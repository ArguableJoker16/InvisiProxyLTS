export type TransportName = 'libcurl' | 'epoxy';

export function isMobileBrowser(browser: Navigator = navigator): boolean {
	const mobile = (
		browser as Navigator & {
			userAgentData?: { mobile?: boolean };
		}
	).userAgentData?.mobile;
	return (
		mobile === true ||
		/Android|iPhone|iPad|iPod|Mobile/i.test(browser.userAgent) ||
		(browser.platform === 'MacIntel' && browser.maxTouchPoints > 1)
	);
}

export function selectedTransport(
	stored: unknown,
	mobile = isMobileBrowser()
): TransportName {
	return mobile || stored === 'epoxy' ? 'epoxy' : 'libcurl';
}
