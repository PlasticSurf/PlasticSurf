/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontSize: {
        'xs': '1rem', // 16px (war 12px)
        'sm': '1.125rem', // 18px (war 14px)
        'base': '1.25rem', // 20px (war 16px)
        'lg': '1.375rem', // 22px (war 18px)
        'xl': '1.5rem', // 24px (war 20px)
        '2xl': '1.75rem', // 28px (war 24px)
        '3xl': '2.125rem', // 34px (war 30px)
        '4xl': '2.5rem', // 40px (war 36px)
        '5xl': '3.25rem', // 52px (war 48px)
        '6xl': '4rem', // 64px (war 60px)
        '7xl': '4.75rem', // 76px (war 72px)
      },
      colors: {
        background: '#080D19',
        primary: '#FF4E56',
        text: '#E0D8D2',
        blog: '#FFFFFF',
        subline: '#927350',
      },
      fontFamily: {
        // Primary Font - Montserrat Alternates (für Überschriften)
        primary: ['Montserrat Alternates', 'sans-serif'],
        // Secondary Font - Playfair Display (für Akzente)
        secondary: ['Playfair Display', 'serif'],
        // Heading Font - Montserrat Alternates
        heading: ['Montserrat Alternates', 'sans-serif'],
        // Display Font - Playfair Display
        display: ['Playfair Display', 'serif'],
        // Body Font - Roboto
        body: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        // Body Text Font (alternative Klasse)
        bodyText: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};