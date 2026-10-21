import { Keywords, Inline, route, SEO } from '../document-helpers.tsx';
import {
	ParticlesScript,
	PageScripts,
	PageDescription,
} from '../components/HeadScripts.tsx';
import HeadContent from '../components/HeadContent.tsx';
import AntiExfil from '../components/AntiExfil.tsx';
import Header from '../components/Header.tsx';
import Documentation from '../components/Documentation.tsx';
import Footer from '../components/Footer.tsx';

export default function DocumentationPage() {
	return (
		<>
			<Keywords />
			<AntiExfil />
			<div id="header" class="fullwidth">
				<Header />
			</div>
			<div id="background" class="fullwidth"></div>
			<div id="mainbody" class="box-hero">
				<div id="documentation" class="hero-grid-container">
					<div class="box-hero">
						<div class="box-noflex">
							<Documentation />
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
			<script
				innerHTML={`
      (function () {
        var v = document.getElementById('vsc');
        var t, a;
        v.addEventListener(
          'mouseenter',
          function () {
            t = setTimeout(function () {
              if (!a) {
                a = true;
                var e = new Audio(
                  '${route('assets/misc/visualstudiocode.mp3')}'
                );
                e.play();
                e.addEventListener(
                  'ended',
                  function () {
                    a = false;
                  },
                  false
                );
              }
            }, 1000);
          },
          false
        );
        v.addEventListener(
          'mouseleave',
          function () {
            clearTimeout(t);
          },
          false
        );
      })();
    `}
			/>
		</>
	);
}

export function Head() {
	return (
		<>
			<title>
				InvisiProxy Docs | Self-Hosting, Configuration &amp; Tor Setup
			</title>
			<SEO>
				<meta
					name="robots"
					content="index, follow, max-image-preview:large"
				/>
				<link
					rel="canonical"
					href="https://invisiproxy.com/documentation"
				/>
				<meta
					name="description"
					content="Self-host InvisiProxy: install it with pnpm, set it up in config.json, route traffic through Tor or a SOCKS5 proxy, and see what each dependency does."
				/>
				<meta property="og:site_name" content="InvisiProxy LTS" />
				<meta
					property="og:url"
					content="https://invisiproxy.com/documentation"
				/>
				<meta
					property="og:title"
					content={
						'InvisiProxy Docs | Self-Hosting, Configuration & Tor Setup'
					}
				/>
				<meta property="og:type" content="website" />
				<meta
					property="og:description"
					content="Run your own InvisiProxy instance. Covers install, config.json, Tor and SOCKS5 routing, and the libraries the project is built on."
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
						'InvisiProxy Docs | Self-Hosting, Configuration & Tor Setup'
					}
				/>
				<meta
					name="twitter:description"
					content="Run your own InvisiProxy instance. Covers install, config.json, Tor and SOCKS5 routing, and the libraries the project is built on."
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
