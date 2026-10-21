import test from 'node:test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fixture, run } from '../helpers/fixture.ts';

test('SEO controls script, vendor, HTML and class obfuscation in production and development', async (t) => {
	for (const usingSEO of [true, false]) {
		const root = await fixture(t, { usingSEO });
		await mkdir(join(root, 'views/assets/css/partials'), {
			recursive: true,
		});
		await writeFile(
			join(root, 'views/assets/css/partials/probe.css'),
			'.config-probe { color: red; }'
		);
		for (const development of [false, true])
			await run(
				root,
				[
					'--input-type=module',
					'-e',
					`
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { classNames, rewriteStylesheet } from './src/obfuscation/classes.ts';
import { obfuscateDocument } from './src/obfuscation/documents.ts';
import { obfuscateScript, obfuscateVendorScript, browserObfuscationPlugin } from './src/obfuscation/scripts.ts';
const source = "(() => { const privateValue = 'private-config-value'; globalThis.result = privateValue; })();";
const html = '<html><head><style>.config-probe { color: red; }</style></head><body><button class="config-probe">Test</button><script>' + source + '</script></body></html>';
const names = classNames();
const document = await obfuscateDocument(html, 'probe.html');
const css = rewriteStylesheet('.config-probe { color: red; }');
const script = obfuscateScript(source, 'probe.js');
const vendor = obfuscateVendorScript(source, 'vendor.js');
const chunk = { type: 'chunk', fileName: 'probe.js', code: source, map: {} };
browserObfuscationPlugin().generateBundle.call({}, {}, { 'probe.js': chunk });
if (${usingSEO}) {
  assert.deepEqual(names, {});
  assert.equal(script, source);
  assert.equal(vendor, source);
  assert.equal(document, html);
  assert.equal(css, '.config-probe { color: red; }');
  assert.equal(chunk.code, source);
} else {
  assert.ok(names['config-probe']);
  assert.ok(css.includes('.' + names['config-probe']));
  assert.ok(document.includes('class="' + names['config-probe'] + '"'));
  assert.doesNotMatch(document, /private-config-value|privateValue|config-probe/);
  for (const code of [script, vendor, chunk.code]) {
    assert.doesNotMatch(code, /privateValue/);
    const context = {};
    runInNewContext(code, context);
    assert.equal(context.result, 'private-config-value');
  }
  assert.doesNotMatch(script, /private-config-value/);
  assert.doesNotMatch(chunk.code, /private-config-value/);
  assert.equal(chunk.map, null);
}
`,
				],
				{ INVISIPROXY_VITE_DEV: development ? '1' : '' }
			);
	}
});
