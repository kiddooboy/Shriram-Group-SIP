/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Shriram AMC Website Brand ───────────────────────────────────────
        shriram: {
          gold:        '#F5A500',   // primary CTA gold
          'gold-dark': '#D4900A',   // hover gold
          'gold-light':'#FFF8E1',   // gold tint bg
          dark:        '#1C1C1C',   // header / footer
          charcoal:    '#2D2D2D',   // secondary dark
          cream:       '#F5F5F0',   // page background
          'off-white': '#FAFAF8',   // card background
          muted:       '#6B7280',   // body copy
          line:        '#E5E7EB',   // borders
        },
        // ── Legacy SMF palette (kept for fund cards etc.) ───────────────────
        smf: {
          teal:        '#0B5C47',
          'teal-dark': '#073D2F',
          'teal-light':'#E8F2EE',
          'teal-mid':  '#1D9E75',
          amber:       '#B5731B',
          'amber-light':'#FBF0DE',
          ink:         '#15201B',
          muted:       '#697772',
          line:        '#E4E9E6',
          app:         '#F7F4EE',
          'bg-cream':  '#ECE7DC',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'Hanken Grotesk', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Inter', 'sans-serif'],
        body:    ['Hanken Grotesk', 'Inter', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #F5A500 0%, #FFD54F 100%)',
        'dark-gradient':  'linear-gradient(135deg, #1C1C1C 0%, #2D2D2D 100%)',
        'hero-pattern':   "radial-gradient(circle at 1px 1px, rgba(245,165,0,0.06) 1px, transparent 0)",
        'cream-pattern':  "radial-gradient(circle at 1px 1px, rgba(11,92,71,0.04) 1px, transparent 0)",
      },
      boxShadow: {
        'gold':   '0 8px 36px rgba(245,165,0,0.25)',
        'card':   '0 4px 24px rgba(0,0,0,0.07)',
        'card-lg':'0 16px 48px rgba(0,0,0,0.10)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft':'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
