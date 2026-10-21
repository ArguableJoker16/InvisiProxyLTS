import { existsSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { config } from '../config.ts';
import { notFoundFile, projectUrl, siteUrl } from '../constants.ts';

const isImage = /\.(?:ico|png|jpg|jpeg)$/;
const notFoundPage = new URL(notFoundFile, siteUrl);

let cached404: { mtimeMs: number; body: string | Buffer } | undefined;

export function preloaded404() {
	const stat = statSync(notFoundPage, { throwIfNoEntry: false });
	if (!stat) return 'Not Found';
	if (cached404?.mtimeMs !== stat.mtimeMs) {
		const html = readFileSync(notFoundPage, 'utf8');
		cached404 = {
			mtimeMs: stat.mtimeMs,
			body: config.disguiseFiles ? gzipSync(html) : html,
		};
	}
	return cached404.body;
}

export function tryReadFile(
	file: string | URL,
	baseUrl: string | URL = projectUrl,
	isBuffer = config.disguiseFiles
) {
	const location = new URL(file, baseUrl);
	if (!existsSync(location)) return preloaded404();
	return isImage.test(location.pathname) || isBuffer
		? readFileSync(location)
		: readFileSync(location, 'utf8');
}
