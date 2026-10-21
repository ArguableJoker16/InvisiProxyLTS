import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { config } from '../config.ts';
import { projectDir } from '../constants.ts';
import { getPathAliases } from '../obfuscation/paths.ts';

export interface SiteFile {
	source: string;
	target: string;
	kind: 'copy' | 'text' | 'json' | 'script' | 'vendor-script' | 'style';
}

const modulePath = (path: string) => join(projectDir, 'node_modules', path);

const vendorDirs = [
	['epoxy', modulePath('@mercuryworkshop/epoxy-transport/dist')],
	['libcurl', modulePath('@mercuryworkshop/libcurl-transport/dist')],
	['scram', scramjetPath],
	['scram', modulePath('@mercuryworkshop/scramjet-controller/dist')],
	['scram', modulePath('@mercuryworkshop/scramjet-utils/dist')],
];

export const faqSearch: SiteFile = {
	source: join(projectDir, 'src/client/faq-search.tsx'),
	get target() {
		return `assets/js/${getPathAliases()['files/faq-search.js'] || 'faq-search.js'}`;
	},
	kind: 'script',
};

export function siteFiles(): SiteFile[] {
	const files: SiteFile[] = [];
	const claimed = new Set<string>();
	const ignoredDirs = ['dist', 'dist-new', 'assets', 'scram'];
	const ignoredFiles = /\.map$|\.d\.ts$/;
	const alias = (name: string) =>
		(!config.usingSEO && getPathAliases()[`files/${name}`]) || name;

	const collect = (dir: string, outDir: string, fromViews: boolean) => {
		if (fromViews && outDir === 'assets/css/partials/') return;
		for (const file of readdirSync(dir)) {
			if (
				(fromViews && ignoredDirs.includes(file)) ||
				ignoredFiles.test(file)
			)
				continue;
			const source = join(dir, file);
			const stats = lstatSync(source);
			if (stats.isDirectory()) {
				collect(source, `${outDir + file}/`, fromViews);
				continue;
			}
			if (!stats.isFile()) continue;
			const target = outDir + alias(file.replace(/\.ts$/, '.js'));
			if (claimed.has(target)) continue;
			let kind: SiteFile['kind'] = 'copy';
			if (!fromViews && /\.(?:m?js|cjs)$/.test(file))
				kind = 'vendor-script';
			if (fromViews) {
				if (/\.(?:ts|js)$/.test(file)) kind = 'script';
				else if (/^assets\/css\/[^/]+\.css$/.test(target))
					kind = 'style';
				else if (file.endsWith('.json')) kind = 'json';
				else if (/\.(?:html|css|txt|xml)$/.test(file)) kind = 'text';
			}
			if (kind !== 'script') claimed.add(target);
			files.push({ source, target, kind });
		}
	};

	collect(join(projectDir, 'views/assets'), 'assets/', true);
	for (const [prefix, path] of vendorDirs) {
		if (!existsSync(path)) {
			console.warn(`[Build] Skipping "${prefix}": ${path} not found.`);
			continue;
		}
		collect(path, `${prefix}/`, false);
	}
	collect(join(projectDir, 'views'), '', true);
	return files;
}

export const siteScripts = () => [
	...siteFiles().filter((file) => file.kind === 'script'),
	faqSearch,
];

export const rootDataFiles = () =>
	siteFiles()
		.filter(
			({ target, kind }) =>
				!target.includes('/') &&
				(kind === 'json' || kind === 'text') &&
				/\.(?:json|xml|txt)$/.test(target)
		)
		.map(({ target }) => target);
