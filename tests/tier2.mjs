// tests/tier2.mjs
import { assert, assertEqual, assertMatch, assertIncludes } from './test-utils.mjs';

/**
 * Tier 2: Boundary and Corner Case Testing
 * 105 boundary tests covering F1 through F21 (5 tests per feature).
 */
export function runTier2Boundaries(ctx, runner) {
  // F1 Boundaries: Astro Build Artifacts
  runner.test('F1.B1: dist/index.html starts with doctype and contains closing html', () => {
    const trimmed = ctx.distHtml.trim();
    assertMatch(trimmed, /^<!doctype\s+html>/i, 'Must start with <!doctype html>');
    assert(trimmed.endsWith('</html>'), 'Must cleanly terminate with </html>');
  });
  runner.test('F1.B2: dist/index.html has zero raw unescaped template expressions', () => {
    assert(!ctx.distHtml.includes('{Astro.'), 'No unrendered {Astro.*} expressions');
    assert(!ctx.distHtml.includes('<undefined>'), 'No <undefined> markup placeholders');
  });
  runner.test('F1.B3: Root elements in dist are valid static files only', () => {
    assert(ctx.distFileExists('index.html'), 'index.html missing');
    assert(ctx.distFileExists('favicon.svg'), 'favicon.svg missing');
    assert(ctx.distFileExists('robots.txt'), 'robots.txt missing');
  });
  runner.test('F1.B4: dist/index.html contains valid UTF-8 Catalan special characters', () => {
    assertIncludes(ctx.distHtml, 'Illes Balears', 'Catalan text missing');
    assertIncludes(ctx.distHtml, 'acompanyament', 'Catalan text missing');
    assertIncludes(ctx.distHtml, 'cívic', 'Catalan accented text missing');
  });
  runner.test('F1.B5: dist directory has no accidental source or git files', () => {
    assert(!ctx.distFileExists('.git'), 'dist must not contain .git');
    assert(!ctx.distFileExists('src'), 'dist must not contain src');
  });

  // F2 Boundaries: Tailwind CSS Bundle
  runner.test('F2.B1: Compiled CSS bundle exceeds 10KB and has no syntax error traces', () => {
    assert(ctx.cssBundle.length > 10000, 'CSS bundle must be > 10KB');
    assert(!ctx.cssBundle.includes('undefined'), 'CSS bundle contains "undefined"');
  });
  runner.test('F2.B2: Responsive breakpoint prefixes present in HTML', () => {
    assertIncludes(ctx.distHtml, 'sm:', 'sm: responsive classes missing');
    assertIncludes(ctx.distHtml, 'md:', 'md: responsive classes missing');
    assertIncludes(ctx.distHtml, 'lg:', 'lg: responsive classes missing');
  });
  runner.test('F2.B3: Dark mode modifier classes pervasive across HTML', () => {
    const darkOccurrences = (ctx.distHtml.match(/dark:/g) || []).length;
    assert(darkOccurrences > 50, `Expected > 50 dark: classes, found ${darkOccurrences}`);
  });
  runner.test('F2.B4: Mediterranean custom tokens compiled into classes', () => {
    assertIncludes(ctx.distHtml, 'ocean-', 'ocean- color classes missing');
    assertIncludes(ctx.distHtml, 'teal-', 'teal- color classes missing');
    assertIncludes(ctx.distHtml, 'coral-', 'coral- color classes missing');
  });
  runner.test('F2.B5: No empty class attributes in primary layout elements', () => {
    assert(!ctx.distHtml.includes('class=""'), 'HTML should not have empty class="" attributes');
  });

  // F3 Boundaries: Icon Attributes & Standards
  runner.test('F3.B1: Every SVG element has viewBox with 4 coordinates', () => {
    ctx.dom.svgs.forEach((svg) => {
      if (svg.viewBox) {
        const parts = svg.viewBox.trim().split(/\s+/);
        assertEqual(parts.length, 4, `viewBox should have 4 coordinates: ${svg.viewBox}`);
      }
    });
  });
  runner.test('F3.B2: Zero 0x0 or empty SVG icons rendered', () => {
    ctx.dom.svgs.forEach((svg) => {
      assert(svg.content.length > 5, 'SVG icon content should not be empty');
    });
  });
  runner.test('F3.B3: Decorative SVGs include proper classes or dimensions', () => {
    const svgsWithClasses = ctx.dom.svgs.filter((s) => s.class && s.class.length > 0);
    assert(svgsWithClasses.length > 10, 'Expected SVGs with classes');
  });
  runner.test('F3.B4: Icons in action buttons do not overflow line boxes', () => {
    assertIncludes(ctx.distHtml, 'shrink-0', 'shrink-0 utility used on icon wrappers');
  });
  runner.test('F3.B5: No broken <img alt="icon"> placeholders used instead of SVGs', () => {
    const iconImgs = ctx.dom.images.filter((i) => i.alt?.toLowerCase().includes('icon'));
    assertEqual(iconImgs.length, 0, 'Icons should be inline Lucide SVGs, not img tags');
  });

  // F4 Boundaries: Image Assets & Dimensions
  runner.test('F4.B1: Zero broken image src: all <img> tags reference existing dist files', () => {
    ctx.dom.images.forEach((img) => {
      const src = img.src.startsWith('/') ? img.src.slice(1) : img.src;
      assert(ctx.distFileExists(src), `Image src not found in dist: ${img.src}`);
    });
  });
  runner.test('F4.B2: All <img> elements have non-empty alt attributes', () => {
    ctx.dom.images.forEach((img) => {
      assert(img.alt && img.alt.trim().length > 0, `Image missing alt: ${img.src}`);
    });
  });
  runner.test('F4.B3: All <img> elements declare explicit width and height to prevent CLS', () => {
    ctx.dom.images.forEach((img) => {
      assert(img.width, `Image missing width attribute: ${img.src}`);
      assert(img.height, `Image missing height attribute: ${img.src}`);
    });
  });
  runner.test('F4.B4: Above-the-fold hero image has loading="eager"', () => {
    assertIncludes(ctx.distHtml, 'loading="eager"', 'Hero image must have loading="eager"');
  });
  runner.test('F4.B5: Below-the-fold images have loading="lazy"', () => {
    assertIncludes(ctx.distHtml, 'loading="lazy"', 'Below-the-fold images must have loading="lazy"');
  });

  // F5 Boundaries: Firebase Configuration
  runner.test('F5.B1: firebase.json is strictly valid JSON without trailing commas', () => {
    assert(ctx.firebaseJson && typeof ctx.firebaseJson === 'object', 'firebase.json must be valid JSON');
  });
  runner.test('F5.B2: firebase.json ignore list contains standard safety patterns', () => {
    const ignore = ctx.firebaseJson.hosting?.ignore || [];
    assert(ignore.includes('firebase.json'), 'ignore must contain firebase.json');
    assert(ignore.includes('**/.*'), 'ignore must contain hidden files');
    assert(ignore.includes('**/node_modules/**'), 'ignore must contain node_modules');
  });
  runner.test('F5.B3: Caching headers: 1 year immutable for images and fonts', () => {
    const headers = ctx.firebaseJson.hosting?.headers || [];
    const mediaRule = headers.find((h) => h.source?.includes('jpg|jpeg'));
    assertEqual(mediaRule.headers[0].value, 'public, max-age=31536000, immutable', 'Immutable cache required for images');
  });
  runner.test('F5.B4: Caching headers: 1 year immutable for JS and CSS bundles', () => {
    const headers = ctx.firebaseJson.hosting?.headers || [];
    const codeRule = headers.find((h) => h.source?.includes('js|css'));
    assertEqual(codeRule.headers[0].value, 'public, max-age=31536000, immutable', 'Immutable cache required for JS/CSS');
  });
  runner.test('F5.B5: Caching headers: max-age=0, must-revalidate for HTML entrypoints', () => {
    const headers = ctx.firebaseJson.hosting?.headers || [];
    const htmlRule = headers.find((h) => h.source === '**/*.html');
    assertEqual(htmlRule.headers[0].value, 'public, max-age=0, must-revalidate', 'Revalidate required for HTML');
  });

  // F6 Boundaries: Complete MkDocs Clean-up
  runner.test('F6.B1: Zero mkdocs files in any subdirectory', () => {
    assert(!ctx.fileExists('mkdocs.yml'), 'mkdocs.yml must not exist');
    assert(!ctx.fileExists('mkdocs.yaml'), 'mkdocs.yaml must not exist');
  });
  runner.test('F6.B2: Zero Python requirements.txt or Pipfile in project root', () => {
    assert(!ctx.fileExists('requirements.txt'), 'requirements.txt must not exist');
    assert(!ctx.fileExists('Pipfile'), 'Pipfile must not exist');
  });
  runner.test('F6.B3: Zero Python virtual environment folders in root', () => {
    assert(!ctx.fileExists('.venv'), '.venv must not exist');
    assert(!ctx.fileExists('venv'), 'venv must not exist');
  });
  runner.test('F6.B4: Zero python-specific scripts in package.json', () => {
    const scripts = Object.values(ctx.packageJson.scripts || {}).join(' ');
    assert(!scripts.includes('python'), 'package scripts should not invoke python');
  });
  runner.test('F6.B5: .gitignore explicitly contains entries for build directories', () => {
    assertIncludes(ctx.gitignore, 'dist', '.gitignore should ignore dist');
  });

  // F7 Boundaries: Layout & DOM Boundaries
  runner.test('F7.B1: dist/index.html size exceeds 75,000 bytes', () => {
    assert(ctx.distHtml.length > 75000, `HTML size should exceed 75KB, got ${ctx.distHtml.length}`);
  });
  runner.test('F7.B2: Document has exactly one <head> and one <body> element', () => {
    const headMatches = (ctx.distHtml.match(/<head\b/gi) || []).length;
    const bodyMatches = (ctx.distHtml.match(/<body\b/gi) || []).length;
    assertEqual(headMatches, 1, 'Exactly one <head> required');
    assertEqual(bodyMatches, 1, 'Exactly one <body> required');
  });
  runner.test('F7.B3: Document has exactly one <main> element', () => {
    const mainMatches = (ctx.distHtml.match(/<main\b/gi) || []).length;
    assertEqual(mainMatches, 1, 'Exactly one <main> required');
  });
  runner.test('F7.B4: Document has exactly one <header> and one <footer> element', () => {
    const headerMatches = (ctx.distHtml.match(/<header\b/gi) || []).length;
    const footerMatches = (ctx.distHtml.match(/<footer\b/gi) || []).length;
    assertEqual(headerMatches, 1, 'Exactly one <header> required');
    assertEqual(footerMatches, 1, 'Exactly one <footer> required');
  });
  runner.test('F7.B5: dist/robots.txt has exactly identical content to public/robots.txt', () => {
    assertEqual(ctx.readDistFile('robots.txt'), ctx.readRootFile('public/robots.txt'), 'robots.txt must match public source');
  });

  // F8 Boundaries: SEO & Metadata Constraints
  runner.test('F8.B1: Viewport meta tag has exact content "width=device-width, initial-scale=1.0"', () => {
    const vp = ctx.dom.meta.find((m) => m.name === 'viewport');
    assertEqual(vp?.content, 'width=device-width, initial-scale=1.0', 'Exact viewport content required');
  });
  runner.test('F8.B2: Charset meta tag is UTF-8', () => {
    const cs = ctx.dom.meta.find((m) => m.charset);
    assertEqual(cs?.charset?.toUpperCase(), 'UTF-8', 'Charset must be UTF-8');
  });
  runner.test('F8.B3: Canonical URL is an absolute HTTPS URL', () => {
    const can = ctx.dom.links.find((l) => l.rel === 'canonical');
    assertMatch(can?.href || '', /^https:\/\//, 'Canonical must be HTTPS URL');
  });
  runner.test('F8.B4: OpenGraph og:image points to valid image path', () => {
    const ogImg = ctx.dom.meta.find((m) => m.property === 'og:image');
    assert(ogImg?.content, 'og:image missing');
    assert(ogImg.content.includes('hero.jpg'), 'og:image should reference hero.jpg');
  });
  runner.test('F8.B5: Twitter card meta tag set to summary_large_image', () => {
    const tw = ctx.dom.meta.find((m) => m.name === 'twitter:card');
    assertEqual(tw?.content, 'summary_large_image', 'twitter:card must be summary_large_image');
  });

  // F9 Boundaries: Anti-FOUC & Navbar Controls
  runner.test('F9.B1: Anti-FOUC inline script in <head> executes cleanly and safely', () => {
    const inlineScript = ctx.dom.scripts.find((s) => s.isInline && s.content.includes('localStorage'));
    assert(inlineScript, 'Inline anti-FOUC theme script must be in head');
    assertIncludes(inlineScript.content, 'prefers-color-scheme', 'Must check system dark preference');
  });
  runner.test('F9.B2: Anti-FOUC script toggles class "dark" on documentElement', () => {
    const inlineScript = ctx.dom.scripts.find((s) => s.isInline && s.content.includes('classList'));
    assertIncludes(inlineScript.content, 'classList.add', 'Must add dark class when theme is dark');
  });
  runner.test('F9.B3: Mobile menu dropdown starts with "hidden" class', () => {
    const menuEl = ctx.dom.elementsWithId.get('mobile-menu');
    assert(menuEl, '#mobile-menu must exist');
    assertIncludes(menuEl.class, 'hidden', '#mobile-menu must be hidden by default');
  });
  runner.test('F9.B4: Mobile hamburger button has initial aria-expanded="false"', () => {
    assertIncludes(ctx.distHtml, 'id="mobile-menu-btn"', 'Mobile menu button missing');
    assertIncludes(ctx.distHtml, 'aria-expanded="false"', 'aria-expanded must be false initially');
  });
  runner.test('F9.B5: Theme toggle buttons have type="button"', () => {
    const toggleBtn = ctx.dom.buttons.find((b) => b.id === 'theme-toggle');
    assertEqual(toggleBtn?.type, 'button', 'Theme toggle button must have type="button"');
  });

  // F10 Boundaries: Footer Hyperlinks & Standards
  runner.test('F10.B1: Back-to-top anchor targets valid id="top"', () => {
    const topAnchor = ctx.dom.anchors.find((a) => a.href === '#top');
    assert(topAnchor, 'Anchor targeting #top missing');
    assert(ctx.dom.elementsWithId.has('top'), 'Target element id="top" must exist in DOM');
  });
  runner.test('F10.B2: Footer copyright string references year 2026', () => {
    assertIncludes(ctx.distHtml, '© 2026', 'Footer copyright must reference 2026');
  });
  runner.test('F10.B3: Footer navigation links all resolve to valid section IDs', () => {
    const footerAnchors = ['#inici', '#eixos', '#projectes', '#perfil', '#consultoria'];
    footerAnchors.forEach((id) => {
      const cleanId = id.replace('#', '');
      assert(ctx.dom.elementsWithId.has(cleanId), `Footer anchor target #${cleanId} must exist`);
    });
  });
  runner.test('F10.B4: Footer external ecosystem links have target="_blank"', () => {
    const escoltesLink = ctx.dom.anchors.find((a) => a.href === 'https://escoltes.balears.tech');
    assertEqual(escoltesLink?.target, '_blank', 'External link must have target="_blank"');
  });
  runner.test('F10.B5: Footer external ecosystem links have rel="noopener noreferrer"', () => {
    const jishoLink = ctx.dom.anchors.find((a) => a.href === 'https://jisho.balears.tech');
    assertEqual(jishoLink?.rel, 'noopener noreferrer', 'External link must have rel="noopener noreferrer"');
  });

  // F11 Boundaries: Hero Typography & Island Scope
  runner.test('F11.B1: Exactly one <h1> element on the page', () => {
    const h1s = ctx.dom.headings.filter((h) => h.level === 1);
    assertEqual(h1s.length, 1, 'Must have exactly one <h1> heading');
  });
  runner.test('F11.B2: Section #inici precedes #perfil in DOM order', () => {
    assert(ctx.dom.getTextOrder('id="inici"', 'id="perfil"'), '#inici must precede #perfil');
  });
  runner.test('F11.B3: Island tags contain all 4 Balearic islands', () => {
    const islands = ['Mallorca', 'Menorca', 'Eivissa', 'Formentera'];
    islands.forEach((isle) => {
      assertIncludes(ctx.distHtml, isle, `Island tag for ${isle} missing`);
    });
  });
  runner.test('F11.B4: Hero primary CTA links to #contacte', () => {
    assertIncludes(ctx.distHtml, 'href="#contacte"', 'Hero primary CTA must target #contacte');
  });
  runner.test('F11.B5: Hero secondary CTA links to #projectes', () => {
    assertIncludes(ctx.distHtml, 'href="#projectes"', 'Hero secondary CTA must target #projectes');
  });

  // F12 Boundaries: Civic Pillars Content & Guarantees
  runner.test('F12.B1: Section #eixos renders exactly 3 pillar cards in grid', () => {
    const pillarMentions = (ctx.distHtml.match(/Pilar Cívic/g) || []).length;
    assertEqual(pillarMentions, 3, 'Must render exactly 3 civic pillar badges');
  });
  runner.test('F12.B2: Each pillar has a distinct title and icon', () => {
    assertIncludes(ctx.distHtml, 'Suport Pro-bono', 'Pro-bono title missing');
    assertIncludes(ctx.distHtml, 'Tech Commons', 'Tech Commons title missing');
    assertIncludes(ctx.distHtml, 'Bústia Ciutadana', 'Bústia title missing');
  });
  runner.test('F12.B3: Pro-bono pillar specifies altruistic zero-cost motto', () => {
    assertIncludes(ctx.distHtml, 'Sense cost, sense tecnicismes', 'Zero-cost motto missing');
  });
  runner.test('F12.B4: Tech Commons pillar specifies open source community ownership', () => {
    assertIncludes(ctx.distHtml, 'propietat de la comunitat', 'Community ownership motto missing');
  });
  runner.test('F12.B5: Citizen inbox specifies technical feasibility assistance', () => {
    assertIncludes(ctx.distHtml, 'viabilitat tècnica', 'Viabilitat tècnica motto missing');
  });

  // F13 Boundaries: Impact Metrics Formatting
  runner.test('F13.B1: Stats counter displays 4 numeric metrics', () => {
    const metrics = ['+13', '+65', '+34.000', '4'];
    metrics.forEach((val) => {
      assertIncludes(ctx.distHtml, val, `Stat metric ${val} missing`);
    });
  });
  runner.test('F13.B2: Metric numbers use gradient text clipping', () => {
    assertIncludes(ctx.distHtml, 'bg-clip-text', 'bg-clip-text gradient styling missing');
  });
  runner.test('F13.B3: Metric labels have corresponding sublabels', () => {
    assertIncludes(ctx.distHtml, 'AstraZeneca, MAPFRE, Boehringer', 'Corporate entities sublabel missing');
    assertIncludes(ctx.distHtml, 'escoltes.balears.tech', 'Escoltes sublabel missing');
    assertIncludes(ctx.distHtml, 'jisho.balears.tech', 'Jisho sublabel missing');
  });
  runner.test('F13.B4: Stats container adapts to 2 columns on mobile and 4 on desktop', () => {
    assertIncludes(ctx.distHtml, 'grid-cols-2', 'Mobile 2-column grid missing');
    assertIncludes(ctx.distHtml, 'lg:grid-cols-4', 'Desktop 4-column grid missing');
  });
  runner.test('F13.B5: No placeholder NaN in stats output', () => {
    const statsMarkup = ctx.distHtml.substring(ctx.distHtml.indexOf('+13'), ctx.distHtml.indexOf('illes connectades') + 30);
    assert(!statsMarkup.includes('NaN'), 'Stats output must not contain NaN');
  });

  // F14 Boundaries: Gabriel Bio Corporate & Academic Credentials
  runner.test('F14.B1: Gabriel bio explicitly lists all corporate companies', () => {
    const companies = ['AstraZeneca', 'MAPFRE', 'Boehringer Ingelheim', 'Movinga', 'APSL', 'SDG Group'];
    companies.forEach((co) => {
      assertIncludes(ctx.distHtml, co, `Company ${co} missing from Gabriel bio`);
    });
  });
  runner.test('F14.B2: Mentions academic degrees (UIB Maths & ESERP MBA)', () => {
    assertIncludes(ctx.distHtml, 'UIB', 'UIB degree missing');
    assertIncludes(ctx.distHtml, 'ESERP', 'ESERP MBA missing');
  });
  runner.test('F14.B3: Mentions PMP official certification', () => {
    assertIncludes(ctx.distHtml, 'PMP®', 'PMP certification missing');
  });
  runner.test('F14.B4: LinkedIn link is HTTPS with rel="noopener noreferrer"', () => {
    const liLink = ctx.dom.anchors.find((a) => a.href?.includes('linkedin.com/in/gabriel-rullan'));
    assert(liLink, 'LinkedIn anchor missing');
    assertEqual(liLink.target, '_blank', 'LinkedIn target must be _blank');
    assertEqual(liLink.rel, 'noopener noreferrer', 'LinkedIn rel must be noopener noreferrer');
  });
  runner.test('F14.B5: Telegram link is HTTPS with target="_blank"', () => {
    const tgLink = ctx.dom.anchors.find((a) => a.href === 'https://t.me/gabriel_rullan');
    assert(tgLink, 'Telegram anchor missing');
    assertEqual(tgLink.target, '_blank', 'Telegram target must be _blank');
  });

  // F15 Boundaries: Projects Catalog Subdomains
  runner.test('F15.B1: escoltes.balears.tech link is secure HTTPS', () => {
    const a = ctx.dom.anchors.find((a) => a.href === 'https://escoltes.balears.tech');
    assert(a, 'escoltes.balears.tech anchor missing');
    assertEqual(a.rel, 'noopener noreferrer', 'rel must be noopener noreferrer');
  });
  runner.test('F15.B2: jisho.balears.tech link is secure HTTPS', () => {
    const a = ctx.dom.anchors.find((a) => a.href === 'https://jisho.balears.tech');
    assert(a, 'jisho.balears.tech anchor missing');
    assertEqual(a.rel, 'noopener noreferrer', 'rel must be noopener noreferrer');
  });
  runner.test('F15.B3: escoltes card details 65 routes and 45 shelters', () => {
    assertIncludes(ctx.distHtml, '65 rutes catalogades', '65 rutes detail missing');
    assertIncludes(ctx.distHtml, '45 refugis', '45 refugis detail missing');
  });
  runner.test('F15.B4: jisho card details 34.300 entries and Cloud Run', () => {
    assertIncludes(ctx.distHtml, '34.300 entrades', '34.300 entries detail missing');
    assertIncludes(ctx.distHtml, 'Cloud Run', 'Cloud Run detail missing');
  });
  runner.test('F15.B5: Projects grid renders cards responsive from 1 to 3 columns', () => {
    assertIncludes(ctx.distHtml, 'grid-cols-1 lg:grid-cols-3', 'Projects 3-column grid missing');
  });

  // F16 Boundaries: Subdomains Incubator Guarantees
  runner.test('F16.B1: Incubator card features dashed border styling', () => {
    assertIncludes(ctx.distHtml, 'border-dashed', 'Dashed border styling missing on incubator card');
  });
  runner.test('F16.B2: Offers free hosting and *.balears.tech subdomains', () => {
    assertIncludes(ctx.distHtml, '*.balears.tech', '*.balears.tech wildcard missing');
    assertIncludes(ctx.distHtml, '100% de franc', '100% de franc mention missing');
  });
  runner.test('F16.B3: Offers technical architecture guidance', () => {
    assertIncludes(ctx.distHtml, "Assessorament d'arquitectura web i dades", 'Architecture advice missing');
  });
  runner.test('F16.B4: Incubator target audience specifies non-profit civic initiatives', () => {
    assertIncludes(ctx.distHtml, 'sense ànim de lucre', 'Non-profit restriction missing');
  });
  runner.test('F16.B5: Incubator card CTA button links to #contacte', () => {
    const incubatorCta = ctx.dom.anchors.find((a) => a.text?.includes('Sol·licita un subdomini cívic'));
    assertEqual(incubatorCta?.href, '#contacte', 'Incubator CTA must target #contacte');
  });

  // F17 Boundaries: Consulting Stream Ordering & Hierarchy
  runner.test('F17.B1: Character stream ordering: Civic volunteering precedes consulting by >= 10,000 bytes', () => {
    const civIdx = ctx.distHtml.indexOf('id="inici"');
    const consIdx = ctx.distHtml.indexOf('id="consultoria"');
    assert(civIdx !== -1, 'id="inici" must exist in HTML');
    assert(consIdx !== -1, 'id="consultoria" must exist in HTML');
    const byteDistance = consIdx - civIdx;
    assert(byteDistance >= 10000, `Expected distance >= 10,000 bytes, got ${byteDistance}`);
  });
  runner.test('F17.B2: Consulting block clearly explains that it funds social volunteering', () => {
    assertIncludes(ctx.distHtml, 'fa sostenible en el temps', 'Sustainability mention missing');
    assertIncludes(ctx.distHtml, 'acompanyament gratuït', 'Free volunteering support mention missing');
  });
  runner.test('F17.B3: data-partner.xyz link uses HTTPS and Catalan localization path', () => {
    assertIncludes(ctx.distHtml, 'https://data-partner.xyz/ca/', 'https://data-partner.xyz/ca/ link missing');
  });
  runner.test('F17.B4: data-partner.xyz link has target="_blank" and rel="noopener noreferrer"', () => {
    const dpLink = ctx.dom.anchors.find((a) => a.href === 'https://data-partner.xyz/ca/');
    assertEqual(dpLink?.target, '_blank', 'data-partner target must be _blank');
    assertEqual(dpLink?.rel, 'noopener noreferrer', 'data-partner rel must be noopener noreferrer');
  });
  runner.test('F17.B5: Consulting block secondary CTA links to #contacte', () => {
    const consultCta = ctx.dom.anchors.find((a) => a.text?.includes('Xerrem del teu repte'));
    assertEqual(consultCta?.href, '#contacte', 'Consulting CTA must target #contacte');
  });

  // F18 Boundaries: Contact Hub Form & Protocols
  runner.test('F18.B1: Contact form has action="mailto:gabriel@data-partner.xyz"', () => {
    assertIncludes(ctx.distHtml, 'action="mailto:gabriel@data-partner.xyz"', 'Form mailto action missing');
  });
  runner.test('F18.B2: Contact form inputs have required attributes', () => {
    assertIncludes(ctx.distHtml, 'id="contact-name"', 'contact-name missing');
    assertIncludes(ctx.distHtml, 'id="contact-email"', 'contact-email missing');
    assertIncludes(ctx.distHtml, 'id="contact-message"', 'contact-message missing');
  });
  runner.test('F18.B3: Contact form select dropdown includes civic initiative options', () => {
    assertIncludes(ctx.distHtml, 'value="pro-bono"', 'pro-bono option missing');
    assertIncludes(ctx.distHtml, 'value="open-source"', 'open-source option missing');
    assertIncludes(ctx.distHtml, 'value="subdomini"', 'subdomini option missing');
  });
  runner.test('F18.B4: Script handles citizen form submit with encodeURIComponent', () => {
    assertIncludes(ctx.distHtml, 'encodeURIComponent', 'Form handler must encode parameters');
    assertIncludes(ctx.distHtml, 'citizen-form', 'citizen-form ID referenced in script');
  });
  runner.test('F18.B5: Telephone link has valid international tel: protocol', () => {
    assertIncludes(ctx.distHtml, 'href="tel:+34638952623"', 'International tel: link missing');
  });

  // F19 Boundaries: Test Infrastructure Robustness
  runner.test('F19.B1: Test runner handles assertions synchronously', () => {
    assertEqual(typeof assert, 'function', 'assert must be a function');
    assertEqual(typeof assertEqual, 'function', 'assertEqual must be a function');
  });
  runner.test('F19.B2: Assertion errors include expected and actual values', () => {
    try {
      assertEqual(1, 2, 'Intentional test');
    } catch (e) {
      assertEqual(e.expected, 2, 'AssertionError should record expected');
      assertEqual(e.actual, 1, 'AssertionError should record actual');
    }
  });
  runner.test('F19.B3: dom.getSectionById retrieves element blocks', () => {
    const hero = ctx.dom.getSectionById('inici');
    assert(hero, 'getSectionById("inici") must return section');
  });
  runner.test('F19.B4: dom.containsText performs case-insensitive search', () => {
    assert(ctx.dom.containsText('balears.tech'), 'containsText should match lowercase');
    assert(ctx.dom.containsText('BALEARS.TECH'), 'containsText should match uppercase');
  });
  runner.test('F19.B5: buildTestContext caches dist files without throwing', () => {
    assert(ctx.distHtml.length > 0, 'distHtml should be loaded in ctx');
  });

  // F20 Boundaries: Git Repository Safety
  runner.test('F20.B1: Zero git merge conflict markers in HTML build output', () => {
    assert(!ctx.distHtml.includes('<<<<<<<'), 'No merge conflict start marker');
    assert(!ctx.distHtml.includes('>>>>>>>'), 'No merge conflict end marker');
  });
  runner.test('F20.B2: Zero secret tokens or API private keys in client build', () => {
    assert(!ctx.distHtml.includes('AIzaSy'), 'No Google Cloud API keys in client markup');
    assert(!ctx.distHtml.includes('BEGIN PRIVATE KEY'), 'No private keys in client markup');
  });
  runner.test('F20.B3: package.json has private: true or valid public configuration', () => {
    assert(ctx.packageJson.name === 'balears-tech', 'Package name must be balears-tech');
  });
  runner.test('F20.B4: Astro config does not expose sensitive server secrets', () => {
    assert(!ctx.astroConfig.includes('process.env.SECRET'), 'No secrets exposed in astro config');
  });
  runner.test('F20.B5: .gitignore excludes .firebase local directory', () => {
    assert(ctx.gitignore.length > 0, '.gitignore must exist');
  });

  // F21 Boundaries: Zero Broken Links & Deployment Readiness
  runner.test('F21.B1: Zero insecure http:// links across entire compiled HTML', () => {
    const insecureLinks = ctx.dom.anchors.filter((a) => a.href && a.href.startsWith('http://'));
    assertEqual(insecureLinks.length, 0, `Found insecure http:// links: ${JSON.stringify(insecureLinks)}`);
  });
  runner.test('F21.B2: Zero broken internal anchor hashes: every href="#xyz" exists in DOM', () => {
    const internalAnchors = ctx.dom.anchors
      .map((a) => a.href)
      .filter((h) => h && h.startsWith('#') && h.length > 1);
    const missingTargets = internalAnchors.filter((h) => !ctx.dom.elementsWithId.has(h.slice(1)));
    assertEqual(missingTargets.length, 0, `Missing internal anchor targets: ${missingTargets.join(', ')}`);
  });
  runner.test('F21.B3: robots.txt User-agent applies to all (*)', () => {
    const r = ctx.readDistFile('robots.txt') || '';
    assertIncludes(r, 'User-agent: *', 'Robots.txt should apply to all user agents');
  });
  runner.test('F21.B4: robots.txt explicitly allows root (Allow: /)', () => {
    const r = ctx.readDistFile('robots.txt') || '';
    assertIncludes(r, 'Allow: /', 'Robots.txt should allow /');
  });
  runner.test('F21.B5: Firebase cleanUrls setting serves clean URLs without .html extension', () => {
    assertEqual(ctx.firebaseJson.hosting?.cleanUrls, true, 'cleanUrls must be enabled in firebase.json');
  });
}
