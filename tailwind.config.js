/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#050509',
                foreground: '#ffffff',
                primary: {
                    DEFAULT: '#2E2BAC', // Electric Blue
                    hover: '#3D3ABD',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#64748b', // Slate 500
                    hover: '#475569',
                    foreground: '#ffffff',
                },
                accent: {
                    cyan: '#06b6d4', // Cyan 500
                    emerald: '#10b981', // Emerald 500
                    amber: '#f59e0b', // Amber 500
                },
                muted: {
                    DEFAULT: '#1e293b',
                    foreground: '#94a3b8',
                },
                card: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    foreground: '#ffffff',
                },
                border: 'rgba(255, 255, 255, 0.1)',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
                mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};
