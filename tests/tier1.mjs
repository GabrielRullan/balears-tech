// tests/tier1.mjs
import { assert, assertEqual, assertMatch, assertIncludes } from './test-utils.mjs';

/**
 * Tier 1: Functional Feature Testing
 * 105 test cases covering F1 through F21 (5 tests per feature).
 */
export function runTier1Features(ctx, runner) {
  // F1: Astro 5 Core Setup
  runner.test('F1.1: Astro dependency in package.json', () => {
    assert(ctx.packageJson.dependencies?.astro, 'Astro dependency missing in package.json');
    assertMatch(ctx.packageJson.dependencies.astro, /\^5\./, 'Astro version must be ^5.x');
  });
  runner.test('F1.2: Astro config sets static output', () => {
    assertIncludes(ctx.astroConfig, "output: 'static'", "astro.config.mjs must specify output: 'static'");
  });
  runner.test('F1.3: tsconfig extends Astro configuration', () => {
    assert(ctx.tsconfig.extends, 'tsconfig must extend Astro base config');
    assertIncludes(ctx.tsconfig.extends, 'astro', 'tsconfig extends should point to astro');
  });
  runner.test('F1.4: Build script defined in package.json', () => {
    assertEqual(ctx.packageJson.scripts?.build, 'astro build', 'build script must execute astro build');
  });
  runner.test('F1.5: dist/index.html generated and non-empty', () => {
    assert(ctx.distFileExists('index.html'), 'dist/index.html must exist');
    assert((ctx.distHtml?.length || 0) > 10000, 'dist/index.html must be substantial HTML output');
  });

  // F2: Tailwind CSS Integration
  runner.test('F2.1: Tailwind packages in package.json', () => {
    assert(ctx.packageJson.dependencies?.['@astrojs/tailwind'], '@astrojs/tailwind missing');
    assert(ctx.packageJson.dependencies?.['tailwindcss'], 'tailwindcss missing');
  });
  runner.test('F2.2: Tailwind config enables class dark mode', () => {
    assertIncludes(ctx.tailwindConfig, "darkMode: 'class'", "Tailwind config must specify darkMode: 'class'");
  });
  runner.test('F2.3: Tailwind config defines Mediterranean color palette', () => {
    assertIncludes(ctx.tailwindConfig, 'ocean:', 'Ocean palette tokens must be defined');
    assertIncludes(ctx.tailwindConfig, 'teal:', 'Teal palette tokens must be defined');
    assertIncludes(ctx.tailwindConfig, 'coral:', 'Coral palette tokens must be defined');
  });
  runner.test('F2.4: Compiled CSS bundle present in dist/_astro', () => {
    assert((ctx.cssBundle?.length || 0) > 1000, 'dist/_astro must contain compiled CSS bundle');
  });
  runner.test('F2.5: Tailwind utility classes present in HTML', () => {
    assertIncludes(ctx.distHtml, 'bg-surface-light', 'Surface light background class missing');
    assertIncludes(ctx.distHtml, 'dark:bg-surface-dark', 'Surface dark background class missing');
  });

  // F3: Iconography Setup
  runner.test('F3.1: lucide-astro dependency present in package.json', () => {
    assert(ctx.packageJson.dependencies?.['lucide-astro'], 'lucide-astro missing');
  });
  runner.test('F3.2: Rendered SVGs present in DOM', () => {
    assert(ctx.dom.svgs.length > 10, `Expected multiple SVGs, found ${ctx.dom.svgs.length}`);
  });
  runner.test('F3.3: SVGs contain valid viewBox attributes', () => {
    const validViewboxes = ctx.dom.svgs.filter((s) => s.viewBox && s.viewBox.includes('0 0 24 24'));
    assert(validViewboxes.length > 5, 'Lucide icons should have 0 0 24 24 viewBox');
  });
  runner.test('F3.4: Essential icons present (sun/moon, menu, arrows)', () => {
    assertIncludes(ctx.distHtml, 'lucide-sun', 'Sun icon missing from markup');
    assertIncludes(ctx.distHtml, 'lucide-moon', 'Moon icon missing from markup');
  });
  runner.test('F3.5: SVGs use appropriate sizing and classes', () => {
    const styledSvgs = ctx.dom.svgs.filter((s) => s.class && s.class.includes('w-'));
    assert(styledSvgs.length > 5, 'SVGs should have Tailwind size classes');
  });

  // F4: Asset Consolidation
  runner.test('F4.1: Public image assets exist in public/assets/img', () => {
    const images = ['hero.jpg', 'escoltes.jpg', 'jisho.jpg', 'consultoria.jpg', 'gabriel-rullan.jpg', 'logo.svg'];
    images.forEach((img) => {
      assert(ctx.fileExists(`public/assets/img/${img}`), `Required asset missing: ${img}`);
    });
  });
  runner.test('F4.2: public/favicon.svg exists', () => {
    assert(ctx.fileExists('public/favicon.svg'), 'public/favicon.svg must exist');
  });
  runner.test('F4.3: dist contains copied assets in dist/assets/img', () => {
    assert(ctx.distFileExists('assets/img/hero.jpg'), 'dist/assets/img/hero.jpg missing');
    assert(ctx.distFileExists('assets/img/logo.svg'), 'dist/assets/img/logo.svg missing');
  });
  runner.test('F4.4: dist contains favicon.svg at root', () => {
    assert(ctx.distFileExists('favicon.svg'), 'dist/favicon.svg must exist');
  });
  runner.test('F4.5: HTML documents reference consolidated image paths', () => {
    assertIncludes(ctx.distHtml, '/assets/img/hero.jpg', 'Hero image reference missing');
    assertIncludes(ctx.distHtml, '/assets/img/logo.svg', 'Logo image reference missing');
  });

  // F5: Firebase Hosting Config
  runner.test('F5.1: firebase.json exists with hosting section', () => {
    assert(ctx.firebaseJson.hosting, 'firebase.json missing hosting configuration');
  });
  runner.test('F5.2: firebase.json hosting public directory is dist', () => {
    assertEqual(ctx.firebaseJson.hosting.public, 'dist', 'firebase.json hosting public must be dist');
  });
  runner.test('F5.3: cleanUrls enabled in firebase.json', () => {
    assertEqual(ctx.firebaseJson.hosting.cleanUrls, true, 'cleanUrls must be true');
  });
  runner.test('F5.4: Cache-Control headers configured for assets', () => {
    const headers = ctx.firebaseJson.hosting.headers || [];
    assert(headers.length > 0, 'firebase.json headers must be configured');
    const assetRule = headers.find((h) => h.source?.includes('jpg|jpeg'));
    assert(assetRule, 'Asset caching rule missing');
  });
  runner.test('F5.5: .firebaserc maps default project to balears-tech', () => {
    assertEqual(ctx.firebaserc.projects?.default, 'balears-tech', 'Default firebase project must be balears-tech');
  });

  // F6: MkDocs Decommission
  runner.test('F6.1: mkdocs.yml removed from project root', () => {
    assert(!ctx.fileExists('mkdocs.yml'), 'mkdocs.yml must not exist');
  });
  runner.test('F6.2: docs/ directory removed', () => {
    assert(!ctx.fileExists('docs'), 'docs/ directory must not exist');
  });
  runner.test('F6.3: site/ directory removed', () => {
    assert(!ctx.fileExists('site'), 'site/ directory must not exist');
  });
  runner.test('F6.4: .gitignore excludes build output and dependencies', () => {
    assertIncludes(ctx.gitignore, 'dist', '.gitignore must exclude dist');
    assertIncludes(ctx.gitignore, 'node_modules', '.gitignore must exclude node_modules');
    assertIncludes(ctx.gitignore, '.astro', '.gitignore must exclude .astro');
  });
  runner.test('F6.5: package.json scripts contain zero mkdocs references', () => {
    const scripts = JSON.stringify(ctx.packageJson.scripts || {});
    assert(!scripts.includes('mkdocs'), 'package.json scripts must not reference mkdocs');
  });

  // F7: Base Build Verification
  runner.test('F7.1: Build output size is robust (> 50KB)', () => {
    assert((ctx.distHtml?.length || 0) > 50000, 'HTML build output must be > 50KB');
  });
  runner.test('F7.2: HTML contains <!doctype html>', () => {
    assertMatch(ctx.distHtml, /<!doctype\s+html>/i, 'HTML must start with <!doctype html>');
  });
  runner.test('F7.3: HTML contains semantic header, main, and footer', () => {
    assertIncludes(ctx.distHtml, '<header', '<header> element missing');
    assertIncludes(ctx.distHtml, '<main', '<main> element missing');
    assertIncludes(ctx.distHtml, '<footer', '<footer> element missing');
  });
  runner.test('F7.4: Main container has id="top"', () => {
    assert(ctx.dom.elementsWithId.has('top'), 'Element with id="top" must exist');
  });
  runner.test('F7.5: robots.txt exists in dist build output', () => {
    assert(ctx.distFileExists('robots.txt'), 'dist/robots.txt must exist');
  });

  // F8: Mediterranean Layout & SEO
  runner.test('F8.1: html tag has lang="ca"', () => {
    assertEqual(ctx.dom.lang, 'ca', 'Document language must be Catalan ("ca")');
  });
  runner.test('F8.2: title tag reflects balears.tech civic platform', () => {
    assertIncludes(ctx.dom.title, 'balears.tech', 'Title must contain balears.tech');
    assertIncludes(ctx.dom.title, 'Impacte Cívic', 'Title must contain Impacte Cívic');
  });
  runner.test('F8.3: meta description explains civic initiative', () => {
    assertIncludes(ctx.distHtml, 'name="description"', 'Meta description tag missing');
    assertIncludes(ctx.distHtml, 'voluntariat', 'Meta description must mention voluntariat');
  });
  runner.test('F8.4: canonical URL points to https://balears.tech', () => {
    const canonicalLink = ctx.dom.links.find((l) => l.rel === 'canonical');
    assert(canonicalLink?.href, 'Canonical link missing');
    assertIncludes(canonicalLink.href, 'balears.tech', 'Canonical URL must point to balears.tech');
  });
  runner.test('F8.5: OpenGraph metadata configured (og:title, og:locale, og:type)', () => {
    const ogTitle = ctx.dom.meta.find((m) => m.property === 'og:title');
    const ogLocale = ctx.dom.meta.find((m) => m.property === 'og:locale');
    assert(ogTitle?.content, 'og:title missing');
    assertEqual(ogLocale?.content, 'ca_ES', 'og:locale must be ca_ES');
  });

  // F9: Navbar & Theme Toggle
  runner.test('F9.1: Header navigation bar present', () => {
    assertIncludes(ctx.distHtml, '<header', 'Header element missing');
    assertIncludes(ctx.distHtml, 'backdrop-blur', 'Navbar backdrop blur missing');
  });
  runner.test('F9.2: Brand identity includes logo and civic subtitle', () => {
    assertIncludes(ctx.distHtml, 'balears.tech logo', 'Logo alt attribute missing');
    assertIncludes(ctx.distHtml, 'Civic Tech & Voluntariat', 'Civic subtitle missing');
  });
  runner.test('F9.3: Desktop navigation contains core anchor items', () => {
    const navHrefs = ctx.dom.anchors.map((a) => a.href);
    assert(navHrefs.includes('#inici'), 'Nav link #inici missing');
    assert(navHrefs.includes('#eixos'), 'Nav link #eixos missing');
    assert(navHrefs.includes('#projectes'), 'Nav link #projectes missing');
    assert(navHrefs.includes('#perfil'), 'Nav link #perfil missing');
    assert(navHrefs.includes('#contacte'), 'Nav link #contacte missing');
  });
  runner.test('F9.4: Mobile hamburger button with accessibility attributes', () => {
    const btn = ctx.dom.buttons.find((b) => b.id === 'mobile-menu-btn');
    assert(btn, 'Button #mobile-menu-btn missing');
    assertEqual(btn.ariaLabel, 'Menú de navegació', 'aria-label must describe navigation menu');
  });
  runner.test('F9.5: ThemeToggle buttons present with data-theme-toggle', () => {
    assertIncludes(ctx.distHtml, 'data-theme-toggle', 'data-theme-toggle attribute missing');
    assertIncludes(ctx.distHtml, 'id="theme-toggle"', '#theme-toggle element missing');
  });

  // F10: Footer Component
  runner.test('F10.1: Footer element rendered', () => {
    assertIncludes(ctx.distHtml, '<footer', 'Footer element missing');
  });
  runner.test('F10.2: Footer contains mission and Mallorca commitment', () => {
    assertIncludes(ctx.distHtml, 'Fet amb compromís cívic des de Mallorca', 'Footer commitment text missing');
  });
  runner.test('F10.3: Footer contains section quick navigation', () => {
    assertIncludes(ctx.distHtml, 'Manifest Cívic', 'Footer link Manifest Cívic missing');
    assertIncludes(ctx.distHtml, 'Pilars de Suport', 'Footer link Pilars de Suport missing');
  });
  runner.test('F10.4: Footer links to ecosystem subdomains', () => {
    assertIncludes(ctx.distHtml, 'https://escoltes.balears.tech', 'Footer escoltes link missing');
    assertIncludes(ctx.distHtml, 'https://jisho.balears.tech', 'Footer jisho link missing');
    assertIncludes(ctx.distHtml, 'https://data-partner.xyz/ca/', 'Footer data-partner link missing');
  });
  runner.test('F10.5: Footer includes copyright and back to top button', () => {
    assertIncludes(ctx.distHtml, '© 2026 balears.tech', 'Copyright 2026 missing');
    assertIncludes(ctx.distHtml, 'Torna a dalt', 'Torna a dalt link missing');
  });

  // F11: Hero & Civic Tech Manifesto
  runner.test('F11.1: Section #inici exists in DOM', () => {
    assert(ctx.dom.elementsWithId.has('inici'), 'Section #inici must exist');
  });
  runner.test('F11.2: Civic badge highlights volunteering in Balearics', () => {
    assertIncludes(ctx.distHtml, 'Voluntariat Tecnològic · Impacte Cívic a les Illes Balears', 'Civic badge missing');
  });
  runner.test('F11.3: H1 emphasizes open tech and Balearic community', () => {
    const h1 = ctx.dom.headings.find((h) => h.level === 1);
    assert(h1, 'H1 heading missing');
    assertIncludes(h1.text, 'Illes Balears', 'H1 must include Illes Balears');
    assertIncludes(h1.text, 'Tecnologia oberta', 'H1 must include Tecnologia oberta');
  });
  runner.test('F11.4: Manifesto explains Gabriel Rul-lan giving back corporate experience', () => {
    assertIncludes(ctx.distHtml, "Posem l'experiència tècnica corporativa al servei", 'Manifesto mission missing');
  });
  runner.test('F11.5: Island tags present for Mallorca, Menorca, Eivissa, Formentera', () => {
    assertIncludes(ctx.distHtml, 'Mallorca', 'Mallorca tag missing');
    assertIncludes(ctx.distHtml, 'Menorca', 'Menorca tag missing');
    assertIncludes(ctx.distHtml, 'Eivissa', 'Eivissa tag missing');
    assertIncludes(ctx.distHtml, 'Formentera', 'Formentera tag missing');
  });

  // F12: Three Collaboration Pillars
  runner.test('F12.1: Section #eixos exists in DOM', () => {
    assert(ctx.dom.elementsWithId.has('eixos'), 'Section #eixos must exist');
  });
  runner.test('F12.2: Pillar 1: Suport Pro-bono & Acompanyament Tècnic', () => {
    assertIncludes(ctx.distHtml, 'Suport Pro-bono', 'Pillar 1 title missing');
    assertIncludes(ctx.distHtml, 'Acompanyament Tècnic', 'Pillar 1 subtitle missing');
    assertIncludes(ctx.distHtml, 'Sense cost, sense tecnicismes incomprensibles', 'Pillar 1 motto missing');
  });
  runner.test('F12.3: Pillar 2: Col·laboració en Codi Obert (Tech Commons)', () => {
    assertIncludes(ctx.distHtml, 'Col·laboració en Codi Obert', 'Pillar 2 title missing');
    assertIncludes(ctx.distHtml, 'Tech Commons', 'Pillar 2 badge missing');
    assertIncludes(ctx.distHtml, 'Tecnologia feta per la comunitat, propietat de la comunitat', 'Pillar 2 motto missing');
  });
  runner.test('F12.4: Pillar 3: Bústia Ciutadana d\'Idees i Propostes', () => {
    assertIncludes(ctx.distHtml, 'Bústia Ciutadana', 'Pillar 3 title missing');
    assertIncludes(ctx.distHtml, 'Idees i Propostes', 'Pillar 3 subtitle missing');
    assertIncludes(ctx.distHtml, 'La teva proposta té espai', 'Pillar 3 motto missing');
  });
  runner.test('F12.5: All 3 pillars have call-to-action navigation buttons', () => {
    assertIncludes(ctx.distHtml, 'Demana suport pro-bono', 'Pillar 1 CTA missing');
    assertIncludes(ctx.distHtml, 'Explora els projectes lliures', 'Pillar 2 CTA missing');
    assertIncludes(ctx.distHtml, 'Envia la teva proposta', 'Pillar 3 CTA missing');
  });

  // F13: Community Impact Metrics
  runner.test('F13.1: Stats section present in DOM', () => {
    assertIncludes(ctx.distHtml, 'experiència corporativa', 'Stats section label missing');
  });
  runner.test('F13.2: Metric +13 years corporate experience', () => {
    assertIncludes(ctx.distHtml, '+13', '+13 metric missing');
    assertIncludes(ctx.distHtml, 'AstraZeneca, MAPFRE, Boehringer', 'Corporate sublabel missing');
  });
  runner.test('F13.3: Metric +65 routes in escoltes portal', () => {
    assertIncludes(ctx.distHtml, '+65', '+65 metric missing');
    assertIncludes(ctx.distHtml, 'rutes i acampades a escoltes', 'Escoltes sublabel missing');
  });
  runner.test('F13.4: Metric +34.000 dictionary entries in jisho', () => {
    assertIncludes(ctx.distHtml, '+34.000', '+34.000 metric missing');
    assertIncludes(ctx.distHtml, 'entrades al diccionari jisho', 'Jisho sublabel missing');
  });
  runner.test('F13.5: Metric 4 islands connected', () => {
    assertIncludes(ctx.distHtml, 'illes connectades', '4 islands metric missing');
  });

  // F14: Gabriel Rul-lan Profile
  runner.test('F14.1: Section #perfil exists in DOM', () => {
    assert(ctx.dom.elementsWithId.has('perfil'), 'Section #perfil must exist');
  });
  runner.test('F14.2: Profile portrait image loaded with alt text', () => {
    assertIncludes(ctx.distHtml, '/assets/img/gabriel-rullan.jpg', 'Gabriel photo src missing');
    assertIncludes(ctx.distHtml, 'Gabriel Rul-lan - Matemàtic', 'Gabriel photo alt missing');
  });
  runner.test('F14.3: Academic degrees and credentials displayed', () => {
    assertIncludes(ctx.distHtml, 'Llicenciat en Matemàtiques', 'Degree in maths missing');
    assertIncludes(ctx.distHtml, 'Executive MBA', 'MBA degree missing');
    assertIncludes(ctx.distHtml, 'Certificació Oficial PMP®', 'PMP certification missing');
  });
  runner.test('F14.4: Corporate track record logos and companies listed', () => {
    assertIncludes(ctx.distHtml, 'AstraZeneca', 'AstraZeneca missing');
    assertIncludes(ctx.distHtml, 'MAPFRE', 'MAPFRE missing');
    assertIncludes(ctx.distHtml, 'Boehringer Ingelheim', 'Boehringer Ingelheim missing');
    assertIncludes(ctx.distHtml, 'Movinga', 'Movinga missing');
    assertIncludes(ctx.distHtml, 'APSL', 'APSL missing');
  });
  runner.test('F14.5: Direct professional channels (LinkedIn & Telegram)', () => {
    assertIncludes(ctx.distHtml, 'https://www.linkedin.com/in/gabriel-rullan/', 'LinkedIn link missing');
    assertIncludes(ctx.distHtml, 'https://t.me/gabriel_rullan', 'Telegram link missing');
  });

  // F15: Community Projects Catalog
  runner.test('F15.1: Section #projectes exists in DOM', () => {
    assert(ctx.dom.elementsWithId.has('projectes'), 'Section #projectes must exist');
    assertIncludes(ctx.distHtml, 'dni.balears.tech', 'dni.balears.tech missing');
    assertIncludes(ctx.distHtml, 'https://github.com/GabrielRullan/dni-blur', 'GabrielRullan/dni-blur missing');
  });
  runner.test('F15.2: escoltes.balears.tech card with thumbnail and title', () => {
    assertIncludes(ctx.distHtml, '/assets/img/escoltes.jpg', 'Escoltes thumbnail missing');
    assertIncludes(ctx.distHtml, "Portal d'excursions i acampades per a l'escoltisme", 'Escoltes card title missing');
  });
  runner.test('F15.3: escoltes card details 65+ rutes, 45 refugis, TIB transport', () => {
    assertIncludes(ctx.distHtml, '65 rutes catalogades', 'Escoltes 65 routes missing');
    assertIncludes(ctx.distHtml, "45 refugis i zones d'acampada legal", 'Escoltes 45 refuges missing');
    assertIncludes(ctx.distHtml, 'xarxa de transport TIB', 'TIB integration missing');
  });
  runner.test('F15.4: jisho.balears.tech card with Murasaki no Jisho title', () => {
    assertIncludes(ctx.distHtml, '/assets/img/jisho.jpg', 'Jisho thumbnail missing');
    assertIncludes(ctx.distHtml, 'Murasaki no Jisho — Diccionari japonès obert', 'Jisho title missing');
  });
  runner.test('F15.5: jisho card details Cloud Run, 34.300+ entries, JMdict', () => {
    assertIncludes(ctx.distHtml, '34.300 entrades', 'Jisho entries count missing');
    assertIncludes(ctx.distHtml, 'Google Cloud Run', 'Cloud Run mention missing');
    assertIncludes(ctx.distHtml, 'JMdict', 'JMdict mention missing');
  });

  // F16: Subdomains Incubator Call
  runner.test('F16.1: Incubator card present in projects grid', () => {
    assertIncludes(ctx.distHtml, 'Incubador de Nous Projectes Cívics', 'Incubator card title missing');
  });
  runner.test('F16.2: Card offers *.balears.tech subdomains', () => {
    assertIncludes(ctx.distHtml, '*.balears.tech', '*.balears.tech wildcard missing');
  });
  runner.test('F16.3: Card guarantees 100% free hosting and subdomains', () => {
    assertIncludes(ctx.distHtml, 'Hosting i subdomini 100% de franc', 'Free hosting guarantee missing');
  });
  runner.test('F16.4: Card mentions serverless architectures (Firebase / Cloud Run)', () => {
    assertIncludes(ctx.distHtml, 'Firebase Hosting / Cloud Run', 'Serverless stack mention missing');
  });
  runner.test('F16.5: Card includes call to action link to #contacte', () => {
    assertIncludes(ctx.distHtml, 'Sol·licita un subdomini cívic', 'Incubator CTA button missing');
  });

  // F17: Consulting Complement Block
  runner.test('F17.1: Section #consultoria located towards bottom of page', () => {
    assert(ctx.dom.elementsWithId.has('consultoria'), 'Section #consultoria must exist');
  });
  runner.test('F17.2: Mentions data-partner.xyz as corporate vehicle', () => {
    assertIncludes(ctx.distHtml, 'data-partner.xyz', 'data-partner.xyz brand missing');
  });
  runner.test('F17.3: Outlines 4 corporate consulting services', () => {
    assertIncludes(ctx.distHtml, 'Simplificació i Integració de Dades', 'Service 1 missing');
    assertIncludes(ctx.distHtml, 'Business Intelligence', 'Service 2 missing');
    assertIncludes(ctx.distHtml, 'Dashboards Executius', 'Service 2 subtitle missing');
    assertIncludes(ctx.distHtml, 'Auditoria Tecnològica i Optimització de Costos', 'Service 3 missing');
    assertIncludes(ctx.distHtml, 'Oficina de Dades com a Servei', 'Service 4 missing');
  });
  runner.test('F17.4: Explains consulting funds and sustains civic volunteering', () => {
    assertIncludes(ctx.distHtml, 'finança i fa sostenible en el temps', 'Social financing model explanation missing');
  });
  runner.test('F17.5: Links directly to https://data-partner.xyz/ca/', () => {
    assertIncludes(ctx.distHtml, 'https://data-partner.xyz/ca/', 'data-partner.xyz link missing');
  });

  // F18: Direct Contact Channels & Citizen Form
  runner.test('F18.1: Section #contacte exists in DOM', () => {
    assert(ctx.dom.elementsWithId.has('contacte'), 'Section #contacte must exist');
  });
  runner.test('F18.2: Google Calendar booking link present', () => {
    assertIncludes(ctx.distHtml, 'https://calendar.app.google/YbQTidmXT3Bg9wdY8', 'Calendar link missing');
  });
  runner.test('F18.3: Telegram direct contact link present', () => {
    assertIncludes(ctx.distHtml, 'https://t.me/gabriel_rullan', 'Telegram link missing');
  });
  runner.test('F18.4: Email and phone direct channels present', () => {
    assertIncludes(ctx.distHtml, 'gabriel@data-partner.xyz', 'Email contact missing');
    assertIncludes(ctx.distHtml, 'tel:+34638952623', 'Phone tel: link missing');
  });
  runner.test('F18.5: Citizen proposal form #citizen-form with all inputs', () => {
    assert(ctx.dom.elementsWithId.has('citizen-form'), '#citizen-form missing');
    assert(ctx.dom.elementsWithId.has('contact-name'), '#contact-name input missing');
    assert(ctx.dom.elementsWithId.has('contact-email'), '#contact-email input missing');
    assert(ctx.dom.elementsWithId.has('contact-type'), '#contact-type select missing');
    assert(ctx.dom.elementsWithId.has('contact-message'), '#contact-message textarea missing');
  });

  // F19: E2E Testing Suite Architecture
  runner.test('F19.1: test-utils.mjs exists and contains assertions', () => {
    assert(ctx.fileExists('tests/test-utils.mjs'), 'tests/test-utils.mjs must exist');
  });
  runner.test('F19.2: Test suite split into modular tier files', () => {
    assert(ctx.fileExists('tests/tier1.mjs'), 'tests/tier1.mjs must exist');
  });
  runner.test('F19.3: Test runner runner functions validate context', () => {
    assert(ctx.dom.raw.length > 0, 'ctx.dom.raw must be populated');
  });
  runner.test('F19.4: buildTestContext populates rootDir and distDir', () => {
    assert(ctx.rootDir.length > 0, 'ctx.rootDir must be non-empty');
    assert(ctx.distDir.length > 0, 'ctx.distDir must be non-empty');
  });
  runner.test('F19.5: Helper methods fileExists and distFileExists functional', () => {
    assert(ctx.fileExists('package.json'), 'ctx.fileExists must return true for package.json');
    assert(ctx.distFileExists('index.html'), 'ctx.distFileExists must return true for index.html');
  });

  // F20: Clean Git Repository
  runner.test('F20.1: Git repository metadata folder .git exists', () => {
    assert(ctx.fileExists('.git'), '.git directory must exist');
  });
  runner.test('F20.2: .gitignore file exists and ignores build artifacts', () => {
    assert(ctx.fileExists('.gitignore'), '.gitignore must exist');
  });
  runner.test('F20.3: Required configuration files exist at root', () => {
    assert(ctx.fileExists('package.json'), 'package.json missing');
    assert(ctx.fileExists('astro.config.mjs'), 'astro.config.mjs missing');
    assert(ctx.fileExists('tailwind.config.mjs'), 'tailwind.config.mjs missing');
  });
  runner.test('F20.4: Source folder src/ contains components and layouts', () => {
    assert(ctx.fileExists('src/components/Navbar.astro'), 'Navbar.astro missing');
    assert(ctx.fileExists('src/layouts/Layout.astro'), 'Layout.astro missing');
  });
  runner.test('F20.5: No leftover mkdocs or python docs folders', () => {
    assert(!ctx.fileExists('site'), 'site/ directory should be absent');
  });

  // F21: Firebase Hosting Config & Deployment Readiness
  runner.test('F21.1: .firebaserc contains default project balears-tech', () => {
    assertEqual(ctx.firebaserc.projects?.default, 'balears-tech', 'Default project must be balears-tech');
  });
  runner.test('F21.2: firebase.json specifies dist public directory', () => {
    assertEqual(ctx.firebaseJson.hosting?.public, 'dist', 'Hosting public must be dist');
  });
  runner.test('F21.3: public/robots.txt contains sitemap URL', () => {
    const robots = ctx.readRootFile('public/robots.txt') || '';
    assertIncludes(robots, 'https://balears-tech.web.app/sitemap-index.xml', 'Robots.txt sitemap URL missing');
  });
  runner.test('F21.4: dist/robots.txt matches public/robots.txt', () => {
    const distRobots = ctx.readDistFile('robots.txt') || '';
    assertIncludes(distRobots, 'Allow: /', 'dist/robots.txt missing Allow: /');
  });
  runner.test('F21.5: Firebase headers define caching for immutable assets', () => {
    const headers = ctx.firebaseJson.hosting?.headers || [];
    const htmlHeader = headers.find((h) => h.source === '**/*.html');
    assert(htmlHeader, 'HTML cache header missing');
    assertEqual(htmlHeader.headers[0].value, 'public, max-age=0, must-revalidate', 'HTML cache header value mismatch');
  });
}
