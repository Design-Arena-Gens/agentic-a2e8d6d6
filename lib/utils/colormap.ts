export type RGB = [number, number, number];

export function turboColormap(t: number): RGB {
  // Clamp and map to Turbo (approximation)
  const x = Math.min(1, Math.max(0, t));
  const r = 0.13572138 + 4.61539260*x - 42.66032258*x*x + 132.13108234*x*x*x - 152.94239396*x*x*x*x + 59.28637943*x*x*x*x*x;
  const g = 0.09140261 + 2.19418839*x + 4.84296658*x*x - 14.18503333*x*x*x + 4.27729857*x*x*x*x + 2.82956604*x*x*x*x*x;
  const b = 0.10667330 + 12.64194608*x - 60.58204836*x*x + 140.01993628*x*x*x - 152.64725817*x*x*x*x + 62.03342472*x*x*x*x*x;
  return [
    Math.min(1, Math.max(0, r/255)),
    Math.min(1, Math.max(0, g/255)),
    Math.min(1, Math.max(0, b/255)),
  ];
}

export function scalarFieldToRGBA(scalars: Float32Array, cmap: (t: number) => RGB): Uint8Array {
  const out = new Uint8Array(scalars.length * 4);
  for (let i = 0; i < scalars.length; i++) {
    const [r, g, b] = cmap(scalars[i]);
    out[4*i+0] = Math.round(r*255);
    out[4*i+1] = Math.round(g*255);
    out[4*i+2] = Math.round(b*255);
    out[4*i+3] = 220;
  }
  return out;
}
