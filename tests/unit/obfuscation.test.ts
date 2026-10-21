import { config } from '../../src/config.ts';
import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixture, run } from '../helpers/fixture.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { parse, type DefaultTreeAdapterTypes } from 'parse5';
import { obfuscatedMarker } from '../../src/constants.ts';
import { obfuscateDocument } from '../../src/obfuscation/documents.ts';
import {
	obfuscateScript,
	obfuscateVendorScript,
	stripObfuscatedMarker,
} from '../../src/obfuscation/scripts.ts';

if (config.usingSEO || !config.minifyScripts) {
	test('obfuscation runs with obfuscation explicitly enabled', async (t) => {
		const root = await fixture(
			t,
			{ usingSEO: false, minifyScripts: true },
			true
		);
		await mkdir(join(root, 'tests/unit'), { recursive: true });
		await mkdir(join(root, 'tests/helpers'), { recursive: true });
		await cp(
			fileURLToPath(import.meta.url),
			join(root, 'tests/unit/obfuscation.test.ts')
		);
		await cp(
			fileURLToPath(new URL('../helpers/fixture.ts', import.meta.url)),
			join(root, 'tests/helpers/fixture.ts')
		);
		await run(root, ['--test', 'tests/unit/obfuscation.test.ts']);
	});
} else {
	test('obfuscation hides identifiers and strings while preserving public object interfaces', () => {
		const code = obfuscateScript(
			`
		const privateObject = { message: 'private-message-value' };
		function privateFunction(privateArgument) { return privateArgument.message; }
		globalThis.result = privateFunction(privateObject);
	`,
			'test.js'
		);
		assert.doesNotMatch(
			code,
			/privateObject|privateFunction|privateArgument|private-message-value/
		);
		const context: Record<string, unknown> = {};
		runInNewContext(code, context);
		assert.equal(context.result, 'private-message-value');
		assert.equal(obfuscateScript(code, 'inline.js'), code);
		const finished = stripObfuscatedMarker(code);
		assert.ok(!finished.includes(obfuscatedMarker));
		const publishedContext: Record<string, unknown> = {};
		runInNewContext(finished, publishedContext);
		assert.equal(publishedContext.result, 'private-message-value');
	});

	test('vendor obfuscation preserves public APIs and vendor DOM selectors', () => {
		const code = stripObfuscatedMarker(
			obfuscateVendorScript(
				`
		(() => {
			function internalFunction(argument) { document.querySelector('.fancybutton'); return argument + 1; }
			globalThis.Vendor = { run: internalFunction };
		})();
	`,
				'vendor.js'
			)
		);
		assert.doesNotMatch(code, /internalFunction/);
		assert.ok(!code.includes(obfuscatedMarker));
		const selectors: string[] = [];
		const context = {
			document: {
				querySelector: (selector: string) => selectors.push(selector),
			},
		};
		runInNewContext(
			`${code}; globalThis.result = Vendor.run(41);`,
			context
		);
		assert.equal(
			(context as typeof context & { result: number }).result,
			42
		);
		assert.deepEqual(selectors, ['.fancybutton']);
	});

	test('HTML obfuscation handles executable inline scripts and preserves data and vendor script references', async () => {
		const bundled = obfuscateScript(
			"globalThis.bundledResult = 'bundled-secret';",
			'bundle.js'
		);
		const html = await obfuscateDocument(
			`<!doctype html><html><head>
		<script src="/scram/controller.api.js"></script>
		<script type="application/ld+json">{"name":"Structured data"}</script>
		</head><body><!-- comment --><pre>  literal  spacing\n</pre>
		<script>const privateValue = 'inline-secret'; globalThis.result = privateValue;</script>
		<script id="bundled">${bundled}</script>
		</body></html>`,
			'test.html'
		);
		assert.doesNotMatch(
			html,
			/privateValue|inline-secret|<!-- comment -->/
		);
		assert.ok(!html.includes(obfuscatedMarker));
		assert.match(html, /src="\/scram\/controller.api.js"/);
		assert.match(html, /\{"name":"Structured data"\}/);
		assert.match(html, /<pre> {2}literal {2}spacing\n<\/pre>/);
		function scripts(
			node: DefaultTreeAdapterTypes.Node
		): DefaultTreeAdapterTypes.Element[] {
			return [
				...('tagName' in node && node.tagName === 'script'
					? [node]
					: []),
				...('childNodes' in node
					? node.childNodes.flatMap(scripts)
					: []),
			];
		}
		const script = scripts(parse(html)).find(
			(node) => node.attrs.length === 0
		);
		assert.ok(script);
		const source = script.childNodes
			.map((node) => ('value' in node ? node.value : ''))
			.join('');
		const context: Record<string, unknown> = {};
		runInNewContext(source, context);
		assert.equal(context.result, 'inline-secret');
		const bundledScript = scripts(parse(html)).find((node) =>
			node.attrs.some(
				(attr) => attr.name === 'id' && attr.value === 'bundled'
			)
		);
		assert.ok(bundledScript);
		const bundledSource = bundledScript.childNodes
			.map((node) => ('value' in node ? node.value : ''))
			.join('');
		assert.equal(bundledSource, stripObfuscatedMarker(bundled));
		runInNewContext(bundledSource, context);
		assert.equal(context.bundledResult, 'bundled-secret');
	});
}
