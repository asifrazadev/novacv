import { Inter, Roboto, Outfit, Playfair_Display, Lora, EB_Garamond, JetBrains_Mono } from "next/font/google"

export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const fontRoboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
})

export const fontOutfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const fontPlayfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const fontLora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
})

export const fontEBGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
})

export const fontJetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const fontVariables = `${fontInter.variable} ${fontRoboto.variable} ${fontOutfit.variable} ${fontPlayfair.variable} ${fontLora.variable} ${fontEBGaramond.variable} ${fontJetBrainsMono.variable}`


