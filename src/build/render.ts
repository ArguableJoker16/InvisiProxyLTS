import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';
import solid from 'vite-plugin-solid';
import { config } from '../config.ts';
import { notFoundFile, projectDir, routesFile } from '../constants.ts';
import data from '../data.json' with { type: 'json' };
import { obfuscateDocument } from '../obfuscation/documents.ts';
import type { SiteValues } from '../site.ts';
import { getPathAliases } from '../obfuscation/paths.ts';
import {
	obfuscationState,
	obfuscationStateFile,
} from '../obfuscation/state.ts';
import { rootDataFiles } from './sources.ts';
import { buildValues } from './values.ts';

type Renderer = typeof import('../client/entry.tsx');
export type LoadRenderer = () => Promise<Renderer>;

export const rendererEntry = fileURLToPath(
	new URL('../client/entry.tsx', import.meta.url)
);

export const importRenderer: LoadRenderer = async () =>
	(
		await runnerImport<Renderer>(rendererEntry, {
			configFile: false,
			root: projectDir,
			logLevel: 'error',
			plugins: [solid({ ssr: true })],
		})
	).module;

export async function renderDocuments(
	values: SiteValues,
	load: LoadRenderer = importRenderer
): Promise<Record<string, string>> {
	const documents = (await load()).renderDocuments(values);
	return Object.fromEntries(
		await Promise.all(
			Object.entries(documents).map(async ([path, html]) => [
				path,
				await obfuscateDocument(html, path),
			])
		)
	);
}

let plainDocuments: Promise<Record<string, string>> | undefined;

export function getPlainDocuments(fresh = false, load?: LoadRenderer) {
	if (fresh || !plainDocuments)
		plainDocuments = renderDocuments(
			{ ...buildValues, inlineAssets: false },
			load
		);
	return plainDocuments;
}

export async function proxyErrorTemplates(): Promise<SiteValues['errors']> {
	const path = 'pages/proxnav/scramjet-error.html';
	const html = (await getPlainDocuments())[path];
	const script =
		/<script\b[^>]*\bid="proxy-error-script"[^>]*\bsrc="([^"]*)"[^>]*>/.exec(
			html
		);
	if (!script) throw new Error(`Missing error script element in ${path}`);
	const offset = script.index + script[0].indexOf('src="') + 5;
	return {
		scramjet: {
			beforeScript: html.slice(0, offset),
			afterScript: html.slice(offset + script[1].length),
		},
	};
}

export async function siteRoutes(load: LoadRenderer = importRenderer) {
	return {
		...(await load()).pageRoutes(),
		...Object.fromEntries(rootDataFiles().map((file) => [file, file])),
	};
}

function isDisguisedDocument(path: string) {
	return (
		config.disguiseFiles &&
		path.endsWith('.html') &&
		(!path.includes('/') ||
			(path.startsWith('pages/') && !path.split('/').includes('deobf')))
	);
}

const gzip = async (html: string) =>
	new Uint8Array(
		await new Response(
			new Blob([new TextEncoder().encode(html)])
				.stream()
				.pipeThrough(new CompressionStream('gzip'))
		).arrayBuffer()
	);

interface RenderOptions {
	load?: LoadRenderer;
	fresh?: boolean;
	head?: string;
}

export async function renderSite({
	load,
	fresh = false,
	head = '',
}: RenderOptions = {}) {
	const files: Record<string, string | Uint8Array> = {};
	const documents = await renderDocuments(buildValues, load);
	for (const [path, document] of Object.entries(documents)) {
		const html = head
			? document.replace('<head>', `<head>${head}`)
			: document;
		files[path] = isDisguisedDocument(path) ? await gzip(html) : html;
	}
	files[routesFile] = JSON.stringify(await siteRoutes(load));
	files[
		`assets/json/${getPathAliases()['files/splash.json'] || 'splash.json'}`
	] = JSON.stringify(data.splash);
	files[notFoundFile] = (await getPlainDocuments(fresh, load))['error.html'];
	files[obfuscationStateFile] = JSON.stringify(obfuscationState());
	return files;
}
