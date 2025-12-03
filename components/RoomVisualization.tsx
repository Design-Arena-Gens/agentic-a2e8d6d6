"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Bounds, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { RoomMode } from '@/lib/physics/roomModes';
import { computeField2D, computeField3D } from '@/lib/physics/pressureField';
import { scalarFieldToRGBA, turboColormap } from '@/lib/utils/colormap';

function SliceHeatmap({ Lx, Ly, Lz, y, modes, frequency, qFactor }: { Lx: number; Ly: number; Lz: number; y: number; modes: RoomMode[]; frequency: number; qFactor: number; }) {
  const resX = 160, resZ = 160;
  const texture = useMemo(() => new THREE.DataTexture(new Uint8Array(4), 1, 1), []);

  const planeRef = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    const field = computeField2D({ Lx, Ly, Lz, modes, frequency, q: qFactor, y, resX, resZ });
    const rgba = scalarFieldToRGBA(field, turboColormap);
    const dataTex = new THREE.DataTexture(rgba, resX, resZ, THREE.RGBAFormat);
    dataTex.needsUpdate = true;
    dataTex.minFilter = THREE.LinearFilter;
    dataTex.magFilter = THREE.LinearFilter;
    // replace the texture contents
    texture.image = dataTex.image;
    (texture as any).data = (dataTex as any).data;
    texture.needsUpdate = true;
  }, [Lx, Ly, Lz, y, modes, frequency, qFactor]);

  return (
    <mesh ref={planeRef} position={[Lx/2, y, Lz/2]} rotation={[-Math.PI/2, 0, 0]}>
      <planeGeometry args={[Lx, Lz, 1, 1]} />
      <meshBasicMaterial map={texture} transparent={true} opacity={0.95} />
    </mesh>
  );
}

function VolumetricPoints({ Lx, Ly, Lz, modes, frequency, qFactor, threshold }: { Lx: number; Ly: number; Lz: number; modes: RoomMode[]; frequency: number; qFactor: number; threshold: number; }) {
  const [geometry] = useState(() => new THREE.BufferGeometry());
  const pointsRef = useRef<THREE.Points>(null!);

  useEffect(() => {
    const res = 34;
    const field = computeField3D({ Lx, Ly, Lz, modes, frequency, q: qFactor, res });

    const positions: number[] = [];
    const colors: number[] = [];

    const color = new THREE.Color();
    let count = 0;
    for (let iy = 0; iy < res; iy++) {
      for (let ix = 0; ix < res; ix++) {
        for (let iz = 0; iz < res; iz++) {
          const idx = iy*res*res + ix*res + iz;
          const v = field[idx];
          if (v >= threshold) {
            const x = (ix + 0.5) * (Lx / res);
            const y = (iy + 0.5) * (Ly / res);
            const z = (iz + 0.5) * (Lz / res);
            positions.push(x, y, z);
            const [r,g,b] = turboColormap(v);
            color.setRGB(r, g, b);
            colors.push(color.r, color.g, color.b);
            count++;
          }
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
  }, [Lx, Ly, Lz, modes, frequency, qFactor, threshold]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.06} sizeAttenuation vertexColors transparent opacity={0.32} depthWrite={false} />
    </points>
  );
}

function RoomBox({ Lx, Ly, Lz }: { Lx: number; Ly: number; Lz: number; }) {
  return (
    <mesh position={[Lx/2, Ly/2, Lz/2]}> 
      <boxGeometry args={[Lx, Ly, Lz]} />
      <meshPhysicalMaterial color="#1a2640" transparent opacity={0.06} roughness={0.9} metalness={0.0} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function RoomVisualization({ Lx, Ly, Lz, frequency, qFactor, sliceY, volumeThreshold, modes }: { Lx: number; Ly: number; Lz: number; frequency: number; qFactor: number; sliceY: number; volumeThreshold: number; modes: RoomMode[]; }) {
  const cameraPos = useMemo(() => new THREE.Vector3(Lx*1.2, Ly*1.2, Lz*1.6), [Lx, Ly, Lz]);

  return (
    <Canvas camera={{ position: cameraPos.toArray(), near: 0.01, far: 100 }} dpr={[1, 2]}>
      <color attach="background" args={[0x0f1115]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 8]} intensity={0.8} />

      <Grid args={[10, 10]} position={[0, 0, 0]} cellColor="#1f2937" />
      <Bounds fit clip margin={1.2}>
        <RoomBox Lx={Lx} Ly={Ly} Lz={Lz} />
        <SliceHeatmap Lx={Lx} Ly={Ly} Lz={Lz} y={Math.min(Math.max(sliceY, 0.001), Ly - 0.001)} modes={modes} frequency={frequency} qFactor={qFactor} />
        <VolumetricPoints Lx={Lx} Ly={Ly} Lz={Lz} modes={modes} frequency={frequency} qFactor={qFactor} threshold={volumeThreshold} />
      </Bounds>

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}> 
        <GizmoViewport axisColors={["#ff6b6b", "#66d9e8", "#ffd43b"]} labelColor="white" />
      </GizmoHelper>

      <OrbitControls enableDamping dampingFactor={0.05} makeDefault />
    </Canvas>
  );
}
