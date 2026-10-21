import { minify } from 'html-minifier-terser';
import { parse, type DefaultTreeAdapterTypes } from 'parse5';
import { config } from '../config.ts';
import { classNames, rewriteClasses, rewriteStylesheet } from './classes.ts';
import { obfuscateScript, stripObfuscatedMarker } from './scripts.ts';

export async function obfuscateDocument(html: string, name: string) {
	if (config.usingSEO) return html;
	const edits: { start: number; end: number; source: string }[] = [];
	const names = classNames();
	function visit(node: DefaultTreeAdapterTypes.Node) {
		if ('tagName' in node) {
			const attr = node.attrs.find((attr) => attr.name === 'class');
			const location = node.sourceCodeLocation?.attrs?.class;
			if (attr && location)
				edits.push({
					start: location.startOffset,
					end: location.endOffset,
					source: `class="${rewriteClasses(attr.value, names).replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`,
				});
			if (
				node.tagName === 'style' &&
				node.sourceCodeLocation?.startTag &&
				node.sourceCodeLocation.endTag
			) {
				const start = node.sourceCodeLocation.startTag.endOffset;
				const end = node.sourceCodeLocation.endTag.startOffset;
				edits.push({
					start,
					end,
					source: rewriteStylesheet(html.slice(start, end), names),
				});
			}
		}
		if ('tagName' in node && node.tagName === 'script') {
			const type = node.attrs.find((attr) => attr.name === 'type')?.value;
			const location = node.sourceCodeLocation;
			if (
				!node.attrs.some((attr) => attr.name === 'src') &&
				(!type ||
					/^(?:module|(?:text|application)\/(?:java|ecma)script)$/i.test(
						type
					)) &&
				location?.startTag &&
				location.endTag
			) {
				const start = location.startTag.endOffset;
				const end = location.endTag.startOffset;
				edits.push({
					start,
					end,
					source: stripObfuscatedMarker(
						obfuscateScript(
							html.slice(start, end),
							`${name}:${start}`
						)
					).replace(/<\/script/gi, '<\\/script'),
				});
			}
		}
		if ('childNodes' in node)
			for (const child of node.childNodes) visit(child);
		if ('content' in node)
			visit(node.content as DefaultTreeAdapterTypes.DocumentFragment);
	}
	visit(parse(html, { sourceCodeLocationInfo: true }));
	for (const edit of edits.sort((a, b) => b.start - a.start))
		html = html.slice(0, edit.start) + edit.source + html.slice(edit.end);
	return minify(html, {
		removeComments: true,
		collapseWhitespace: true,
		conservativeCollapse: true,
		minifyCSS: true,
		minifyJS: false,
		keepClosingSlash: true,
	});
}
