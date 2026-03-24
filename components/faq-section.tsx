"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Quanto custa instalar painéis solares?",
    answer: "O custo varia de acordo com o tamanho do sistema e o consumo da sua residência. Em média, um sistema residencial completo pode custar entre R$ 15.000 e R$ 50.000. Oferecemos financiamento facilitado com parcelas que geralmente são menores que a economia na conta de luz.",
  },
  {
    question: "Qual a economia real na conta de energia?",
    answer: "Nossos clientes economizam em média 85% a 95% na conta de luz. A economia exata depende do tamanho do sistema instalado, da orientação do telhado e do consumo da residência. Em muitos casos, a conta de luz fica apenas com a taxa mínima da concessionária.",
  },
  {
    question: "Os painéis funcionam em dias nublados?",
    answer: "Sim! Embora a produção seja reduzida em dias nublados ou chuvosos (cerca de 10-25% da capacidade normal), os painéis continuam gerando energia. O sistema é dimensionado considerando a média anual de radiação solar da sua região.",
  },
  {
    question: "Qual a vida útil dos painéis solares?",
    answer: "Nossos painéis têm vida útil superior a 30 anos. Oferecemos garantia de 25 anos de performance, garantindo que os painéis manterão pelo menos 80% da eficiência original após esse período.",
  },
  {
    question: "Preciso de bateria para armazenar energia?",
    answer: "Não necessariamente. A maioria dos sistemas utiliza o modelo de compensação de energia com a rede elétrica. A energia excedente gerada durante o dia é enviada para a rede e você recebe créditos para usar à noite. Porém, oferecemos sistemas com bateria para quem deseja total independência energética.",
  },
  {
    question: "Quanto tempo leva a instalação?",
    answer: "A instalação residencial típica é concluída em 1 a 3 dias. O processo completo, desde a avaliação inicial até a ativação do sistema, leva em média 30 a 45 dias, incluindo a aprovação da concessionária de energia.",
  },
]

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-wider uppercase bg-accent/10 text-accent rounded-full mb-6">
            Dúvidas Frequentes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
            Perguntas mais comuns
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Tire suas dúvidas sobre energia solar residencial.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-6 data-[state=open]:border-accent/50 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-medium pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
