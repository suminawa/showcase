"use client";

/*
 * 見本: 間取りシミュレーターの 3D。寸法も色も持たず、house.ts / shell.ts / furniture.ts が返す
 * 「箱の一覧」を並べるだけにしてある。形を直したいときは .ts の側だけを触る。
 * このファイルは next/dynamic（ssr: false）からだけ読まれる ── three.js を
 * ほかの画面の束に混ぜないため。
 */

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { MOUSE, TOUCH } from "three";

import { furnitureOnFloor, lighten, partsInScene } from "./furniture";
import {
  cameraPose,
  FLOOR_TONE,
  HOUSE,
  INTERIOR_TONE,
  isCutaway,
  lightingPreset,
  SELECTED_FLOOR_TONE,
  showsRoof,
  visibleFloors,
  wallColorById,
  WINDOW_TONE,
  type Floor,
  type FloorMode,
  type LightingMode,
  type ViewMode,
  type WallColor,
} from "./house";
import { FLOOR_RECT, layoutRooms } from "./layout";
import { type PlanState } from "./plan-state";
import {
  annotationPositions,
  interiorWallPanels,
  roofShape,
  roomSlab,
  slabPanel,
  wallPanels,
  windowPanels,
  type Panel,
} from "./shell";
import s from "./viewer.module.css";

export type SceneProps = {
  /** 間取りと家具。ここでは読むだけで、書き替えは Viewer が行う */
  plan: PlanState;
  /** 間取り図で編集している階。選択の強調をこの階だけに出す */
  activeFloor: Floor;
  floorMode: FloorMode;
  view: ViewMode;
  lighting: LightingMode;
  wallColorId: WallColor["id"];
  /** 動きを減らす設定のとき true。自動回転と慣性を止める */
  reducedMotion: boolean;
  /** 選択中の部屋または家具の id */
  selectedId: string | null;
  /** WebGL のコンテキストを失ったときに呼ばれる。呼び出し側で断りの表示に切り替える */
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

/* 操作の割り当ても、毎回新しい物を作らないよう外に出す */
const MOUSE_BUTTONS = {
  LEFT: MOUSE.ROTATE,
  MIDDLE: MOUSE.DOLLY,
  RIGHT: MOUSE.PAN,
};
const TOUCHES = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

/** 箱を 1 つ置く。家の部品も家具もすべてこれ */
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

/** 家そのもの。見せる階と切り方は house.ts が、部屋と家具は plan が決める */
function House({
  plan,
  activeFloor,
  floorMode,
  lighting,
  wallColorId,
  selectedId,
}: {
  plan: PlanState;
  activeFloor: Floor;
  floorMode: FloorMode;
  lighting: LightingMode;
  wallColorId: WallColor["id"];
  selectedId: string | null;
}) {
  const cutaway = isCutaway(floorMode);
  const colors = wallColorById(wallColorId);
  const preset = lightingPreset(lighting);
  const roof = roofShape();

  return (
    <group>
      {visibleFloors(floorMode).map((floor) => {
        const tree = plan.floors[floor];
        return (
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
                    color={
                      lighting === "night" ? WINDOW_TONE.night : WINDOW_TONE.day
                    }
                    emissive={WINDOW_TONE.emissive}
                    emissiveIntensity={preset.windowEmissive}
                    roughness={0.15}
                    metalness={0.1}
                  />
                </mesh>
              ))}
            {layoutRooms(tree, FLOOR_RECT).map((room) => (
              <Box
                key={room.id}
                panel={roomSlab(room, floor)}
                color={
                  floor === activeFloor && room.id === selectedId
                    ? SELECTED_FLOOR_TONE
                    : FLOOR_TONE[floor]
                }
                roughness={0.95}
              />
            ))}
            {interiorWallPanels(tree, floor, cutaway).map((panel) => (
              <Box key={panel.id} panel={panel} color={INTERIOR_TONE} />
            ))}
            {furnitureOnFloor(plan.furniture, floor).flatMap((item) =>
              partsInScene(item).map((part) => (
                <Box
                  key={part.id}
                  panel={part}
                  color={
                    item.id === selectedId
                      ? lighten(part.color, 0.12)
                      : part.color
                  }
                />
              )),
            )}
          </group>
        );
      })}

      {showsRoof(floorMode) && (
        <group position={roof.position} scale={[1, 1, roof.scaleZ]}>
          <mesh rotation={[0, roof.rotationY, 0]}>
            <coneGeometry args={[roof.radius, roof.height, 4]} />
            <meshStandardMaterial
              color={colors.roof}
              roughness={0.9}
              flatShading
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** 注記。見えている階のすべての部屋に出す */
function Annotations({
  plan,
  floorMode,
}: {
  plan: PlanState;
  floorMode: FloorMode;
}) {
  // 幅の狭いスマホでは吹き出しを詰めないと注記どうしが重なるので、距離係数を小さくして縮める
  const width = useThree((state) => state.size.width);
  // 屋根が載っている全体では中が見えないので注記を出さない
  if (showsRoof(floorMode)) return null;
  const distanceFactor = width < 480 ? 11 : 16;
  const notes = visibleFloors(floorMode).flatMap((floor) =>
    annotationPositions(layoutRooms(plan.floors[floor], FLOOR_RECT), floor),
  );
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
    const place = () => {
      const pose = cameraPose(floorMode, view);
      camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
      camera.updateProjectionMatrix();
      // frameloop="demand" のときは、動かしただけでは描き直らないので明示的に起こす
      invalidate();
    };
    place();
  }, [camera, invalidate, floorMode, view]);
  return null;
}

export default function Scene({
  plan,
  activeFloor,
  floorMode,
  view,
  lighting,
  wallColorId,
  reducedMotion,
  selectedId,
  onContextLost,
}: SceneProps) {
  // 最初はゆっくり回して立体だと分かるようにし、触られたら止める
  const [autoRotate, setAutoRotate] = useState(!reducedMotion);
  const pose = cameraPose(floorMode, view);
  const spinning = autoRotate && !reducedMotion && view === "orbit";
  // 自動回転のときだけ毎フレーム描き直す。それ以外は状態や操作が変わったときだけ
  // 描く「オンデマンド」にして、待機中の電力を使わない
  const frameloop: "always" | "demand" = spinning ? "always" : "demand";

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
        plan={plan}
        activeFloor={activeFloor}
        floorMode={floorMode}
        lighting={lighting}
        wallColorId={wallColorId}
        selectedId={selectedId}
      />
      <Annotations plan={plan} floorMode={floorMode} />
      <CameraRig floorMode={floorMode} view={view} />
      <OrbitControls
        makeDefault
        target={pose.target}
        enableDamping={!reducedMotion}
        dampingFactor={0.08}
        autoRotate={spinning}
        autoRotateSpeed={0.5}
        onStart={() => setAutoRotate(false)}
        enableRotate
        enablePan
        mouseButtons={MOUSE_BUTTONS}
        touches={TOUCHES}
        minDistance={5}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
