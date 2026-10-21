import { createSignal, createEffect } from 'solid-js';
import { render } from 'solid-js/web';

const normalizeSearch = (value: string) =>
	value
		.replace(/[\u00ad\u200b-\u200d\ufeff]/g, '')
		.trim()
		.toLocaleLowerCase();

function FAQSearch() {
	const [query, setQuery] = createSignal('');
	const entries = [...document.querySelectorAll<HTMLElement>('#faqs > div')];
	createEffect(() => {
		const search = normalizeSearch(query());
		for (const entry of entries) {
			const heading = entry.firstElementChild?.textContent || '';
			entry.style.display = normalizeSearch(heading).includes(search)
				? ''
				: 'none';
		}
	});
	return (
		<input
			class="faq-search"
			type="search"
			aria-label="Search frequently asked questions"
			autocomplete="off"
			spellcheck={false}
			placeholder="Search"
			value={query()}
			onInput={(event) => setQuery(event.currentTarget.value)}
		/>
	);
}

const root = document.getElementById('faq-search-root');
if (root) {
	root.replaceChildren();
	render(() => <FAQSearch />, root);
}
