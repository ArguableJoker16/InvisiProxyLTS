import { Keywords, iconBookmarklet } from '../document-helpers.tsx';
import {
	ParticlesScript,
	PageScripts,
	PageDescription,
} from '../components/HeadScripts.tsx';
import HeadContent from '../components/HeadContent.tsx';
import AntiExfil from '../components/AntiExfil.tsx';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';

export default function Icons() {
	return (
		<>
			<Keywords />
			<AntiExfil />
			<div id="header" class="fullwidth">
				<Header />
			</div>
			<div id="background" class="fullwidth"></div>
			<Keywords />
			<div id="mainbody" class="fullwidth">
				<div class="box-clear text-center textm">
					<Keywords />
					<h1 class="bigtitle">Icon Information</h1>
					<h3>How to find the Icon URL of a Site</h3>
					<p>
						Go to the website you want an icon from, then use this
						bookmarklet (drag it to your bookmarks bar):
					</p>
					<div id="bks-parent">
						<a
							href={iconBookmarklet()}
							id="iconfinder"
							class="fancybutton fb-l glowbutton"
						>
							Find Icon URL
						</a>
					</div>
					<p>
						Copy the URL that the bookmarklet gives you. Then go
						back to InvisiLTS and enter in the URL for the Icon URL
						in Settings. Enjoy!
					</p>
				</div>
			</div>
			<div id="footer" class="fullwidth">
				<Footer />
			</div>
			<Keywords />
		</>
	);
}

export function Head() {
	return (
		<>
			<title>InvisiProxy LTS</title>
			<PageDescription />
			<HeadContent />
			<ParticlesScript />
			<PageScripts />
		</>
	);
}
