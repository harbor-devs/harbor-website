// PageCurl: the WebGL page turn for the phone diary (moved in from public/curl-test).
// The page folds along a crease like the laptop turn (same corner path, same shadows),
// with a slight bend at the crease, and wraps around the folded-back pages on the left.
// Units are canvas px: the page is 330 x 467, x right, y down, z toward the viewer.

export const PAGE_W = 330;
export const PAGE_H = 467;
// Area the WebGL canvas covers, around the page (room for the curl and the bulge)
export const REGION = { x0: -120, y0: -110, x1: 345, y1: 577 };

const TUBE_R = 34; // radius of the folded-back pages on the left (matches curl-phone.webp)
const BEND_R = 9; // the slight bend at the crease
const MAX_SHADOW = 0.5; // same as the laptop (maxShadowOpacity)

export type Point = { x: number; y: number };

type Fold = {
  P: Point; // a point on the crease
  n: Point; // which way the crease faces (toward the corner)
  R: number; // bend radius
  opacity: number;
  outerW: number;
  innerW: number;
  lift: number;
};

type Program = {
  p: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
  a: number;
};

const VERT = `
attribute vec2 aP;
uniform vec2 uP; uniform vec2 uN; uniform float uR; uniform float uRw;
uniform vec4 uRegion;
varying vec2 vUV; varying vec3 vPos; varying vec3 vNrm; varying float vD;
const float PI = 3.14159265;
vec3 deform(vec2 p) {
  float d = dot(p - uP, uN);
  vec3 q = vec3(p, 0.0);
  if (d > 0.0) {
    vec2 foot = p - d * uN;
    if (d < PI * uR) {
      float th = d / uR;
      q = vec3(foot + uN * uR * sin(th), uR * (1.0 - cos(th)));
    } else {
      q = vec3(foot - uN * (d - PI * uR), 2.0 * uR);
    }
  }
  // Near the left edge the turned page settles down onto the folded-back pages,
  // so it hugs them instead of floating out past them
  float hug = smoothstep(0.0, 45.0, q.x);
  q.z = mix(min(q.z, 1.2), q.z, hug);
  if (q.x < 0.0) {
    float r = uRw + q.z;
    float s = -q.x;
    float ph = s / r;
    if (ph < PI) { q.x = -r * sin(ph); q.z = -uRw + r * cos(ph); }
    else { q.x = s - PI * r; q.z = -uRw - r; }
  }
  return q;
}
void main() {
  vec3 q = deform(aP);
  vec3 qx = deform(aP + vec2(0.6, 0.0));
  vec3 qy = deform(aP + vec2(0.0, 0.6));
  vNrm = cross(qx - q, qy - q);
  vPos = q;
  vD = dot(aP - uP, uN);
  vUV = aP / vec2(${PAGE_W}.0, ${PAGE_H}.0);
  gl_Position = vec4(
    (q.x - uRegion.x) / (uRegion.z - uRegion.x) * 2.0 - 1.0,
    1.0 - (q.y - uRegion.y) / (uRegion.w - uRegion.y) * 2.0,
    -q.z / 400.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uFront; uniform sampler2D uBack;
uniform vec2 uP; uniform vec2 uN; uniform float uR; uniform float uRw;
uniform float uInnerW; uniform float uOpacity; uniform float uLift;
varying vec2 vUV; varying vec3 vPos; varying vec3 vNrm; varying float vD;
const float PI = 3.14159265;
float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
void main() {
  vec3 p = vPos;
  // Hidden behind the page, or behind the folded-back pages
  if (p.z < -0.5) {
    if (p.x > -0.5) discard;
    if (p.x > -uRw) {
      float zf = -uRw + sqrt(max(uRw * uRw - p.x * p.x, 0.0));
      if (p.z < zf - 0.5) discard;
    }
  }
  vec3 n = normalize(vNrm);
  bool front = n.z >= 0.0;
  vec3 col;
  if (front) {
    col = texture2D(uFront, vUV).rgb;
  } else {
    // Back of the page: the paper, plus the ink showing through faintly (mirrored)
    vec3 paper = texture2D(uBack, vec2(1.0 - vUV.x, vUV.y)).rgb;
    float ink = clamp((lum(texture2D(uBack, vUV).rgb) - lum(texture2D(uFront, vUV).rgb)) * 2.5, 0.0, 1.0);
    col = paper * (1.0 - 0.05 * ink) * 1.03;
  }
  // Light from the top left, so the bend reads as paper
  vec3 nn = front ? n : -n;
  vec3 L = normalize(vec3(-0.35, -0.55, 1.0));
  float diff = dot(nn, L) / L.z;
  float shade = clamp(0.58 + 0.42 * diff, 0.3, 1.08);
  col *= shade;
  if (vD > 0.0) {
    // The laptop's inner shadow on the turning part (same bands as page-flip)
    float t = vD / max(uInnerW, 0.001);
    float a = 0.0;
    if (t < 0.05) a = uOpacity;
    else if (t < 0.15) a = mix(uOpacity, 0.05, (t - 0.05) / 0.10);
    else if (t < 0.35) a = mix(0.05, uOpacity, (t - 0.15) / 0.20);
    else if (t < 1.0) a = mix(uOpacity, 0.0, (t - 0.35) / 0.65);
    col *= 1.0 - a;
  } else if (uLift > 0.0) {
    // Soft shadow of the lifted part on the flat part, just past its edge
    vec2 m = vUV * vec2(${PAGE_W}.0, ${PAGE_H}.0) + (PI * uR - 2.0 * vD) * uN;
    vec2 out2 = max(max(-m, m - vec2(${PAGE_W}.0, ${PAGE_H}.0)), 0.0);
    float e = length(out2);
    if (e > 0.0) col *= 1.0 - 0.22 * uLift * clamp(1.0 - e / 12.0, 0.0, 1.0);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

const SHADOW_VERT = `
attribute vec2 aP;
uniform vec4 uRegion;
varying vec2 vXY;
void main() {
  vXY = aP;
  gl_Position = vec4(
    (aP.x - uRegion.x) / (uRegion.z - uRegion.x) * 2.0 - 1.0,
    1.0 - (aP.y - uRegion.y) / (uRegion.w - uRegion.y) * 2.0,
    0.2 / 400.0, 1.0);
}`;

const SHADOW_FRAG = `
precision highp float;
uniform vec2 uP; uniform vec2 uN; uniform float uOuterW; uniform float uOpacity;
varying vec2 vXY;
void main() {
  float d = dot(vXY - uP, uN);
  if (d < 0.0) discard;
  // The laptop's outer shadow: from the crease onto the page underneath
  float a = uOpacity * clamp(1.0 - d / max(uOuterW, 0.001), 0.0, 1.0);
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type);
  if (!s) throw new Error("Could not create a shader");
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? "Shader did not compile");
  }
  return s;
}

function makeProgram(gl: WebGLRenderingContext, vs: string, fs: string): Program {
  const p = gl.createProgram();
  if (!p) throw new Error("Could not create a WebGL program");
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? "WebGL program did not link");
  }
  // Look up every uniform once, by name
  const u: Record<string, WebGLUniformLocation | null> = {};
  const count: number = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(p, i);
    if (info) u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u, a: gl.getAttribLocation(p, "aP") };
}

// The fold for a corner C pulled to T (same rule as page-flip: the crease is
// halfway between them), shifted so the corner lands right under the finger
// even with the bend.
export function foldFor(C: Point, T: Point): Fold | null {
  const dx = C.x - T.x;
  const dy = C.y - T.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const n = { x: dx / len, y: dy / len };
  // Progress like page-flip: 0 at the start, 1 when the corner reaches the far side
  const progress = Math.min(Math.abs(T.x - PAGE_W) / (2 * PAGE_W), 1);
  const R = Math.min(BEND_R, len / 5);
  const P = {
    x: (C.x + T.x) / 2 - (n.x * Math.PI * R) / 2,
    y: (C.y + T.y) / 2 - (n.y * Math.PI * R) / 2,
  };
  const shadowW = ((PAGE_W * 3) / 4) * progress;
  return {
    P,
    n,
    R,
    opacity: (1 - progress) * MAX_SHADOW,
    outerW: shadowW,
    innerW: (shadowW * 3) / 4,
    lift: Math.min(len / 40, 1),
  };
}

// No fold at all (the page lies flat)
const FLAT: Fold = { P: { x: 1e5, y: 0 }, n: { x: 1, y: 0 }, R: 1, opacity: 0, outerW: 1, innerW: 1, lift: 0 };

export class PageCurl {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private page: Program;
  private shadow: Program;
  private vbo: WebGLBuffer | null;
  private ibo: WebGLBuffer | null;
  private quad: WebGLBuffer | null;
  private count: number;
  private front: WebGLTexture | null;
  private back: WebGLTexture | null;

  // Throws if the phone has no WebGL. The caller falls back to a plain page swap.
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, depth: true });
    if (!gl) throw new Error("No WebGL on this device");
    this.gl = gl;
    this.page = makeProgram(gl, VERT, FRAG);
    this.shadow = makeProgram(gl, SHADOW_VERT, SHADOW_FRAG);

    // Page mesh: a grid over the page
    const NX = 72;
    const NY = 102;
    const verts: number[] = [];
    for (let j = 0; j <= NY; j++) {
      for (let i = 0; i <= NX; i++) verts.push((i / NX) * PAGE_W, (j / NY) * PAGE_H);
    }
    const idx: number[] = [];
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const a = j * (NX + 1) + i;
        idx.push(a, a + 1, a + NX + 1, a + 1, a + NX + 2, a + NX + 1);
      }
    }
    this.count = idx.length;
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    // 73 * 103 vertices fits in 16 bit indices
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

    // One rectangle over the page, for the shadow underneath
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, PAGE_W, 0, 0, PAGE_H, PAGE_W, PAGE_H]), gl.STATIC_DRAW);

    this.front = this.makeTex();
    this.back = this.makeTex();
  }

  private makeTex(): WebGLTexture | null {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  // front: the turning page with its text. back: the paper image for its back side.
  setPage(frontCanvas: HTMLCanvasElement, backImage: HTMLImageElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.front);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frontCanvas);
    gl.bindTexture(gl.TEXTURE_2D, this.back);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backImage);
  }

  resize(cssW: number, cssH: number, dpr: number) {
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  // Draw the page with corner C pulled to T
  draw(C: Point, T: Point) {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const f = foldFor(C, T) ?? FLAT;
    const R = REGION;

    // The page
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    const pg = this.page;
    gl.useProgram(pg.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.enableVertexAttribArray(pg.a);
    gl.vertexAttribPointer(pg.a, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(pg.u.uP, f.P.x, f.P.y);
    gl.uniform2f(pg.u.uN, f.n.x, f.n.y);
    gl.uniform1f(pg.u.uR, f.R);
    gl.uniform1f(pg.u.uRw, TUBE_R);
    gl.uniform4f(pg.u.uRegion, R.x0, R.y0, R.x1, R.y1);
    gl.uniform1f(pg.u.uInnerW, f.innerW);
    gl.uniform1f(pg.u.uOpacity, f.opacity);
    gl.uniform1f(pg.u.uLift, f.lift);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.front);
    gl.uniform1i(pg.u.uFront, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.back);
    gl.uniform1i(pg.u.uBack, 1);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);

    // The shadow on the page underneath (only where the turning page is not)
    if (f.opacity > 0.001) {
      const sh = this.shadow;
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(sh.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      gl.enableVertexAttribArray(sh.a);
      gl.vertexAttribPointer(sh.a, 2, gl.FLOAT, false, 0, 0);
      gl.uniform4f(sh.u.uRegion, R.x0, R.y0, R.x1, R.y1);
      gl.uniform2f(sh.u.uP, f.P.x, f.P.y);
      gl.uniform2f(sh.u.uN, f.n.x, f.n.y);
      gl.uniform1f(sh.u.uOuterW, f.outerW);
      gl.uniform1f(sh.u.uOpacity, f.opacity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  clear() {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  // Free the GPU memory when the phone book goes away (React unmount)
  destroy() {
    const gl = this.gl;
    gl.deleteBuffer(this.vbo);
    gl.deleteBuffer(this.ibo);
    gl.deleteBuffer(this.quad);
    gl.deleteTexture(this.front);
    gl.deleteTexture(this.back);
    gl.deleteProgram(this.page.p);
    gl.deleteProgram(this.shadow.p);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

// How far the corner has to travel left so the whole page is wrapped out of sight
export function endX(): number {
  const r = TUBE_R + 1.2;
  const c = -(Math.PI * r + Math.PI * BEND_R) / 2 - 8;
  return 2 * c - PAGE_W;
}