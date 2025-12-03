import type { RoomMode } from './roomModes';

function modeFieldAt(nx: number, ny: number, nz: number, Lx: number, Ly: number, Lz: number, x: number, y: number, z: number): number {
  // Rigid boundaries -> pressure antinodes at walls -> cos shape
  const kx = Math.PI * nx / Lx;
  const ky = Math.PI * ny / Ly;
  const kz = Math.PI * nz / Lz;
  const cx = nx === 0 ? 1 : Math.cos(kx * x);
  const cy = ny === 0 ? 1 : Math.cos(ky * y);
  const cz = nz === 0 ? 1 : Math.cos(kz * z);
  return cx * cy * cz;
}

function lorentzianWeight(f: number, fm: number, Q: number): number {
  const bw = Math.max(fm / Math.max(Q, 1e-3), 0.5);
  const r = (f - fm) / bw;
  return 1 / (1 + r * r);
}

export function computeField2D({ Lx, Ly, Lz, modes, frequency, q, y, resX, resZ }:
  { Lx: number; Ly: number; Lz: number; modes: RoomMode[]; frequency: number; q: number; y: number; resX: number; resZ: number; }): Float32Array {
  const out = new Float32Array(resX * resZ);
  let min = Infinity, max = -Infinity;
  for (let ix = 0; ix < resX; ix++) {
    const x = (ix + 0.5) * (Lx / resX);
    for (let iz = 0; iz < resZ; iz++) {
      const z = (iz + 0.5) * (Lz / resZ);
      let p = 0;
      for (let m = 0; m < modes.length; m++) {
        const md = modes[m];
        const w = lorentzianWeight(frequency, md.f, q);
        p += w * modeFieldAt(md.nx, md.ny, md.nz, Lx, Ly, Lz, x, y, z);
      }
      const idx = ix * resZ + iz;
      out[idx] = p;
      if (p < min) min = p;
      if (p > max) max = p;
    }
  }
  // Normalize to [0,1]
  const span = max - min || 1;
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - min) / span;
  return out;
}

export function computeField3D({ Lx, Ly, Lz, modes, frequency, q, res }:
  { Lx: number; Ly: number; Lz: number; modes: RoomMode[]; frequency: number; q: number; res: number; }): Float32Array {
  const out = new Float32Array(res * res * res);
  let min = Infinity, max = -Infinity;
  for (let iy = 0; iy < res; iy++) {
    const y = (iy + 0.5) * (Ly / res);
    for (let ix = 0; ix < res; ix++) {
      const x = (ix + 0.5) * (Lx / res);
      for (let iz = 0; iz < res; iz++) {
        const z = (iz + 0.5) * (Lz / res);
        let p = 0;
        for (let m = 0; m < modes.length; m++) {
          const md = modes[m];
          const w = lorentzianWeight(frequency, md.f, q);
          p += w * modeFieldAt(md.nx, md.ny, md.nz, Lx, Ly, Lz, x, y, z);
        }
        const idx = iy*res*res + ix*res + iz;
        out[idx] = p;
        if (p < min) min = p;
        if (p > max) max = p;
      }
    }
  }
  const span = max - min || 1;
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - min) / span;
  return out;
}
