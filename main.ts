import { readFileSync as rf, writeFileSync as wf, mkdirSync as md, readdirSync as rd, existsSync as ex } from 'node:fs';
import { join } from 'node:path';
const { MAKEFUN_INPUT_DIR: IN = '/input', MAKEFUN_OUTPUT_DIR: OUT = '/output' } = process.env;
const T = new Array(256).fill(null);
const D = (o, i, p, q) => { T[o] = [i, p, q]; };
D(0,0,0,0); D(1,1,0,1); D(2,4,0,1); D(3,0,1,0); D(4,0,1,2); D(5,0,2,2); D(6,0,2,3); D(7,0,3,3);
for (let o = 16; o <= 30; o++) if (o !== 23) D(o, 0, o === 27 ? 1 : 2, 1);
D(23,0,1,1); D(32,0,2,1); D(33,0,2,1); D(34,0,2,1);
D(48,2,0,0); D(49,2,1,0); D(50,2,1,0); D(51,2,0,0); D(52,0,0,0);
D(64,0,1,1); D(65,0,2,0); D(80,0,1,0); D(81,0,1,0); D(82,0,0,1); D(83,0,1,0);
function run(prog, inp) {
  const st = new Int32Array(256), cs = new Int32Array(64), mem = new Int32Array(256);
  const out = new Uint8Array(65536);
  let sp = 0, csp = 0, pc = 0, ol = 0, ip = 0, steps = 0;
  const plen = prog.length;
  const done = c => ({ out: out.subarray(0, ol), code: c });
  const off = () => ((prog[pc + 1] | (prog[pc + 2] << 8)) << 16) >> 16;
  while (true) {
    if (steps >= 1e6) return done(10);
    if (pc < 0 || pc >= plen) return done(9);
    const op = prog[pc], m = T[op];
    if (!m) return done(5);
    if (m[0] > 0 && pc + m[0] >= plen) return done(9);
    steps++;
    if (sp < m[1]) return done(2);
    if (sp - m[1] + m[2] > 256) return done(3);
    const nx = pc + 1 + m[0];
    let a, b, v;
    switch (op) {
      case 0: return done(0);
      case 1: st[sp++] = (prog[pc + 1] << 24) >> 24; break;
      case 2: st[sp++] = prog[pc + 1] | (prog[pc + 2] << 8) | (prog[pc + 3] << 16) | (prog[pc + 4] << 24); break;
      case 3: sp--; break;
      case 4: st[sp] = st[sp - 1]; sp++; break;
      case 5: v = st[sp - 1]; st[sp - 1] = st[sp - 2]; st[sp - 2] = v; break;
      case 6: st[sp] = st[sp - 2]; sp++; break;
      case 7: a = st[sp - 3]; b = st[sp - 2]; v = st[sp - 1]; st[sp - 3] = b; st[sp - 2] = v; st[sp - 1] = a; break;
      case 16: b = st[--sp]; a = st[--sp]; st[sp++] = (a + b) | 0; break;
      case 17: b = st[--sp]; a = st[--sp]; st[sp++] = (a - b) | 0; break;
      case 18: b = st[--sp]; a = st[--sp]; st[sp++] = Math.imul(a, b); break;
      case 19: b = st[--sp]; a = st[--sp]; if (!b) return done(4); st[sp++] = a === -2147483648 && b === -1 ? -2147483648 : (a / b) | 0; break;
      case 20: b = st[--sp]; a = st[--sp]; if (!b) return done(4); st[sp++] = b === -1 ? 0 : a % b; break;
      case 21: b = st[--sp]; a = st[--sp]; if (!b) return done(4); st[sp++] = ((a >>> 0) / (b >>> 0)) | 0; break;
      case 22: b = st[--sp]; a = st[--sp]; if (!b) return done(4); st[sp++] = ((a >>> 0) % (b >>> 0)) | 0; break;
      case 23: st[sp - 1] = (-st[sp - 1]) | 0; break;
      case 24: b = st[--sp]; a = st[--sp]; st[sp++] = a & b; break;
      case 25: b = st[--sp]; a = st[--sp]; st[sp++] = a | b; break;
      case 26: b = st[--sp]; a = st[--sp]; st[sp++] = a ^ b; break;
      case 27: st[sp - 1] = ~st[sp - 1]; break;
      case 28: b = st[--sp]; a = st[--sp]; st[sp++] = a << (b & 31); break;
      case 29: b = st[--sp]; a = st[--sp]; st[sp++] = a >> (b & 31); break;
      case 30: b = st[--sp]; a = st[--sp]; st[sp++] = (a >>> (b & 31)) | 0; break;
      case 32: b = st[--sp]; a = st[--sp]; st[sp++] = a === b ? 1 : 0; break;
      case 33: b = st[--sp]; a = st[--sp]; st[sp++] = a < b ? 1 : 0; break;
      case 34: b = st[--sp]; a = st[--sp]; st[sp++] = (a >>> 0) < (b >>> 0) ? 1 : 0; break;
      case 48: pc = nx + off(); continue;
      case 49: v = st[--sp]; pc = v === 0 ? nx + off() : nx; continue;
      case 50: v = st[--sp]; pc = v !== 0 ? nx + off() : nx; continue;
      case 51: if (csp >= 64) return done(7); cs[csp++] = nx; pc = off() & 65535; continue;
      case 52: if (!csp) return done(8); pc = cs[--csp]; continue;
      case 64: a = st[--sp]; if (a < 0 || a > 255) return done(6); st[sp++] = mem[a]; break;
      case 65: a = st[--sp]; v = st[--sp]; if (a < 0 || a > 255) return done(6); mem[a] = v; break;
      case 80: { v = st[--sp]; const s = String(v); if (ol + s.length > 65536) return done(11); for (let i = 0; i < s.length; i++) out[ol++] = s.charCodeAt(i); break; }
      case 81: v = st[--sp]; if (ol >= 65536) return done(11); out[ol++] = v & 255; break;
      case 82: st[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 83: v = st[--sp]; return done(v & 255);
    }
    pc = nx;
  }
}
for (const id of rd(IN, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()) {
  const prog = rf(join(IN, id, 'program.bin'));
  const p = join(IN, id, 'input.bin');
  const r = run(prog, ex(p) ? rf(p) : Buffer.alloc(0));
  const od = join(OUT, id);
  md(od, { recursive: true });
  wf(join(od, 'stdout.bin'), r.out);
  wf(join(od, 'exit.txt'), r.code + '\n');
}
