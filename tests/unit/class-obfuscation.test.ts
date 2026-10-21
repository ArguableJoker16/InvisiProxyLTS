import { config } from '../../src/config.ts';
import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixture, run } from '../helpers/fixture.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import {
	classNames,
	rewriteClassReferences,
	rewriteClasses,
	rewriteSelector,
	rewriteStylesheet,
} from '../../src/obfuscation/classes.ts';
import { obfuscateDocument } from '../../src/obfuscation/documents.ts';

if (config.usingSEO || !config.minifyScripts) {
	test('class-obfuscation runs with obfuscation explicitly enabled', async (t) => {
		const root = await fixture(
			t,
			{ usingSEO: false, minifyScripts: true },
			true
		);
		await mkdir(join(root, 'tests/unit'), { recursive: true });
		await mkdir(join(root, 'tests/helpers'), { recursive: true });
		await cp(
			fileURLToPath(import.meta.url),
			join(root, 'tests/unit/class-obfuscation.test.ts')
		);
		await cp(
			fileURLToPath(new URL('../helpers/fixture.ts', import.meta.url)),
			join(root, 'tests/helpers/fixture.ts')
		);
		await run(root, ['--test', 'tests/unit/class-obfuscation.test.ts']);
	});
} else {
	test('classes use the same names in CSS, HTML and browser-generated markup while preserving vendors', async () => {
		const names = classNames();
		assert.ok(names.fancybutton && names['faq-search']);
		assert.equal(names['fa-github'], undefined);
		assert.equal(
			rewriteClasses('fancybutton fas fa-github'),
			`${names.fancybutton} fas fa-github`
		);
		const css = rewriteStylesheet(
			'.fancybutton:is(.faq-search) { background: url("/image.fancybutton.png"); content: ".fancybutton"; }'
		);
		assert.ok(
			css.includes(`.${names.fancybutton}:is(.${names['faq-search']})`)
		);
		assert.ok(css.includes('/image.fancybutton.png'));
		assert.ok(css.includes('content: ".fancybutton"'));
		assert.equal(
			rewriteSelector('[class~="fancybutton"][href="/test.fancybutton"]'),
			`[class~="${names.fancybutton}"][href="/test.fancybutton"]`
		);
		const html = await obfuscateDocument(
			'<html><head><style>.fancybutton { color: red; }</style></head><body><button class="fancybutton fas fa-github">Test</button></body></html>',
			'classes.html'
		);
		assert.ok(html.includes(`class="${names.fancybutton} fas fa-github"`));
		assert.ok(html.includes(`.${names.fancybutton}`));
	});

	test('dynamic DOM selectors, saved themes, classList and HTML strings stay synchronized', () => {
		const names = classNames();
		const calls: unknown[] = [];
		const code = rewriteClassReferences(
			`
		const theme = 'light';
		document.documentElement.classList.toggle(theme, true);
		document.documentElement.classList.replace('fancybutton', theme);
		const selector = '.fancybutton[href="/image.fancybutton"]';
		document.querySelector(selector);
		document.getElementsByClassName('faq-search');
		globalThis.markup = '<input class="faq-search fas fa-search">';
		globalThis.compiled = '<input class=faq-search type=search>';
		globalThis.url = '/image.fancybutton';
	`,
			'dynamic.js'
		);
		const context = {
			document: {
				documentElement: {
					classList: {
						toggle: (...args: unknown[]) => calls.push(args),
						replace: (...args: unknown[]) => calls.push(args),
					},
				},
				querySelector: (value: string) => calls.push(value),
				getElementsByClassName: (value: string) => calls.push(value),
			},
			markup: '',
			compiled: '',
			url: '',
		};
		runInNewContext(code, context);
		assert.deepEqual(calls, [
			[names.light, true],
			[names.fancybutton, names.light],
			`.${names.fancybutton}[href="/image.fancybutton"]`,
			names['faq-search'],
		]);
		assert.equal(
			context.markup,
			`<input class="${names['faq-search']} fas fa-search">`
		);
		assert.equal(
			context.compiled,
			`<input class="${names['faq-search']}" type=search>`
		);
		assert.equal(context.url, '/image.fancybutton');
	});

	test('chained DOM lookups rewrite both the receiver and the final selector', () => {
		const names = classNames();
		const code = rewriteClassReferences(
			`document.getElementsByClassName('dropdown-settings')[0].parentElement.querySelector('button.link-button');`,
			'chain.js'
		);
		assert.ok(code.includes(names['dropdown-settings']));
		assert.ok(code.includes(`button.${names['link-button']}`));
		assert.doesNotMatch(code, /dropdown-settings|link-button/);
	});
}
