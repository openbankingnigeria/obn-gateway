import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'ssm': '357px',
      'mx': '420px',
      'mxx': '460px',
      'mid': '530px',
      'mids': '590px',
      'sm': '640px',
      'md': '768px',
      'ms': '900px',
      'lg': '1024px',
      'lgg': '1164px',
      'xl': '1280px',
      'wide': '1440px',
      '2xl': '1536px',
      'widest': '1550px',
    },
    extend: {
      colors: {
        'o-black': '#000000',
        'o-white': '#FFFFFF',
        'o-alt-white': '#FFFFFFB2',
        'o-red': '#D01B3F',
        'o-border': '#F1F2F4',

        'o-dark-green': '#4BA07A',
        'o-green': '#9FF5B4',
        'o-green2': '#41AA57',
        'o-green3': '#63B690',

        'o-dark-blue': '#23396C',
        'o-blue': '#274079',
        'o-light-blue': '#5277C7',
        'o-lightest-blue': '#F3F6FB',

        'o-text-darkest': '#1C2B36',
        'o-text-dark': '#2B2E36',
        'o-text-dark2': '#0D0D12',
        'o-text-dark3': '#36394A',
        
        'o-text-muted': '#818898',
        'o-text-muted2': '#999FAD',
        'o-text-disabled': '#A4ACB9',
        
        'o-text-medium': '#475467',
        'o-text-medium2': '#545A69',
        'o-text-medium3': '#666D80',

        'o-bg': '#FCFBFD',
        'o-bg2': '#F6F8FA',
        'o-bg-dark': '#182749',
        'o-bg-disabled': '#F8FAFB',
        
        'o-status-green': '#459572',
        'o-status-yellow': '#F6C344',
        'o-status-gray': '#6E757C',
        'o-status-red': '#CB444A',
        'o-status-blue': '#3579F6',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        f48: ['48px', '56px'],
        f36: ['32px', '40px'],
        f28: ['28px', '35px'],
        f24: ['24px', '30px'],
        f22: ['22px', '32px'],
        f20: ['20px', '28px'],
        f18: ['18px', '28px'],
        f16: ['16px', '24px'],
        f15: ['15px', '22px'],
        f14: ['14px', '20px'],
        f13: ['13px', '20px'],
        f12: ['12px', '20px']
      },
    },
  },
  plugins: [],
}

export default config