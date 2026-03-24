"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowDown, MessageCircle } from "lucide-react"
import * as THREE from "three"

/* ══════════════════════════════════════════════════════════════
   EnergyGridThree  —  rede elétrica 3D com Three.js
   Partículas fluindo em linhas, nodes âmbar pulsantes,
   interação com mouse, estética on.energy.
   ══════════════════════════════════════════════════════════════ */
function EnergyGridThree() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene / Camera ─────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 2000)
    camera.position.set(0, 0, 500)

    // ── Mouse (normalized -1..1) ───────────────────────────────
    const mouse = new THREE.Vector2(-999, -999)
    const onMouseMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect()
      mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1
      mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1
    }
    const onMouseLeave = () => { mouse.set(-999, -999) }
    const onTouch = (e: TouchEvent) => {
      const r = mount.getBoundingClientRect()
      const t = e.touches[0]
      if (t) {
        mouse.x =  ((t.clientX - r.left) / r.width)  * 2 - 1
        mouse.y = -((t.clientY - r.top)  / r.height) * 2 + 1
      }
    }
    mount.addEventListener("mousemove", onMouseMove)
    mount.addEventListener("mouseleave", onMouseLeave)
    mount.addEventListener("touchmove", onTouch, { passive: true })
    mount.addEventListener("touchend", onMouseLeave)

    // ── Color palette ─────────────────────────────────────────
    const AMBER  = new THREE.Color(0xf59e0b)
    const AMBER2 = new THREE.Color(0xfbbf24)
    const WHITE  = new THREE.Color(0xffffff)

    // ── Build node grid ───────────────────────────────────────
    const W = mount.clientWidth, H = mount.clientHeight
    const COLS = Math.ceil(W / 110) + 2
    const ROWS = Math.ceil(H / 90)  + 2
    const cw   = W / (COLS - 1)
    const rh   = H / (ROWS - 1)

    interface NodeData {
      pos: THREE.Vector3
      baseX: number; baseY: number
      energy: number; phase: number
      mesh: THREE.Mesh
    }
    const nodeList: NodeData[] = []

    // Node geometry — small circle sprite
    const nodeGeo  = new THREE.CircleGeometry(3, 12)
    const nodeMat  = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true })

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (Math.random() < 0.15) continue  // organic gaps

        const jx = (Math.random() - 0.5) * cw * 0.35
        const jy = (Math.random() - 0.5) * rh * 0.35
        const x  = c * cw - W / 2 + jx
        const y  = r * rh - H / 2 + jy

        const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone())
        mesh.position.set(x, y, 0)
        scene.add(mesh)

        nodeList.push({
          pos: new THREE.Vector3(x, y, 0),
          baseX: x, baseY: y,
          energy: Math.random(),
          phase: Math.random() * Math.PI * 2,
          mesh,
        })
      }
    }

    // ── Build edges (connect nearby nodes) ────────────────────
    interface EdgeData {
      a: number; b: number; dist: number
      line: THREE.Line
      positions: Float32Array
    }
    const edgeList: EdgeData[] = []
    const MAX_EDGE = Math.hypot(cw, rh) * 1.6

    for (let a = 0; a < nodeList.length; a++) {
      let conn = 0
      for (let b = a + 1; b < nodeList.length && conn < 4; b++) {
        const d = nodeList[a].pos.distanceTo(nodeList[b].pos)
        if (d < MAX_EDGE) {
          const positions = new Float32Array([
            nodeList[a].pos.x, nodeList[a].pos.y, 0,
            nodeList[b].pos.x, nodeList[b].pos.y, 0,
          ])
          const geo = new THREE.BufferGeometry()
          geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
          const mat = new THREE.LineBasicMaterial({
            color: AMBER, transparent: true, opacity: 0.07, linewidth: 1,
          })
          const line = new THREE.Line(geo, mat)
          scene.add(line)
          edgeList.push({ a, b, dist: d, line, positions })
          conn++
        }
      }
    }

    // ── Particles flowing along edges ─────────────────────────
    interface ParticleData {
      edgeIdx: number; pos: number; speed: number
      mesh: THREE.Mesh
    }
    const particleList: ParticleData[] = []
    const particleGeo = new THREE.CircleGeometry(2.5, 8)

    function spawnParticle(edgeIdx: number) {
      const mat  = new THREE.MeshBasicMaterial({ color: WHITE, transparent: true, opacity: 0 })
      const mesh = new THREE.Mesh(particleGeo, mat)
      mesh.position.set(nodeList[edgeList[edgeIdx].a].pos.x, nodeList[edgeList[edgeIdx].a].pos.y, 1)
      scene.add(mesh)
      particleList.push({ edgeIdx, pos: 0, speed: 0.003 + Math.random() * 0.007, mesh })
    }

    // Seed particles
    for (let i = 0; i < Math.min(edgeList.length, 40); i++) {
      spawnParticle(Math.floor(Math.random() * edgeList.length))
    }

    // Tail geometry per particle (line strip)
    // We'll fake tails with a second smaller sphere behind the particle
    // (keeping it simple and performant)

    // ── Raycaster for mouse ────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const mouseWorld = new THREE.Vector3()

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", onResize)

    // ── Animation loop ────────────────────────────────────────
    let raf = 0
    let lastSpawn = 0
    const clock = new THREE.Clock()

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const dt      = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      // Mouse world position
      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(mousePlane, mouseWorld)
      const hasMouse = mouse.x > -900

      // ── Update nodes ──
      nodeList.forEach(n => {
        n.energy = (n.energy + dt * 0.6) % 1

        const pulse  = Math.sin(elapsed * 2.5 + n.phase) * 0.5 + 0.5
        const hover  = hasMouseeffect(n, mouseWorld)
        const baseA  = 0.08 + pulse * 0.08 + hover * 0.7
        const scale  = 0.4 + hover * 1.8 + n.energy * 0.3;

        (n.mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(baseA, 1)
        n.mesh.scale.setScalar(scale)
      })

      // ── Update edges ──
      edgeList.forEach(e => {
        const midX = (nodeList[e.a].pos.x + nodeList[e.b].pos.x) / 2
        const midY = (nodeList[e.a].pos.y + nodeList[e.b].pos.y) / 2
        const md   = hasMouseeffectXY(midX, midY, mouseWorld)
        const op   = 0.04 + md * 0.35;
        (e.line.material as THREE.LineBasicMaterial).opacity = op
      })

      // ── Spawn particles ──
      const now = performance.now()
      if (now - lastSpawn > 80 && particleList.length < 120) {
        lastSpawn = now
        // Prefer edges near mouse
        let ei = Math.floor(Math.random() * edgeList.length)
        if (hasMouseeffectXY(0, 0, mouseWorld) > 0 && edgeList.length > 0) {
          let best = ei, bestD = Infinity
          for (let k = 0; k < 12; k++) {
            const idx = Math.floor(Math.random() * edgeList.length)
            const e   = edgeList[idx]
            const midX = (nodeList[e.a].pos.x + nodeList[e.b].pos.x) / 2
            const midY = (nodeList[e.a].pos.y + nodeList[e.b].pos.y) / 2
            const d = Math.hypot(midX - mouseWorld.x, midY - mouseWorld.y)
            if (d < bestD) { bestD = d; best = idx }
          }
          ei = best
        }
        spawnParticle(ei)
      }

      // ── Update particles ──
      for (let i = particleList.length - 1; i >= 0; i--) {
        const p = particleList[i]
        p.pos += p.speed

        if (p.pos >= 1) {
          scene.remove(p.mesh)
          p.mesh.geometry.dispose()
          ;(p.mesh.material as THREE.Material).dispose()
          particleList.splice(i, 1)
          continue
        }

        const e  = edgeList[p.edgeIdx]
        const na = nodeList[e.a], nb = nodeList[e.b]
        const x  = na.pos.x + (nb.pos.x - na.pos.x) * p.pos
        const y  = na.pos.y + (nb.pos.y - na.pos.y) * p.pos
        p.mesh.position.set(x, y, 1)

        // Fade in/out + mouse boost
        const fade  = p.pos < 0.1 ? p.pos / 0.1 : p.pos > 0.85 ? (1 - p.pos) / 0.15 : 1
        const hover = hasMouseeffectXY(x, y, mouseWorld)
        const op    = Math.min(fade * (0.7 + hover * 0.3), 1)
        ;(p.mesh.material as THREE.MeshBasicMaterial).opacity = op

        // Color: white-hot when fast/hovered, amber otherwise
        const col = new THREE.Color().lerpColors(AMBER2, WHITE, hover * 0.7)
        ;(p.mesh.material as THREE.MeshBasicMaterial).color.copy(col)
        p.mesh.scale.setScalar(0.6 + hover * 0.8)
      }

      // ── Subtle camera drift ──
      camera.position.x += (mouse.x * 15 - camera.position.x) * 0.03
      camera.position.y += (mouse.y * 10 - camera.position.y) * 0.03
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    // Helper: distance influence (0-1)
    function hasMouseeffect(n: NodeData, mw: THREE.Vector3): number {
      if (!hasMouseGlobal()) return 0
      const d = Math.hypot(n.pos.x - mw.x, n.pos.y - mw.y)
      return d < 180 ? Math.pow(1 - d / 180, 1.5) : 0
    }
    function hasMouseeffectXY(x: number, y: number, mw: THREE.Vector3): number {
      if (!hasMouseGlobal()) return 0
      const d = Math.hypot(x - mw.x, y - mw.y)
      return d < 180 ? Math.pow(1 - d / 180, 1.5) : 0
    }
    function hasMouseGlobal() { return mouse.x > -900 }

    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      mount.removeEventListener("mousemove", onMouseMove)
      mount.removeEventListener("mouseleave", onMouseLeave)
      mount.removeEventListener("touchmove", onTouch)
      mount.removeEventListener("touchend", onMouseLeave)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 z-0" />
}

/* ── Energy Streams Button ──────────────────────────────────── */
function EnergyButton({ children, href, className = "" }: {
  children: React.ReactNode; href: string; className?: string
}) {
  const streams = [
    { top: "12%", left: "-10%",  width: "2.5rem", delay: "0s"    },
    { top: "67%", left: "15%",   width: "3rem",   delay: "0.05s" },
    { top: "34%", left: "-45%",  width: "2.5rem", delay: "0.1s"  },
    { top: "82%", left: "70%",   width: "2rem",   delay: "0.15s" },
    { top: "19%", left: "5%",    width: "2.5rem", delay: "0.2s"  },
    { top: "56%", left: "30%",   width: "3.5rem", delay: "0.25s" },
    { top: "91%", left: "-55%",  width: "2.5rem", delay: "0.3s"  },
    { top: "43%", left: "80%",   width: "2.8rem", delay: "0.35s" },
    { top: "28%", left: "-20%",  width: "2.5rem", delay: "0.4s"  },
    { top: "74%", left: "40%",   width: "2.2rem", delay: "0.08s" },
    { top: "8%",  left: "-65%",  width: "2.5rem", delay: "0.12s" },
    { top: "51%", left: "10%",   width: "3.2rem", delay: "0.18s" },
    { top: "88%", left: "-50%",  width: "2.5rem", delay: "0.22s" },
    { top: "38%", left: "25%",   width: "2.6rem", delay: "0.28s" },
    { top: "61%", left: "-75%",  width: "2.5rem", delay: "0.32s" },
  ]
  return (
    <a href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`energy-button group ${className}`}
    >
      <span className="energy-streams">
        {streams.map((s, i) => (
          <span key={i} className="stream"
            style={{ top: s.top, left: s.left, width: s.width, animationDelay: s.delay }} />
        ))}
      </span>
      <span className="energy-bg" /><span className="energy-fill" />
      <span className="energy-glow" /><span className="energy-label">{children}</span>
    </a>
  )
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ number, suffix, title, description, delay }: {
  number: string; suffix?: string; title: string; description: string; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="stat-card"
    >
      <div className="stat-number-wrapper">
        <div className="stat-number">
          {number}{suffix && <span className="stat-suffix">{suffix}</span>}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-description">{description}</p>
      </div>
    </motion.div>
  )
}

/* ── Hero Section ───────────────────────────────────────────── */
export function HeroSection() {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const textRef    = useRef<HTMLDivElement>(null)
  const textInView = useInView(textRef, { once: true })
  const whatsappUrl = "https://wa.me/5561994227754?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20painéis%20solares%20Nexara%20Energy."

  return (
    <>
      <section ref={sectionRef} className="hero-fullbleed">
        <EnergyGridThree />
        <div className="hero-video-overlay" />

        <motion.div ref={textRef} style={{ opacity: contentOpacity }} className="hero-content">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={textInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="hero-label"
          >
            Nexara Energy — Brasília
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={textInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hero-heading"
          >
            E se o sol pagasse suas contas?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={textInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            className="hero-copy"
          >
            Milhares de famílias em Brasília já transformaram seus telhados em usinas de energia. Descubra quanto o seu pode gerar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={textInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            className="hero-cta"
          >
            <EnergyButton href={whatsappUrl} className="green">
              <MessageCircle className="inline-block mr-2 h-4 w-4" />
              Fale pelo WhatsApp
            </EnergyButton>
            <EnergyButton href="#vantagens">Saiba Mais</EnergyButton>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="hero-scroll-indicator"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>Explorar</span>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      <section className="stats-cards-section">
        <div className="stats-cards-grid">
          <StatCard number="98"  suffix="%"     title="Eficiência Energética"  description="Painéis de última geração com tecnologia AI para máximo aproveitamento solar." delay={0}   />
          <StatCard number="25"  suffix=" anos" title="Garantia Total"         description="Durabilidade comprovada com garantia líder no mercado brasileiro."           delay={0.1} />
          <StatCard number="85"  suffix="%"     title="Economia na Conta de Luz" description="Redução média comprovada pelos nossos clientes em Brasília e região."     delay={0.2} />
          <StatCard number="500" suffix="+"     title="Projetos Instalados"    description="Mais de 500 residências e empresas confiaram na Nexara Energy."             delay={0.3} />
        </div>
      </section>
    </>
  )
}
