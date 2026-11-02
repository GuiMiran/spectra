'use strict';

// Deliberately bounded XML subset for default-namespace VSTest TRX, not a
// general XML engine. No DTD, entity declarations, external resources or XInclude.
const NS = 'http://microsoft.com/schemas/VisualStudio/TeamTest/2010';
const NAME = /^[A-Za-z_][A-Za-z0-9_.-]*/;
const fail = () => { throw new Error('Malformed or unsupported TRX XML.'); };

function decode(text) {
  return text.replace(/&([^;]*);|&/g, (match, entity) => {
    const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (Object.hasOwn(named, entity)) return named[entity];
    if (!/^#(?:[0-9]+|x[0-9a-fA-F]+)$/.test(entity || '')) return fail();
    const code = entity[1] === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    if (!(code === 9 || code === 10 || code === 13 || code >= 32 && code <= 0xD7FF ||
        code >= 0xE000 && code <= 0xFFFD || code >= 0x10000 && code <= 0x10FFFF)) return fail();
    return String.fromCodePoint(code);
  });
}

function parseTrx(bytes) {
  if (bytes.length > 16 * 1024 * 1024) throw new Error('TRX file exceeds 16 MiB.');
  const xml = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '');
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/u.test(xml)) return fail();
  let pos = 0, nodes = 0, root = null;
  const stack = [];
  const whitespace = () => { const start = pos; while (/[ \t\r\n]/.test(xml[pos] || '') && pos < xml.length) pos++; return pos > start; };
  const name = () => { const match = xml.slice(pos).match(NAME); if (!match) return fail(); pos += match[0].length; return match[0]; };
  if (xml.startsWith('<?xml ')) {
    const end = xml.indexOf('?>');
    if (end < 0 || !/^<\?xml\s+version=["']1\.0["'](?:\s+encoding=["']utf-8["'])?(?:\s+standalone=["'](?:yes|no)["'])?\s*\?>$/i.test(xml.slice(0, end + 2))) return fail();
    pos = end + 2;
  }
  while (pos < xml.length) {
    if (xml.startsWith('<!--', pos)) {
      const end = xml.indexOf('-->', pos + 4);
      if (end < 0 || xml.slice(pos + 4, end).includes('--') || xml[end - 1] === '-') return fail();
      pos = end + 3; continue;
    }
    if (xml.startsWith('<![CDATA[', pos)) {
      const end = xml.indexOf(']]>', pos + 9);
      if (!stack.length || end < 0) return fail();
      pos = end + 3; continue;
    }
    if (xml[pos] !== '<') {
      const end = xml.indexOf('<', pos), next = end < 0 ? xml.length : end;
      const text = xml.slice(pos, next);
      if (text.includes(']]>') || !stack.length && /[^ \t\r\n]/.test(text)) return fail();
      decode(text); pos = next; continue;
    }
    if (xml.startsWith('</', pos)) {
      pos += 2; const tag = name(); whitespace();
      if (xml[pos++] !== '>' || stack.pop()?.name !== tag) return fail();
      continue;
    }
    pos++; const tag = name(), attributes = Object.create(null);
    while (true) {
      const spaced = whitespace();
      if (xml[pos] === '/' || xml[pos] === '>') break;
      if (!spaced) return fail();
      const key = name(); whitespace();
      if (Object.hasOwn(attributes, key) || xml[pos++] !== '=') return fail();
      whitespace(); const quote = xml[pos++];
      if (quote !== '"' && quote !== "'") return fail();
      const end = xml.indexOf(quote, pos);
      if (end < 0 || xml.slice(pos, end).includes('<')) return fail();
      attributes[key] = decode(xml.slice(pos, end).replace(/[\r\n\t]/g, ' '));
      pos = end + 1;
    }
    const selfClosing = xml[pos] === '/'; if (selfClosing) pos++;
    if (xml[pos++] !== '>') return fail();
    if (++nodes > 200000 || stack.length >= 64) throw new Error('TRX XML complexity limit exceeded.');
    const node = { name: tag, attributes, children: [] };
    if (!stack.length) {
      if (root || tag !== 'TestRun' || attributes.xmlns !== NS) return fail();
      root = node;
    } else {
      if (Object.hasOwn(attributes, 'xmlns')) return fail();
      stack.at(-1).children.push(node);
    }
    if (!selfClosing) stack.push(node);
  }
  if (stack.length || !root) return fail();
  const results = root.children.filter(node => node.name === 'Results');
  if (results.length !== 1 || results[0].children.some(node => node.name !== 'UnitTestResult')) {
    throw new Error('TRX needs exactly one Results container with flat UnitTestResult entries.');
  }
  // Prevent hidden/nested rows from silently escaping the inventory check.
  function check(node, parent) {
    if (node.name === 'UnitTestResult' && parent !== results[0]) return fail();
    node.children.forEach(child => check(child, node));
  }
  check(root, null);
  const summaries = root.children.filter(node => node.name === 'ResultSummary');
  if (summaries.length !== 1) throw new Error('TRX needs exactly one ResultSummary.');
  return { id: root.attributes.id, outcome: summaries[0].attributes.outcome,
    rows: results[0].children.map(node => node.attributes) };
}

module.exports = { parseTrx };
