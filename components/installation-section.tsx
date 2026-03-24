"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ClipboardCheck, Truck, Wrench, CheckCircle } from "lucide-react"
import Image from "next/image"

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Avaliação com IA",
    description: "Nossa inteligência artificial analisa sua residência em Brasília, consumo de energia e calcula a solução ideal para suas necessidades.",
  },
  {
    number: "02",
    icon: Truck,
    title: "Entrega dos Equipamentos",
    description: "Todos os componentes são entregues diretamente na sua casa em Brasília e região com agendamento prévio.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Instalação Profissional",
    description: "Técnicos certificados realizam a instalação completa em apenas 1-3 dias em toda Brasília e entorno.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Ativação e Monitoramento IA",
    description: "Sistema ativado e conectado ao nosso app com IA para otimização e monitoramento em tempo real da sua geração.",
  },
]

export function InstallationSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="instalacao" className="py-24 lg:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-wider uppercase bg-accent/10 text-accent rounded-full mb-6">
            Processo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
            Instalação simples e rápida
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Da avaliação inicial à ativação do sistema, cuidamos de todo o processo 
            para que você comece a economizar o mais rápido possível.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
          >
            <Image
              src="/images/solar-installation.jpg"
              alt="Instalação de painéis solares"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                className="group relative flex gap-6 p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                    <step.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-accent">{step.number}</span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
