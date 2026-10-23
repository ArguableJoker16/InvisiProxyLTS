import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultLocale, loadLocales } from '../../src/build/locales.ts';
import type { Messages } from '../../src/site.ts';

function flatten(messages: Messages, prefix = ''): Record<string, string> {
	return Object.fromEntries(
		Object.entries(messages).flatMap(([key, value]) => {
			const path = prefix ? `${prefix}.${key}` : key;
			return typeof value === 'string'
				? [[path, value]]
				: Object.entries(flatten(value, path));
		})
	);
}

const markers = (text: string) =>
	[...text.matchAll(/\{\w+\}|<\/?\w+\/?>/g)].map(([marker]) => marker).sort();

test('translations keep the keys, placeholders and tags from en.yaml', () => {
	const [english, ...others] = loadLocales();
	assert.equal(english.code, defaultLocale);
	const reference = flatten(english.messages);
	for (const locale of others)
		for (const [key, text] of Object.entries(flatten(locale.messages))) {
			const file = `src/locales/${locale.code}.yaml`;
			assert.ok(key in reference, `${file}: "${key}" is not in en.yaml`);
			assert.deepEqual(
				markers(text),
				markers(reference[key]),
				`${file}: ${key}`
			);
		}
});
