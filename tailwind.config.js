/** @type {import('tailwindcss').Config} */
// Tailwind is included for future shadcn/ui components. The existing template
// uses inline styles + CSS vars (tokens.css), which continues to work.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-raised": "var(--bg-raised)",
        "bg-muted": "var(--bg-muted)",
        "bg-inset": "var(--bg-inset)",
        fg: "var(--fg)",
        "fg-1": "var(--fg-1)",
        "fg-2": "var(--fg-2)",
        "fg-3": "var(--fg-3)",
        "fg-4": "var(--fg-4)",
        border: "var(--border)",
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: "var(--f-sans)",
        mono: "var(--f-mono)",
        serif: "var(--f-serif)",
      },
    },
  },
  plugins: [],
};
