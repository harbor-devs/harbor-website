// Draws the camera shutter (8 lens blades) with WebGL in one full-screen pass.
// Every pixel works out which blade covers it, so the graphics chip does all the work.
// Same blade model as the still first-paint drawing in Shutter.tsx:
// blade i turns on a pin at angle i * 45deg on a circle of radius R around the hole center.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uSize;   // screen size in CSS px
uniform float uDpr;   // device pixels per CSS px
uniform float uR;     // pin circle radius in CSS px
uniform float uA;     // opening angle in radians (0 = edges meet in the center)
uniform vec2 uCenter; // where the hole opens, in CSS px from the screen center

const float PI = 3.14159265;

vec3 metal(float d) {
  // umber metal, a bit lighter right behind the edge (same stops as the still drawing)
  float t = d / (2.0 * uR);
  vec3 c0 = vec3(0.290, 0.216, 0.153);
  vec3 c1 = vec3(0.227, 0.165, 0.114);
  vec3 c2 = vec3(0.165, 0.122, 0.078);
  vec3 c3 = vec3(0.118, 0.086, 0.055);
  vec3 c = t < 0.08 ? mix(c0, c1, t / 0.08) : t < 0.5 ? mix(c1, c2, (t - 0.08) / 0.42) : mix(c2, c3, clamp((t - 0.5) / 0.5, 0.0, 1.0));
  // brass line on the cutting edge, then a thin dark line under it
  vec3 brass = vec3(0.659, 0.510, 0.235);
  float b = 1.0 - smoothstep(1.0, 2.0, d);
  float s = (1.0 - smoothstep(3.5, 4.5, d)) * (1.0 - b);
  c = mix(c, c * 0.65, s);
  return mix(c, brass, b * 0.9);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr - uSize * 0.5 - uCenter;

  float d[8];
  bool cov[8];
  for (int i = 0; i < 8; i++) {
    float th = float(i) * PI / 4.0;
    vec2 pin = uR * vec2(cos(th), sin(th));
    float ph = th + PI + uA;
    vec2 n = vec2(-sin(ph), cos(ph));
    d[i] = dot(p - pin, n);
    cov[i] = d[i] > -0.5;
  }

  // Blades overlap in a circle: the one on top is the last of a covering run
  int top = -1;
  float dTop = 0.0;
  bool under = false;
  float dUnder = 0.0;
  for (int i = 0; i < 8; i++) {
    int nx = i == 7 ? 0 : i + 1;
    int pv = i == 0 ? 7 : i - 1;
    bool cNext = false; bool cPrev = false; float dPrev = 0.0;
    for (int k = 0; k < 8; k++) {
      if (k == nx) cNext = cov[k];
      if (k == pv) { cPrev = cov[k]; dPrev = d[k]; }
    }
    if (top < 0 && cov[i] && !cNext) { top = i; dTop = d[i]; under = cPrev; dUnder = dPrev; }
  }

  bool any = false;
  for (int i = 0; i < 8; i++) { if (cov[i]) any = true; }
  if (!any) {
    // the open hole: see-through
    gl_FragColor = vec4(0.0);
    return;
  }
   if (top < 0) {
    // every blade covers this pixel (only the single center point when shut): same dark as the seams
    gl_FragColor = vec4(metal(4.0), 1.0);
    return;
  }
  // soft 1px edge so lines are not jagged
  float a = clamp(dTop + 0.5, 0.0, 1.0);
  vec4 below = under ? vec4(metal(max(dUnder, 0.0)), 1.0) : vec4(0.0);
  vec4 col = mix(below, vec4(metal(max(dTop, 0.0)), 1.0), a);
  gl_FragColor = vec4(col.rgb * col.a, col.a);
}
`;

export type ShutterGL = {
  // angle: blade angle; cx, cy: hole center from the screen center; r: pin circle radius (all CSS px)
  draw: (angle: number, cx: number, cy: number, r: number) => void;
  destroy: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

// Returns null if WebGL is not available; the caller then just fades instead
export function createShutterGL(canvas: HTMLCanvasElement): ShutterGL | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // One rectangle covering the whole screen
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uSize = gl.getUniformLocation(prog, "uSize");
  const uDpr = gl.getUniformLocation(prog, "uDpr");
  const uR = gl.getUniformLocation(prog, "uR");
  const uA = gl.getUniformLocation(prog, "uA");
  const uCenter = gl.getUniformLocation(prog, "uCenter");

  const draw = (angle: number, cx: number, cy: number, r: number) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // Sharp enough for thin brass lines, light enough for phones
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    gl.viewport(0, 0, bw, bh);
    gl.uniform2f(uSize, w, h);
    gl.uniform1f(uDpr, bw / w);
    gl.uniform1f(uR, r);
    gl.uniform2f(uCenter, cx, cy);
    gl.uniform1f(uA, angle);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const destroy = () => {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  return { draw, destroy };
}