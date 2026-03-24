"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowDown, MessageCircle } from "lucide-react"

/* ══════════════════════════════════════════════════════
   EnergyCableCanvas — Múltiplos cabos de energia com
   raios massivos, explosões no mouse, ondas de choque,
   partículas e pulsos dramáticos.
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

    let w = 0, h = 0, dpr = 1

    const resize = () => {
      const r = container.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width; h = r.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + "px"; canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // ── Mouse ──
    let mx = -9999, my = -9999, active = false
    let smoothX = -9999, smoothY = -9999
    let prevX = -9999, prevY = -9999
    let speed = 0
    let clicked = false

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect()
      mx = e.clientX - r.left; my = e.clientY - r.top; active = true
    }
    const onLeave = () => { active = false }
    const onTouch = (e: TouchEvent) => {
      const r = container.getBoundingClientRect()
      const t = e.touches[0]
      if (t) { mx = t.clientX - r.left; my = t.clientY - r.top; active = true }
    }
    const onClick = (e: MouseEvent) => {
      const r = container.getBoundingClientRect()
      mx = e.clientX - r.left; my = e.clientY - r.top
      clicked = true; active = true
    }

    container.addEventListener("mousemove", onMove)
    container.addEventListener("mouseleave", onLeave)
    container.addEventListener("touchmove", onTouch, { passive: true })
    container.addEventListener("touchend", onLeave)
    container.addEventListener("click", onClick)
    container.addEventListener("touchstart", (e) => {
      const r = container.getBoundingClientRect()
      const t = e.touches[0]
      if (t) { mx = t.clientX - r.left; my = t.clientY - r.top; clicked = true; active = true }
    }, { passive: true })

    // ── Multiple cable paths ──
    function getCable(time: number, offsetY: number, ampScale: number, phaseOffset: number) {
      const pts: { x: number; y: number }[] = []
      const segs = 150
      for (let i = 0; i <= segs; i++) {
        const t = i / segs
        const x = (t - 0.05) * w * 1.1
        const base = h * offsetY
        const w1 = Math.sin(t * Math.PI * 3 + time * 0.5 + phaseOffset) * h * 0.08 * ampScale
        const w2 = Math.sin(t * Math.PI * 1.5 - time * 0.3 + phaseOffset * 2) * h * 0.04 * ampScale
        const w3 = Math.sin(t * Math.PI * 5 + time * 1.2 + phaseOffset) * h * 0.01 * ampScale
        // Mouse magnetic pull
        let pull = 0
        if (active) {
          const dx = x - smoothX, dy = base + w1 + w2 - smoothY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 250) pull = (1 - dist / 250) * 40 * (dy > 0 ? -1 : 1)
        }
        pts.push({ x, y: base + w1 + w2 + w3 + pull })
      }
      return pts
    }

    // Cable configs: [yOffset, amplitude, phaseOffset, hue, alpha]
    const cableConfigs = [
      { y: 0.35, amp: 1.2, phase: 0, hue: 35, alpha: 0.6 },
      { y: 0.5, amp: 1.0, phase: 2, hue: 30, alpha: 1.0 },   // main cable
      { y: 0.65, amp: 0.8, phase: 4, hue: 40, alpha: 0.5 },
    ]

    // ── Types ──
    interface Pulse { pos: number; speed: number; intensity: number; width: number; hue: number; cableIdx: number }
    interface Bolt { segs: { x: number; y: number }[]; life: number; maxLife: number; hue: number; width: number }
    interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number }
    interface Shockwave { x: number; y: number; radius: number; maxRadius: number; life: number; maxLife: number }

    const pulses: Pulse[] = []
    const bolts: Bolt[] = []
    const particles: Particle[] = []
    const shockwaves: Shockwave[] = []
    let lastPulse = 0, lastBolt = 0, lastMouseBolt = 0

    function spawnBoltFromCable(cable: { x: number; y: number }[], hue: number, size: number) {
      const t = 0.05 + Math.random() * 0.9
      const idx = Math.floor(t * (cable.length - 1))
      const o = cable[idx]
      if (!o) return
      const dir = Math.random() > 0.5 ? -1 : 1
      const angle = dir * (Math.PI / 5 + Math.random() * Math.PI / 2.5)
      const segCount = 6 + Math.floor(Math.random() * 10 * size)
      const segs: { x: number; y: number }[] = [{ x: o.x, y: o.y }]
      let bx = o.x, by = o.y
      const step = 12 + Math.random() * 30 * size
      for (let s = 0; s < segCount; s++) {
        bx += Math.cos(angle + (Math.random() - 0.5) * 1.5) * step * (0.4 + Math.random())
        by += Math.sin(angle + (Math.random() - 0.5) * 1.5) * step * (0.4 + Math.random())
        segs.push({ x: bx, y: by })
        // Branch at random points
        if (Math.random() < 0.15 && size > 0.5) {
          const branchSegs: { x: number; y: number }[] = [{ x: bx, y: by }]
          let bx2 = bx, by2 = by
          const branchAngle = angle + (Math.random() - 0.5) * 2
          for (let sb = 0; sb < 3 + Math.floor(Math.random() * 4); sb++) {
            bx2 += Math.cos(branchAngle + (Math.random() - 0.5) * 1.2) * step * 0.6
            by2 += Math.sin(branchAngle + (Math.random() - 0.5) * 1.2) * step * 0.6
            branchSegs.push({ x: bx2, y: by2 })
          }
          bolts.push({ segs: branchSegs, life: 0, maxLife: 4 + Math.random() * 6, hue, width: 0.3 + Math.random() * 0.6 })
        }
      }
      bolts.push({ segs, life: 0, maxLife: 8 + Math.random() * 14, hue, width: 0.8 + Math.random() * 2 * size })
    }

    function spawnExplosion(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const spd = 2 + Math.random() * 8
        particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0, maxLife: 30 + Math.random() * 40,
          size: 1 + Math.random() * 3,
          hue: 25 + Math.random() * 25,
        })
      }
      shockwaves.push({ x, y, radius: 0, maxRadius: 150 + Math.random() * 100, life: 0, maxLife: 25 })
    }

    function spawnBoltBetween(x1: number, y1: number, x2: number, y2: number, hue: number, widthMul: number) {
      const segs: { x: number; y: number }[] = [{ x: x1, y: y1 }]
      const segCount = 8 + Math.floor(Math.random() * 10)
      for (let s = 1; s <= segCount; s++) {
        const t = s / segCount
        const jit = (1 - Math.abs(t - 0.5) * 2) * 50  // more jitter in middle
        segs.push({
          x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * jit,
          y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * jit,
        })
      }
      bolts.push({ segs, life: 0, maxLife: 6 + Math.random() * 12, hue, width: (0.8 + Math.random() * 2) * widthMul })
    }

    function drawBolt(segs: { x: number; y: number }[], hue: number, alpha: number, width: number) {
      if (alpha < 0.01) return
      // Outer glow
      ctx.beginPath()
      segs.forEach((s, j) => j === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y))
      ctx.strokeStyle = `hsla(${hue}, 100%, 55%, ${alpha * 0.35})`
      ctx.lineWidth = width + 6
      ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${alpha * 0.7})`
      ctx.shadowBlur = 35
      ctx.lineJoin = "round"; ctx.lineCap = "round"
      ctx.stroke()

      // Core
      ctx.beginPath()
      segs.forEach((s, j) => j === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y))
      ctx.strokeStyle = `hsla(${hue}, 85%, 78%, ${alpha * 0.9})`
      ctx.lineWidth = width + 1
      ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${alpha * 0.5})`
      ctx.shadowBlur = 15
      ctx.stroke()

      // White-hot center
      ctx.beginPath()
      segs.forEach((s, j) => j === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y))
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.7})`
      ctx.lineWidth = Math.max(width * 0.4, 0.5)
      ctx.shadowBlur = 0
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    function drawCablePath(cable: { x: number; y: number }[], hue: number, alpha: number) {
      // Wide ambient glow
      ctx.save()
      ctx.beginPath()
      cable.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.03 * alpha})`
      ctx.lineWidth = 100
      ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${0.06 * alpha})`
      ctx.shadowBlur = 80
      ctx.stroke()
      ctx.restore()

      // Cable body
      ctx.beginPath()
      cable.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.strokeStyle = `rgba(50, 50, 50, ${0.8 * alpha})`
      ctx.lineWidth = 3.5
      ctx.lineJoin = "round"; ctx.lineCap = "round"
      ctx.shadowBlur = 0
      ctx.stroke()

      // Edge glow
      ctx.beginPath()
      cable.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.strokeStyle = `hsla(${hue}, 100%, 55%, ${0.18 * alpha})`
      ctx.lineWidth = 6
      ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${0.4 * alpha})`
      ctx.shadowBlur = 20
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    let raf = 0
    const t0 = performance.now()

    const animate = () => {
      const now = performance.now()
      const elapsed = (now - t0) / 1000
      ctx.clearRect(0, 0, w, h)

      // ── Subtle background gradient ──
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7)
      bgGrad.addColorStop(0, "rgba(30, 15, 0, 0.15)")
      bgGrad.addColorStop(1, "transparent")
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // Mouse smoothing
      smoothX += (mx - smoothX) * 0.15
      smoothY += (my - smoothY) * 0.15
      const ddx = smoothX - prevX, ddy = smoothY - prevY
      speed = Math.sqrt(ddx * ddx + ddy * ddy)
      prevX = smoothX; prevY = smoothY

      // Get all cables
      const cables = cableConfigs.map(c => getCable(elapsed, c.y, c.amp, c.phase))

      // ── Draw cables ──
      cableConfigs.forEach((c, ci) => drawCablePath(cables[ci], c.hue, c.alpha))

      // ── Spawn pulses ──
      if (now - lastPulse > 200) {
        lastPulse = now
        const ci = Math.floor(Math.random() * cables.length)
        pulses.push({
          pos: -0.05, speed: 0.2 + Math.random() * 0.35,
          intensity: 0.5 + Math.random() * 0.5,
          width: 0.04 + Math.random() * 0.06,
          hue: cableConfigs[ci].hue + Math.random() * 15 - 7,
          cableIdx: ci,
        })
      }

      // ── Draw pulses ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.pos += p.speed * 0.016
        if (p.pos > 1.1) { pulses.splice(i, 1); continue }
        const cable = cables[p.cableIdx]
        if (!cable) continue
        const idx = Math.max(0, Math.min(Math.floor(p.pos * (cable.length - 1)), cable.length - 1))
        const pt = cable[idx]
        const fade = p.pos < 0.1 ? p.pos / 0.1 : p.pos > 0.9 ? (1 - p.pos) / 0.1 : 1
        const a = p.intensity * fade * cableConfigs[p.cableIdx].alpha

        // Big radial glow
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 90)
        g.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${a * 0.4})`)
        g.addColorStop(0.3, `hsla(${p.hue}, 100%, 50%, ${a * 0.15})`)
        g.addColorStop(1, "transparent")
        ctx.fillStyle = g
        ctx.fillRect(pt.x - 90, pt.y - 90, 180, 180)

        // Bright core segment
        const s0 = Math.max(0, Math.floor((p.pos - p.width) * (cable.length - 1)))
        const s1 = Math.min(cable.length - 1, Math.floor((p.pos + p.width) * (cable.length - 1)))
        if (s1 > s0) {
          ctx.beginPath()
          for (let s = s0; s <= s1; s++) s === s0 ? ctx.moveTo(cable[s].x, cable[s].y) : ctx.lineTo(cable[s].x, cable[s].y)
          ctx.strokeStyle = `hsla(${p.hue}, 100%, 72%, ${a * 0.85})`
          ctx.lineWidth = 8
          ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${a})`
          ctx.shadowBlur = 30
          ctx.stroke()

          ctx.beginPath()
          for (let s = s0; s <= s1; s++) s === s0 ? ctx.moveTo(cable[s].x, cable[s].y) : ctx.lineTo(cable[s].x, cable[s].y)
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.95})`
          ctx.lineWidth = 2.5
          ctx.shadowBlur = 10
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      // ── Auto lightning from cables ──
      if (now - lastBolt > 300 + Math.random() * 400) {
        lastBolt = now
        const ci = Math.floor(Math.random() * cables.length)
        spawnBoltFromCable(cables[ci], cableConfigs[ci].hue, 0.8 + Math.random() * 0.7)

        // Occasionally bolt between two cables
        if (Math.random() < 0.3 && cables.length > 1) {
          const ci2 = (ci + 1) % cables.length
          const t = 0.1 + Math.random() * 0.8
          const idx1 = Math.floor(t * (cables[ci].length - 1))
          const idx2 = Math.floor(t * (cables[ci2].length - 1))
          const p1 = cables[ci][idx1], p2 = cables[ci2][idx2]
          if (p1 && p2) spawnBoltBetween(p1.x, p1.y, p2.x, p2.y, 35, 1.2)
        }
      }

      // ── Mouse interaction ──
      if (active && speed > 2 && now - lastMouseBolt > 50) {
        lastMouseBolt = now

        // Find nearest point on any cable
        let nearDist = Infinity, nearPt = { x: 0, y: 0 }, nearCi = 0
        cables.forEach((cable, ci) => {
          cable.forEach(p => {
            const d = Math.hypot(p.x - smoothX, p.y - smoothY)
            if (d < nearDist) { nearDist = d; nearPt = p; nearCi = ci }
          })
        })

        const count = Math.min(Math.ceil(speed / 5), 5)
        for (let b = 0; b < count; b++) {
          if (nearDist < 350) {
            // Bolt from cable to mouse
            spawnBoltBetween(nearPt.x, nearPt.y, smoothX + (Math.random() - 0.5) * 20, smoothY + (Math.random() - 0.5) * 20, cableConfigs[nearCi].hue, 1 + speed * 0.03)
          }
          // Radial bolts from cursor
          if (speed > 8) {
            const angle = Math.random() * Math.PI * 2
            const len = 40 + Math.random() * 80 + speed * 3
            const segs: { x: number; y: number }[] = [{ x: smoothX, y: smoothY }]
            let bx = smoothX, by = smoothY
            const segCount = 5 + Math.floor(Math.random() * 6)
            for (let s = 0; s < segCount; s++) {
              bx += Math.cos(angle + (Math.random() - 0.5) * 1) * (len / segCount)
              by += Math.sin(angle + (Math.random() - 0.5) * 1) * (len / segCount)
              segs.push({ x: bx, y: by })
            }
            bolts.push({ segs, life: 0, maxLife: 5 + Math.random() * 8, hue: 30 + Math.random() * 20, width: 0.5 + Math.random() * 1.5 })
          }
        }

        // Spawn trail particles
        if (speed > 4) {
          for (let i = 0; i < Math.min(Math.ceil(speed / 3), 8); i++) {
            particles.push({
              x: smoothX + (Math.random() - 0.5) * 10,
              y: smoothY + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 0, maxLife: 20 + Math.random() * 30,
              size: 0.5 + Math.random() * 2.5,
              hue: 25 + Math.random() * 25,
            })
          }
        }
      }

      // ── Click / tap explosion ──
      if (clicked) {
        clicked = false
        spawnExplosion(mx, my, 60)
        // Massive bolts on click
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3
          const len = 100 + Math.random() * 150
          const segs: { x: number; y: number }[] = [{ x: mx, y: my }]
          let bx = mx, by = my
          for (let s = 0; s < 8 + Math.floor(Math.random() * 6); s++) {
            bx += Math.cos(angle + (Math.random() - 0.5) * 0.8) * (len / 8)
            by += Math.sin(angle + (Math.random() - 0.5) * 0.8) * (len / 8)
            segs.push({ x: bx, y: by })
          }
          bolts.push({ segs, life: 0, maxLife: 12 + Math.random() * 10, hue: 25 + Math.random() * 25, width: 1 + Math.random() * 2.5 })
        }
        // Bolt to each cable
        cables.forEach((cable, ci) => {
          let nd = Infinity, np = cable[0]
          cable.forEach(p => { const d = Math.hypot(p.x - mx, p.y - my); if (d < nd) { nd = d; np = p } })
          spawnBoltBetween(mx, my, np.x, np.y, cableConfigs[ci].hue, 1.8)
        })
        // Mouse glow flash
        const flash = ctx.createRadialGradient(mx, my, 0, mx, my, 200)
        flash.addColorStop(0, "rgba(245, 180, 50, 0.5)")
        flash.addColorStop(0.5, "rgba(245, 140, 20, 0.15)")
        flash.addColorStop(1, "transparent")
        ctx.fillStyle = flash
        ctx.fillRect(mx - 200, my - 200, 400, 400)
      }

      // ── Draw & update bolts ──
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]
        b.life++
        if (b.life > b.maxLife) { bolts.splice(i, 1); continue }
        const prog = b.life / b.maxLife
        const alpha = prog < 0.05 ? 1 : Math.pow(1 - prog, 2.2)
        drawBolt(b.segs, b.hue, alpha, b.width)
      }

      // ── Draw & update particles ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        if (p.life > p.maxLife) { particles.splice(i, 1); continue }
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.96; p.vy *= 0.96
        const prog = p.life / p.maxLife
        const alpha = prog < 0.1 ? prog / 0.1 : Math.pow(1 - prog, 1.5)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 - prog * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha * 0.8})`
        ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${alpha})`
        ctx.shadowBlur = 10
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // ── Shockwaves ──
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const s = shockwaves[i]
        s.life++
        if (s.life > s.maxLife) { shockwaves.splice(i, 1); continue }
        const prog = s.life / s.maxLife
        s.radius = s.maxRadius * prog
        const alpha = (1 - prog) * 0.5
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(35, 100%, 60%, ${alpha})`
        ctx.lineWidth = 2 * (1 - prog)
        ctx.shadowColor = `hsla(35, 100%, 55%, ${alpha * 0.8})`
        ctx.shadowBlur = 15
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      // ── Floating ambient particles along cables ──
      const ambientCount = 50
      for (let i = 0; i < ambientCount; i++) {
        const ci = i % cables.length
        const cable = cables[ci]
        const t = (i / ambientCount + elapsed * 0.03 + ci * 0.33) % 1
        const idx = Math.floor(t * (cable.length - 1))
        const p = cable[Math.max(0, Math.min(idx, cable.length - 1))]
        if (!p) continue
        const ox = Math.sin(elapsed * 2.5 + i * 5.7) * 40
        const oy = Math.cos(elapsed * 1.8 + i * 3.3) * 25
        const pa = (0.12 + Math.sin(elapsed * 4 + i * 1.7) * 0.08) * cableConfigs[ci].alpha
        ctx.beginPath()
        ctx.arc(p.x + ox, p.y + oy, 1.2 + Math.sin(elapsed + i) * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${cableConfigs[ci].hue}, 100%, 65%, ${pa})`
        ctx.shadowColor = `hsla(${cableConfigs[ci].hue}, 100%, 60%, ${pa * 2})`
        ctx.shadowBlur = 8
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // ── Mouse cursor glow ──
      if (active) {
        const intensity = Math.min(speed / 20, 1) * 0.3 + 0.05
        const g = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 120)
        g.addColorStop(0, `rgba(245, 170, 30, ${intensity})`)
        g.addColorStop(0.4, `rgba(245, 140, 20, ${intensity * 0.3})`)
        g.addColorStop(1, "transparent")
        ctx.fillStyle = g
        ctx.fillRect(smoothX - 120, smoothY - 120, 240, 240)
      }

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
      container.removeEventListener("click", onClick)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
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
