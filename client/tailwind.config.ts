/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{jsx,tsx}", "./*.html"],
    theme: {
        extend: {
            colors: {
                // New color palette based on teals and blues
                dark: "#0B1121",
                darkSecondary: "#11172A",
                darkTertiary: "#1A2236",
                darkHover: "#202942",
                lightBg: "#F3F4F6",
                lightSecondary: "#E5E7EB",
                accent: {
                    primary: "#0EA5E9",   // sky-500
                    secondary: "#14B8A6", // teal-500
                    blue: "#2563EB",
                    green: "#059669",
                    yellow: "#EAB308",
                    red: "#EF4444",
                },
                primary: {
                    50: "#ECFEFF",
                    100: "#CFFAFE",
                    200: "#A5F3FC",
                    300: "#67E8F9",
                    400: "#22D3EE",
                    500: "#0EA5E9",
                    600: "#0284C7",
                    700: "#0369A1",
                    800: "#075985",
                    900: "#0C4A6E",
                    950: "#082F49",
                },
                teal: {
                    50: "#F0FDFA",
                    100: "#CCFBF1",
                    200: "#99F6E4",
                    300: "#5EEAD4",
                    400: "#2DD4BF",
                    500: "#14B8A6",
                    600: "#0D9488",
                    700: "#0F766E",
                    800: "#115E59",
                    900: "#134E4A",
                    950: "#042F2E",
                },
                surface: {
                    dark: "rgba(17, 23, 42, 0.8)",
                    light: "rgba(255, 255, 255, 0.8)",
                },
                // Warm, human accent reserved for landing-page presence cues
                // (cursor tags, avatars) — everything else in the palette is
                // "the system"; this is "the people using it".
                signal: {
                    DEFAULT: "#FB923C",
                    soft: "#FDBA74",
                    dim: "#C2410C",
                },
            },
            fontFamily: {
                sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
                mono: ["Fira Code", "JetBrains Mono", "monospace"],
                display: ["Montserrat", "sans-serif"],
                // Editorial serif reserved for landing-page headlines only —
                // deliberate contrast with the mono/sans product UI.
                editorial: ["Fraunces", "Georgia", "serif"],
            },
            animation: {
                "up-down": "up-down 2s ease-in-out infinite alternate",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "shimmer": "shimmer 2s linear infinite",
                "float": "float 6s ease-in-out infinite",
                "caret-blink": "caret-blink 1s step-end infinite",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "caret-blink": {
                    "0%, 45%": { opacity: "1" },
                    "50%, 100%": { opacity: "0" },
                },
            },
            boxShadow: {
                'glow': '0 0 15px -3px rgba(14, 165, 233, 0.3), 0 0 6px -2px rgba(14, 165, 233, 0.3)',
                'glow-lg': '0 0 25px -5px rgba(14, 165, 233, 0.3), 0 0 10px -5px rgba(14, 165, 233, 0.3)',
                'glow-teal': '0 0 15px -3px rgba(20, 184, 166, 0.3), 0 0 6px -2px rgba(20, 184, 166, 0.3)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-mesh': 'linear-gradient(to right bottom, #0EA5E9, #0B1121, #0B1121, #14B8A6)',
                'gradient-ocean': 'linear-gradient(135deg, #0B1121 0%, #0c2c4f 100%)',
                'gradient-glass': 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
            },
        },
    },
    plugins: [],
}
