"use client"

import { Navbar } from "@/components/home/navbar"
import { Hero } from "@/components/home/hero"
import { StackMarquee } from "@/components/home/stack-marquee"
import { Features } from "@/components/home/features"
import { Templates } from "@/components/home/templates"
import { OpenSourceCTA } from "@/components/home/cta"
import { Footer } from "@/components/home/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <StackMarquee />
      <Features />
      <Templates />
      <OpenSourceCTA />
      <Footer />
    </div>
  )
}