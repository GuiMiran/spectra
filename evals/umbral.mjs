/**
 * Umbral — piloto local de SPECTRA / GUIDO. Ejecutar: node evals/umbral.mjs (Node 18+).
 * Contrato sintético: PreReady → Ready → Release. Un salto se rechaza con
 * 409 / TRANSITION_NOT_ALLOWED y no cambia el estado persistido del recurso.
 * Compara un smoke con un gate que vuelve a consultar el recurso tras el rechazo.
 * Sin dependencias, credenciales, servicios externos ni repositorios remotos.
 */
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';

const variants = ['reference', 'allows-skip', 'rejects-but-writes', 'rejects-with-wrong-code'];

function fixture(variant) {
  const versions = new Map([['control', 'PreReady'], ['edge', 'PreReady']]);
  const next = new Map([['PreReady', 'Ready'], ['Ready', 'Release']]);
  return createServer(async (req, res) => {
    function send(status, body) {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    }
    const route = /^\/versions\/([^/]+)(\/transition)?$/.exec(req.url);
    if (!route || !versions.has(route[1])) return send(404, { code: 'NOT_FOUND' });
    const [, id, transition] = route;
    if (!transition && req.method === 'GET') return send(200, { id, state: versions.get(id) });
    if (!transition || req.method !== 'POST') return send(405, { code: 'METHOD_NOT_ALLOWED' });
    let to;
    try {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      ({ to } = JSON.parse(raw));
    } catch {
      return send(400, { code: 'INVALID_JSON' });
    }
    const from = versions.get(id);
    const skip = from === 'PreReady' && to === 'Release';
    if ((typeof to === 'string' && next.get(from) === to) || (skip && variant === 'allows-skip')) {
      versions.set(id, to);
      return send(200, { id, state: to });
    }
    if (skip && variant === 'rejects-but-writes') versions.set(id, to);
    return send(409, { code: skip && variant === 'rejects-with-wrong-code' ? 'OTHER' : 'TRANSITION_NOT_ALLOWED' });
  });
}

async function run(variant) {
  const server = fixture(variant);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(id, to) {
    const path = `/versions/${id}`;
    const response = await fetch(base + path + (to ? '/transition' : ''), {
      signal: AbortSignal.timeout(3000),
      ...(to ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to }) } : {}),
    });
    return { status: response.status, body: await response.json() };
  }
  try {
    for (const to of ['Ready', 'Release']) {
      const moved = await request('control', to);
      assert.equal(moved.status, 200, 'Smoke: la transición válida debe responder 200');
      const current = await request('control');
      assert.equal(current.status, 200);
      assert.equal(current.body.state, to, 'Smoke: debe persistir el estado válido');
    }
    const before = await request('edge');
    assert.equal(before.status, 200);
    assert.equal(before.body.state, 'PreReady', 'Precondición del caso límite');
    const rejected = await request('edge', 'Release');
    const after = await request('edge');
    assert.equal(after.status, 200, 'Debe poder leerse el recurso después del intento');
    const checks = {
      status: rejected.status === 409,
      code: rejected.body.code === 'TRANSITION_NOT_ALLOWED',
      state: after.body.state === before.body.state,
    };
    return { variant, smoke: 'PASS', gate: Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL', checks };
  } finally {
    await new Promise((resolve, reject) => {
      server.close(err => err ? reject(err) : resolve());
      server.closeIdleConnections?.();
    });
  }
}

const expected = {
  reference: { status: true, code: true, state: true },
  'allows-skip': { status: false, code: false, state: false },
  'rejects-but-writes': { status: true, code: true, state: false },
  'rejects-with-wrong-code': { status: true, code: false, state: true },
};

for (const variant of variants) {
  const result = await run(variant);
  console.log(JSON.stringify(result));
  assert.deepEqual(result.checks, expected[variant], `Resultado inesperado: ${variant}`);
}
