"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, CheckCircle, MessageCircle, Zap, Shield, Clock } from "lucide-react"

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
    <section id="contato" className="py-24 lg:py-32 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-medium tracking-wider uppercase bg-green-500/20 text-green-400 rounded-full border border-green-500/30"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Atendimento em Brasília
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance text-white"
          >
            Pronto para começar a{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              economizar
            </span>
            ?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-slate-300 mb-10 text-pretty max-w-2xl mx-auto"
          >
            Fale diretamente com nossa equipe pelo WhatsApp e receba uma avaliação 
            personalizada para sua residência em Brasília. Nossa IA calcula a economia ideal para você.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-7 text-lg group shadow-lg shadow-green-500/25"
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                Solicitar Orçamento pelo WhatsApp
                <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.a>

            <p className="text-slate-500 text-sm">
              ou ligue: <a href="tel:+5561994227754" className="text-slate-300 hover:text-white transition-colors">(61) 99422-7754</a>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 text-slate-300"
              >
                <div className="p-2 rounded-full bg-amber-500/20">
                  <benefit.icon className="h-5 w-5 text-amber-400" />
                </div>
                <span>{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 pt-12 border-t border-slate-800"
          >
            <p className="text-slate-500 text-sm mb-6">Garantias Nexara Energy</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
              {["25 Anos de Garantia", "Instalação Profissional", "Suporte 24/7", "Certificação INMETRO"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-amber-500" />
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
