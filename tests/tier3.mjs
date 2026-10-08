// tests/tier3.mjs
import { assert, assertEqual, assertMatch, assertIncludes } from './test-utils.mjs';

/**
 * Tier 3: Cross-Feature Pairwise Interactions
 * 21 interaction tests validating connections and contracts across components.
 */
export function runTier3Interactions(ctx, runner) {
  runner.test('T3.1: Navbar Inici Link -> Hero Section Anchor (#inici)', () => {
    const navLink = ctx.dom.anchors.find((a) => a.href === '#inici' && a.text === 'Inici');
    assert(navLink, 'Nav link for #inici missing');
    assert(ctx.dom.elementsWithId.has('inici'), 'Section id="inici" must exist');
  });

  runner.test('T3.2: Navbar Eixos Link -> Civic Pillars Section Anchor (#eixos)', () => {
    const navLink = ctx.dom.anchors.find((a) => a.href === '#eixos' && a.text === 'Eixos Cívics');
    assert(navLink, 'Nav link for #eixos missing');
    assert(ctx.dom.elementsWithId.has('eixos'), 'Section id="eixos" must exist');
  });

  runner.test('T3.3: Navbar Projectes Link -> Projects Catalog Section Anchor (#projectes)', () => {
    const navLink = ctx.dom.anchors.find((a) => a.href === '#projectes' && a.text === 'Projectes');
    assert(navLink, 'Nav link for #projectes missing');
    assert(ctx.dom.elementsWithId.has('projectes'), 'Section id="projectes" must exist');
  });

  runner.test('T3.4: Navbar Trajectòria Link -> Gabriel Profile Section Anchor (#perfil)', () => {
    const navLink = ctx.dom.anchors.find((a) => a.href === '#perfil' && a.text === 'Trajectòria');
    assert(navLink, 'Nav link for #perfil missing');
    assert(ctx.dom.elementsWithId.has('perfil'), 'Section id="perfil" must exist');
  });

  runner.test('T3.5: Navbar Consultoria Link -> Consulting Section Anchor (#consultoria)', () => {
    const navLink = ctx.dom.anchors.find((a) => a.href === '#consultoria' && a.text === 'Consultoria');
    assert(navLink, 'Nav link for #consultoria missing');
    assert(ctx.dom.elementsWithId.has('consultoria'), 'Section id="consultoria" must exist');
  });

  runner.test('T3.6: Navbar Contacte Link -> Contact Hub Section Anchor (#contacte)', () => {
    const navLink = ctx.dom.anchors.find((a) => a.href === '#contacte' && a.text === 'Contacte');
    assert(navLink, 'Nav link for #contacte missing');
    assert(ctx.dom.elementsWithId.has('contacte'), 'Section id="contacte" must exist');
  });

  runner.test('T3.7: Mobile Menu Button -> Mobile Drawer Visibility Toggle', () => {
    const btn = ctx.dom.buttons.find((b) => b.id === 'mobile-menu-btn');
    assert(btn, 'Button #mobile-menu-btn missing');
    const drawer = ctx.dom.elementsWithId.get('mobile-menu');
    assert(drawer, 'Drawer #mobile-menu missing');
    assertIncludes(ctx.distHtml, 'mobile-menu-btn', 'mobile-menu-btn script reference missing');
    assertIncludes(ctx.distHtml, 'classList.toggle("hidden")', 'Mobile toggle script missing');
  });

  runner.test('T3.8: Mobile Drawer Links -> Auto-close on Navigation', () => {
    assertIncludes(ctx.distHtml, 'mobile-nav-link', 'Mobile links must have mobile-nav-link class');
    assertIncludes(ctx.distHtml, '.mobile-nav-link', 'Mobile nav links query selector missing');
  });

  runner.test('T3.9: Desktop ThemeToggle -> HTML root class toggle', () => {
    assertIncludes(ctx.distHtml, 'data-theme-toggle', 'data-theme-toggle attribute missing');
    assertIncludes(ctx.distHtml, 'classList.toggle("dark")', 'Theme toggle script must toggle dark class');
  });

  runner.test('T3.10: Mobile ThemeToggle -> localStorage persistence', () => {
    assertIncludes(ctx.distHtml, 'localStorage.setItem("theme"', 'Theme toggle must persist preference to localStorage');
  });

  runner.test('T3.11: Inline Anti-FOUC Head Script -> ThemeToggle localStorage sync', () => {
    assertIncludes(ctx.distHtml, "localStorage.getItem('theme')", 'Anti-FOUC script in head must read localStorage');
    assertIncludes(ctx.distHtml, 'prefers-color-scheme', 'Anti-FOUC script must fallback to system preference');
  });

  runner.test('T3.12: Hero CTA Primary -> Contact Hub Anchor (#contacte)', () => {
    const heroSection = ctx.dom.getSectionById('inici');
    assert(heroSection, 'Section #inici missing');
    assertIncludes(heroSection.innerHtml, 'href="#contacte"', 'Hero primary CTA must target #contacte');
    assertIncludes(heroSection.innerHtml, 'Proposa una iniciativa cívica', 'Hero primary CTA text missing');
  });

  runner.test('T3.13: Hero CTA Secondary -> Projects Catalog Anchor (#projectes)', () => {
    const heroSection = ctx.dom.getSectionById('inici');
    assert(heroSection, 'Section #inici missing');
    assertIncludes(heroSection.innerHtml, 'href="#projectes"', 'Hero secondary CTA must target #projectes');
    assertIncludes(heroSection.innerHtml, 'Explora els projectes', 'Hero secondary CTA text missing');
  });

  runner.test('T3.14: Civic Pillar 1 (Pro-bono) -> Contact Hub Anchor (#contacte)', () => {
    const pillarsSection = ctx.dom.getSectionById('eixos');
    assert(pillarsSection, 'Section #eixos missing');
    assertIncludes(pillarsSection.innerHtml, 'Demana suport pro-bono', 'Pillar 1 action text missing');
    assertIncludes(pillarsSection.innerHtml, 'href="#contacte"', 'Pillar 1 must target #contacte');
  });

  runner.test('T3.15: Civic Pillar 2 (Open Source) -> Projects Catalog Anchor (#projectes)', () => {
    const pillarsSection = ctx.dom.getSectionById('eixos');
    assert(pillarsSection, 'Section #eixos missing');
    assertIncludes(pillarsSection.innerHtml, 'Explora els projectes lliures', 'Pillar 2 action text missing');
    assertIncludes(pillarsSection.innerHtml, 'href="#projectes"', 'Pillar 2 must target #projectes');
  });

  runner.test('T3.16: Civic Pillar 3 (Citizen Inbox) -> Contact Hub Anchor (#contacte)', () => {
    const pillarsSection = ctx.dom.getSectionById('eixos');
    assert(pillarsSection, 'Section #eixos missing');
    assertIncludes(pillarsSection.innerHtml, 'Envia la teva proposta', 'Pillar 3 action text missing');
    assertIncludes(pillarsSection.innerHtml, 'href="#contacte"', 'Pillar 3 must target #contacte');
  });

  runner.test('T3.17: Subdomains Incubator CTA -> Contact Hub Anchor (#contacte)', () => {
    const projectsSection = ctx.dom.getSectionById('projectes');
    assert(projectsSection, 'Section #projectes missing');
    assertIncludes(projectsSection.innerHtml, 'Sol·licita un subdomini cívic', 'Incubator CTA text missing');
    assertIncludes(projectsSection.innerHtml, 'href="#contacte"', 'Incubator CTA must target #contacte');
  });

  runner.test('T3.18: Gabriel Bio Link -> data-partner.xyz External Navigation', () => {
    const bioSection = ctx.dom.getSectionById('perfil');
    assert(bioSection, 'Section #perfil missing');
    assertIncludes(bioSection.innerHtml, 'https://data-partner.xyz/ca/', 'Gabriel bio must link to data-partner.xyz');
    assertIncludes(bioSection.innerHtml, 'target="_blank"', 'Bio link must open in new tab');
  });

  runner.test('T3.19: Consulting Complement Block -> Contact Hub Anchor (#contacte)', () => {
    const consultSection = ctx.dom.getSectionById('consultoria');
    assert(consultSection, 'Section #consultoria missing');
    assertIncludes(consultSection.innerHtml, 'Xerrem del teu repte', 'Consulting secondary CTA text missing');
    assertIncludes(consultSection.innerHtml, 'href="#contacte"', 'Consulting CTA must target #contacte');
  });

  runner.test('T3.20: Citizen Proposal Form -> Mailto submission with URI encoding', () => {
    assertIncludes(ctx.distHtml, 'id="citizen-form"', '#citizen-form missing');
    assertIncludes(ctx.distHtml, 'mailto:gabriel@data-partner.xyz', 'Mailto target missing in form');
    assertIncludes(ctx.distHtml, 'encodeURIComponent', 'Form script must encode URI component');
  });

  runner.test('T3.21: Footer Back-to-Top Link -> Main Top Anchor (#top)', () => {
    const backToTop = ctx.dom.anchors.find((a) => a.href === '#top');
    assert(backToTop, 'Footer link targeting #top missing');
    const targetEl = ctx.dom.elementsWithId.get('top');
    assert(targetEl, 'Target element id="top" missing');
    assertEqual(targetEl.tag, 'main', 'Target element #top must be <main>');
  });
}
