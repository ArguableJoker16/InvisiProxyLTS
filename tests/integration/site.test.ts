import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import {
	buildFixture,
	fixture,
	probe,
	run,
	startServer,
} from '../helpers/fixture.ts';

for (const [label, pathname, settings] of [
	['disguised', '/school/', { usingSEO: false, disguiseFiles: true }],
	['SEO', '/', { usingSEO: true, disguiseFiles: false }],
] as const)
	test(`${label} build serves its pages, API and Wisp`, {
		timeout: 900_000,
	}, async (t) => {
		const root = await fixture(t, { ...settings, pathname }, true);
		await buildFixture(root);
		await run(root, [probe('http-probe.ts')]);

		const state = await readFile(
			join(root, 'views/dist/.obfuscation.json'),
			'utf8'
		).then(JSON.parse, () => ({}));
		const wisp = state.aliases?.['prefixes/wisp'] ?? 'wisp';
		const origin = await startServer(root);
		const page = await fetch(origin + pathname);
		assert.equal(page.status, 200);
		assert.match(await page.text(), /^<!doctype html>/i);
		const socket = new WebSocket(
			`${origin.replace('http', 'ws')}${pathname}${wisp}/`
		);
		socket.binaryType = 'arraybuffer';
		const frame = await new Promise<ArrayBuffer>((resolve, reject) => {
			socket.onmessage = (event) => resolve(event.data);
			socket.onerror = () => reject(new Error('Wisp connection failed'));
		});
		socket.close();
		assert.ok(frame.byteLength > 0);
	});
