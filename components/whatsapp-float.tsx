"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

export function WhatsAppFloat() {
  const whatsappUrl = "https://wa.me/5561994227754?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20painéis%20solares%20Nexara%20Energy."

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-lg shadow-green-500/30 transition-colors group"
      initial={{ opacity: 0, scale: 0, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Fale conosco pelo WhatsApp"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 10, 0],
        }}
        transition={{ 
          duration: 0.5, 
          repeat: Infinity, 
          repeatDelay: 3,
        }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.div>
      <span className="font-medium hidden sm:inline">Fale Conosco</span>
      
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.a>
  )
}
