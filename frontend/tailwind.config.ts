import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",        // Fixed: Added /src
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Fixed: Added /src
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",     // Fixed: Added /src
  ],
  theme: {
    extend: {
        // ... (keep your existing colors and borderRadius)
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;