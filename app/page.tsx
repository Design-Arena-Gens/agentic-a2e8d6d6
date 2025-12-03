"use client";

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import ControlsPanel from '@/components/ControlsPanel';
import { computeRoomModes } from '@/lib/physics/roomModes';

const RoomVisualization = dynamic(() => import('@/components/RoomVisualization'), { ssr: false });

export default function Page() {
  const [length, setLength] = useState(5.2); // meters X
  const [width, setWidth] = useState(3.8);  // meters Z
  const [height, setHeight] = useState(2.6); // meters Y
  const [fMax, setFMax] = useState(300);
  const [frequency, setFrequency] = useState(60);
  const [qFactor, setQFactor] = useState(40);
  const [sliceY, setSliceY] = useState(1.2);
  const [volumeThreshold, setVolumeThreshold] = useState(0.65);

  const modes = useMemo(() => {
    return computeRoomModes({ Lx: length, Ly: height, Lz: width, fMax, speedOfSound: 343 });
  }, [length, width, height, fMax]);

  return (
    <main className="main">
      <div className="header">
        <strong>Advanced Rectangular Room Mode Calculator</strong>
        <div className="small">Realtime 3D pressure field visualization (React Three Fiber)</div>
      </div>
      <aside className="sidebar">
        <ControlsPanel
          length={length}
          width={width}
          height={height}
          fMax={fMax}
          frequency={frequency}
          qFactor={qFactor}
          sliceY={sliceY}
          volumeThreshold={volumeThreshold}
          onChange={({ length, width, height, fMax, frequency, qFactor, sliceY, volumeThreshold }) => {
            if (length !== undefined) setLength(length);
            if (width !== undefined) setWidth(width);
            if (height !== undefined) setHeight(height);
            if (fMax !== undefined) setFMax(fMax);
            if (frequency !== undefined) setFrequency(frequency);
            if (qFactor !== undefined) setQFactor(qFactor);
            if (sliceY !== undefined) setSliceY(sliceY);
            if (volumeThreshold !== undefined) setVolumeThreshold(volumeThreshold);
          }}
          modes={modes}
        />
      </aside>
      <section className="content">
        <RoomVisualization
          Lx={length}
          Ly={height}
          Lz={width}
          frequency={frequency}
          qFactor={qFactor}
          sliceY={sliceY}
          volumeThreshold={volumeThreshold}
          modes={modes}
        />
      </section>
    </main>
  );
}
