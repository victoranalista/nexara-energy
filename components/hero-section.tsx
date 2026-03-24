"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowDown, MessageCircle } from "lucide-react"

/* ══════════════════════════════════════════════════════
   EnergyCableCanvas: Cabo de energia animado com raios
   Canvas puro, sem vídeo, qualidade perfeita em qualquer tela.
   ══════════════════════════════════════════════════════ */
function EnergyCableCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0, h = 0
    let dpr = window.devicePixelRatio || 1

    const resize = () => {
      const r = container.getBoundingClientRect()
      dpr = window.devicePixelRatio || 1
      w = r.width; h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // Mouse tracking for interactive bolts
    let mx = -9999, my = -9999, active = false
    let smoothX = -9999, smoothY = -9999
    let prevX = -9999, prevY = -9999
    let speed = 0

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect()
      mx = e.clientX - r.left; my = e.clientY - r.top
      active = true
    }
    const onLeave = () => { active = false }
    const onTouch = (e: TouchEvent) => {
      const r = container.getBoundingClientRect()
      const t = e.touches[0]
      if (t) { mx = t.clientX - r.left; my = t.clientY - r.top; active = true }
    }

    container.addEventListener("mousemove", onMove)
    container.addEventListener("mouseleave", onLeave)
    container.addEventListener("touchmove", onTouch, { passive: true })
    container.addEventListener("touchend", onLeave)

    // ── Cable path: smooth S-curve across the screen ──
    function getCablePath(time: number): { x: number; y: number }[] {
      const points: { x: number; y: number }[] = []
      const segments = 120
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const x = t * w
        // Main S-curve with subtle time-based wave motion
        const baseY = h * 0.5
        const wave1 = Math.sin(t * Math.PI * 2.5 + time * 0.4) * h * 0.12
        const wave2 = Math.sin(t * Math.PI * 1.2 - time * 0.25) * h * 0.06
        const wave3 = Math.sin(t * Math.PI * 4 + time * 0.8) * h * 0.015
        const y = baseY + wave1 + wave2 + wave3
        points.push({ x, y })
      }
      return points
    }

    // ── Energy pulses flowing along cable ──
    interface EnergyPulse {
      position: number  // 0-1 along cable
      speed: number
      intensity: number
      width: number
      hue: number
    }

    const pulses: EnergyPulse[] = []
    let lastPulseTime = 0
    const PULSE_INTERVAL = 400

    // ── Lightning bolts branching from cable ──
    interface CableBolt {
      originT: number  // position along cable (0-1)
      segs: { x: number; y: number }[]
      life: number
      maxLife: number
      hue: number
      width: number
    }

    const cableBolts: CableBolt[] = []
    let lastBoltTime = 0
    const BOLT_INTERVAL = 800

    // ── Mouse-triggered bolts ──
    interface MouseBolt {
      segs: { x: number; y: number }[]
      life: number
      maxLife: number
      hue: number
      width: number
    }
    const mouseBolts: MouseBolt[] = []
    let lastMouseBolt = 0

    let raf = 0
    const startTime = performance.now()

    const animate = () => {
      const now = performance.now()
      const elapsed = (now - startTime) / 1000
      ctx.clearRect(0, 0, w, h)

      // Get current cable path
      const cable = getCablePath(elapsed)

      // ── Draw ambient glow behind cable ──
      ctx.save()
      ctx.beginPath()
      cable.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.strokeStyle = "rgba(245, 158, 11, 0.04)"
      ctx.lineWidth = 80
      ctx.shadowColor = "rgba(245, 158, 11, 0.08)"
      ctx.shadowBlur = 60
      ctx.filter = "blur(30px)"
      ctx.stroke()
      ctx.restore()

      // ── Draw the main cable (dark core) ──
      ctx.beginPath()
      cable.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.strokeStyle = "rgba(40, 40, 40, 0.9)"
      ctx.lineWidth = 3
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      ctx.shadowBlur = 0
      ctx.stroke()

      // ── Draw cable edge glow ──
      ctx.beginPath()
      cable.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.strokeStyle = "rgba(245, 158, 11, 0.12)"
      ctx.lineWidth = 5
      ctx.shadowColor = "rgba(245, 158, 11, 0.3)"
      ctx.shadowBlur = 15
      ctx.stroke()
      ctx.shadowBlur = 0

      // ── Spawn energy pulses ──
      if (now - lastPulseTime > PULSE_INTERVAL) {
        lastPulseTime = now
        pulses.push({
          position: -0.05,
          speed: 0.15 + Math.random() * 0.2,
          intensity: 0.6 + Math.random() * 0.4,
          width: 0.03 + Math.random() * 0.04,
          hue: 30 + Math.random() * 20,
        })
      }

      // ── Draw & update energy pulses ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i]
        pulse.position += pulse.speed * 0.016

        if (pulse.position > 1.05) { pulses.splice(i, 1); continue }

        // Find position on cable
        const idx = Math.floor(pulse.position * (cable.length - 1))
        const nextIdx = Math.min(idx + 1, cable.length - 1)
        if (idx < 0 || idx >= cable.length) continue

        const p = cable[Math.max(0, idx)]
        const pNext = cable[nextIdx]

        // Draw pulse glow
        const pulseAlpha = pulse.intensity * (
          pulse.position < 0.1 ? pulse.position / 0.1 :
          pulse.position > 0.9 ? (1 - pulse.position) / 0.1 : 1
        )

        // Wide outer glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 60)
        grad.addColorStop(0, `hsla(${pulse.hue}, 100%, 65%, ${pulseAlpha * 0.35})`)
        grad.addColorStop(0.4, `hsla(${pulse.hue}, 100%, 50%, ${pulseAlpha * 0.12})`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.fillRect(p.x - 60, p.y - 60, 120, 120)

        // Bright core line segment
        const segStart = Math.max(0, Math.floor((pulse.position - pulse.width) * (cable.length - 1)))
        const segEnd = Math.min(cable.length - 1, Math.floor((pulse.position + pulse.width) * (cable.length - 1)))

        if (segEnd > segStart) {
          // Core glow
          ctx.beginPath()
          for (let s = segStart; s <= segEnd; s++) {
            if (s === segStart) ctx.moveTo(cable[s].x, cable[s].y)
            else ctx.lineTo(cable[s].x, cable[s].y)
          }
          ctx.strokeStyle = `hsla(${pulse.hue}, 100%, 70%, ${pulseAlpha * 0.8})`
          ctx.lineWidth = 6
          ctx.shadowColor = `hsla(${pulse.hue}, 100%, 60%, ${pulseAlpha})`
          ctx.shadowBlur = 20
          ctx.stroke()

          // White-hot center
          ctx.beginPath()
          for (let s = segStart; s <= segEnd; s++) {
            if (s === segStart) ctx.moveTo(cable[s].x, cable[s].y)
            else ctx.lineTo(cable[s].x, cable[s].y)
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.9})`
          ctx.lineWidth = 2
          ctx.shadowColor = `rgba(255, 255, 255, ${pulseAlpha * 0.5})`
          ctx.shadowBlur = 8
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      // ── Spawn lightning bolts from cable ──
      if (now - lastBoltTime > BOLT_INTERVAL + Math.random() * 600) {
        lastBoltTime = now
        const originT = 0.1 + Math.random() * 0.8
        const idx = Math.floor(originT * (cable.length - 1))
        const origin = cable[idx]
        if (origin) {
          const angle = (Math.random() > 0.5 ? -1 : 1) * (Math.PI / 4 + Math.random() * Math.PI / 3)
          const segCount = 5 + Math.floor(Math.random() * 8)
          const segs: { x: number; y: number }[] = [{ x: origin.x, y: origin.y }]
          let bx = origin.x, by = origin.y
          const stepLen = 15 + Math.random() * 25

          for (let s = 0; s < segCount; s++) {
            bx += Math.cos(angle + (Math.random() - 0.5) * 1.2) * stepLen * (0.5 + Math.random())
            by += Math.sin(angle + (Math.random() - 0.5) * 1.2) * stepLen * (0.5 + Math.random())
            segs.push({ x: bx, y: by })
          }

          cableBolts.push({
            originT,
            segs,
            life: 0,
            maxLife: 6 + Math.random() * 10,
            hue: 25 + Math.random() * 30,
            width: 0.6 + Math.random() * 1.2,
          })
        }
      }

      // ── Draw cable bolts ──
      for (let i = cableBolts.length - 1; i >= 0; i--) {
        const bolt = cableBolts[i]
        bolt.life++
        if (bolt.life > bolt.maxLife) { cableBolts.splice(i, 1); continue }

        // Update origin position (cable moves)
        const idx = Math.floor(bolt.originT * (cable.length - 1))
        const currentOrigin = cable[Math.max(0, idx)]
        if (currentOrigin && bolt.segs[0]) {
          const dx = currentOrigin.x - bolt.segs[0].x
          const dy = currentOrigin.y - bolt.segs[0].y
          bolt.segs.forEach(s => { s.x += dx; s.y += dy })
        }

        const progress = bolt.life / bolt.maxLife
        const alpha = progress < 0.05 ? 1 : Math.pow(1 - progress, 2.5)

        drawBolt(ctx, bolt.segs, bolt.hue, alpha, bolt.width)
      }

      // ── Mouse interactive bolts ──
      smoothX += (mx - smoothX) * 0.12
      smoothY += (my - smoothY) * 0.12
      const ddx = smoothX - prevX, ddy = smoothY - prevY
      speed = Math.sqrt(ddx * ddx + ddy * ddy)
      prevX = smoothX; prevY = smoothY

      if (active && speed > 3 && now - lastMouseBolt > 100 && mouseBolts.length < 25) {
        lastMouseBolt = now

        // Find nearest cable point
        let nearestDist = Infinity, nearestIdx = 0
        cable.forEach((p, idx) => {
          const d = Math.hypot(p.x - smoothX, p.y - smoothY)
          if (d < nearestDist) { nearestDist = d; nearestIdx = idx }
        })

        const count = Math.min(Math.ceil(speed / 8), 3)
        for (let b = 0; b < count; b++) {
          const origin = nearestDist < 200 ? cable[nearestIdx] : { x: smoothX, y: smoothY }
          const target = nearestDist < 200 ? { x: smoothX, y: smoothY } : cable[nearestIdx]

          const segs: { x: number; y: number }[] = [{ x: origin.x, y: origin.y }]
          const segCount = 6 + Math.floor(Math.random() * 8)
          let bx = origin.x, by = origin.y
          const baseAngle = Math.atan2(target.y - origin.y, target.x - origin.x)

          for (let s = 0; s < segCount; s++) {
            const t = (s + 1) / segCount
            const targetX = origin.x + (target.x - origin.x) * t
            const targetY = origin.y + (target.y - origin.y) * t
            bx = targetX + (Math.random() - 0.5) * 40
            by = targetY + (Math.random() - 0.5) * 40
            segs.push({ x: bx, y: by })
          }

          mouseBolts.push({
            segs,
            life: 0,
            maxLife: 6 + Math.random() * 10,
            hue: 25 + Math.random() * 30,
            width: 0.6 + Math.random() * 1.5 + speed * 0.1,
          })
        }
      }

      // ── Draw mouse bolts ──
      for (let i = mouseBolts.length - 1; i >= 0; i--) {
        const bolt = mouseBolts[i]
        bolt.life++
        if (bolt.life > bolt.maxLife) { mouseBolts.splice(i, 1); continue }

        const progress = bolt.life / bolt.maxLife
        const alpha = progress < 0.05 ? 1 : Math.pow(1 - progress, 2)

        drawBolt(ctx, bolt.segs, bolt.hue, alpha, bolt.width)
      }

      // ── Floating ambient particles near cable ──
      const particleCount = 30
      for (let i = 0; i < particleCount; i++) {
        const t = (i / particleCount + elapsed * 0.02) % 1
        const idx = Math.floor(t * (cable.length - 1))
        const p = cable[Math.max(0, Math.min(idx, cable.length - 1))]
        if (!p) continue

        const offsetX = Math.sin(elapsed * 2 + i * 7.3) * 30
        const offsetY = Math.cos(elapsed * 1.5 + i * 4.1) * 20
        const particleAlpha = 0.15 + Math.sin(elapsed * 3 + i * 2.1) * 0.1

        ctx.beginPath()
        ctx.arc(p.x + offsetX, p.y + offsetY, 1 + Math.random(), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(35, 100%, 65%, ${particleAlpha})`
        ctx.shadowColor = "hsla(35, 100%, 60%, 0.4)"
        ctx.shadowBlur = 6
        ctx.fill()
      }
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      container.removeEventListener("mousemove", onMove)
      container.removeEventListener("mouseleave", onLeave)
      container.removeEventListener("touchmove", onTouch)
      container.removeEventListener("touchend", onLeave)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}

/* ── Helper: draw a lightning bolt ── */
function drawBolt(
  ctx: CanvasRenderingContext2D,
  segs: { x: number; y: number }[],
  hue: number,
  alpha: number,
  width: number
) {
  // Outer glow
  ctx.beginPath()
  ctx.strokeStyle = `hsla(${hue}, 100%, 55%, ${alpha * 0.4})`
  ctx.lineWidth = width + 4
  ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${alpha * 0.8})`
  ctx.shadowBlur = 25
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  segs.forEach((s, j) => {
    if (j === 0) ctx.moveTo(s.x, s.y)
    else ctx.lineTo(s.x, s.y)
  })
  ctx.stroke()

  // Bright core
  ctx.beginPath()
  ctx.strokeStyle = `hsla(${hue}, 80%, 80%, ${alpha * 0.9})`
  ctx.lineWidth = width
  ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${alpha * 0.5})`
  ctx.shadowBlur = 12
  segs.forEach((s, j) => {
    if (j === 0) ctx.moveTo(s.x, s.y)
    else ctx.lineTo(s.x, s.y)
  })
  ctx.stroke()

  // White-hot center
  ctx.beginPath()
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`
  ctx.lineWidth = Math.max(width * 0.3, 0.5)
  ctx.shadowBlur = 0
  segs.forEach((s, j) => {
    if (j === 0) ctx.moveTo(s.x, s.y)
    else ctx.lineTo(s.x, s.y)
  })
  ctx.stroke()
  ctx.shadowBlur = 0
}

/* ── Energy Streams Button (on.energy) ── */
function EnergyButton({
  children, href, className = "",
}: { children: React.ReactNode; href: string; className?: string }) {
  const streamStyles = [
    { top: "12%", left: "-10%", width: "2.5rem", delay: "0s" },
    { top: "67%", left: "15%", width: "3rem", delay: "0.05s" },
    { top: "34%", left: "-45%", width: "2.5rem", delay: "0.1s" },
    { top: "82%", left: "70%", width: "2rem", delay: "0.15s" },
    { top: "19%", left: "5%", width: "2.5rem", delay: "0.2s" },
    { top: "56%", left: "30%", width: "3.5rem", delay: "0.25s" },
    { top: "91%", left: "-55%", width: "2.5rem", delay: "0.3s" },
    { top: "43%", left: "80%", width: "2.8rem", delay: "0.35s" },
    { top: "28%", left: "-20%", width: "2.5rem", delay: "0.4s" },
    { top: "74%", left: "40%", width: "2.2rem", delay: "0.08s" },
    { top: "8%", left: "-65%", width: "2.5rem", delay: "0.12s" },
    { top: "51%", left: "10%", width: "3.2rem", delay: "0.18s" },
    { top: "88%", left: "-50%", width: "2.5rem", delay: "0.22s" },
    { top: "38%", left: "25%", width: "2.6rem", delay: "0.28s" },
    { top: "61%", left: "-75%", width: "2.5rem", delay: "0.32s" },
  ]

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`energy-button group ${className}`}
    >
      <span className="energy-streams">
        {streamStyles.map((s, i) => (
          <span key={i} className="stream" style={{ top: s.top, left: s.left, width: s.width, animationDelay: s.delay }} />
        ))}
      </span>
      <span className="energy-bg" />
      <span className="energy-fill" />
      <span className="energy-glow" />
      <span className="energy-label">{children}</span>
    </a>
  )
}

/* ── Stat Card ── */
function StatCard({ number, suffix, title, description, delay }: {
  number: string; suffix?: string; title: string; description: string; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="stat-card"
    >
      <div className="stat-number-wrapper">
        <div className="stat-number">
          {number}
          {suffix && <span className="stat-suffix">{suffix}</span>}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-description">{description}</p>
      </div>
    </motion.div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const textRef = useRef<HTMLDivElement>(null)
  const textInView = useInView(textRef, { once: true })

  const whatsappUrl = "https://wa.me/5561994227754?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20painéis%20solares%20Nexara%20Energy."

  return (
    <>
      <section ref={sectionRef} className="hero-fullbleed">
        <EnergyCableCanvas />
        <div className="hero-video-overlay" />

        <motion.div
          ref={textRef}
          style={{ opacity: contentOpacity }}
          className="hero-content"
        >
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
          <StatCard number="98" suffix="%" title="Eficiência Energética" description="Painéis de última geração com tecnologia AI para máximo aproveitamento solar." delay={0} />
          <StatCard number="25" suffix=" anos" title="Garantia Total" description="Durabilidade comprovada com garantia líder no mercado brasileiro." delay={0.1} />
          <StatCard number="85" suffix="%" title="Economia na Conta de Luz" description="Redução média comprovada pelos nossos clientes em Brasília e região." delay={0.2} />
          <StatCard number="500" suffix="+" title="Projetos Instalados" description="Mais de 500 residências e empresas confiaram na Nexara Energy." delay={0.3} />
        </div>
      </section>
    </>
  )
}
