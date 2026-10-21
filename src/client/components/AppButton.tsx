export default function App(props: {
	url: string;
	name: string;
	newtab?: boolean;
	icon?: string;
}) {
	return (
		<>
			{props.newtab ? (
				<a
					href={props.url}
					target="_blank"
					rel="noopener noreferrer"
					class="dependencylogo tippy-button"
					data-app-url={props.url}
					data-tippy-content={props.name}
					aria-label={props.name}
				>
					<img data-proxy-icon={props.icon ?? ''} alt={props.name} />
				</a>
			) : (
				<button
					type="button"
					class="dependencylogo tippy-button"
					data-app-url={props.url}
					data-tippy-content={props.name}
					aria-label={props.name}
				>
					<img data-proxy-icon={props.icon ?? ''} alt={props.name} />
				</button>
			)}
		</>
	);
}
