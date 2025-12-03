"use client";

import { useMemo } from 'react';
import type { RoomMode } from '@/lib/physics/roomModes';

export default function ControlsPanel(props: {
  length: number; width: number; height: number;
  fMax: number; frequency: number; qFactor: number; sliceY: number; volumeThreshold: number;
  modes: RoomMode[];
  onChange: (partial: Partial<Record<'length'|'width'|'height'|'fMax'|'frequency'|'qFactor'|'sliceY'|'volumeThreshold', number>>) => void;
}) {
  const { length, width, height, fMax, frequency, qFactor, sliceY, volumeThreshold, onChange, modes } = props;
  const axialCount = useMemo(() => modes.filter(m => m.type === 'axial').length, [modes]);
  const tangentialCount = useMemo(() => modes.filter(m => m.type === 'tangential').length, [modes]);
  const obliqueCount = useMemo(() => modes.filter(m => m.type === 'oblique').length, [modes]);

  return (
    <div>
      <div className="row">
        <div>
          <label className="label">Length X (m)</label>
          <input className="input" type="number" step={0.1} value={length}
            onChange={e => onChange({ length: parseFloat(e.target.value) })} />
        </div>
        <div>
          <label className="label">Width Z (m)</label>
          <input className="input" type="number" step={0.1} value={width}
            onChange={e => onChange({ width: parseFloat(e.target.value) })} />
        </div>
      </div>
      <div className="row">
        <div>
          <label className="label">Height Y (m)</label>
          <input className="input" type="number" step={0.1} value={height}
            onChange={e => onChange({ height: parseFloat(e.target.value) })} />
        </div>
        <div>
          <label className="label">F max (Hz)</label>
          <input className="input" type="number" min={20} max={400} step={10} value={fMax}
            onChange={e => onChange({ fMax: parseFloat(e.target.value) })} />
        </div>
      </div>

      <label className="label">Frequency for field (Hz)</label>
      <input className="input" type="range" min={20} max={fMax} step={1} value={frequency}
        onChange={e => onChange({ frequency: parseFloat(e.target.value) })} />
      <div className="small">{frequency.toFixed(1)} Hz</div>

      <label className="label">Q factor (damping)</label>
      <input className="input" type="range" min={5} max={120} step={1} value={qFactor}
        onChange={e => onChange({ qFactor: parseFloat(e.target.value) })} />
      <div className="small">Q = {qFactor.toFixed(0)}</div>

      <label className="label">Slice height Y (m)</label>
      <input className="input" type="range" min={0} max={height} step={0.02} value={sliceY}
        onChange={e => onChange({ sliceY: parseFloat(e.target.value) })} />
      <div className="small">y = {sliceY.toFixed(2)} m</div>

      <label className="label">Volumetric threshold</label>
      <input className="input" type="range" min={0.2} max={0.95} step={0.01} value={volumeThreshold}
        onChange={e => onChange({ volumeThreshold: parseFloat(e.target.value) })} />
      <div className="small">Threshold = {volumeThreshold.toFixed(2)}</div>

      <div className="help">
        Modes up to {fMax} Hz:
        <div className="stats">Total: {modes.length} ? Axial: {axialCount} ? Tangential: {tangentialCount} ? Oblique: {obliqueCount}</div>
      </div>
    </div>
  );
}
