// tests/test-utils.mjs
import fs from 'node:fs';
import path from 'node:path';

/**
 * Custom Assertion Error with detailed message
 */
export class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

export function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message || 'Assertion failed', true, false);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
      expected,
      actual
    );
  }
}

export function assertMatch(actual, regex, message) {
  if (typeof actual !== 'string' || !regex.test(actual)) {
    throw new AssertionError(
      message || `Expected string to match ${regex}, got "${actual}"`,
      regex.toString(),
      actual
    );
  }
}

export function assertIncludes(actual, substring, message) {
  if (typeof actual !== 'string' || !actual.includes(substring)) {
    throw new AssertionError(
      message || `Expected string to include "${substring}"`,
      substring,
      actual
    );
  }
}

export function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

export function readJsonSafe(filePath) {
  const content = readFileSafe(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Lightweight, robust HTML parser tailored for static HTML validation
 */
export function parseHtml(html) {
  if (!html || typeof html !== 'string') {
    return {
      raw: '',
      title: '',
      lang: '',
      meta: [],
      links: [],
      scripts: [],
      images: [],
      anchors: [],
      buttons: [],
      headings: [],
      elementsWithId: new Map(),
      svgs: [],
      containsText: () => false,
      getSectionById: () => null,
      getTextOrder: () => false,
      getAllText: () => ''
    };
  }

  // Extract <html lang="...">
  const htmlTagMatch = html.match(/<html\b([^>]*)>/i);
  let lang = '';
  if (htmlTagMatch) {
    const langMatch = htmlTagMatch[1].match(/lang=["']([^"']*)["']/i);
    if (langMatch) lang = langMatch[1];
  }

  // Extract <title>...</title>
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract all <meta ...> tags
  const meta = [];
  const metaMatches = html.matchAll(/<meta\b([^>]*)\/?>/gi);
  for (const m of metaMatches) {
    const attrStr = m[1];
    const item = {};
    const nameM = attrStr.match(/name=["']([^"']*)["']/i);
    const propM = attrStr.match(/property=["']([^"']*)["']/i);
    const contentM = attrStr.match(/content=["']([^"']*)["']/i);
    const charsetM = attrStr.match(/charset=["']([^"']*)["']/i);
    const httpEquivM = attrStr.match(/http-equiv=["']([^"']*)["']/i);
    if (nameM) item.name = nameM[1];
    if (propM) item.property = propM[1];
    if (contentM) item.content = contentM[1];
    if (charsetM) item.charset = charsetM[1];
    if (httpEquivM) item.httpEquiv = httpEquivM[1];
    meta.push(item);
  }

  // Extract all <link ...> tags
  const links = [];
  const linkMatches = html.matchAll(/<link\b([^>]*)\/?>/gi);
  for (const m of linkMatches) {
    const attrStr = m[1];
    const item = {};
    const relM = attrStr.match(/rel=["']([^"']*)["']/i);
    const hrefM = attrStr.match(/href=["']([^"']*)["']/i);
    const typeM = attrStr.match(/type=["']([^"']*)["']/i);
    if (relM) item.rel = relM[1];
    if (hrefM) item.href = hrefM[1];
    if (typeM) item.type = typeM[1];
    links.push(item);
  }

  // Extract all <script ...> tags
  const scripts = [];
  const scriptMatches = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
  for (const m of scriptMatches) {
    const attrStr = m[1];
    const content = m[2];
    const item = { content };
    const srcM = attrStr.match(/src=["']([^"']*)["']/i);
    item.src = srcM ? srcM[1] : null;
    item.isInline = !item.src;
    item.isModule = /type=["']module["']/i.test(attrStr);
    scripts.push(item);
  }

  // Extract all <img ...> tags
  const images = [];
  const imgMatches = html.matchAll(/<img\b([^>]*)\/?>/gi);
  for (const m of imgMatches) {
    const attrStr = m[1];
    const item = {};
    const srcM = attrStr.match(/src=["']([^"']*)["']/i);
    const altM = attrStr.match(/alt=["']([^"']*)["']/i);
    const classM = attrStr.match(/class=["']([^"']*)["']/i);
    const widthM = attrStr.match(/width=["']([^"']*)["']/i);
    const heightM = attrStr.match(/height=["']([^"']*)["']/i);
    if (srcM) item.src = srcM[1];
    if (altM) item.alt = altM[1];
    if (classM) item.class = classM[1];
    if (widthM) item.width = widthM[1];
    if (heightM) item.height = heightM[1];
    images.push(item);
  }

  // Extract all <a ...> tags
  const anchors = [];
  const aMatches = html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi);
  for (const m of aMatches) {
    const attrStr = m[1];
    const innerHtml = m[2];
    const item = { text: innerHtml.replace(/<[^>]*>/g, '').trim(), innerHtml };
    const hrefM = attrStr.match(/href=["']([^"']*)["']/i);
    const targetM = attrStr.match(/target=["']([^"']*)["']/i);
    const relM = attrStr.match(/rel=["']([^"']*)["']/i);
    const classM = attrStr.match(/class=["']([^"']*)["']/i);
    const idM = attrStr.match(/id=["']([^"']*)["']/i);
    if (hrefM) item.href = hrefM[1];
    if (targetM) item.target = targetM[1];
    if (relM) item.rel = relM[1];
    if (classM) item.class = classM[1];
    if (idM) item.id = idM[1];
    anchors.push(item);
  }

  // Extract all <button ...> tags
  const buttons = [];
  const btnMatches = html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi);
  for (const m of btnMatches) {
    const attrStr = m[1];
    const innerHtml = m[2];
    const item = { text: innerHtml.replace(/<[^>]*>/g, '').trim() };
    const ariaLabelM = attrStr.match(/aria-label=["']([^"']*)["']/i);
    const classM = attrStr.match(/class=["']([^"']*)["']/i);
    const idM = attrStr.match(/id=["']([^"']*)["']/i);
    const typeM = attrStr.match(/type=["']([^"']*)["']/i);
    if (ariaLabelM) item.ariaLabel = ariaLabelM[1];
    if (classM) item.class = classM[1];
    if (idM) item.id = idM[1];
    if (typeM) item.type = typeM[1];
    buttons.push(item);
  }

  // Extract all <h1..6> headings
  const headings = [];
  const hMatches = html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi);
  for (const m of hMatches) {
    const level = parseInt(m[1], 10);
    const attrStr = m[2];
    const innerHtml = m[3];
    const item = { level, text: innerHtml.replace(/<[^>]*>/g, '').trim(), innerHtml };
    const classM = attrStr.match(/class=["']([^"']*)["']/i);
    const idM = attrStr.match(/id=["']([^"']*)["']/i);
    if (classM) item.class = classM[1];
    if (idM) item.id = idM[1];
    headings.push(item);
  }

  // Extract all elements with id="..."
  const elementsWithId = new Map();
  const idMatches = html.matchAll(/<([a-z0-9_-]+)\b([^>]*\bid=["']([^"']+)["'][^>]*)>/gi);
  for (const m of idMatches) {
    const tag = m[1];
    const attrStr = m[2];
    const id = m[3];
    const classM = attrStr.match(/class=["']([^"']*)["']/i);
    elementsWithId.set(id, {
      tag,
      id,
      class: classM ? classM[1] : ''
    });
  }

  // Extract all <svg ...> tags
  const svgs = [];
  const svgMatches = html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/gi);
  for (const m of svgMatches) {
    const attrStr = m[1];
    const content = m[2];
    const item = { content };
    const viewBoxM = attrStr.match(/viewBox=["']([^"']*)["']/i);
    const classM = attrStr.match(/class=["']([^"']*)["']/i);
    const ariaHiddenM = attrStr.match(/aria-hidden=["']([^"']*)["']/i);
    if (viewBoxM) item.viewBox = viewBoxM[1];
    if (classM) item.class = classM[1];
    if (ariaHiddenM) item.ariaHidden = ariaHiddenM[1];
    svgs.push(item);
  }

  return {
    raw: html,
    title,
    lang,
    meta,
    links,
    scripts,
    images,
    anchors,
    buttons,
    headings,
    elementsWithId,
    svgs,
    containsText: (needle) => {
      if (needle instanceof RegExp) return needle.test(html);
      return html.toLowerCase().includes(needle.toLowerCase());
    },
    getSectionById: (id) => {
      // Find element with id and slice its approximate outer HTML block
      const regex = new RegExp(`<([a-z0-9_-]+)[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
      const match = html.match(regex);
      if (match) {
        return {
          tag: match[1],
          innerHtml: match[2],
          text: match[2].replace(/<[^>]*>/g, '').trim()
        };
      }
      return elementsWithId.get(id) || null;
    },
    getTextOrder: (needle1, needle2) => {
      const idx1 = html.indexOf(needle1);
      const idx2 = html.indexOf(needle2);
      if (idx1 === -1 || idx2 === -1) return false;
      return idx1 < idx2;
    },
    getAllText: () => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  };
}

/**
 * Loads project context from disk
 */
export function buildTestContext(rootDir = process.cwd()) {
  const distDir = path.join(rootDir, 'dist');
  const distHtmlPath = path.join(distDir, 'index.html');
  const distHtml = readFileSafe(distHtmlPath);

  // Look for CSS bundle in dist/_astro/*.css or dist/assets/*.css
  let cssBundle = '';
  const astroAssetsDir = path.join(distDir, '_astro');
  if (fs.existsSync(astroAssetsDir)) {
    const files = fs.readdirSync(astroAssetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    if (cssFile) {
      cssBundle = readFileSafe(path.join(astroAssetsDir, cssFile)) || '';
    }
  }

  const packageJson = readJsonSafe(path.join(rootDir, 'package.json')) || {};
  const firebaseJson = readJsonSafe(path.join(rootDir, 'firebase.json')) || {};
  const firebaserc = readJsonSafe(path.join(rootDir, '.firebaserc')) || {};
  const tailwindConfig = readFileSafe(path.join(rootDir, 'tailwind.config.mjs')) || '';
  const astroConfig = readFileSafe(path.join(rootDir, 'astro.config.mjs')) || '';
  const tsconfig = readJsonSafe(path.join(rootDir, 'tsconfig.json')) || {};
  const gitignore = readFileSafe(path.join(rootDir, '.gitignore')) || '';

  return {
    rootDir,
    distDir,
    distHtmlPath,
    distHtml,
    dom: parseHtml(distHtml),
    cssBundle,
    packageJson,
    firebaseJson,
    firebaserc,
    tailwindConfig,
    astroConfig,
    tsconfig,
    gitignore,
    fileExists: (relPath) => fileExists(path.join(rootDir, relPath)),
    distFileExists: (relPath) => fileExists(path.join(distDir, relPath)),
    readDistFile: (relPath) => readFileSafe(path.join(distDir, relPath)),
    readRootFile: (relPath) => readFileSafe(path.join(rootDir, relPath))
  };
}
