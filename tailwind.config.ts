import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#e11d48', // Rose 600
                    hover: '#be123c',
                },
                secondary: {
                    DEFAULT: '#10b981', // Emerald 500
                    hover: '#059669',
                },
                accent: {
                    DEFAULT: '#f59e0b', // Amber 500
                },
                neutral: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    800: '#1e293b',
                    900: '#0f172a',
                }
            },
        },
    },
    plugins: [],
};
export default config;
