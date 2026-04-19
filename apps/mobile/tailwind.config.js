/**
 * NativeWind config — Tempo Flow design tokens for mobile.
 * @source docs/design/claude-export/design-system/tokens.css
 */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#131312',
        cream: '#F3EBE2',
        'cream-raised': '#FAF6F0',
        'cream-deep': '#EBE0D2',
        'tempo-orange': '#D97757',
        'soft-orange': '#E8A87C',
        'dust-grey': '#6B6864',
        'dust-grey-soft': '#9A968F',
        line: '#D7CEC2',
        'line-soft': '#E6DDD1',
        moss: '#4A7C59',
        brick: '#C8553D',
        amber: '#D4A44C',
        'slate-blue': '#6E88A7',

        // Semantic aliases (match web CSS vars)
        background: '#F3EBE2',
        foreground: '#131312',
        card: '#FAF6F0',
        'card-foreground': '#131312',
        border: '#D7CEC2',
        'border-soft': '#E6DDD1',
        primary: '#D97757',
        'primary-foreground': '#FAFAF9',
        muted: '#EBE0D2',
        'muted-foreground': '#6B6864',
        accent: '#E8A87C',
        destructive: '#C8553D',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        dyslexia: ['OpenDyslexic', 'Newsreader', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
