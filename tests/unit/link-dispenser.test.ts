import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLinkDispenser } from '../../src/server/link-dispenser.ts';
import { serve, testClientIp } from '../helpers/http.ts';

async function dispenser(t: TestContext, contents?: string) {
	const dir = await mkdtemp(join(tmpdir(), 'invisiproxy-links-'));
	const file = pathToFileURL(join(dir, 'links.txt'));
	const dispense = createLinkDispenser(file, testClientIp);
	const app = await serve((req, res) => {
		if (req.method === 'POST' && req.url === '/nested/api/link')
			return dispense(req, res);
		res.statusCode = 404;
		res.end();
	});
	t.after(async () => {
		await app.close();
		await rm(dir, { recursive: true, force: true });
	});
	if (contents !== undefined) await writeFile(file, contents);
	return {
		app,
		file,
		request: (ip = '192.0.2.1', headers: Record<string, string> = {}) =>
			app.inject({
				method: 'POST',
				url: '/nested/api/link',
				remoteAddress: ip,
				headers,
			}),
	};
}

test('returns one HTTP(S) URL and never source comments, credentials, invalid schemes or the full list', async (t) => {
	const { request } = await dispenser(
		t,
		'# SECRET_COMMENT\r\n\r\nbad\nftp://invalid.example\njavascript:alert(1)\nhttps://user:secret@example.com\n  https://one.example/  \nhttp://two.example/path?q=1\n'
	);
	for (let i = 1; i <= 24; i++) {
		const response = await request(`192.0.2.${i}`);
		assert.equal(response.statusCode, 200);
		assert.equal(response.headers['cache-control'], 'no-store');
		assert.deepEqual(Object.keys(response.json()), ['link']);
		assert.ok(
			['https://one.example/', 'http://two.example/path?q=1'].includes(
				response.json().link
			)
		);
	}
});

for (const [label, contents] of [
	['missing', undefined],
	['empty', ''],
	['invalid', '# SECRET\njavascript:alert(1)\nnot a URL'],
] as const)
	test(`${label} file gives a generic uncached error`, async (t) => {
		const { request, file } = await dispenser(t, contents);
		const response = await request();
		assert.equal(response.statusCode, 503);
		assert.equal(response.headers['cache-control'], 'no-store');
		assert.deepEqual(Object.keys(response.json()), ['error']);
		assert.ok(!response.body.includes(file.pathname));
		assert.ok(!response.body.includes('SECRET'));
	});

test('cooldown applies to concurrent requests and ignores spoofed forwarding headers', async (t) => {
	t.mock.timers.enable({ apis: ['Date'], now: 1000 });
	const { request } = await dispenser(t, 'https://one.example/');
	const responses = await Promise.all(
		Array.from({ length: 8 }, () => request())
	);
	assert.equal(responses.filter((r) => r.statusCode === 200).length, 1);
	assert.equal(responses.filter((r) => r.statusCode === 429).length, 7);
	const spoofed = await request('192.0.2.1', {
		'x-forwarded-for': '192.0.2.99',
	});
	assert.equal(spoofed.statusCode, 429);
	assert.equal(Number(spoofed.headers['retry-after']), 5);
	assert.equal((await request('192.0.2.2')).statusCode, 200);
	t.mock.timers.tick(5000);
	assert.equal((await request()).statusCode, 200);
});

test('restocks take effect without restart and the endpoint only handles POST', async (t) => {
	const { app, request, file } = await dispenser(t, 'https://old.example/');
	assert.equal((await request()).json().link, 'https://old.example/');
	await writeFile(file, 'https://new.example/');
	assert.equal(
		(await request('192.0.2.2')).json().link,
		'https://new.example/'
	);
	assert.equal((await app.inject('/nested/api/link')).statusCode, 404);
});
