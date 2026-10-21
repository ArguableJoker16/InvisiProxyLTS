export default function Terms() {
	return (
		<div id="tos" class="box-clear textm">
			<div style="margin: 2%">
				<div class="text-center">
					<h1 class="bigtitle">Privacy Policy</h1>
					<h4>InvisiProxy, a private web proxy service.</h4>
				</div>
				<p>
					<strong>Effective Date: 07-16-2021</strong>
				</p>
				<p>
					<strong>Updated Date: 05-10-2026</strong>
				</p>
				<h4>What is InvisiProxy?</h4>
				<p>
					{`
      ${' InvisiProxy LTS is a web proxy service that helps you access\n      websites that may be blocked by your network, government or policy all\n      within your browser with no download or setup. It does this securely and\n      with additional privacy features. Browse Tor/Onion sites in any browser,\n      hide browsing activity and bypass filters. This includes the potential\n      ability to bypass content blockers from governments, chrome extensions,\n      localized client firewalls, and network-related filters.<br />This project\n      serves mostly as a proof of concept for the ideal clientless solution to\n      bypassing censorship. '}
    `}
				</p>
				<h4>Is any data being collected?</h4>
				<p>
					{`
      ${' Nope! No data is logged or collected by any of our web proxies\n      featured. Logging is disabled to ensure user privacy on the backend.\n      NextDNS queries are adjusted to not log client IPs or domains and store in\n      Switzerland. NextDNS log retention for respective numerical values is\n      minimal and focused on ensuring the service operates smoothly. Cloudflare\n      is utilized for this project to improve performance and have easier DNS\n      management due to the scope of this project. At a minimum Cloudflare\n      numerical values are utilized for tracking visits and page views\n      indicating when server upgrades are needed. NGINX is set to store no logs.\n      InvisiProxy LTS values its statement of ending internet censorship along\n      with valuing user privacy. Outside of this the Wisp protocol (to proxy TCP\n      connections) is used with libcurl-transport for\n      end-to-end encryption by running SSL/TLS inside webassembly. This service\n      is made to be as transparent as possible and remember you can self-host at\n      any time to ensure you are in control over everything.\n      <br /><br />If you wish to make a privacy statement or request please\n      contact us via Discord. '}
    `}
				</p>
				<h4 id="Security">Security</h4>
				<p>
					{`
      ${' InvisiProxy LTS is built from the ground up to ensure a secure\n      and reliable web proxy service for its users. One of the core technologies\n      behind InvisiProxy LTS is the new Wisp protocol, developed by Mercury\n      Workshop.<br /><br />This protocol brings several innovative features and\n      enhancements that contribute to the speed and security of the service over\n      previous models. '}
    `}
				</p>
				<p>
					The Wisp protocol is designed to handle modern web traffic
					demands while maintaining high security standards. By
					implementing Wisp, this project leverages the following
					benefits:
				</p>
				<p>
					Performance: The Wisp protocol optimizes TCP data transfer
					speeds, ensuring that users experience minimal latency while
					browsing.
				</p>
				<p>
					Compatibility: Wisp is built to be compatible with a wide
					range of web technologies, ensuring seamless access to
					various websites and online services. This is done through
					the support of various open-source transports following the
					protocol (Libcurl Transport).
				</p>
				<p>
					Resilience Against Censorship: The protocol is designed to
					bypass sophisticated censorship techniques employed by
					restrictive networks, allowing users to access blocked
					content with ease.
				</p>
				<p>
					Fingerprint Resistance: This project has strong fingerprint
					resistance mechanisms within its reverse proxy setup for
					official instances. This means that the proxy is designed to
					minimize the unique identifiers that can be used to track or
					identify users, thereby enhancing privacy. By following
					industry best practices and continually updating its
					methods, users can browse anonymously without leaving
					identifiable traces.
				</p>
				<p>
					Transparency: Transparency is a key principle for
					InvisiProxy LTS. The project operates with an open-source
					model, allowing the community to review and contribute to
					the codebase. This openness not only fosters trust but also
					enables continuous improvement through community feedback
					and collaboration. By adhering to transparent practices,
					InvisiProxy LTS ensures that users are aware of how their
					data is handled and what measures are in place to protect
					their privacy.
				</p>
				<p>
					Source/Global Randomisation: In order to further enhance
					security and privacy, InvisiProxy LTS employs source and
					global randomisation. This allows the project to remain
					unblocked longer on domains and also improve anonmity while
					browsing. Typical web proxies will leave traces whenever
					rewriting assets, but with this method, it is much harder to
					detect the proxy and block it.
				</p>
				<p>
					Encryption: InvisiProxy LTS utilizes advanced proxy
					technologies that focus on end-to-end encryption and secure
					data transfer, particularly in the context of URL rewriting
					proxies. NOTE: This is still a massive work in progress and
					open to contributions.
				</p>
				<p>
					Regular Audits: Conducting regular security audits to
					identify and address potential vulnerabilities.
				</p>
				<h4 id="Cookies">Additional Usage</h4>
				<p>
					InvisiProxy uses "Cookies", IndexedDB, localStorage, and
					sessionStorage to maintain a user session (described more
					below) and store your preferences on your computer. All of
					this information is completely private being only local
					content with ZERO analytical purposes.
				</p>
				<p>
					A cookie is a string of information that a website stores on
					a visitor's computer, and that the visitor's browser
					provides to the website each time the visitor returns.
					InvisiProxy uses cookies to help ensure useablity with the
					Settings menu, and lastly for user preferences. Users who do
					not wish to have cookies placed on their computers should
					set their browsers to refuse cookies before using
					InvisiProxy's websites, with the drawback that certain
					features of InvisiProxy WILL not function properly without
					the aid of cookies, localStorage or IndexedDB. No cookies,
					IndexedDB, localStorage, or sessionStorage features are
					stored for analytical purposes only functions (Scramjet
					(Caching proxied assets, session state, etc.), Autocomplete
					(Proxied), Setting Menu: Tab Cloak, Icon Presets, Transport
					Options, Search Engines, Theming, Sandboxing, Tor Routing,
					Hide Ads, Hidden History, and Region Swapping) rely on it
					for storing persistent data locally.
				</p>
				<p>
					In addiition, InvisiProxy uses Service Workers as a
					technology for our web proxies. This enables the ability to
					intercept respective network traffic, etc. and is a core
					function for the project.
				</p>
				<p>
					By continuing to navigate our website without changing your
					cookie settings, you hereby acknowledge and agree to
					InvisiProxy's use of cookies.
				</p>
				<h4 id="Changes">Ending Note</h4>
				<p>
					Although most changes are likely to be minor, InvisiProxy
					may change its Privacy Policy from time to time, and in
					InvisiProxy LTS's sole discretion. InvisiProxy LTS
					encourages visitors to frequently check this page for any
					changes to its Privacy Policy. Your continued use of this
					site after any change in this Privacy Policy will constitute
					your acceptance of such change. In the case of any abuse or
					DDOS attacks, InvisiProxy LTS may be forced to temporarily
					log data to mitigate the attack and ensure the service
					remains operational. In such cases, any logged data will be
					securely deleted immediately after the attack is mitigated.
				</p>
				<h4 id="Credit">{'Contact Information & Credit'}</h4>
				<p>
					{
						'\n      If you have any questions about our Privacy Policy, please contact us via\n      email at '
					}
					d9tcv6vgx@mozmail.com <br />
					<br />
				</p>
			</div>
		</div>
	);
}
