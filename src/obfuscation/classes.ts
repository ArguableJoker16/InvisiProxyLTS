import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import ts from 'typescript';
import { config } from '../config.ts';
import { projectUrl } from '../constants.ts';
import {
	generatedNames,
	obfuscationState,
	saveObfuscationState,
} from './state.ts';

const vendorClass =
	/^(?:fa(?:[brsld])?(?:-|$)|aos(?:-|$)|tippy-(?:box|content|arrow|backdrop)|eruda(?:-|$))/;

export function classNames(): Record<string, string> {
	if (config.usingSEO) return {};
	const state = obfuscationState();
	if (Object.keys(state.classes).length) return state.classes;
	const names = new Set<string>();
	const add = (value: string) => {
		for (const name of value.split(/\s+/))
			if (name && !vendorClass.test(name)) names.add(name);
	};
	const cssRoot = new URL('views/assets/css/', projectUrl);
	for (const file of existsSync(cssRoot)
		? readdirSync(cssRoot, { recursive: true, encoding: 'utf8' })
		: []) {
		if (!file.endsWith('.css')) continue;
		postcss
			.parse(readFileSync(new URL(file, cssRoot), 'utf8'))
			.walkRules((rule) => {
				selectorParser((selectors) => {
					selectors.walkClasses((node) => {
						add(node.value);
					});
				}).processSync(rule.selector);
			});
	}
	const clientRoot = fileURLToPath(new URL('src/client/', projectUrl));
	for (const file of readdirSync(clientRoot, {
		recursive: true,
		encoding: 'utf8',
	})) {
		if (!file.endsWith('.tsx')) continue;
		const source = ts.createSourceFile(
			file,
			readFileSync(`${clientRoot}/${file}`, 'utf8'),
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
		);
		function visit(node: ts.Node) {
			if (
				ts.isJsxAttribute(node) &&
				node.name.getText(source) === 'class'
			) {
				const value = node.initializer;
				const literal =
					value && ts.isJsxExpression(value)
						? value.expression
						: value;
				if (literal && ts.isStringLiteralLike(literal))
					add(literal.text);
			}
			ts.forEachChild(node, visit);
		}
		visit(source);
	}
	state.classes = generatedNames(names, 'classes');
	saveObfuscationState(state);
	return state.classes;
}

export function rewriteClasses(value: string, names = classNames()) {
	return value.replace(/\S+/g, (name) => names[name] || name);
}

export function rewriteSelector(value: string, names = classNames()) {
	return selectorParser((selectors) => {
		selectors.walkClasses((node) => {
			node.value = names[node.value] || node.value;
		});
		selectors.walkAttributes((node) => {
			if (
				node.attribute === 'class' &&
				node.value &&
				['=', '~='].includes(node.operator || '')
			)
				node.setValue(rewriteClasses(node.value, names), {
					quoteMark: node.quoteMark,
				});
		});
	}).processSync(value);
}

export function rewriteStylesheet(css: string, names = classNames()) {
	const root = postcss.parse(css);
	root.walkRules((rule) => {
		rule.selector = rewriteSelector(rule.selector, names);
	});
	return root.toString();
}

export function rewriteClassReferences(
	code: string,
	name: string,
	names = classNames()
) {
	const source = ts.createSourceFile(
		name,
		code,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.JS
	);
	const edits: { start: number; end: number; value: string }[] = [];
	const suffix = randomBytes(8).toString('hex');
	const classes = `__invisiClasses_${suffix}`;
	const selector = `__invisiSelector_${suffix}`;
	let runtime = false;
	function argument(node: ts.Expression, kind: 'classes' | 'selector') {
		let value: string;
		if (ts.isStringLiteralLike(node)) {
			value = JSON.stringify(
				kind === 'classes'
					? rewriteClasses(node.text, names)
					: rewriteSelector(node.text, names)
			);
		} else {
			runtime = true;
			value = `${kind === 'classes' ? classes : selector}(${node.getText(source)})`;
		}
		edits.push({ start: node.getStart(source), end: node.end, value });
	}
	function visit(node: ts.Node) {
		if (ts.isCallExpression(node)) {
			const call = node.expression;
			const method = ts.isPropertyAccessExpression(call)
				? call.name.text
				: ts.isIdentifier(call)
					? call.text
					: '';
			if (node.arguments[0]) {
				if (
					[
						'querySelector',
						'querySelectorAll',
						'closest',
						'matches',
						'tippy',
					].includes(method)
				) {
					argument(node.arguments[0], 'selector');
					visit(call);
					for (const arg of node.arguments.slice(1)) visit(arg);
					return;
				}
				if (
					method === 'getElementsByClassName' ||
					(ts.isPropertyAccessExpression(call) &&
						ts.isPropertyAccessExpression(call.expression) &&
						call.expression.name.text === 'classList')
				) {
					const count = ['add', 'remove', 'replace'].includes(method)
						? node.arguments.length
						: 1;
					for (const arg of node.arguments.slice(0, count))
						argument(arg, 'classes');
					visit(call);
					for (const arg of node.arguments.slice(count)) visit(arg);
					return;
				}
				if (
					method === 'setAttribute' &&
					ts.isStringLiteralLike(node.arguments[0]) &&
					node.arguments[0].text === 'class' &&
					node.arguments[1]
				) {
					argument(node.arguments[1], 'classes');
					visit(call);
					return;
				}
			}
		}
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
			ts.isPropertyAccessExpression(node.left) &&
			node.left.name.text === 'className'
		) {
			argument(node.right, 'classes');
			visit(node.left);
			return;
		}
		if (ts.isStringLiteralLike(node) && /\bclass\s*=/.test(node.text)) {
			const text = node.text.replace(
				/(\bclass\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/g,
				(_match, before, doubleQuoted, singleQuoted, unquoted) =>
					`${before}"${rewriteClasses(doubleQuoted ?? singleQuoted ?? unquoted, names)}"`
			);
			if (text !== node.text)
				edits.push({
					start: node.getStart(source),
					end: node.end,
					value: JSON.stringify(text),
				});
		}
		ts.forEachChild(node, visit);
	}
	visit(source);
	for (const edit of edits.sort((a, b) => b.start - a.start))
		code = code.slice(0, edit.start) + edit.value + code.slice(edit.end);
	if (!runtime) return code;
	return `(() => {
		const names = ${JSON.stringify(names)};
		function ${classes}(value) { return typeof value === 'string' ? value.replace(/\\S+/g, name => names[name] || name) : value; }
		function ${selector}(value) { return typeof value === 'string' ? value.replace(/"[^"]*"|'[^']*'|\\.([a-zA-Z_][\\w-]*)/g, (match, name) => name && names[name] ? '.' + names[name] : match) : value; }
		${code}
	})();`;
}
