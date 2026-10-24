/* Toast - https://github.com/havi11368/scramjet/blob/utils/packages/utils/src/custom-error-page.ts */

export interface ErrorPageDetails {
	url: string;
	trace: string;
	version: string;
}

export function proxiedUrl(rawUrl: string, prefix: string): string {
	try {
		const { pathname } = new URL(rawUrl);
		if (!pathname.startsWith(prefix)) return rawUrl;
		const url = new URL(decodeURIComponent(pathname.slice(prefix.length)));
		for (const key of [...url.searchParams.keys()])
			if (key.startsWith('$')) url.searchParams.delete(key);
		return url.href;
	} catch {
		return rawUrl;
	}
}

export function errorTrace(error: unknown): string {
	if (
		error &&
		typeof error === 'object' &&
		'stack' in error &&
		typeof error.stack === 'string' &&
		error.stack
	)
		return error.stack;
	return String(error);
}

export function errorPageScript({
	url,
	trace,
	version,
}: ErrorPageDetails): string {
	const source = `(() => {
	const trace = ${JSON.stringify(trace)};
	const set = (id, key, value) => {
		const element = document.getElementById(id);
		if (element) element[key] = value;
	};
	const onClick = (id, listener) =>
		document.getElementById(id)?.addEventListener('click', listener);
	set('fetchedURL', 'textContent', ${JSON.stringify(url)});
	set('errorTrace', 'value', trace);
	set('scramjetVersion', 'textContent', ${JSON.stringify(version)});
	onClick('reload', () => location.reload());
	onClick('copy-button', () => navigator.clipboard.writeText(trace));
})();`;
	const bytes = new TextEncoder().encode(source);
	return `data:text/javascript;base64,${btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))}`;
}
