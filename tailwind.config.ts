import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff00',
        'neon-green-dim': '#008000',
        'terminal-green': '#0f0',
        'cyber-black': '#000000',
      },
      fontFamily: {
        'mono': ['"Fira Code"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
        'sans': ['"Fira Code"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'flicker': 'flicker 0.15s infinite linear',
        'typewriter': 'typewriter 2s steps(20) 1s 1 normal both',
        'slide-in-left': 'slide-in-left 0.8s ease-out',
        'slide-in-right': 'slide-in-right 0.8s ease-out',
        'data-stream': 'data-stream 3s linear infinite',
        'terminal-cursor': 'terminal-cursor 1s infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'cyber-glitch': 'cyber-glitch 0.3s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00',
          },
          '50%': {
            opacity: '0.5',
            boxShadow: '0 0 2px #00ff00, 0 0 5px #00ff00, 0 0 8px #00ff00',
          },
        },
        'glow': {
          'from': {
            textShadow: '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00',
          },
          'to': {
            textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
          },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        'typewriter': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'slide-in-left': {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slide-in-right': {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'data-stream': {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '50%': { 
            opacity: '1',
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
        'terminal-cursor': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'neon-pulse': {
          '0%': {
            filter: 'brightness(1) drop-shadow(0 0 5px #00ff00)',
          },
          '50%': {
            filter: 'brightness(1.2) drop-shadow(0 0 20px #00ff00)',
          },
          '100%': {
            filter: 'brightness(1) drop-shadow(0 0 5px #00ff00)',
          },
        },
        'cyber-glitch': {
          '0%': {
            transform: 'translateX(0)',
            filter: 'hue-rotate(0deg)',
          },
          '20%': {
            transform: 'translateX(-2px)',
            filter: 'hue-rotate(90deg)',
          },
          '40%': {
            transform: 'translateX(2px)',
            filter: 'hue-rotate(180deg)',
          },
          '60%': {
            transform: 'translateX(-1px)',
            filter: 'hue-rotate(270deg)',
          },
          '80%': {
            transform: 'translateX(1px)',
            filter: 'hue-rotate(360deg)',
          },
          '100%': {
            transform: 'translateX(0)',
            filter: 'hue-rotate(0deg)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
