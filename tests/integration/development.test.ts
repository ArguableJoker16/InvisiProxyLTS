import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { fixture, run } from '../helpers/fixture.ts';

for (const usingSEO of [true, false])
	for (const disguiseFiles of [true, false]) {
		test(`development updates: SEO=${usingSEO}, disguise=${disguiseFiles}`, {
			timeout: 360000,
		}, async (t) => {
			const root = await fixture(
				t,
				{
					usingSEO,
					disguiseFiles,
					pathname: '/school/',
					minifyScripts: !usingSEO,
				},
				true
			);
			await run(
				root,
				[
					fileURLToPath(
						new URL('../fixtures/dev-probe.ts', import.meta.url)
					),
				],
				{ INVISIPROXY_VITE_DEV: '1' },
				300000
			);
		});
	}
