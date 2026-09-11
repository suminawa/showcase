"use client";

/*
 * 見本: 建物ビューアの 3D の場面。寸法も色も持たず、house.ts と shell.ts が返す
 * 「箱の一覧」を並べるだけにしてある。形を直したいときは .ts の側だけを触る。
 * このファイルは next/dynamic（ssr: false）からだけ読まれる ── three.js を
 * ほかの画面の束に混ぜないため。
 */

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { MOUSE, TOUCH } from "three";

import {
  annotationPositions,
  cameraPose,
  effectiveFloorMode,
  HOUSE,
  isCutaway,
  lightingPreset,
  rooms,
  showsRoof,
  visibleRooms,
  wallColorById,
  type Floor,
  type FloorMode,
  type LightingMode,
  type ViewMode,
  type WallColor,
} from "./house";
import {
  roofShape,
  roomSlab,
  slabPanel,
  wallPanels,
  windowPanels,
  type Panel,
} from "./shell";
import s from "./viewer.module.css";

export type SceneProps = {
  floorMode: FloorMode;
  view: ViewMode;
  lighting: LightingMode;
  wallColorId: WallColor["id"];
  /** 動きを減らす設定のとき true。自動回転と慣性を止める */
  reducedMotion: boolean;
  /** WebGL のコンテキストを失ったときに呼ばれる。呼び出し側で平面図の代替表示に切り替える */
  onContextLost?: () => void;
};

/*
 * 最初の視点。毎回の描画で新しい配列を渡すと R3F がカメラを作り直してしまうので、
 * ここで 1 つだけ作って使い回す。以降の視点の置き直しは CameraRig が行う。
 */
const INITIAL_CAMERA = {
  fov: 42,
  near: 0.1,
  far: 300,
  position: [13, 10, 14] as [number, number, number],
};

/** 部屋の床の色。外壁の色を変えても床は変えない（間取りの読みやすさを保つため） */
const FLOOR_TONE: Record<Floor, string> = { 1: "#d8d2c6", 2: "#cec7b9" };

/** 箱を 1 つ置く。家の部品はすべてこれ */
function Box({
  panel,
  color,
  roughness = 0.85,
}: {
  panel: Panel;
  color: string;
  roughness?: number;
}) {
  return (
    <mesh position={panel.position}>
      <boxGeometry args={panel.size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
    </mesh>
  );
}

/** 空・光・地面。昼夜で入れ替わる */
function Stage({ lighting }: { lighting: LightingMode }) {
  const preset = lightingPreset(lighting);
  return (
    <>
      <color attach="background" args={[preset.background]} />
      <ambientLight
        color={preset.ambient.color}
        intensity={preset.ambient.intensity}
      />
      <hemisphereLight
        color={preset.hemisphere.sky}
        groundColor={preset.hemisphere.ground}
        intensity={preset.hemisphere.intensity}
      />
      <directionalLight
        color={preset.key.color}
        intensity={preset.key.intensity}
        position={preset.key.position}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -HOUSE.slabThickness - 0.02, 0]}
      >
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color={preset.ground} roughness={1} />
      </mesh>
    </>
  );
}

/** 家そのもの。見せる階と切り方は house.ts が決める */
function House({
  floorMode,
  view,
  lighting,
  wallColorId,
}: Omit<SceneProps, "reducedMotion">) {
  const mode = effectiveFloorMode(floorMode, view);
  const cutaway = isCutaway(floorMode, view);
  const colors = wallColorById(wallColorId);
  const preset = lightingPreset(lighting);
  const shown = visibleRooms(rooms, mode);
  const floors: Floor[] = mode === "all" ? [1, 2] : mode === "1f" ? [1] : [2];
  const roof = roofShape();

  return (
    <group>
      {floors.map((floor) => (
        <group key={floor}>
          <Box panel={slabPanel(floor)} color={colors.trim} />
          {wallPanels(floor, cutaway).map((panel) => (
            <Box key={panel.id} panel={panel} color={colors.wall} />
          ))}
          {/* 切って見るときは壁が腰までしか無いので、窓は出さない */}
          {!cutaway &&
            windowPanels(floor).map((panel) => (
              <mesh key={panel.id} position={panel.position}>
                <boxGeometry args={panel.size} />
                <meshStandardMaterial
                  color={lighting === "night" ? "#ffe3ac" : "#8fb6d8"}
                  emissive="#ffd79a"
                  emissiveIntensity={preset.windowEmissive}
                  roughness={0.15}
                  metalness={0.1}
                />
              </mesh>
            ))}
        </group>
      ))}

      {shown.map((room) => (
        <Box
          key={room.id}
          panel={roomSlab(room)}
          color={FLOOR_TONE[room.floor]}
          roughness={0.95}
        />
      ))}

      {showsRoof(floorMode, view) && (
        <group position={roof.position} scale={[1, 1, roof.scaleZ]}>
          <mesh rotation={[0, roof.rotationY, 0]}>
            <coneGeometry args={[roof.radius, roof.height, 4]} />
            <meshStandardMaterial color={colors.roof} roughness={0.9} flatShading />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** 注記 5 点。見えている階のぶんだけ出す */
function Annotations({
  floorMode,
  view,
}: {
  floorMode: FloorMode;
  view: ViewMode;
}) {
  const mode = effectiveFloorMode(floorMode, view);
  const notes = annotationPositions(visibleRooms(rooms, mode));
  // 幅の狭いスマホでは吹き出しを詰めないと注記どうしが重なるので、距離係数を小さくして縮める
  const width = useThree((state) => state.size.width);
  const distanceFactor = width < 480 ? 11 : 16;
  return (
    <>
      {notes.map((note) => (
        <Html
          key={note.id}
          position={note.position}
          center
          distanceFactor={distanceFactor}
          zIndexRange={[20, 0]}
          pointerEvents="none"
        >
          <span className={s.note}>
            <b className={s.noteName}>{note.label}</b>
            <span className={s.noteArea}>{note.area.toFixed(1)} m²</span>
          </span>
        </Html>
      ))}
    </>
  );
}

/**
 * 表示を切り替えたら視点を置き直す。途中の動きは付けない ──
 * 動きを減らす設定の人にも同じ見え方になるし、切替が一瞬で終わる。
 * OrbitControls は毎フレーム camera.position から向きを計算し直すので、
 * ここで位置を入れ替えれば操作と喧嘩しない。
 */
function CameraRig({
  floorMode,
  view,
}: {
  floorMode: FloorMode;
  view: ViewMode;
}) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const pose = cameraPose(floorMode, view);
    camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
    camera.updateProjectionMatrix();
    // frameloop="demand" のときは、動かしただけでは描き直らないので明示的に起こす
    invalidate();
  }, [camera, invalidate, floorMode, view]);
  return null;
}

export default function Scene({
  floorMode,
  view,
  lighting,
  wallColorId,
  reducedMotion,
  onContextLost,
}: SceneProps) {
  // 最初はゆっくり回して立体だと分かるようにし、触られたら止める
  const [autoRotate, setAutoRotate] = useState(!reducedMotion);
  const pose = cameraPose(floorMode, view);
  // 自動回転のときだけ毎フレーム描き直す。それ以外は操作や視点の置き直しのときだけ
  // 描く「オンデマンド」にして、待機中の電力を使わない
  const frameloop: "always" | "demand" =
    autoRotate && !reducedMotion && view === "orbit" ? "always" : "demand";

  return (
    <Canvas
      className={s.canvas}
      dpr={[1, 2]}
      camera={INITIAL_CAMERA}
      gl={{ antialias: true }}
      frameloop={frameloop}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <Stage lighting={lighting} />
      <House
        floorMode={floorMode}
        view={view}
        lighting={lighting}
        wallColorId={wallColorId}
      />
      <Annotations floorMode={floorMode} view={view} />
      <CameraRig floorMode={floorMode} view={view} />
      <OrbitControls
        makeDefault
        target={pose.target}
        enableDamping={!reducedMotion}
        dampingFactor={0.08}
        autoRotate={autoRotate && !reducedMotion && view === "orbit"}
        autoRotateSpeed={0.5}
        onStart={() => setAutoRotate(false)}
        enableRotate={view === "orbit"}
        enablePan={view === "plan"}
        mouseButtons={
          view === "plan"
            ? { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }
            : { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }
        }
        touches={
          view === "plan"
            ? { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }
            : { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }
        }
        minDistance={5}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
