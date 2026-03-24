"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { CheckCircle, MessageCircle, ChevronRight, Zap, Shield, Clock } from "lucide-react"

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const whatsappUrl = "https://wa.me/5561994227754?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20painéis%20solares."

  const benefits = [
    { icon: Zap, text: "Avaliação gratuita com IA" },
    { icon: Shield, text: "Sem compromisso" },
    { icon: Clock, text: "Resposta imediata" },
  ]

  return (
    <section id="contato" className="relative overflow-hidden bg-background">
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-full border"
              style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", borderColor: "rgba(34,197,94,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Atendimento em Brasília
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#fff",
              marginBottom: "1.5rem",
            }}
          >
            Sua conta de luz pode cair{" "}
            <span style={{ color: "#f59e0b", fontWeight: 400 }}>85%</span>{" "}
            no próximo mês
          </motion.h2>

          {/* Copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.5)",
              maxWidth: "36rem",
              margin: "0 auto 2.5rem",
            }}
          >
            Nossa IA analisa seu consumo e projeta a economia exata. Fale com a equipe pelo WhatsApp — orçamento em minutos, sem compromisso.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="energy-button green"
              style={{ height: "3.8rem", padding: "0 2.5rem", fontSize: "1.05rem" }}
            >
              <span className="energy-bg" />
              <span className="energy-fill" style={{ background: "#22c55e" }} />
              <span className="energy-glow" style={{ background: "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.35) 0, transparent 70%)" }} />
              <span className="energy-label">
                <MessageCircle className="mr-2 h-5 w-5" />
                Solicitar Orçamento
                <ChevronRight className="ml-2 h-4 w-4" />
              </span>
            </motion.a>

            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }}>
              ou ligue:{" "}
              <a href="tel:+5561994227754" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                (61) 99422-7754
              </a>
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-8"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.55 + i * 0.08 }}
                className="flex items-center gap-3"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <div className="p-2 rounded-full" style={{ background: "rgba(245,158,11,0.1)" }}>
                  <benefit.icon className="h-4 w-4" style={{ color: "#f59e0b" }} />
                </div>
                <span className="text-sm">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs mb-5 tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
              Garantias Nexara Energy
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {["25 Anos de Garantia", "Instalação Profissional", "Suporte 24/7", "Certificação INMETRO"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                  <CheckCircle className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
