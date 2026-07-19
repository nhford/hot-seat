/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      screens: {
        // Compact 3-col expanded resume (full details return at 2xl / 1536px)
        expand: "1440px",
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(3rem, 1fr))', // Adjust `3rem` if needed
      },
    },
  },
  plugins: []
}
