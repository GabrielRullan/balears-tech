// tests/tier4.mjs
import { assert, assertEqual, assertMatch, assertIncludes } from './test-utils.mjs';

/**
 * Tier 4: Realistic User Journey Scenarios
 * 10 end-to-end user journeys validating real personas interacting with balears.tech.
 */
export function runTier4Scenarios(ctx, runner) {
  runner.test('T4.1: Citizen Proposing a Civic Initiative', () => {
    // Persona: Balearic citizen visits landing, reads manifesto, clicks CTA to submit project idea
    const hero = ctx.dom.getSectionById('inici');
    assertIncludes(hero.text, 'Voluntariat Tecnològic', 'Manifesto missing in hero');
    const heroCta = ctx.dom.anchors.find((a) => a.text?.includes('Proposa una iniciativa cívica'));
    assertEqual(heroCta?.href, '#contacte', 'Hero CTA should guide citizen to #contacte');

    const form = ctx.dom.getSectionById('contacte');
    assertIncludes(form.text, 'Bústia Ciutadana Directa', 'Form title missing in contact section');
    assert(ctx.dom.elementsWithId.has('contact-name'), 'Nom field missing for citizen');
    assert(ctx.dom.elementsWithId.has('contact-email'), 'Email field missing for citizen');
    assert(ctx.dom.elementsWithId.has('contact-type'), 'Initiative type dropdown missing');
    assertIncludes(ctx.distHtml, 'value="subdomini"', 'Option to propose subdomain missing');
  });

  runner.test('T4.2: Youth Scout Leader Finding Excursions and Shelters', () => {
    // Persona: Scout leader in Mallorca looks for free trails and shelters for weekend camp
    const projects = ctx.dom.getSectionById('projectes');
    assertIncludes(projects.text, 'escoltes.balears.tech', 'Escoltes subdomain missing in projects');
    assertIncludes(projects.text, '65 rutes', 'Route catalog count missing');
    assertIncludes(projects.text, '45 refugis', 'Shelters count missing');
    assertIncludes(projects.text, 'xarxa de transport TIB', 'TIB public transport integration missing');

    const escoltesLink = ctx.dom.anchors.find((a) => a.href === 'https://escoltes.balears.tech');
    assert(escoltesLink, 'External link to escoltes.balears.tech missing');
    assertEqual(escoltesLink.target, '_blank', 'Should open in a new tab');
    assertEqual(escoltesLink.rel, 'noopener noreferrer', 'Should have security rel attributes');
  });

  runner.test('T4.3: Tech Developer Exploring Murasaki no Jisho on Cloud Run', () => {
    // Persona: Software engineer discovers open source Japanese dictionary project
    const pillars = ctx.dom.getSectionById('eixos');
    assertIncludes(pillars.text, 'Col·laboració en Codi Obert', 'Open source pillar missing');

    const projects = ctx.dom.getSectionById('projectes');
    assertIncludes(projects.text, 'jisho.balears.tech', 'Jisho subdomain missing');
    assertIncludes(projects.text, 'Murasaki no Jisho', 'Dictionary project name missing');
    assertIncludes(projects.text, 'Google Cloud Run', 'Serverless Cloud Run architecture missing');
    assertIncludes(projects.text, 'JMdict', 'Open databases attribution missing');

    const jishoLink = ctx.dom.anchors.find((a) => a.href === 'https://jisho.balears.tech');
    assert(jishoLink, 'External link to jisho.balears.tech missing');
  });

  runner.test('T4.4: Local Non-Profit Seeking Pro-Bono Digital Support', () => {
    // Persona: Local cultural association needs digital audit and open tools
    const pillars = ctx.dom.getSectionById('eixos');
    assertIncludes(pillars.text, 'Suport Pro-bono', 'Pro-bono pillar missing');
    assertIncludes(pillars.text, 'Sense cost, sense tecnicismes incomprensibles', 'Altruistic promise missing');

    const actionLink = ctx.dom.anchors.find((a) => a.text?.includes('Demana suport pro-bono'));
    assertEqual(actionLink?.href, '#contacte', 'Action must direct to contact hub');

    const contact = ctx.dom.getSectionById('contacte');
    assertIncludes(contact.innerHtml, 'value="pro-bono"', 'Pro-bono option available in contact hub');
  });

  runner.test('T4.5: Balearic Enterprise Exploring Commercial Data Partner Consulting', () => {
    // Persona: CEO/CFO of Balearic company needs business intelligence & data engineering
    const consultSection = ctx.dom.getSectionById('consultoria');
    assertIncludes(consultSection.text, 'data-partner.xyz', 'Commercial partner brand missing');
    assertIncludes(consultSection.text, 'Business Intelligence', 'BI service missing');
    assertIncludes(consultSection.text, 'Simplificació i Integració de Dades', 'Data pipeline service missing');
    assertIncludes(consultSection.text, 'finança i fa sostenible', 'Explanation of civic funding model missing');

    const dpLink = ctx.dom.anchors.find((a) => a.href === 'https://data-partner.xyz/ca/');
    assert(dpLink, 'Link to data-partner.xyz missing');
    assertEqual(dpLink.target, '_blank', 'data-partner link must open in new tab');
  });

  runner.test('T4.6: Mobile Visitor Using Hamburger Navigation & Dark Mode', () => {
    // Persona: Mobile smartphone user opens navigation drawer, toggles dark theme
    const btn = ctx.dom.buttons.find((b) => b.id === 'mobile-menu-btn');
    assert(btn, 'Mobile menu button missing');
    const mobileDrawer = ctx.dom.elementsWithId.get('mobile-menu');
    assert(mobileDrawer, 'Mobile menu drawer missing');

    const mobileThemeBtn = ctx.dom.buttons.find((b) => b.id === 'theme-toggle-mobile');
    assert(mobileThemeBtn, 'Mobile theme toggle button missing');
    assertIncludes(ctx.distHtml, 'theme-toggle-mobile', 'Mobile theme toggle script hook missing');
  });

  runner.test('T4.7: Community Innovator Proposing Subdomain under *.balears.tech Incubator', () => {
    // Persona: Citizen with community project proposal applies for incubator
    const projects = ctx.dom.getSectionById('projectes');
    assertIncludes(projects.text, 'Incubador de Nous Projectes Cívics', 'Incubator title missing');
    assertIncludes(projects.text, '*.balears.tech', '*.balears.tech wildcard missing');
    assertIncludes(projects.text, 'Hosting i subdomini 100% de franc', 'Free hosting promise missing');

    const cta = ctx.dom.anchors.find((a) => a.text?.includes('Sol·licita un subdomini cívic'));
    assertEqual(cta?.href, '#contacte', 'Incubator CTA should route to contact');
  });

  runner.test('T4.8: Tech Executive Reviewing Gabriel Rul-lan Corporate Credentials', () => {
    // Persona: VP of Engineering validates Gabriel Rul-lan corporate and academic pedigree
    const bio = ctx.dom.getSectionById('perfil');
    assertIncludes(bio.text, 'Gabriel Rul-lan', 'Profile name missing');
    assertIncludes(bio.text, 'AstraZeneca', 'AstraZeneca experience missing');
    assertIncludes(bio.text, 'MAPFRE', 'MAPFRE experience missing');
    assertIncludes(bio.text, 'Boehringer Ingelheim', 'Boehringer experience missing');
    assertIncludes(bio.text, 'Llicenciat en Matemàtiques (UIB)', 'UIB maths degree missing');
    assertIncludes(bio.text, 'Executive MBA (ESERP Business School)', 'ESERP MBA missing');
    assertIncludes(bio.text, 'Certificació Oficial PMP®', 'PMP certification missing');

    const li = ctx.dom.anchors.find((a) => a.href?.includes('linkedin.com/in/gabriel-rullan'));
    assert(li, 'LinkedIn link missing in bio');
  });

  runner.test('T4.9: Immediate Meeting Scheduling via Google Calendar / Telegram', () => {
    // Persona: Partner schedules a direct 30-min call without intermediary back-and-forth
    const contact = ctx.dom.getSectionById('contacte');
    assertIncludes(contact.text, 'Agenda una Reunió', 'Calendar card title missing');
    assertIncludes(contact.text, 'Reserva 30 minuts per videoconferència', 'Meeting duration explanation missing');

    const calLink = ctx.dom.anchors.find((a) => a.href?.includes('calendar.app.google'));
    assert(calLink, 'Google Calendar booking link missing');

    const tgLink = ctx.dom.anchors.find((a) => a.href === 'https://t.me/gabriel_rullan');
    assert(tgLink, 'Telegram link missing');
  });

  runner.test('T4.10: Search Engine Crawler & Social Media Bot Indexing', () => {
    // Persona: Googlebot / Twitterbot / Slack unfurler crawls platform for indexing and previews
    const robots = ctx.readDistFile('robots.txt') || '';
    assertIncludes(robots, 'User-agent: *', 'Robots.txt must allow crawlers');
    assertIncludes(robots, 'Sitemap: https://balears-tech.web.app/sitemap-index.xml', 'Sitemap index URL missing');

    assertEqual(ctx.dom.lang, 'ca', 'Language attribute must be Catalan');
    assertIncludes(ctx.dom.title, 'balears.tech', 'Title must identify domain');

    const metaDesc = ctx.dom.meta.find((m) => m.name === 'description');
    assert(metaDesc?.content?.length > 20, 'Meta description must be descriptive');

    const ogImg = ctx.dom.meta.find((m) => m.property === 'og:image');
    assert(ogImg?.content, 'OpenGraph image required for social cards');
  });
}
