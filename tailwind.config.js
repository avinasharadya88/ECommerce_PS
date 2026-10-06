/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'oklch(0.145 0.018 265 / <alpha-value>)',
        surface: 'oklch(0.185 0.02 265 / <alpha-value>)',
        'surface-raised': 'oklch(0.225 0.022 265 / <alpha-value>)',
        'surface-sunken': 'oklch(0.125 0.016 265 / <alpha-value>)',
        border: 'oklch(0.3 0.02 265 / 0.7)',
        'border-strong': 'oklch(0.42 0.03 265)',
        foreground: 'oklch(0.97 0.005 265 / <alpha-value>)',
        muted: 'oklch(0.7 0.02 265 / <alpha-value>)',
        subtle: 'oklch(0.55 0.02 265 / <alpha-value>)',
        primary: 'oklch(0.68 0.19 278 / <alpha-value>)',
        'primary-strong': 'oklch(0.6 0.22 285 / <alpha-value>)',
        'primary-foreground': 'oklch(0.99 0 0)',
        accent: 'oklch(0.8 0.14 195 / <alpha-value>)',
        success: 'oklch(0.77 0.16 158 / <alpha-value>)',
        warning: 'oklch(0.82 0.15 78 / <alpha-value>)',
        danger: 'oklch(0.68 0.2 18 / <alpha-value>)',
        amazon: 'oklch(0.78 0.16 68 / <alpha-value>)',
        flipkart: 'oklch(0.66 0.17 255 / <alpha-value>)',
        shopify: 'oklch(0.74 0.16 150 / <alpha-value>)',
      },
      boxShadow: {
        card: '0 1px 0 0 oklch(1 0 0 / 0.04) inset, 0 12px 32px -16px oklch(0 0 0 / 0.6)',
        glow: '0 0 0 1px oklch(0.68 0.19 278 / 0.35), 0 16px 48px -12px oklch(0.6 0.22 285 / 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(32px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'slide-in': 'slide-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}
