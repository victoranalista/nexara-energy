"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowDown, MessageCircle } from "lucide-react"

/* ══════════════════════════════════════════════════════
   TrailVideo: trail.mp4 + sparks canvas reativo ao mouse
   Vídeo roda nativo (GPU). Canvas leve só desenha sparks.
   ══════════════════════════════════════════════════════ */
function TrailVideo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0, h = 0
    const resize = () => {
      const r = container.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = w; canvas.height = h
    }
    resize()
    window.addEventListener("resize", resize)

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

    // Lightning bolts that persist and fade
    interface Bolt {
      segs: { x: number; y: number }[]
      life: number; maxLife: number; hue: number; width: number
    }
    const bolts: Bolt[] = []
    const MAX_BOLTS = 20

    // Throttle bolt spawning
    let lastSpawn = 0
    const SPAWN_INTERVAL = 120 // ms between bolt spawns when moving

    let raf = 0

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      // Smooth mouse
      smoothX += (mx - smoothX) * 0.12
      smoothY += (my - smoothY) * 0.12

      // Mouse speed
      const ddx = smoothX - prevX, ddy = smoothY - prevY
      speed = Math.sqrt(ddx * ddx + ddy * ddy)
      prevX = smoothX; prevY = smoothY

      const now = performance.now()

      if (active && speed > 4 && now - lastSpawn > SPAWN_INTERVAL && bolts.length < MAX_BOLTS) {
        lastSpawn = now

        // More bolts when faster, max 3 per burst
        const count = Math.min(Math.ceil(speed / 10), 3)

        for (let b = 0; b < count; b++) {
          const angle = Math.random() * Math.PI * 2
          const segCount = 8 + Math.floor(Math.random() * 10)
          const segs: { x: number; y: number }[] = []
          let bx = smoothX
          let by = smoothY
          segs.push({ x: bx, y: by })

          // Longer bolts when moving faster
          const stepLen = 15 + Math.random() * 20 + speed * 2

          for (let s = 0; s < segCount; s++) {
            const jitter = 0.6 + Math.random()
            bx += Math.cos(angle + (Math.random() - 0.5) * 1.8) * stepLen * jitter
            by += Math.sin(angle + (Math.random() - 0.5) * 1.8) * stepLen * jitter
            segs.push({ x: bx, y: by })
          }

          bolts.push({
            segs,
            life: 0,
            maxLife: 8 + Math.random() * 12, // fast flash
            hue: 30 + Math.random() * 25,
            width: 0.8 + Math.random() * 1.5 + speed * 0.15,
          })
        }
      }

      // Draw & update bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const bolt = bolts[i]
        bolt.life++
        if (bolt.life > bolt.maxLife) { bolts.splice(i, 1); continue }

        const progress = bolt.life / bolt.maxLife
        // Instant flash, then fade
        const alpha = progress < 0.05 ? 1 : Math.pow(1 - progress, 2)

        // Outer electric glow
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${bolt.hue}, 100%, 55%, ${alpha * 0.4})`
        ctx.lineWidth = bolt.width + 4
        ctx.shadowColor = `hsla(${bolt.hue}, 100%, 50%, ${alpha * 0.8})`
        ctx.shadowBlur = 25
        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        bolt.segs.forEach((s, j) => {
          if (j === 0) ctx.moveTo(s.x, s.y)
          else ctx.lineTo(s.x, s.y)
        })
        ctx.stroke()

        // Bright core
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${bolt.hue}, 80%, 80%, ${alpha * 0.9})`
        ctx.lineWidth = bolt.width
        ctx.shadowColor = `hsla(${bolt.hue}, 100%, 65%, ${alpha * 0.5})`
        ctx.shadowBlur = 12
        bolt.segs.forEach((s, j) => {
          if (j === 0) ctx.moveTo(s.x, s.y)
          else ctx.lineTo(s.x, s.y)
        })
        ctx.stroke()

        // White-hot center
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`
        ctx.lineWidth = Math.max(bolt.width * 0.3, 0.5)
        ctx.shadowBlur = 0
        bolt.segs.forEach((s, j) => {
          if (j === 0) ctx.moveTo(s.x, s.y)
          else ctx.lineTo(s.x, s.y)
        })
        ctx.stroke()
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
      {/* Video nativo (GPU decoded) */}
      <video
        src="/video/trail.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Canvas leve: só sparks + glow + mini lightnings */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      />
    </div>
  )
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
        <TrailVideo />
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
