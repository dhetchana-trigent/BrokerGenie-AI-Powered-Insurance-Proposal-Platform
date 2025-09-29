import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Manrope } from "next/font/google"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "BrokerGenie - Insurance Quote Management",
  description: "Personalized coverage packages and ready-to-send proposals",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-geist: ${GeistSans.variable};
  --font-manrope: ${manrope.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.variable} ${manrope.variable} ${GeistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
