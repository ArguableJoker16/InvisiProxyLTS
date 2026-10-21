import { Keywords, Inline, route, SEO } from '../document-helpers.tsx';
import {
	ParticlesScript,
	PageScripts,
	PageDescription,
} from '../components/HeadScripts.tsx';
import HeadContent from '../components/HeadContent.tsx';
import AntiExfil from '../components/AntiExfil.tsx';
import Header from '../components/Header.tsx';
import FAQ from '../components/FAQ.tsx';
import Footer from '../components/Footer.tsx';

export default function FAQPage() {
	return (
		<>
			<Keywords />
			<AntiExfil />
			<div id="header" class="fullwidth">
				<Header />
			</div>
			<div id="background" class="fullwidth"></div>
			<Keywords />
			<div id="mainbody" class="box-hero">
				<div id="documentation" class="hero-grid-container">
					<div class="box-hero">
						<div class="box-noflex">
							<FAQ />
						</div>
					</div>
				</div>
			</div>
			<div id="footer" class="fullwidth">
				<Footer />
			</div>
			<Keywords />
			<Inline>
				<script src={route('assets/js/card.js', 'inline')} />
			</Inline>
		</>
	);
}

export function Head() {
	return (
		<>
			<title>
				InvisiProxy FAQ | Network Errors, CAPTCHAs &amp; YouTube Fixes
			</title>
			<SEO>
				<meta
					name="robots"
					content="index, follow, max-image-preview:large"
				/>
				<link
					rel="canonical"
					href="https://invisiproxy.com/questions"
				/>
				<meta
					name="description"
					content="Network Error, blank pages, CAPTCHA loops, or YouTube not loading? Fixes for the most common InvisiProxy problems, and whether it's safe to log in to sites."
				/>
				<meta property="og:site_name" content="InvisiProxy LTS" />
				<meta
					property="og:url"
					content="https://invisiproxy.com/questions"
				/>
				<meta
					property="og:title"
					content={
						'InvisiProxy FAQ | Network Errors, CAPTCHAs & YouTube Fixes'
					}
				/>
				<meta property="og:type" content="website" />
				<meta
					property="og:description"
					content="Quick fixes for Network Errors, blank pages, CAPTCHA loops and YouTube playback, plus answers on Discord support and logging in safely."
				/>
			</SEO>
			<meta property="og:image" content={route('assets/img/hero.webp')} />
			<meta
				property="og:image:secure_url"
				content={route('assets/img/hero.webp')}
			/>
			<SEO>
				<meta property="og:image:alt" content="InvisiProxy logo" />
				<meta property="og:locale" content="en_US" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@titaniumnetdev" />
				<meta name="twitter:creator" content="@titaniumnetdev" />
				<meta
					name="twitter:title"
					content={
						'InvisiProxy FAQ | Network Errors, CAPTCHAs & YouTube Fixes'
					}
				/>
				<meta
					name="twitter:description"
					content="Quick fixes for Network Errors, blank pages, CAPTCHA loops and YouTube playback, plus answers on Discord support and logging in safely."
				/>
				<meta
					name="twitter:image"
					content={route('assets/img/hero.webp')}
				/>
				<meta name="twitter:image:alt" content="InvisiProxy logo" />
			</SEO>
			<HeadContent />
			<ParticlesScript />
			<PageScripts />
		</>
	);
}
