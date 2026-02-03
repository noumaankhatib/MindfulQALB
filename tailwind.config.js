/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft, Calming, Professional Mental Health Palette
        // WCAG AA+ compliant contrast ratios
        primary: {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#b8ddcb',
          300: '#8bc4a8',
          400: '#5fa382', // Main primary - soft sage green
          500: '#4a8a6b',
          600: '#3d7157',
          700: '#345a48',
          800: '#2d4a3c',
          900: '#273e33',
          950: '#13211a',
        },
        secondary: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd', // Soft blue-gray
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#141619',
        },
        accent: {
          50: '#faf7f4',
          100: '#f5ede5',
          200: '#e8d9cc',
          300: '#d9c0a8',
          400: '#c7a382', // Warm beige
          500: '#b88a66',
          600: '#a67552',
          700: '#8a6044',
          800: '#714f3a',
          900: '#5d4130',
          950: '#302116',
        },
        // Soft pastel additions for calming aesthetic
        sage: {
          50: '#f6f9f7',
          100: '#e8f0eb',
          200: '#d1e1d7',
          300: '#a8c7b5',
          400: '#7aab8e',
          500: '#5a9070',
          600: '#47755a',
          700: '#3a5f4a',
          800: '#314d3d',
          900: '#2a4034',
          950: '#15231c',
        },
        // LavHealthy-aligned lavender palette - Enriched for better visibility
        // Slightly less saturated, warmer tones for calm therapeutic feel
        lavender: {
          50: '#FAF8FF',   // Very light lavender background
          100: '#F5F3FF',  // Light lavender (dropdown bg hover)
          200: '#EDE9FE',  // Soft lavender
          300: '#DDD6FE',  // Medium light
          400: '#C4B5FD',  // Medium lavender
          500: '#9F7AEA',  // Primary lavender (slightly warmer)
          600: '#8B5CF6',  // Deeper lavender (CTA gradient)
          700: '#7C3AED',  // Strong lavender (PRIMARY for CTAs)
          800: '#6D28D9',  // Dark lavender
          900: '#5B21B6',  // Very dark
          950: '#4C1D95',  // Deepest
        },
        // Semantic color tokens for LavHealthy theme
        lav: {
          bg: '#FAF8FF',
          surface: '#FFFFFF',
          text: '#1F2937',
          muted: '#6B7280',
          hover: '#F5F3FF',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf3e7',
          300: '#f5e8d4',
          400: '#edd6b8',
          500: '#e3c19a',
          600: '#d4a674',
          700: '#c08c55',
          800: '#a07346',
          900: '#835f3c',
          950: '#46311e',
        },
        // Neutral grays for text and backgrounds
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Dark mode colors - softer, less harsh
        dark: {
          deep: '#0f1419', // Softer dark blue-gray instead of pure black
          black: '#1a2026',
          gray: '#2d3439',
          'gray-light': '#3d454a',
        },
      },
      fontFamily: {
        // Professional, readable typography
        display: ['Georgia', 'Times New Roman', 'serif'], // Classic serif for headings
        body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // Clean sans-serif
        accent: ['Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        // Improved readability with better line heights
        'display-2xl': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'display-md': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        // Subtle, calming animations
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'gentle-float': 'gentleFloat 8s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'soft-pulse': 'softPulse 3s ease-in-out infinite',
        'float-slow': 'floatSlow 12s ease-in-out infinite',
        'float-medium': 'floatMedium 10s ease-in-out infinite',
        'float-fast': 'floatFast 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, -15px) rotate(2deg)' },
          '50%': { transform: 'translate(5px, -25px) rotate(0deg)' },
          '75%': { transform: 'translate(-5px, -10px) rotate(-2deg)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(-15px, -20px) rotate(-3deg)' },
          '66%': { transform: 'translate(10px, -15px) rotate(3deg)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-10px, -20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'gentle': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
        'glow-primary': '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-accent': '0 0 20px rgba(167, 139, 250, 0.25)',
        'glow-lavender': '0 0 24px rgba(124, 58, 237, 0.35)',
        'glow-lavender-soft': '0 4px 14px rgba(139, 92, 246, 0.15)',
        'dropdown': '0 10px 40px rgba(139, 92, 246, 0.1), 0 2px 10px rgba(0, 0, 0, 0.05)',
        'cta-lavender': '0 4px 14px rgba(139, 92, 246, 0.25)',
        'cta-lavender-hover': '0 6px 20px rgba(139, 92, 246, 0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-soft': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#8B5CF6", // Lavender purple
          "secondary": "#adb5bd", // Soft blue-gray
          "accent": "#A78BFA", // Light lavender
          "neutral": "#2d3439",
          "base-100": "#0f1419",
          "base-200": "#1a2026",
          "base-300": "#2d3439",
          "info": "#8B5CF6",
          "success": "#7C3AED",
          "warning": "#c7a382",
          "error": "#c49595",
        },
        light: {
          "primary": "#7C3AED", // Strong lavender for better contrast
          "secondary": "#868e96",
          "accent": "#A78BFA",
          "neutral": "#f5f5f5",
          "base-100": "#ffffff",
          "base-200": "#FAF8FF", // Light lavender tint
          "base-300": "#F5F3FF",
          "info": "#8B5CF6",
          "success": "#7C3AED",
          "warning": "#a67552",
          "error": "#c49595",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    darkTheme: "dark",
    lightTheme: "light",
  },
}
