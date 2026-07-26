/**
 * Stable Fluids 法の GLSL ソース。
 * baseVertex はフルスクリーン三角形 + 近傍 UV（vL/vR/vT/vB）を varying で渡す。
 */

export const baseVertexShader = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const copyShader = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
uniform sampler2D uTexture;
out vec4 outColor;
void main () {
  outColor = texture(uTexture, vUv);
}`;

export const clearShader = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
uniform sampler2D uTexture;
uniform float uValue;
out vec4 outColor;
void main () {
  outColor = uValue * texture(uTexture, vUv);
}`;

export const splatShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float uAspectRatio;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
out vec4 outColor;
void main () {
  vec2 p = vUv - uPoint;
  p.x *= uAspectRatio;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture(uTarget, vUv).xyz;
  outColor = vec4(base + splat, 1.0);
}`;

/**
 * 滴の着水による面積保存の放射変位。
 * 非圧縮ソルバは点からの正味の湧き出しを打ち消してしまうため、輪の成長は
 * 速度場ではなく染料そのものを外へずらして表現する（マーブリングの定石）。
 * 既存の染料は r_old = sqrt(r² − a) から読み直され、半径 sqrt(a) の空白が中心に開く。
 */
export const displaceShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform float uAspectRatio;
uniform float uAmount;
out vec4 outColor;
void main () {
  vec2 p = vUv - uPoint;
  p.x *= uAspectRatio;
  float r = length(p);
  float rOld = sqrt(max(r * r - uAmount, 0.0));
  vec2 dir = r > 0.00001 ? p / r : vec2(0.0);
  vec2 src = uPoint + vec2(dir.x * rOld / uAspectRatio, dir.y * rOld);
  outColor = texture(uTarget, clamp(src, 0.0, 1.0));
}`;

/**
 * 落ちた滴そのもの。輪を重ねても黒く飽和しないよう、加算ではなく置換で描く。
 */
export const dropShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform float uAspectRatio;
uniform float uRadius;
uniform vec3 uColor;
out vec4 outColor;
void main () {
  vec2 p = vUv - uPoint;
  p.x *= uAspectRatio;
  float d = length(p);
  float edge = fwidth(d) * 1.5 + 0.0012;
  float mask = 1.0 - smoothstep(uRadius - edge, uRadius + edge, d);
  vec3 base = texture(uTarget, vUv).rgb;
  outColor = vec4(mix(base, uColor, mask), 1.0);
}`;

/**
 * 水面を渡る風。点の集まりではなく速度場そのものへ横流れを 1 パスで足す。
 * 上下に波打たせることで、輪が櫛で梳いたように羽根状へ引き伸ばされる。
 * 盤の縁では包絡線で 0 に落とし、墨が外へ吹き飛ばないようにする。
 */
export const breezeShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float uStrength;
uniform float uPhase;
out vec4 outColor;
void main () {
  vec2 v = texture(uTarget, vUv).xy;
  float wave = sin(vUv.y * 4.1 + uPhase);
  float envelope =
    smoothstep(0.0, 0.20, vUv.x) * smoothstep(1.0, 0.80, vUv.x) *
    smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.84, vUv.y);
  vec2 add = vec2(1.0 + wave * 0.35, wave * 0.5) * uStrength * envelope;
  outColor = vec4(v + add, 0.0, 1.0);
}`;

/**
 * セミラグランジュ移流。線形フィルタ不可の環境では MANUAL_FILTERING を
 * 先頭に #define して手動バイリニアで補間する。
 */
export const advectionShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform vec2 uDyeTexelSize;
uniform float uDt;
uniform float uDissipation;
out vec4 outColor;

#ifdef MANUAL_FILTERING
vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}
#endif

void main () {
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - uDt * bilerp(uVelocity, vUv, uTexelSize).xy * uTexelSize;
  vec4 result = bilerp(uSource, coord, uDyeTexelSize);
#else
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
  vec4 result = texture(uSource, coord);
#endif
  float decay = 1.0 + uDissipation * uDt;
  outColor = result / decay;
  outColor.a = 1.0;
}`;

export const divergenceShader = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
out vec4 outColor;
void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  outColor = vec4(div, 0.0, 0.0, 1.0);
}`;

export const curlShader = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
out vec4 outColor;
void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  outColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

export const vorticityShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;
out vec4 outColor;
void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity += force * uDt;
  velocity = clamp(velocity, vec2(-1000.0), vec2(1000.0));
  outColor = vec4(velocity, 0.0, 1.0);
}`;

export const pressureShader = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
out vec4 outColor;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  outColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

export const gradientSubtractShader = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
out vec4 outColor;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity -= vec2(R - L, T - B);
  outColor = vec4(velocity, 0.0, 1.0);
}`;

/** 染料 = 累積吸収。表示色 = 紙白 − 吸収（減法混色）。 */
export const displayShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uDye;
uniform vec3 uPaper;
out vec4 outColor;
void main () {
  vec3 absorption = texture(uDye, vUv).rgb;
  vec3 color = clamp(uPaper - absorption, 0.0, 1.0);
  outColor = vec4(color, 1.0);
}`;
