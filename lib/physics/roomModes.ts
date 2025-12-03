export type ModeType = 'axial' | 'tangential' | 'oblique';
export interface RoomMode { nx: number; ny: number; nz: number; f: number; type: ModeType; }

export function computeRoomModes({ Lx, Ly, Lz, fMax, speedOfSound = 343 }:
  { Lx: number; Ly: number; Lz: number; fMax: number; speedOfSound?: number; }): RoomMode[] {
  // Determine max mode indices per axis given fMax
  const c = speedOfSound;
  const nMaxX = Math.ceil((2 * Lx * fMax) / c);
  const nMaxY = Math.ceil((2 * Ly * fMax) / c);
  const nMaxZ = Math.ceil((2 * Lz * fMax) / c);

  const modes: RoomMode[] = [];
  for (let nx = 0; nx <= nMaxX; nx++) {
    for (let ny = 0; ny <= nMaxY; ny++) {
      for (let nz = 0; nz <= nMaxZ; nz++) {
        if (nx === 0 && ny === 0 && nz === 0) continue;
        const f = 0.5 * c * Math.sqrt((nx / Lx) ** 2 + (ny / Ly) ** 2 + (nz / Lz) ** 2);
        if (f <= fMax + 1e-6) {
          const zeros = [nx, ny, nz].filter((n) => n === 0).length;
          const type: ModeType = zeros === 2 ? 'axial' : zeros === 1 ? 'tangential' : 'oblique';
          modes.push({ nx, ny, nz, f, type });
        }
      }
    }
  }

  modes.sort((a, b) => a.f - b.f);
  return modes;
}
