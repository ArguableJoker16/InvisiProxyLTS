import { translate } from '../document-helpers.tsx';

export function SettingToggle(props: {
	label: string;
	description: string;
	class: string;
	checked?: boolean;
}) {
	return (
		<label class="setting-row">
			<span class="setting-copy">
				<span class="setting-label">{props.label}</span>
				<span class="setting-description">{props.description}</span>
			</span>
			<input
				type="checkbox"
				class={`switch ${props.class}`}
				checked={props.checked}
			/>
		</label>
	);
}

export function AddressField(props: {
	id: string;
	formId: string;
	label: string;
	description: string;
	placeholder: string;
	invalid: string;
}) {
	return (
		<div class="setting-field">
			<label for={props.id}>{props.label}</label>
			<span class="setting-description">{props.description}</span>
			<form id={props.formId} class="cloakform address-form">
				<input
					id={props.id}
					type="text"
					placeholder={props.placeholder}
					spellcheck="false"
					autocomplete="off"
					data-invalid={props.invalid}
				/>
				<input type="submit" value={translate('settings.tab.apply')} />
			</form>
		</div>
	);
}

export function TransportSelect(props: { id: string; containerId: string }) {
	return (
		<div id={props.containerId} class="transport-setting setting-field">
			<label for={props.id}>
				{translate('settings.browsing.transport')}
			</label>
			<select
				id={props.id}
				class="transport-list"
				aria-label={translate('settings.browsing.transport')}
			>
				<option value="libcurl" selected>
					Libcurl
				</option>
				<option value="epoxy">Epoxy</option>
			</select>
		</div>
	);
}
