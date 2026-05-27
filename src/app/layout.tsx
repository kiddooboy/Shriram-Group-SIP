import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shriram Group SIP — Employee Benefit Plan',
  description: 'AI-powered SIP plan for Shriram Group employees. Invest in Shriram AMC funds with a plan personalised to your life stage.',
}

export const viewport: Viewport = {
  themeColor: '#1B3A6B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <div className="max-w-md mx-auto min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}
