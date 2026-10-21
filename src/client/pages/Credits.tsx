import { Keywords, Inline, route, credits } from '../document-helpers.tsx';
import {
	ParticlesScript,
	PageScripts,
	PageDescription,
} from '../components/HeadScripts.tsx';
import HeadContent from '../components/HeadContent.tsx';
import AntiExfil from '../components/AntiExfil.tsx';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';

export default function Credits() {
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
				<Keywords />
				<div id="credits" class="hero-grid-container">
					<div class="box-hero">
						<div class="box-noflex">
							<h1 class="bigtitle">Credits</h1>
							<h2>What is InvisiProxy?</h2>
							<p>
								InvisiProxy LTS is an official web proxy service
								can bypass web filters regardless of whether it
								is an extension or network-based.
								<br />
								This project allows you to access content
								otherwise blocked by governments, schools, or
								workplaces.
							</p>
							<div>
								{credits.map((section) => (
									<>
										<h3>{section.title}</h3>
										<table class="documentation-table">
											<thead>
												<tr>
													<th scope="col">Name</th>
													<th scope="col">
														Contributions
													</th>
													<th scope="col">
														Notes and Contact Info
													</th>
												</tr>
											</thead>
											<tbody>
												{section.people.map(
													(person) => (
														<tr>
															<td>
																<strong>
																	{
																		person.name
																	}
																</strong>
															</td>
															<td>
																{
																	person.contributions
																}
															</td>
															<td>
																{person.url ? (
																	<a
																		href={
																			person.url
																		}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		{
																			person.contact
																		}
																	</a>
																) : (
																	person.contact
																)}
															</td>
														</tr>
													)
												)}
											</tbody>
										</table>
									</>
								))}
								<div class="text-center">
									<div class="image-container-hero">
										<img
											class="potato"
											src={route(
												'/assets/img/potato.png'
											)}
											alt="icon"
										/>
									</div>
								</div>
							</div>
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
			<title>InvisiProxy LTS | Credits</title>
			<PageDescription />
			<HeadContent />
			<ParticlesScript />
			<PageScripts common={false} />
		</>
	);
}
