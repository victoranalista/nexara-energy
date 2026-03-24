"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Zap, Shield, Leaf, TrendingUp, Sun, Battery } from "lucide-react"
import Image from "next/image"

const features = [
  {
    icon: Zap,
    title: "Alta Eficiência",
    description: "Células fotovoltaicas de última geração com até 22% de eficiência na conversão de energia.",
  },
  {
    icon: Shield,
    title: "Durabilidade Extrema",
    description: "Construídos para resistir a condições climáticas adversas com garantia de 25 anos.",
  },
  {
    icon: Leaf,
    title: "100% Sustentável",
    description: "Reduza sua pegada de carbono e contribua para um planeta mais verde.",
  },
  {
    icon: TrendingUp,
    title: "Economia Garantida",
    description: "Economia de até 95% na conta de energia com retorno do investimento em 4-6 anos.",
  },
  {
    icon: Sun,
    title: "Design Premium",
    description: "Acabamento preto elegante que se integra perfeitamente à arquitetura da sua casa.",
  },
  {
    icon: Battery,
    title: "Armazenamento",
    description: "Compatible com sistemas de bateria para energia 24 horas, mesmo à noite.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="vantagens" className="py-24 lg:py-32 bg-background">
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
            Vantagens
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
            Por que escolher nossos painéis solares?
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Tecnologia de ponta combinada com design elegante para transformar 
            sua residência em uma fonte de energia limpa e sustentável.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export function ImageShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="paineis" className="py-24 lg:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
        >
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
          >
            <Image
              src="/images/solar-panels-detail.jpg"
              alt="Detalhe dos painéis solares premium"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-wider uppercase bg-accent/10 text-accent rounded-full">
              Design Premium
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              Beleza que gera energia
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Nossos painéis solares são projetados para serem tão bonitos quanto eficientes. 
              O acabamento em preto fosco se integra harmoniosamente a qualquer estilo arquitetônico, 
              valorizando a estética da sua residência enquanto gera energia limpa.
            </p>
            <ul className="space-y-4">
              {[
                "Acabamento preto premium sem moldura visível",
                "Integração perfeita com qualquer tipo de telhado",
                "Resistente a impactos, vento e granizo",
                "Certificação internacional de qualidade",
              ].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
