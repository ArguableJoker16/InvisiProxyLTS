import type { Component, JSX } from 'solid-js';

export interface PageDefinition {
	route?: string | readonly string[];
	Page: Component;
	Head: Component;
	lang?: string;
	bodyStyle?: JSX.HTMLAttributes<HTMLBodyElement>['style'];
	bodyScripts?: JSX.ScriptHTMLAttributes<HTMLScriptElement>[];
}
