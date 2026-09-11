import { describe, expect, it } from "vitest";
import { defaultFurniture } from "./furniture";
import { CELL_COUNT, defaultLayout, roomArea, type GridLayout } from "./grid";
import {
  defaultPlanState,
  parsePlanState,
  serializePlanState,
  STORAGE_KEY,
} from "./plan-state";

describe("defaultPlanState", () => {
  it("既定の間取りと家具を持つ", () => {
    const state = defaultPlanState();
    expect(state.version).toBe(2);
    expect(state.floors[1]).toEqual(defaultLayout(1));
    expect(state.floors[2]).toEqual(defaultLayout(2));
    expect(state.furniture).toEqual(defaultFurniture());
  });

  it("呼ぶたびに別の値を返す（書き換えが漏れない）", () => {
    const a = defaultPlanState();
    const b = defaultPlanState();
    expect(a).not.toBe(b);
    expect(a.furniture).not.toBe(b.furniture);
    expect(a.floors[1].cells).not.toBe(b.floors[1].cells);
  });
});

describe("保存と読み込み", () => {
  it("保存の鍵は v2", () => {
    expect(STORAGE_KEY).toBe("suminawa-demo-3d-viewer:v2");
  });

  it("書き出して読み直すと同じ値になる", () => {
    const state = defaultPlanState();
    expect(parsePlanState(serializePlanState(state))).toEqual(state);
  });

  it("version 1 の保存データは受け取らない", () => {
    expect(
      parsePlanState(
        JSON.stringify({
          version: 1,
          floors: { 1: defaultLayout(1), 2: defaultLayout(2) },
          furniture: [],
        }),
      ),
    ).toBeNull();
  });

  it("壊れた保存データは受け取らない", () => {
    expect(parsePlanState(null)).toBeNull();
    expect(parsePlanState("")).toBeNull();
    expect(parsePlanState("{")).toBeNull();
    expect(parsePlanState("[]")).toBeNull();
    expect(
      parsePlanState(
        JSON.stringify({ ...defaultPlanState(), furniture: "なし" }),
      ),
    ).toBeNull();
    expect(
      parsePlanState(JSON.stringify({ ...defaultPlanState(), floors: [] })),
    ).toBeNull();
  });

  it("マスの数が違う・知らない id・知らない部屋名・id の重複は受け取らない", () => {
    const base = defaultPlanState();
    const second = base.floors[2];

    const short: GridLayout = {
      rooms: base.floors[1].rooms,
      cells: base.floors[1].cells.slice(0, CELL_COUNT - 1),
    };
    expect(
      parsePlanState(
        JSON.stringify({ ...base, floors: { 1: short, 2: second } }),
      ),
    ).toBeNull();

    const unknownCell: GridLayout = {
      rooms: base.floors[1].rooms,
      cells: base.floors[1].cells.map(() => "room-9"),
    };
    expect(
      parsePlanState(
        JSON.stringify({ ...base, floors: { 1: unknownCell, 2: second } }),
      ),
    ).toBeNull();

    const unknownLabel = {
      rooms: [{ id: "room-1", label: "書庫" }],
      cells: base.floors[1].cells.map(() => "room-1"),
    };
    expect(
      parsePlanState(
        JSON.stringify({ ...base, floors: { 1: unknownLabel, 2: second } }),
      ),
    ).toBeNull();

    const duplicated = {
      rooms: [
        { id: "room-1", label: "LDK" },
        { id: "room-1", label: "和室" },
      ],
      cells: base.floors[1].cells.map(() => "room-1"),
    };
    expect(
      parsePlanState(
        JSON.stringify({ ...base, floors: { 1: duplicated, 2: second } }),
      ),
    ).toBeNull();
  });

  it("マスを 1 つも持たない部屋は、読み込んだ時点で消える", () => {
    const base = defaultPlanState();
    const extra: GridLayout = {
      rooms: [...base.floors[1].rooms, { id: "room-6", label: "収納" }],
      cells: base.floors[1].cells,
    };
    const parsed = parsePlanState(
      JSON.stringify({ ...base, floors: { 1: extra, 2: base.floors[2] } }),
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.floors[1].rooms.map((room) => room.id)).toEqual([
      "room-1",
      "room-2",
      "room-3",
      "room-4",
      "room-5",
    ]);
    expect(parsed ? roomArea(parsed.floors[1], "room-1") : 0).toBe(33);
  });

  it("知らない家具・数でない座標・知らない回転は受け取らない", () => {
    const base = defaultPlanState();

    expect(
      parsePlanState(
        JSON.stringify({
          ...base,
          furniture: [
            { id: "f-1", type: "piano", floor: 1, x: 2, z: 2, rotation: 0 },
          ],
        }),
      ),
    ).toBeNull();

    expect(
      parsePlanState(
        JSON.stringify({
          ...base,
          furniture: [
            { id: "f-1", type: "bed", floor: 1, x: "2", z: 2, rotation: 0 },
          ],
        }),
      ),
    ).toBeNull();

    expect(
      parsePlanState(
        JSON.stringify({
          ...base,
          furniture: [
            { id: "f-1", type: "bed", floor: 1, x: 2, z: 2, rotation: 45 },
          ],
        }),
      ),
    ).toBeNull();
  });

  it("輪郭の外にある家具は中に寄せて受け取る", () => {
    const parsed = parsePlanState(
      JSON.stringify({
        version: 2,
        floors: { 1: defaultLayout(1), 2: defaultLayout(2) },
        furniture: [
          { id: "f-1", type: "bed", floor: 1, x: 99, z: -5, rotation: 0 },
        ],
      }),
    );
    expect(parsed?.furniture).toEqual([
      { id: "f-1", type: "bed", floor: 1, x: 8.3, z: 1, rotation: 0 },
    ]);
  });
});
