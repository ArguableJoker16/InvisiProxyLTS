import test from 'node:test';
import { fixture, probe, run } from '../helpers/fixture.ts';

test('obfuscated scripts, documents and class names keep working', async (t) => {
	const root = await fixture(t, { usingSEO: false, minifyScripts: true });
	await run(root, [probe('obfuscation-probe.ts')]);
});

test('SEO mode leaves scripts, documents and class names alone', async (t) => {
	const root = await fixture(t, { usingSEO: true });
	await run(root, [probe('obfuscation-probe.ts')]);
});
