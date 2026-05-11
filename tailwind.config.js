/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#020617',
        foreground: '#E5E7EB',
        secondaryBg: '#0F172A',
        cardBg: '#111827',
        primaryAccent: '#38BDF8',
        secondaryAccent: '#22D3EE',
        aiAccent: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        textPrimary: '#E5E7EB',
        textSecondary: '#94A3B8',
        border: 'rgba(255,255,255,0.08)',
        
        // Shadcn UI colors mapping
        primary: {
          DEFAULT: '#38BDF8',
          foreground: '#020617',
        },
        secondary: {
          DEFAULT: '#0F172A',
          foreground: '#E5E7EB',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#E5E7EB',
        },
        muted: {
          DEFAULT: '#0F172A',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          foreground: '#E5E7EB',
        },
        popover: {
          DEFAULT: '#111827',
          foreground: '#E5E7EB',
        },
        card: {
          DEFAULT: '#111827',
          foreground: '#E5E7EB',
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 1, filter: 'brightness(1)' },
          "50%": { opacity: .8, filter: 'brightness(1.5)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
