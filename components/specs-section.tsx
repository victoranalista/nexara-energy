"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

const specs = [
  { label: "Potência Máxima", value: "420W", unit: "por painel" },
  { label: "Eficiência", value: "22.2%", unit: "conversão" },
  { label: "Garantia", value: "25", unit: "anos" },
  { label: "Degradação", value: "<0.25%", unit: "ao ano" },
  { label: "Dimensões", value: "1879", unit: "x 1045 x 35mm" },
  { label: "Peso", value: "21.8", unit: "kg" },
]

const technicalDetails = [
  { label: "Tipo de Célula", value: "Monocristalino PERC" },
  { label: "Número de Células", value: "144 (6x24)" },
  { label: "Tensão Máxima", value: "40.8V" },
  { label: "Corrente Máxima", value: "10.31A" },
  { label: "Temperatura Operacional", value: "-40°C a +85°C" },
  { label: "Resistência a Granizo", value: "35mm @ 27.8 m/s" },
]

export function SpecsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="especificacoes" className="py-24 lg:py-32 bg-background">
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
            Especificações
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
            Tecnologia de ponta em cada detalhe
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Especificações técnicas que garantem máxima performance e durabilidade.
          </p>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 mb-16"
        >
          {specs.map((spec, index) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card border border-border"
            >
              <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                {spec.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {spec.unit}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{spec.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Specs with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative aspect-square rounded-2xl overflow-hidden"
          >
            <Image
              src="/images/solar-night.jpg"
              alt="Casa com painéis solares ao entardecer"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-lg font-medium">Energia 24 horas</p>
              <p className="text-sm text-muted-foreground">
                Com sistema de bateria integrado, sua casa nunca fica sem energia
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Detalhes Técnicos</h3>
            <div className="space-y-4">
              {technicalDetails.map((detail, index) => (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="flex justify-between items-center py-4 border-b border-border"
                >
                  <span className="text-muted-foreground">{detail.label}</span>
                  <span className="font-medium">{detail.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
