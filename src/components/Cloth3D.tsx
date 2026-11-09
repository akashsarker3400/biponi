/**
 * A real-time 3D saree: Verlet cloth physics + physically based silk.
 * - hangs from a brass rod, sways in a breeze
 * - grab & pull the fabric with mouse / finger
 * - zari is metallic (glints as lights move), silk has sheen
 */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Look, Motif } from '../data'

export type LightMood = 'day' | 'lamp' | 'pandal'

const SX = 24
const SY = 44
const WIDTH = 1.15
const HEIGHT = 2.35

/* ------------------------------------------------------------------ */
/* Texture painting: the same layout drawn twice, once in colour and   */
/* once as a black/white metal mask so only the zari shines.           */
/* ------------------------------------------------------------------ */
const KOLKA = new Path2D('M8 20 C2 18 2 9 8 7 C13 5 15 1 13 0 C20 3 21 15 13 20 C11 21 9.5 21 8 20 Z')

function drawMotif(x: CanvasRenderingContext2D, motif: Motif, x0: number, y0: number, w: number, h: number, S: number, zari: string, border: string) {
  x.save()
  x.beginPath()
  x.rect(x0, y0, w, h)
  x.clip()
  if (motif === 'check' || motif === 'stripe') {
    x.fillStyle = border
    x.globalAlpha = motif === 'check' ? 0.55 : 0.9
    for (let i = x0; i < x0 + w; i += S) x.fillRect(i + S * 0.42, y0, S * (motif === 'check' ? 0.16 : 0.08), h)
    if (motif === 'check') for (let j = y0; j < y0 + h; j += S) x.fillRect(x0, j + S * 0.42, w, S * 0.16)
    x.globalAlpha = 1
    x.fillStyle = zari
    for (let i = x0; i < x0 + w; i += S) x.fillRect(i + S * 0.49, y0, S * 0.025, h)
    x.restore()
    return
  }
  x.fillStyle = zari
  let r = 0
  for (let j = y0 + S / 2; j < y0 + h + S; j += S * 0.85, r++) {
    for (let i = x0 + (r % 2 ? S / 2 : 0); i < x0 + w + S; i += S) {
      if (motif === 'jamdani') {
        const s = S * 0.3
        x.beginPath()
        x.moveTo(i, j - s)
        x.lineTo(i + s * 0.36, j)
        x.lineTo(i, j + s)
        x.lineTo(i - s * 0.36, j)
        x.closePath()
        x.moveTo(i - s, j)
        x.lineTo(i, j - s * 0.36)
        x.lineTo(i + s, j)
        x.lineTo(i, j + s * 0.36)
        x.closePath()
        x.fill()
      } else if (motif === 'buti') {
        x.beginPath()
        x.arc(i, j, S * 0.07, 0, Math.PI * 2)
        x.fill()
      } else if (motif === 'kolka') {
        x.save()
        x.translate(i - S * 0.28, j - S * 0.28)
        x.scale(S / 38, S / 38)
        x.fill(KOLKA)
        x.restore()
      }
    }
  }
  x.restore()
}

export function paintSaree(look: Look, mode: 'color' | 'metal', W = 768, H = 1536) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d')!
  const col = (role: 'body' | 'border' | 'zari') => (mode === 'color' ? look[role] : role === 'zari' ? '#ffffff' : '#000000')
  const FR = Math.round(H * 0.04)
  const bodyH = H - FR
  const PALLU = Math.round(bodyH * 0.7)
  const S = W / 8
  const pw = Math.round(W * 0.085)

  x.clearRect(0, 0, W, H)
  x.fillStyle = col('body')
  x.fillRect(0, 0, W, bodyH)
  if (mode === 'color') {
    // tiny tonal variation: hand-dyed threads are never perfectly flat
    for (let i = 0; i < W; i += 3) {
      x.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.035})`
      x.fillRect(i, 0, 2, bodyH)
    }
  }
  drawMotif(x, look.motif, pw, 0, W - pw * 2, PALLU, S, col('zari'), col('border'))

  // pallu (anchol): heavy zari bands + dense motif
  let y = PALLU
  x.fillStyle = col('zari')
  x.fillRect(0, y, W, 18)
  y += 18
  let k = 0
  while (y < bodyH) {
    const band = k % 2 === 0 ? 46 : 74
    if (k % 2 === 0) {
      x.fillStyle = col('border')
      x.fillRect(0, y, W, band)
      x.fillStyle = col('zari')
      x.fillRect(0, y + 6, W, 3)
      x.fillRect(0, y + band - 9, W, 3)
      drawMotif(x, 'jamdani', 0, y + 12, W, band - 24, 26, col('zari'), col('border'))
    } else {
      drawMotif(x, look.motif === 'plain' ? 'buti' : look.motif, 0, y, W, band, S * 0.55, col('zari'), col('border'))
    }
    y += band
    k++
  }

  // paar (borders) on both long edges
  for (const px of [0, W - pw]) {
    x.fillStyle = col('border')
    x.fillRect(px, 0, pw, bodyH)
    x.fillStyle = col('zari')
    x.fillRect(px + pw * 0.12, 0, pw * 0.05, bodyH)
    x.fillRect(px + pw * 0.83, 0, pw * 0.05, bodyH)
    drawMotif(x, 'jamdani', px + pw * 0.2, 0, pw * 0.6, bodyH, pw * 0.55, col('zari'), col('border'))
  }

  // tassels
  x.lineCap = 'round'
  for (let i = 4; i < W; i += 7) {
    x.strokeStyle = i % 4 === 0 ? col('zari') : col('border')
    x.lineWidth = 3
    x.beginPath()
    x.moveTo(i, bodyH - 2)
    x.lineTo(i + (Math.random() - 0.5) * 3, bodyH + FR * (0.6 + Math.random() * 0.4))
    x.stroke()
  }
  return c
}

function weaveBump() {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const x = c.getContext('2d')!
  x.fillStyle = '#808080'
  x.fillRect(0, 0, 32, 32)
  for (let i = 0; i < 32; i += 4) {
    for (let j = 0; j < 32; j += 4) {
      const over = ((i + j) / 4) % 2 === 0
      x.fillStyle = over ? '#b4b4b4' : '#5a5a5a'
      x.fillRect(i, j + 1, 4, 2)
      x.fillStyle = over ? '#5a5a5a' : '#b4b4b4'
      x.fillRect(i + 1, j, 2, 4)
    }
  }
  return c
}

/* ------------------------------------------------------------------ */
/* Cloth simulation                                                    */
/* ------------------------------------------------------------------ */
class ClothSim {
  n = (SX + 1) * (SY + 1)
  p = new Float32Array(this.n * 3)
  q = new Float32Array(this.n * 3)
  pin = new Uint8Array(this.n)
  a: number[] = []
  b: number[] = []
  rest: number[] = []
  constructor() {
    for (let j = 0; j <= SY; j++)
      for (let i = 0; i <= SX; i++) {
        const k = j * (SX + 1) + i
        const x = (i / SX - 0.5) * WIDTH
        const y = HEIGHT / 2 - (j / SY) * HEIGHT
        // natural pleats: gathered at the rod, softening towards the hem
        const z = Math.sin((i / SX) * Math.PI * 5) * (0.055 - 0.025 * (j / SY)) + Math.sin(i * 0.9) * 0.01 * (j / SY)
        this.p.set([x, y, z], k * 3)
        this.q.set([x, y, z], k * 3)
        if (j === 0) this.pin[k] = 1
      }
    const link = (k1: number, k2: number) => {
      this.a.push(k1)
      this.b.push(k2)
      const dx = this.p[k1 * 3] - this.p[k2 * 3]
      const dy = this.p[k1 * 3 + 1] - this.p[k2 * 3 + 1]
      const dz = this.p[k1 * 3 + 2] - this.p[k2 * 3 + 2]
      this.rest.push(Math.hypot(dx, dy, dz))
    }
    const id = (i: number, j: number) => j * (SX + 1) + i
    for (let j = 0; j <= SY; j++)
      for (let i = 0; i <= SX; i++) {
        if (i < SX) link(id(i, j), id(i + 1, j))
        if (j < SY) link(id(i, j), id(i, j + 1))
        if (i < SX && j < SY) {
          link(id(i, j), id(i + 1, j + 1))
          link(id(i + 1, j), id(i, j + 1))
        }
        if (i < SX - 1) link(id(i, j), id(i + 2, j))
        if (j < SY - 1) link(id(i, j), id(i, j + 2))
      }
  }
  iters = 14
  step(dt: number, wind: THREE.Vector3, normals: ArrayLike<number>, t: number, grab: number, target: THREE.Vector3 | null) {
    const { p, q, pin, n } = this
    const g = -5.2
    const damp = Math.pow(0.965, dt * 60) // frame-rate independent air drag
    for (let k = 0; k < n; k++) {
      if (pin[k] || k === grab) continue
      const i3 = k * 3
      const nx = normals[i3]
      const ny = normals[i3 + 1]
      const nz = normals[i3 + 2]
      const row = Math.floor(k / (SX + 1))
      // travelling ripples, stronger towards the free hem
      const flutter = (0.55 + 0.45 * Math.sin(t * 3.2 - row * 0.32 + (k % (SX + 1)) * 0.22)) * (0.5 + row / SY)
      const dot = (nx * wind.x + ny * wind.y + nz * wind.z) * flutter
      for (let c = 0; c < 3; c++) {
        const v = (p[i3 + c] - q[i3 + c]) * damp
        q[i3 + c] = p[i3 + c]
        const f = (c === 0 ? nx : c === 1 ? ny : nz) * dot + (c === 1 ? g : 0) + (c === 0 ? wind.x * 0.45 * flutter : 0)
        p[i3 + c] += v + f * dt * dt
      }
    }
    if (grab >= 0 && target) {
      p[grab * 3] = target.x
      p[grab * 3 + 1] = target.y
      p[grab * 3 + 2] = target.z
    }
    const { a, b, rest } = this
    for (let it = 0; it < this.iters; it++) {
      for (let c = 0; c < a.length; c++) {
        const i1 = a[c] * 3
        const i2 = b[c] * 3
        const dx = p[i2] - p[i1]
        const dy = p[i2 + 1] - p[i1 + 1]
        const dz = p[i2 + 2] - p[i1 + 2]
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
        const diff = (d - rest[c]) / d
        const l1 = pin[a[c]] || a[c] === grab
        const l2 = pin[b[c]] || b[c] === grab
        if (l1 && l2) continue
        const s1 = l1 ? 0 : l2 ? 1 : 0.5
        const s2 = l2 ? 0 : l1 ? 1 : 0.5
        p[i1] += dx * diff * s1
        p[i1 + 1] += dy * diff * s1
        p[i1 + 2] += dz * diff * s1
        p[i2] -= dx * diff * s2
        p[i2 + 1] -= dy * diff * s2
        p[i2 + 2] -= dz * diff * s2
      }
    }
  }
  poke(cx: number, cy: number, r: number, fx: number, fz: number) {
    for (let k = 0; k < this.n; k++) {
      if (this.pin[k]) continue
      const dx = this.p[k * 3] - cx
      const dy = this.p[k * 3 + 1] - cy
      const d = Math.hypot(dx, dy)
      if (d < r) {
        const f = 1 - d / r
        this.q[k * 3] -= fx * f
        this.q[k * 3 + 2] -= fz * f
      }
    }
  }
}

/* ------------------------------------------------------------------ */
export function Cloth3D({ look, mood = 'day', wind = true, gust = 0, className, onGrab }: { look: Look; mood?: LightMood; wind?: boolean; gust?: number; className?: string; onGrab?: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ setLook: (l: Look) => void; setMood: (m: LightMood) => void; setWind: (w: boolean) => void; gust: () => void } | null>(null)
  const grabCb = useRef(onGrab)
  grabCb.current = onGrab

  useEffect(() => {
    const el = host.current!
    // phones: lower resolution + cheaper physics so scrolling stays smooth
    const lite = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760
    const renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: lite ? 'low-power' : 'high-performance' })
    renderer.setPixelRatio(Math.min(lite ? 1.25 : 2, window.devicePixelRatio))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 1.05
    el.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'pan-y'

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    const camBase = new THREE.Vector3(0.75, 0.15, 5.4)
    camera.position.copy(camBase)
    camera.lookAt(0, -0.05, 0)

    // lights
    const hemi = new THREE.HemisphereLight(0xfff6e8, 0xc9a04a, 1.1)
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(2, 3, 4)
    const warm = new THREE.PointLight(0xff9a40, 0, 8, 1.6)
    warm.position.set(-0.7, -0.8, 1.2)
    const glintA = new THREE.PointLight(0xff8a3d, 0, 7, 1.5)
    const glintB = new THREE.PointLight(0xffd36b, 0, 7, 1.5)
    scene.add(hemi, key, warm, glintA, glintB)

    // rod
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a04a, metalness: 1, roughness: 0.28 })
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, WIDTH * 1.32, 24), brass)
    rod.rotation.z = Math.PI / 2
    rod.position.set(0, HEIGHT / 2 + 0.014, 0)
    const finGeo = new THREE.SphereGeometry(0.036, 24, 16)
    const finL = new THREE.Mesh(finGeo, brass)
    const finR = new THREE.Mesh(finGeo, brass)
    finL.position.set(-WIDTH * 0.66, HEIGHT / 2 + 0.014, 0)
    finR.position.set(WIDTH * 0.66, HEIGHT / 2 + 0.014, 0)
    scene.add(rod, finL, finR)

    // cloth
    const sim = new ClothSim()
    if (lite) sim.iters = 7
    const geo = new THREE.PlaneGeometry(WIDTH, HEIGHT, SX, SY)
    const posAttr = geo.attributes.position as THREE.BufferAttribute
    posAttr.setUsage(THREE.DynamicDrawUsage)
    const bump = new THREE.CanvasTexture(weaveBump())
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping
    bump.repeat.set(70, 140)
    const mat = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      metalness: 1,
      roughness: 0.58,
      sheen: 0.35,
      sheenRoughness: 0.55,
      specularIntensity: 0.45,
      bumpMap: bump,
      bumpScale: 0.06,
      alphaTest: 0.5,
      envMapIntensity: 0.9,
    })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    let maps: THREE.Texture[] = []
    const setLook = (l: Look) => {
      maps.forEach((m) => m.dispose())
      const map = new THREE.CanvasTexture(paintSaree(l, 'color'))
      map.colorSpace = THREE.SRGBColorSpace
      map.anisotropy = renderer.capabilities.getMaxAnisotropy()
      const metal = new THREE.CanvasTexture(paintSaree(l, 'metal'))
      mat.map = map
      mat.metalnessMap = metal
      mat.sheenColor = new THREE.Color(l.body).lerp(new THREE.Color('#fff2d8'), 0.12)
      mat.needsUpdate = true
      maps = [map, metal]
    }
    setLook(look)

    // mood
    let curMood: LightMood = mood
    const setMood = (m: LightMood) => {
      curMood = m
      hemi.intensity = m === 'day' ? 0.45 : m === 'lamp' ? 0.18 : 0.35
      hemi.color.set(m === 'pandal' ? 0xffd6a0 : 0xfff6e8)
      key.intensity = m === 'day' ? 1.15 : m === 'lamp' ? 0.15 : 0.5
      warm.intensity = m === 'lamp' ? 2.6 : 0
      glintA.intensity = glintB.intensity = m === 'pandal' ? 4 : m === 'day' ? 0.8 : 0
      mat.envMapIntensity = m === 'day' ? 0.6 : m === 'lamp' ? 0.25 : 0.45
      renderer.toneMappingExposure = m === 'day' ? 0.85 : m === 'lamp' ? 1 : 0.95
    }
    setMood(mood)

    let windOn = wind
    let gustV = 0
    const windVec = new THREE.Vector3()

    // interaction
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const plane = new THREE.Plane()
    const target = new THREE.Vector3()
    let grab = -1
    let last = { x: 0, y: 0, t: 0 }
    const setNdc = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
    }
    const down = (e: PointerEvent) => {
      setNdc(e)
      const hit = ray.intersectObject(mesh)[0]
      if (!hit || !hit.face) return
      const cands = [hit.face.a, hit.face.b, hit.face.c]
      let best = cands[0]
      let bd = Infinity
      cands.forEach((k) => {
        const d = hit.point.distanceTo(new THREE.Vector3(sim.p[k * 3], sim.p[k * 3 + 1], sim.p[k * 3 + 2]))
        if (d < bd) {
          bd = d
          best = k
        }
      })
      if (sim.pin[best]) return
      grab = best
      plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), hit.point)
      target.copy(hit.point)
      renderer.domElement.setPointerCapture(e.pointerId)
      el.classList.add('grabbing')
      grabCb.current?.()
    }
    const move = (e: PointerEvent) => {
      setNdc(e)
      if (grab >= 0) {
        ray.ray.intersectPlane(plane, target)
        return
      }
      const now = performance.now()
      const dt = Math.max(16, now - last.t)
      const vx = (e.clientX - last.x) / dt
      last = { x: e.clientX, y: e.clientY, t: now }
      const hit = ray.intersectObject(mesh)[0]
      if (hit) {
        el.classList.add('can-grab')
        const s = Math.min(1.2, Math.abs(vx))
        sim.poke(hit.point.x, hit.point.y, 0.32, vx * 0.004, 0.006 * s)
      } else el.classList.remove('can-grab')
    }
    const up = () => {
      grab = -1
      el.classList.remove('grabbing')
    }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)
    renderer.domElement.addEventListener('pointercancel', up)
    renderer.domElement.addEventListener('pointerleave', () => el.classList.remove('can-grab'))

    // sizing
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const fitH = HEIGHT * 1.12
      const fitW = WIDTH * 2.1
      const dist = Math.max(fitH / 2 / Math.tan((camera.fov * Math.PI) / 360), fitW / 2 / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect))
      camBase.set(dist * 0.32, 0.18, dist * 0.95)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    // loop (paused when off-screen)
    let visible = true
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting))
    io.observe(el)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let t = 0
    let prev = performance.now()
    const mouse = { x: 0, y: 0 }
    const onWinMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('pointermove', onWinMove)

    let tick = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) {
        prev = now
        return
      }
      // phones: simulate + draw every other frame (30 fps) to keep scrolling fluid
      if (lite && tick++ % 2 === 1 && grab < 0) return
      const dt = Math.min(lite ? 0.05 : 0.033, (now - prev) / 1000)
      prev = now
      t += dt
      const base = windOn && !reduce ? 2.1 + Math.sin(t * 0.7) * 1.1 + Math.sin(t * 1.9) * 0.5 : 0.2
      gustV *= 0.96
      windVec.set(Math.sin(t * 0.45) * 1.4 + Math.sin(t * 1.3) * 0.4, 0, base + gustV)
      const normals = geo.attributes.normal.array
      const sub = lite ? 1 : 2
      for (let s = 0; s < sub; s++) sim.step(dt / sub, windVec, normals, t, grab, grab >= 0 ? target : null)
      posAttr.array.set(sim.p)
      posAttr.needsUpdate = true
      geo.computeVertexNormals()
      geo.computeBoundingSphere()

      // moving lights make the zari glint
      glintA.position.set(Math.sin(t * 0.8) * 1.8, Math.cos(t * 0.5) * 0.9, 1.6 + Math.sin(t * 0.6) * 0.4)
      glintB.position.set(Math.cos(t * 0.6) * -1.6, Math.sin(t * 0.9) * 1.1, 1.4)
      if (curMood === 'lamp') warm.intensity = 2.6 + Math.sin(t * 13) * 0.18 + Math.sin(t * 29) * 0.12
      // gentle camera parallax
      camera.position.set(camBase.x + mouse.x * 0.5, camBase.y - mouse.y * 0.3, camBase.z)
      camera.lookAt(0, -0.05, 0)
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(frame)

    api.current = {
      setLook: (l) => {
        setLook(l)
        gustV = 2.6
      },
      setMood,
      setWind: (w) => {
        windOn = w
      },
      gust: () => {
        gustV = 7
      },
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onWinMove)
      maps.forEach((m) => m.dispose())
      bump.dispose()
      geo.dispose()
      mat.dispose()
      brass.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
      api.current = null
    }
    // the scene is built once; later prop changes go through `api`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    api.current?.setLook(look)
  }, [look])
  useEffect(() => {
    api.current?.setMood(mood)
  }, [mood])
  useEffect(() => {
    api.current?.setWind(wind)
  }, [wind])
  useEffect(() => {
    if (gust) api.current?.gust()
  }, [gust])

  return <div ref={host} className={'cloth3d ' + (className ?? '')} />
}
