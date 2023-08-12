/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'default': "url(https://cdn.discordapp.com/attachments/684205433426280451/1140000628945461308/alex-shuper-KwrPZDvZRPk-unsplash.jpg)"
      }
    },
  },
  plugins: [],
}