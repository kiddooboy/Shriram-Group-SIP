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
        // CRED-style ink palette
        cred: {
          black: '#0A0A0B',
          base: '#0E0E10',
          card: '#161618',
          'card-hi': '#1F1F22',
          line: 'rgba(255,255,255,0.08)',
        },
        shriram: {
          // accent — golden yellow
          orange: '#FFC107',
          'orange-dark': '#E0A800',
          'orange-light': '#FFF8E1',
          navy: '#1B3A6B',
          gold: '#FFD54F',
        },
        // Shriram Mutual Fund brand custom color system
        smf: {
          teal: '#0B5C47',
          'teal-dark': '#073D2F',
          'teal-light': '#E8F2EE',
          'teal-mid': '#1D9E75',
          amber: '#B5731B',
          'amber-light': '#FBF0DE',
          ink: '#15201B',
          muted: '#697772',
          line: '#E4E9E6',
          app: '#F7F4EE',
          'bg-cream': '#ECE7DC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Hanken Grotesk', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
        'orange-soft': 'linear-gradient(135deg, rgba(255,193,7,0.18) 0%, rgba(255,213,79,0.06) 100%)',
        'glow-orange': 'radial-gradient(60% 50% at 50% 0%, rgba(255,193,7,0.20) 0%, rgba(255,193,7,0) 100%)',
      },
      boxShadow: {
        'cred': '0 8px 40px rgba(0,0,0,0.55)',
        'orange-glow': '0 8px 36px rgba(255,193,7,0.30)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
