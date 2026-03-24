"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Ricardo Mendes",
    location: "Lago Sul, Brasília - DF",
    rating: 5,
    text: "Instalei os painéis há 8 meses e minha conta de luz caiu de R$ 850 para R$ 55. A equipe da Nexara foi impecável e a IA deles calculou exatamente quantos painéis eu precisava.",
    savingsPercent: 94,
  },
  {
    name: "Ana Carolina Silva",
    location: "Águas Claras, Brasília - DF",
    rating: 5,
    text: "O processo foi muito mais simples do que imaginei. A equipe foi super profissional e a instalação levou apenas 2 dias. A tecnologia com IA faz toda diferença!",
    savingsPercent: 89,
  },
  {
    name: "Marcos Eduardo",
    location: "Jardim Botânico, Brasília - DF",
    rating: 5,
    text: "Além da economia na conta de luz, valoriza o imóvel. O design dos painéis é moderno e se integrou perfeitamente com a arquitetura da casa. Atendimento via WhatsApp muito ágil!",
    savingsPercent: 92,
  },
]

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-wider uppercase bg-accent/10 text-accent rounded-full mb-6">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Histórias reais de pessoas que transformaram suas casas com energia solar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="relative p-6 lg:p-8 rounded-2xl bg-card border border-border"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-accent/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 text-pretty">
                {`"${testimonial.text}"`}
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{testimonial.savingsPercent}%</p>
                  <p className="text-xs text-muted-foreground">economia</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
