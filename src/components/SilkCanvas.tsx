/**
 * Hero photo rendered in WebGL so the mouse can ripple it like silk.
 * Plain WebGL1, no library: one quad, two textures (for crossfades),
 * and a ring buffer of "drops" left by the moving cursor.
 */
import { useEffect, useRef } from 'react'

const N = 24
const VS = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`
const FS = `precision mediump float;
uniform sampler2D uA,uB;uniform float uMix,uTime,uAsp,uAspA,uAspB,uZA,uZB;uniform vec4 uD[${N}];varying vec2 v;
vec2 cover(vec2 uv,float ia,float z){vec2 s=vec2(1.);if(uAsp>ia)s.y=ia/uAsp;else s.x=uAsp/ia;float hy=.5*s.y/z;float cy=clamp(.66,hy,1.-hy);return (uv-.5)*s/z+vec2(.5,cy);}
void main(){
  vec2 uv=v;vec2 disp=vec2(0.);float light=0.;
  for(int i=0;i<${N};i++){
    vec4 d=uD[i];if(d.w<=0.)continue;float age=uTime-d.z;if(age<0.||age>3.)continue;
    vec2 dv=uv-d.xy;dv.x*=uAsp;float dist=length(dv);
    float w=sin(dist*52.-age*9.)*exp(-dist*6.5)*exp(-age*1.7)*d.w;
    disp+=normalize(dv+1e-5)*w*.013;light+=w;
  }
  disp+=vec2(sin(uv.y*8.+uTime*.7),cos(uv.x*6.+uTime*.5))*.0012;
  vec2 a=cover(uv+disp,uAspA,uZA),b=cover(uv+disp,uAspB,uZB);vec2 ch=disp*.4;
  vec3 ca=vec3(texture2D(uA,a+ch).r,texture2D(uA,a).g,texture2D(uA,a-ch).b);
  vec3 cb=vec3(texture2D(uB,b+ch).r,texture2D(uB,b).g,texture2D(uB,b-ch).b);
  vec3 c=mix(ca,cb,uMix)+light*.07*vec3(1.,.86,.6);
  gl_FragColor=vec4(c,1.);
}`

export function SilkCanvas({ src, dur, onReady }: { src: string; dur: number; onReady: (ok: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const api = useRef<{ show: (s: string) => void } | null>(null)
  const readyCb = useRef(onReady)
  readyCb.current = onReady

  useEffect(() => {
    const c = ref.current!
    const gl = c.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      readyCb.current(false)
      return
    }
    const sh = (type: number, code: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, code)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      readyCb.current(false)
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(prog, n)
    const u = { A: U('uA'), B: U('uB'), mix: U('uMix'), time: U('uTime'), asp: U('uAsp'), aspA: U('uAspA'), aspB: U('uAspB'), zA: U('uZA'), zB: U('uZB'), d: U('uD') }
    gl.uniform1i(u.A, 0)
    gl.uniform1i(u.B, 1)

    const mkTex = () => {
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([40, 8, 12, 255]))
      return t
    }
    let texA = mkTex()
    let texB = mkTex()
    let aspA = 1.5
    let aspB = 1.5
    let startA = 0
    let startB = 0
    let mix = 0
    let mixFrom = -1
    let first = true
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    let dead = false
    const t0 = performance.now()
    const now = () => (performance.now() - t0) / 1000
    const load = (s: string) => {
      const im = new Image()
      im.crossOrigin = 'anonymous'
      im.onload = () => {
        if (dead) return
        if (first) {
          gl.bindTexture(gl.TEXTURE_2D, texA)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im)
          aspA = im.width / im.height
          startA = now()
          first = false
          readyCb.current(true)
        } else {
          gl.bindTexture(gl.TEXTURE_2D, texB)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im)
          aspB = im.width / im.height
          startB = now()
          mixFrom = now()
        }
      }
      im.onerror = () => {
        if (!dead && first) readyCb.current(false)
      }
      im.src = s
    }
    api.current = { show: load }

    // cursor drops
    const drops = new Float32Array(N * 4)
    let di = 0
    let last = { x: 0, y: 0, t: 0 }
    const host = c.closest('section') ?? c
    const onMove = (e: Event) => {
      const pe = e as PointerEvent
      const r = c.getBoundingClientRect()
      const x = (pe.clientX - r.left) / r.width
      const y = 1 - (pe.clientY - r.top) / r.height
      const tt = now()
      const sp = Math.hypot(x - last.x, y - last.y) / Math.max(0.016, tt - last.t)
      if (tt - last.t > 0.045) {
        drops.set([x, y, tt, Math.min(1.4, 0.25 + sp * 0.6)], di * 4)
        di = (di + 1) % N
        last = { x, y, t: tt }
      }
    }
    const onDown = (e: Event) => {
      const pe = e as PointerEvent
      const r = c.getBoundingClientRect()
      drops.set([(pe.clientX - r.left) / r.width, 1 - (pe.clientY - r.top) / r.height, now(), 2.2], di * 4)
      di = (di + 1) % N
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerdown', onDown)

    const resize = () => {
      const d = Math.min(1.5, devicePixelRatio)
      c.width = c.clientWidth * d
      c.height = c.clientHeight * d
      gl.viewport(0, 0, c.width, c.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    resize()

    let visible = true
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting))
    io.observe(c)

    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const tt = now()
      if (mixFrom >= 0) {
        mix = Math.min(1, (tt - mixFrom) / 1.4)
        if (mix >= 1) {
          ;[texA, texB] = [texB, texA]
          aspA = aspB
          startA = startB
          mix = 0
          mixFrom = -1
        }
      }
      // slow Ken Burns zoom per slide
      const z = (s: number) => 1.12 - 0.1 * Math.min(1, (tt - s) / (dur + 1.4))
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texA)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, texB)
      gl.uniform1f(u.mix, mix)
      gl.uniform1f(u.time, tt)
      gl.uniform1f(u.asp, c.width / c.height)
      gl.uniform1f(u.aspA, aspA)
      gl.uniform1f(u.aspB, aspB)
      gl.uniform1f(u.zA, z(startA))
      gl.uniform1f(u.zB, z(startB))
      gl.uniform4fv(u.d, drops)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onDown)
      gl.deleteTexture(texA)
      gl.deleteTexture(texB)
      gl.deleteProgram(prog)
      api.current = null
    }
  }, [dur])

  useEffect(() => {
    api.current?.show(src)
  }, [src])

  return <canvas ref={ref} className="silk-canvas" aria-hidden />
}
