import { describe, expect, it } from "vitest";
import { defaultFurniture } from "./furniture";
import { defaultLayout } from "./layout";
import {
  defaultPlanState,
  parsePlanState,
  serializePlanState,
  STORAGE_KEY,
} from "./plan-state";

describe("defaultPlanState", () => {
  it("既定の間取りと家具を持つ", () => {
    const state = defaultPlanState();
    expect(state.version).toBe(1);
    expect(state.floors[1]).toEqual(defaultLayout(1));
    expect(state.floors[2]).toEqual(defaultLayout(2));
    expect(state.furniture).toEqual(defaultFurniture());
  });

  it("呼ぶたびに別の値を返す（書き換えが漏れない）", () => {
    const a = defaultPlanState();
    const b = defaultPlanState();
    expect(a).not.toBe(b);
    expect(a.furniture).not.toBe(b.furniture);
  });
});

describe("保存と読み込み", () => {
  it("保存の鍵は決めたもの", () => {
    expect(STORAGE_KEY).toBe("suminawa-demo-3d-viewer:v1");
  });

  it("書き出して読み直すと同じ値になる", () => {
    const state = defaultPlanState();
    expect(parsePlanState(serializePlanState(state))).toEqual(state);
  });

  it("壊れた保存データは受け取らない", () => {
    expect(parsePlanState(null)).toBeNull();
    expect(parsePlanState("")).toBeNull();
    expect(parsePlanState("{")).toBeNull();
    expect(parsePlanState("[]")).toBeNull();
    expect(
      parsePlanState(JSON.stringify({ ...defaultPlanState(), version: 2 })),
    ).toBeNull();
    expect(
      parsePlanState(
        JSON.stringify({ ...defaultPlanState(), furniture: "なし" }),
      ),
    ).toBeNull();
  });

  it("知らない部屋名・家具・数でない座標は受け取らない", () => {
    const base = defaultPlanState();

    expect(
      parsePlanState(
        JSON.stringify({
          ...base,
          floors: {
            1: { kind: "room", id: "room-1", label: "書庫" },
            2: defaultLayout(2),
          },
        }),
      ),
    ).toBeNull();

    expect(
      parsePlanState(
        JSON.stringify({
          ...base,
          floors: {
            1: { kind: "split", id: "split-1", axis: "x", at: 4 },
            2: defaultLayout(2),
          },
        }),
      ),
    ).toBeNull();

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
        version: 1,
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

  it("矩形からはみ出した分割線は中に戻して受け取る", () => {
    const parsed = parsePlanState(
      JSON.stringify({
        version: 1,
        floors: {
          1: {
            kind: "split",
            id: "split-1",
            axis: "x",
            at: 99,
            first: { kind: "room", id: "room-1", label: "LDK" },
            second: { kind: "room", id: "room-2", label: "和室" },
          },
          2: defaultLayout(2),
        },
        furniture: [],
      }),
    );
    expect(parsed?.floors[1]).toMatchObject({ at: 7.5 });
  });
});
