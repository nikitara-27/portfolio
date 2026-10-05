/*!
 * <sunlit-footer> — dappled-sunlight footer background (WebGL, Canvas 2D fallback)
 * Drop-in web component: works in plain HTML, React/Next, Astro, Vue, Svelte, etc.
 *
 * Usage:
 *   <script src="sunlit-footer.js" defer></script>
 *   <sunlit-footer class="site-footer"> ...your footer content... </sunlit-footer>
 *
 * Optional attributes (defaults shown):
 *   blob-count="16" blob-size="1" grain="0.35" grain-size="1"
 *   drift-speed="1" pull-strength="1" shadow-color="#1975FF" light-color="#FFFEC2"
 */
(function () {
  if (typeof window === 'undefined' || !window.customElements || customElements.get('sunlit-footer')) return;

  class DCLogic {}

  class Component extends DCLogic {
    componentWillUnmount() { this._kill(); }
    componentDidUpdate() { if (this._sys) this._sys.sync(); }
    _kill() { if (this._sys) { this._sys.destroy(); this._sys = null; } }

    renderVals() {
      const p = this.props || {};
      if (!this._h) {
        const self = this;
        this._h = {
          setCanvas: function (el) {
            if (el) {
              if (self._sys && self._sys.canvas === el) return;
              self._kill();
              self._sys = self._make(el);
            } else {
              self._kill();
            }
          },
          onMove: function (e) { if (self._sys) self._sys.move(e); },
          onDown: function (e) { if (self._sys) self._sys.down(e); },
          onUp: function (e) { if (self._sys) self._sys.up(e); },
          onLeave: function (e) { if (self._sys) self._sys.leave(e); }
        };
      }
      const shadow = typeof p.shadowColor === 'string' && p.shadowColor ? p.shadowColor : '#1975FF';
      return Object.assign({ shadowColor: shadow, showContent: p.showContent !== false }, this._h);
    }

    _make(canvas) {
      const self = this;
      const doc = canvas.ownerDocument || document;
      const win = doc.defaultView || window;

      /* ---------- helpers ---------- */
      const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const fr = (x) => x - Math.floor(x);
      const hex = (s, d) => {
        let h = String(s || '').trim().replace('#', '');
        if (/^[0-9a-f]{3}$/i.test(h)) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        if (!/^[0-9a-f]{6}$/i.test(h)) h = d;
        return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
      };
      const rng = (seed) => () => {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const cfg = () => {
        const q = self.props || {};
        return {
          count: Math.round(clamp(num(q.blobCount, 16), 4, 32)),
          size: clamp(num(q.blobSize, 1), 0.3, 3),
          grain: clamp(num(q.grain, 0.35), 0, 1),
          speed: clamp(num(q.driftSpeed, 1), 0, 5),
          pull: clamp(num(q.pullStrength, 1), 0, 3),
          cell: clamp(num(q.grainSize, 1), 1, 4),
          shadow: hex(q.shadowColor, '1975FF'),
          light: hex(q.lightColor, 'FFFEC2')
        };
      };

      /* ---------- state ---------- */
      let MAXB = 32, dprNow = 1;
      let aspect = 4.8;
      let tDrift = 0, last = 0, raf = 0, visible = true, dead = false, pressed = false, releaseTimer = 0;
      let blobs = [], genKey = -1;
      const cur = { x: 0, y: 0, sx: 0, sy: 0, h: 0, target: 0, has: false };
      const A = new Float32Array(128); // x, y, 1/rx, 1/ry
      const B = new Float32Array(128); // cos, sin, weight, c1
      const C = new Float32Array(128); // s1, c2, s2, c3  (outline harmonics)
      const D = new Float32Array(128); // soft-side u, v, s3, 0
      const reduceMQ = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
      const isReduced = () => !!(reduceMQ && reduceMQ.matches);

      /* ---------- light spots: layout traced from the reference, extras seeded ---------- */
      // the 16 light spots of the reference: [x as fraction of width, y / height, radius / height, elongation, angle, weight] at a 3.41:1 frame
      const REF = [
        [0.062, 0.34, 0.2814, 1.1726, 0.12, 1.25],
        [0.283, 0.21, 0.2814, 1.2792, -0.1, 1.2],
        [0.742, 0.23, 0.3040, 1.4475, 0.06, 1.2],
        [0.955, 0.54, 0.2846, 1.0541, -0.2, 1.25],
        [0.52, 0.57, 0.2551, 1.2150, 0.15, 1.25],
        [0.467, 0.07, 0.1572, 1.2089, -0.08, 1.05],
        [0.423, 0.46, 0.0500, 1.0000, 0, 0.72],
        [0.616, 0.38, 0.0650, 1.0000, 0, 0.7],
        [0.823, 0.5, 0.0550, 1.0000, 0, 0.68],
        [0.249, 0.55, 0.0450, 1.0000, 0, 0.6],
        [0.89, 0.07, 0.1510, 1.2583, 0.18, 1.05],
        [0.17, 0.03, 0.0592, 1.1832, 0, 0.8],
        [0.16, 0.8, 0.1225, 1.2247, 0.2, 0.35],
        [0.37, 0.92, 0.0980, 1.2247, -0.15, 0.3],
        [0.68, 0.95, 0.1058, 1.3229, 0.1, 0.3],
        [0.85, 0.86, 0.0837, 1.1952, -0.2, 0.3]
      ];
      // outline "personalities": [first, second, third harmonic amplitude] (sum stays within ~8-15% of the radius)
      const SHAPES = [[0.03, 0.04, 0.025], [0.035, 0.09, 0.02], [0.085, 0.05, 0.02], [0.07, 0.03, 0.05]];
      const gen = (n) => {
        const r = rng(7919);
        const old = blobs;
        blobs = [];
        for (let i = 0; i < n; i++) {
          let e = REF[i];
          if (!e) {
            // extras (wide screens / higher counts) go into the emptiest gaps so they stay separate
            const small = r() < 0.55;
            let bx = r(), by = 0.15 + r() * 0.7, best = -1;
            for (let tries = 0; tries < 12; tries++) {
              const cx = r(), cy = 0.12 + r() * 0.76;
              let dmin = 1e9;
              for (let j = 0; j < blobs.length; j++) {
                const q = blobs[j], ddx = (cx - q.fx) * aspect, ddy = cy - q.fy;
                dmin = Math.min(dmin, Math.sqrt(ddx * ddx + ddy * ddy) - Math.max(q.rx, q.ry));
              }
              if (dmin > best) { best = dmin; bx = cx; by = cy; }
            }
            e = small ? [bx, by, 0.035 + r() * 0.03, 1.0 + r() * 0.1, r() * 3.14, 0.9]
                      : [bx, by, 0.08 + r() * 0.06, 1.0 + r() * 0.2, r() * 3.14, 1.0];
          }
          const big = e[2] > 0.1;
          const sh = SHAPES[Math.floor(r() * SHAPES.length)];
          const k = big ? 1 : 0.6;
          const b = {
            fx: e[0], fy: e[1], rx: e[2] * e[3], ry: e[2] / e[3], w: e[5], a0: e[4],
            h: [sh[0] * k * (0.8 + r() * 0.4), sh[1] * k * (0.8 + r() * 0.4), sh[2] * k * (0.8 + r() * 0.4)],
            hp: [r() * 6.283, r() * 6.283, r() * 6.283],
            sf: 0.2 + r() * 0.15, sp: r() * 6.283,
            amp: big ? 0.035 + r() * 0.03 : 0.025 + r() * 0.02,
            f1: 0.13 + r() * 0.16, f2: 0.09 + r() * 0.14, f3: 0.07 + r() * 0.1,
            p1: r() * 6.283, p2: r() * 6.283, p3: r() * 6.283, p4: r() * 6.283,
            x: 0, y: 0, vx: 0, vy: 0, init: false, boost: 0
          };
          if (old[i] && old[i].init) { b.x = old[i].x; b.y = old[i].y; b.vx = old[i].vx; b.vy = old[i].vy; b.init = true; }
          blobs.push(b);
        }
      };
      // Fewer blobs on narrow (phone) footers so it doesn't get crowded
      const effN = (count) => clamp(Math.round(count * clamp(0.3 + 0.7 * aspect / 3.41, 0.3, 1)), 4, Math.min(32, MAXB));

      /* ---------- simulation: idle drift + spring toward cursor ---------- */
      const step = (dt, c) => {
        const n = effN(c.count);
        if (n !== genKey) { genKey = n; gen(n); }
        tDrift += dt * c.speed;
        const t = tDrift;
        const ks = 1 - Math.exp(-dt * 9);
        cur.sx += (cur.x - cur.sx) * ks;
        cur.sy += (cur.y - cur.sy) * ks;
        cur.h += (cur.target - cur.h) * (1 - Math.exp(-dt * (cur.target > cur.h ? 5 : 2.2)));
        if (cur.target === 0 && cur.h < 0.005) { cur.h = 0; cur.has = false; }
        const hov = cur.h * c.pull;
        const R = 0.95 * Math.sqrt(c.size);
        const xs = Math.sqrt(aspect / 3.41);
        for (let i = 0; i < blobs.length; i++) {
          const b = blobs[i];
          let tx = b.fx * aspect + b.amp * 1.4 * (Math.sin(t * b.f1 + b.p1) + 0.5 * Math.sin(t * b.f2 * 1.7 + b.p2));
          let ty = b.fy + b.amp * (Math.cos(t * b.f2 + b.p3) + 0.4 * Math.sin(t * b.f1 * 1.3 + b.p4));
          let inf = 0;
          if (hov > 0.001) {
            const dx = cur.sx - tx, dy = cur.sy - ty;
            inf = Math.exp(-(dx * dx + dy * dy) / (R * R));
            const m = Math.min(0.88, inf * 0.8 * hov);
            tx += dx * m; ty += dy * m;
          }
          b.boost += (inf * Math.min(1, hov) - b.boost) * (1 - Math.exp(-dt * 4));
          if (!b.init) { b.x = tx; b.y = ty; b.vx = 0; b.vy = 0; b.init = true; }
          const SK = 22, SD = 7.5;
          b.vx += ((tx - b.x) * SK - b.vx * SD) * dt;
          b.vy += ((ty - b.y) * SK - b.vy * SD) * dt;
          b.x += b.vx * dt; b.y += b.vy * dt;
          const grow = c.size * (1 + 0.22 * b.boost);
          const rr = b.ry * grow * (1 + 0.07 * Math.sin(t * b.f3 + b.p2));
          const rx = b.rx * grow * (1 + 0.07 * Math.sin(t * b.f3 * 1.3 + b.p4));
          const ang = b.a0 + 0.15 * Math.sin(t * b.f3 * 0.8 + b.p1);
          // outline harmonics drift slowly, like light shifting as leaves sway
          const ph = (j) => b.hp[j] + 0.6 * Math.sin(t * (0.05 + 0.02 * j) + b.p2 + j);
          const am = (j) => b.h[j] * (1 + 0.2 * Math.sin(t * 0.07 + b.p3 + j * 1.7));
          const sd = b.sp + 0.5 * Math.sin(t * 0.04 + b.p4);
          const o = i * 4;
          A[o] = b.x; A[o + 1] = b.y; A[o + 2] = 1 / (rx * xs); A[o + 3] = 1 / rr;
          B[o] = Math.cos(ang); B[o + 1] = Math.sin(ang); B[o + 2] = b.w; B[o + 3] = am(0) * Math.cos(ph(0));
          C[o] = am(0) * Math.sin(ph(0)); C[o + 1] = am(1) * Math.cos(ph(1)); C[o + 2] = am(1) * Math.sin(ph(1)); C[o + 3] = am(2) * Math.cos(ph(2));
          D[o] = b.sf * Math.cos(sd); D[o + 1] = b.sf * Math.sin(sd); D[o + 2] = am(2) * Math.sin(ph(2)); D[o + 3] = 0;
        }
        return blobs.length;
      };

      /* ---------- WebGL renderer ---------- */
      let gl = null, loc = {};
      const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
      const FS = (n) => [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
        '#define MAXB ' + n,
        'uniform vec2 uRes;uniform float uTime;uniform int uCount;',
        'uniform vec4 uA[MAXB];uniform vec4 uB[MAXB];uniform vec4 uC[MAXB];uniform vec4 uD[MAXB];',
        'uniform vec3 uCur;uniform float uCurR;uniform float uGrain;uniform float uCell;uniform vec3 uShadow;uniform vec3 uLight;',
        'float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
        'float vn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
        ' return mix(mix(h12(i),h12(i+vec2(1.0,0.0)),u.x),mix(h12(i+vec2(0.0,1.0)),h12(i+vec2(1.0,1.0)),u.x),u.y);}',
        'void main(){',
        ' vec2 fc=gl_FragCoord.xy;',
        ' vec2 p=vec2(fc.x,uRes.y-fc.y)/uRes.y;',
        ' float t=uTime;',
        // organic domain warp: makes every blob irregular and slowly shape-shifting
        ' vec2 w1=vec2(vn(p*2.1+vec2(t*0.06,0.0)),vn(p*2.1+vec2(7.3,3.1-t*0.05)))-0.5;',
        ' vec2 w2=vec2(vn(p*5.3+vec2(11.0+t*0.08,2.0)),vn(p*5.3+vec2(23.0,5.0-t*0.07)))-0.5;',
        ' vec2 q=p+w1*0.07+w2*0.025;',
        ' float f=0.0;',
        ' for(int i=0;i<MAXB;i++){',
        '  if(i>=uCount)break;',
        '  vec4 a=uA[i];vec4 b=uB[i];vec4 c=uC[i];vec4 e=uD[i];',
        '  vec2 d=q-a.xy;',
        '  vec2 l=vec2(b.x*d.x+b.y*d.y,-b.y*d.x+b.x*d.y)*a.zw;',
        '  float r=length(l)+1e-5;float cs=l.x/r;float sn=l.y/r;',
        // low-frequency outline distortion: lopsided, egg-ish, a flatter side
        '  float m=1.0+b.w*cs+c.x*sn+c.y*(cs*cs-sn*sn)+c.z*(2.0*cs*sn)+c.w*cs*(4.0*cs*cs-3.0)+e.z*sn*(3.0-4.0*sn*sn);',
        '  float dd=r/m;',
        // uneven falloff: one side fades softer / wider than the other
        '  float g=1.0-(e.x*cs+e.y*sn);',
        '  if(dd>0.6)dd=0.6+(dd-0.6)*g;',
        '  f+=b.z*exp(-dd*dd);',
        ' }',
        // metaball field: the cursor adds its own light so nearby pools bridge and merge
        ' vec2 dc=q-uCur.xy;float cd=dot(dc,dc);',
        ' f+=uCur.z*0.55*exp(-cd/(uCurR*uCurR));',
        ' float near=uCur.z*exp(-cd/0.12);',
        ' float wd=mix(0.62,0.16,near);',
        ' float pr=smoothstep(0.5-wd,0.5+wd,f);',
        // grain lives only in the light/shadow transition; flat areas stay calm
        ' float edge=4.0*pr*(1.0-pr);',
        ' vec2 cell=floor(fc/uCell);',
        ' float tri=h12(cell+vec2(17.0,43.0))+h12(cell+vec2(91.0,7.0))-1.0;',
        ' float k=pr+(tri*0.55+(vn(p*16.0+3.7)-0.5)*0.3)*uGrain*edge;',
        ' vec3 col=mix(uShadow,uLight,clamp(k,0.0,1.0));',
        // barely-there uniform print grain over everything
        ' float tri2=h12(cell+vec2(3.0,61.0))+h12(cell+vec2(47.0,29.0))-1.0;',
        ' col+=tri2*0.035*min(1.0,uGrain/0.35);',
        ' gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);',
        '}'
      ].join('\n');

      const initGL = (target, probe) => {
        let g = null;
        try {
          const opts = { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false };
          g = target.getContext('webgl', opts) || target.getContext('experimental-webgl', opts);
        } catch (e) { g = null; }
        if (!g) return false;
        const maxVec = g.getParameter(g.MAX_FRAGMENT_UNIFORM_VECTORS) || 16;
        const nB = clamp(Math.floor((maxVec - 10) / 4), 4, 32);
        const sh = (type, src) => {
          const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s);
          return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
        };
        const v = sh(g.VERTEX_SHADER, VS), f = sh(g.FRAGMENT_SHADER, FS(nB));
        let okay = !!(v && f), prog = null;
        if (okay) {
          prog = g.createProgram(); g.attachShader(prog, v); g.attachShader(prog, f);
          g.bindAttribLocation(prog, 0, 'a'); g.linkProgram(prog);
          okay = !!g.getProgramParameter(prog, g.LINK_STATUS);
        }
        if (probe || !okay) {
          const lose = g.getExtension('WEBGL_lose_context'); if (lose && probe) lose.loseContext();
          return okay;
        }
        g.useProgram(prog);
        const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
        g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
        loc = {};
        ['uRes', 'uTime', 'uCount', 'uCur', 'uCurR', 'uGrain', 'uCell', 'uShadow', 'uLight'].forEach((k) => { loc[k] = g.getUniformLocation(prog, k); });
        loc.uA = g.getUniformLocation(prog, 'uA[0]');
        loc.uB = g.getUniformLocation(prog, 'uB[0]');
        loc.uC = g.getUniformLocation(prog, 'uC[0]');
        loc.uD = g.getUniformLocation(prog, 'uD[0]');
        MAXB = nB; gl = g;
        return true;
      };

      const drawGL = (n, c) => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(loc.uRes, canvas.width, canvas.height);
        gl.uniform1f(loc.uTime, tDrift);
        gl.uniform1i(loc.uCount, Math.min(n, MAXB));
        gl.uniform4fv(loc.uA, A.subarray(0, MAXB * 4));
        gl.uniform4fv(loc.uB, B.subarray(0, MAXB * 4));
        gl.uniform4fv(loc.uC, C.subarray(0, MAXB * 4));
        gl.uniform4fv(loc.uD, D.subarray(0, MAXB * 4));
        gl.uniform3f(loc.uCur, cur.sx, cur.sy, cur.h * Math.min(1, c.pull));
        gl.uniform1f(loc.uCurR, 0.12 * Math.sqrt(c.size));
        gl.uniform1f(loc.uGrain, c.grain);
        gl.uniform1f(loc.uCell, c.cell);
        gl.uniform3f(loc.uShadow, c.shadow[0], c.shadow[1], c.shadow[2]);
        gl.uniform3f(loc.uLight, c.light[0], c.light[1], c.light[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      /* ---------- Canvas 2D fallback (same math, CPU) ---------- */
      let ctx2d = null, img = null, noise = null, grid = null, last2d = -1e9;
      const h12 = (x, y) => {
        let a = fr(x * 0.1031), b = fr(y * 0.1031), c = a;
        const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
        a += d; b += d; c += d;
        return fr((a + b) * c);
      };
      const vn = (x, y) => {
        const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
        const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
        const a = h12(ix, iy), b = h12(ix + 1, iy), c = h12(ix, iy + 1), d = h12(ix + 1, iy + 1);
        const top = a + (b - a) * ux, bot = c + (d - c) * ux;
        return top + (bot - top) * uy;
      };
      const sstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
      const probAt = (px, py, n, g, t, cz, cr) => {
        const qx = px + (vn(px * 2.1 + t * 0.06, py * 2.1) - 0.5) * 0.07 + (vn(px * 5.3 + 11 + t * 0.08, py * 5.3 + 2) - 0.5) * 0.025;
        const qy = py + (vn(px * 2.1 + 7.3, py * 2.1 + 3.1 - t * 0.05) - 0.5) * 0.07 + (vn(px * 5.3 + 23, py * 5.3 + 5 - t * 0.07) - 0.5) * 0.025;
        let f = 0;
        for (let i = 0; i < n; i++) {
          const o = i * 4, dx = qx - A[o], dy = qy - A[o + 1];
          const lx = (B[o] * dx + B[o + 1] * dy) * A[o + 2], ly = (-B[o + 1] * dx + B[o] * dy) * A[o + 3];
          const rr = Math.sqrt(lx * lx + ly * ly) + 1e-5;
          if (rr > 4) continue;
          const cs = lx / rr, sn = ly / rr;
          const m = 1 + B[o + 3] * cs + C[o] * sn + C[o + 1] * (cs * cs - sn * sn) + C[o + 2] * (2 * cs * sn) + C[o + 3] * cs * (4 * cs * cs - 3) + D[o + 2] * sn * (3 - 4 * sn * sn);
          let dd = rr / m;
          if (dd > 0.6) dd = 0.6 + (dd - 0.6) * (1 - (D[o] * cs + D[o + 1] * sn));
          f += B[o + 2] * Math.exp(-dd * dd);
        }
        const ex = qx - cur.sx, ey = qy - cur.sy, cd = ex * ex + ey * ey;
        f += cz * 0.55 * Math.exp(-cd / (cr * cr));
        const near = cz * Math.exp(-cd / 0.12);
        const wd = 0.62 + (0.16 - 0.62) * near;
        const pr = sstep(0.5 - wd, 0.5 + wd, f);
        const edge = 4 * pr * (1 - pr);
        return pr + (vn(px * 16 + 3.7, py * 16 + 3.7) - 0.5) * 0.3 * g * edge;
      };
      const draw2D = (n, c) => {
        const w = canvas.width, h = canvas.height;
        if (!w || !h) return;
        if (!img || img.width !== w || img.height !== h) {
          img = ctx2d.createImageData(w, h);
          noise = new Float32Array(w * h * 2);
          const r = rng(4242);
          for (let i = 0; i < w * h * 2; i++) noise[i] = r() + r() - 1;
        }
        const S = 3, gw = Math.floor(w / S) + 2, gh = Math.floor(h / S) + 2;
        if (!grid || grid.length !== gw * gh) grid = new Float32Array(gw * gh);
        const g = c.grain, cz = cur.h * Math.min(1, c.pull), cr = 0.12 * Math.sqrt(c.size);
        for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) grid[gy * gw + gx] = probAt(gx * S / h, gy * S / h, n, g, tDrift, cz, cr);
        const d = img.data, ovs = Math.min(1, g / 0.35);
        const lr = Math.round(c.light[0] * 255), lg = Math.round(c.light[1] * 255), lb = Math.round(c.light[2] * 255);
        const sr = Math.round(c.shadow[0] * 255), sg = Math.round(c.shadow[1] * 255), sb = Math.round(c.shadow[2] * 255);
        for (let y = 0; y < h; y++) {
          const gyf = y / S, iy = gyf | 0, fy = gyf - iy;
          for (let x = 0; x < w; x++) {
            const gxf = x / S, ix = gxf | 0, fx = gxf - ix, i0 = iy * gw + ix;
            const top = grid[i0] + (grid[i0 + 1] - grid[i0]) * fx;
            const bot = grid[i0 + gw] + (grid[i0 + gw + 1] - grid[i0 + gw]) * fx;
            const k = y * w + x, o = k * 4;
            const pr = top + (bot - top) * fy;
            const edge = clamp(4 * pr * (1 - pr), 0, 1);
            const t = clamp(pr + noise[k * 2] * 0.55 * g * edge, 0, 1);
            const ov = noise[k * 2 + 1] * 8.9 * ovs;
            d[o] = sr + (lr - sr) * t + ov; d[o + 1] = sg + (lg - sg) * t + ov; d[o + 2] = sb + (lb - sb) * t + ov;
            d[o + 3] = 255;
          }
        }
        ctx2d.putImageData(img, 0, 0);
      };

      /* ---------- choose renderer ---------- */
      let ok = false;
      try { const probe = doc.createElement('canvas'); probe.width = 4; probe.height = 4; ok = initGL(probe, true); } catch (e) { ok = false; }
      if (ok) ok = initGL(canvas, false);
      if (!ok) {
        gl = null;
        try { ctx2d = canvas.getContext('2d'); } catch (e) { ctx2d = null; }
        canvas.style.imageRendering = 'pixelated';
      }

      const render = (n, c, now, force) => {
        if (gl) drawGL(n, c);
        else if (ctx2d && (force || now - last2d > 55)) { last2d = now; draw2D(n, c); }
      };

      /* ---------- loop ---------- */
      const frame = (now) => {
        raf = 0;
        if (dead) return;
        if (isReduced()) { renderStatic(); return; }
        const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
        last = now;
        const c = cfg();
        render(step(dt, c), c, now, false);
        if (visible) raf = win.requestAnimationFrame(frame);
      };
      const kick = () => {
        if (dead) return;
        if (isReduced()) { renderStatic(); return; }
        if (!raf && visible) { last = 0; raf = win.requestAnimationFrame(frame); }
      };
      const renderStatic = () => {
        if (dead) return;
        tDrift = 0; cur.h = 0; cur.target = 0;
        genKey = -1; blobs = [];
        const c = cfg();
        render(step(0, c), c, 0, true);
      };

      /* ---------- sizing: grain stays one device pixel at every screen size ---------- */
      const resize = () => {
        const cw = canvas.clientWidth || 1, ch = canvas.clientHeight || 1;
        const dpr = gl ? Math.min(win.devicePixelRatio || 1, 3) : 1;
        dprNow = dpr;
        aspect = cw / ch;
        const W = Math.round(cw * dpr), H = Math.round(ch * dpr);
        if (canvas.width !== W) canvas.width = W;
        if (canvas.height !== H) canvas.height = H;
        if (isReduced()) renderStatic(); else kick();
      };
      let ro = null, io = null;
      if (win.ResizeObserver) { ro = new win.ResizeObserver(resize); ro.observe(canvas); }
      win.addEventListener('resize', resize);
      if (win.IntersectionObserver) {
        io = new win.IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) kick(); });
        io.observe(canvas);
      }
      const onMQ = () => { if (isReduced()) renderStatic(); else kick(); };
      if (reduceMQ) { if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onMQ); else if (reduceMQ.addListener) reduceMQ.addListener(onMQ); }
      const onLost = (e) => { e.preventDefault(); gl = null; };
      const onRestored = () => { if (initGL(canvas, false)) resize(); };
      canvas.addEventListener('webglcontextlost', onLost);
      canvas.addEventListener('webglcontextrestored', onRestored);

      /* ---------- pointer: hover on desktop, tap / drag on touch ---------- */
      const locate = (e) => {
        const r = canvas.getBoundingClientRect();
        if (!r.height) return;
        cur.x = (e.clientX - r.left) / r.height;
        cur.y = (e.clientY - r.top) / r.height;
        if (!cur.has) { cur.sx = cur.x; cur.sy = cur.y; cur.has = true; }
      };
      const engage = (e) => {
        if (isReduced()) return;
        locate(e); cur.target = 1;
        if (releaseTimer) { win.clearTimeout(releaseTimer); releaseTimer = 0; }
        kick();
      };
      const softRelease = () => {
        if (releaseTimer) win.clearTimeout(releaseTimer);
        releaseTimer = win.setTimeout(() => { releaseTimer = 0; cur.target = 0; kick(); }, 900);
      };

      resize();

      return {
        canvas: canvas,
        move: (e) => { if (e.pointerType === 'mouse' || pressed) engage(e); },
        down: (e) => { pressed = true; engage(e); },
        up: (e) => { pressed = false; if (e.pointerType !== 'mouse') softRelease(); },
        leave: (e) => {
          pressed = false;
          if (e.pointerType === 'mouse') { cur.target = 0; kick(); } else softRelease();
        },
        sync: () => { if (isReduced()) renderStatic(); else kick(); },
        destroy: () => {
          dead = true;
          if (raf) win.cancelAnimationFrame(raf);
          if (releaseTimer) win.clearTimeout(releaseTimer);
          if (ro) ro.disconnect();
          if (io) io.disconnect();
          win.removeEventListener('resize', resize);
          if (reduceMQ) { if (reduceMQ.removeEventListener) reduceMQ.removeEventListener('change', onMQ); else if (reduceMQ.removeListener) reduceMQ.removeListener(onMQ); }
          canvas.removeEventListener('webglcontextlost', onLost);
          canvas.removeEventListener('webglcontextrestored', onRestored);
        }
      };
    }
  }

  const ATTRS = {
    'blob-count': 'blobCount', 'blob-size': 'blobSize', 'grain': 'grain', 'grain-size': 'grainSize',
    'drift-speed': 'driftSpeed', 'pull-strength': 'pullStrength', 'shadow-color': 'shadowColor', 'light-color': 'lightColor'
  };
  const COLOR = { shadowColor: 1, lightColor: 1 };

  class SunlitFooter extends HTMLElement {
    static get observedAttributes() { return Object.keys(ATTRS); }

    connectedCallback() {
      if (this._comp) return;
      const cs = getComputedStyle(this);
      if (cs.position === 'static') this.style.position = 'relative';
      if (cs.display === 'inline') this.style.display = 'block';
      this.style.overflow = 'hidden';
      this.style.touchAction = 'pan-y';

      const cv = document.createElement('canvas');
      cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0';
      this.prepend(cv);
      this._cv = cv;

      this._comp = new Component();
      this._comp.props = this._readProps();
      this.style.backgroundColor = this._comp.props.shadowColor || '#1975FF';
      this._sys = this._comp._make(cv);

      const s = () => this._sys;
      this._on = {
        pointermove: (e) => s() && s().move(e),
        pointerdown: (e) => s() && s().down(e),
        pointerup: (e) => s() && s().up(e),
        pointerleave: (e) => s() && s().leave(e),
        pointercancel: (e) => s() && s().leave(e)
      };
      for (const k in this._on) this.addEventListener(k, this._on[k]);
    }

    disconnectedCallback() {
      if (this._on) for (const k in this._on) this.removeEventListener(k, this._on[k]);
      if (this._sys) this._sys.destroy();
      if (this._cv) this._cv.remove();
      this._sys = this._comp = this._cv = this._on = null;
    }

    attributeChangedCallback() {
      if (!this._comp) return;
      this._comp.props = this._readProps();
      this.style.backgroundColor = this._comp.props.shadowColor || '#1975FF';
      this._sys && this._sys.sync();
    }

    _readProps() {
      const p = {};
      for (const a in ATTRS) {
        const v = this.getAttribute(a);
        if (v == null || v === '') continue;
        const key = ATTRS[a];
        p[key] = COLOR[key] ? v : parseFloat(v);
      }
      return p;
    }
  }

  customElements.define('sunlit-footer', SunlitFooter);
})();
