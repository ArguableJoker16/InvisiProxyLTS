import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { fixture, run, buildFixture } from '../helpers/fixture.ts';

for (const disguiseFiles of [false, true]) {
	test(`Chromium interactions: disguise=${disguiseFiles}`, {
		timeout: 180_000,
	}, async (t) => {
		const root = await fixture(
			t,
			{ usingSEO: !disguiseFiles, disguiseFiles, pathname: '/school/' },
			true
		);
		await buildFixture(root);
		console.log(
			await run(root, [
				fileURLToPath(
					new URL('../fixtures/browser-probe.ts', import.meta.url)
				),
			])
		);
	});
}
