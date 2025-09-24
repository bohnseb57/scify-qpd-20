import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'dm-sans': ['DM Sans', 'sans-serif'],
				'sans': ['DM Sans', 'ui-sans-serif', 'system-ui']
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Scilife Brand Palette
				'sl-neutral': {
					0: 'hsl(var(--sl-neutral-0))',
					50: 'hsl(var(--sl-neutral-50))',
					100: 'hsl(var(--sl-neutral-100))',
					200: 'hsl(var(--sl-neutral-200))',
					300: 'hsl(var(--sl-neutral-300))',
					400: 'hsl(var(--sl-neutral-400))',
					500: 'hsl(var(--sl-neutral-500))',
					600: 'hsl(var(--sl-neutral-600))',
					700: 'hsl(var(--sl-neutral-700))',
					800: 'hsl(var(--sl-neutral-800))',
					900: 'hsl(var(--sl-neutral-900))',
					950: 'hsl(var(--sl-neutral-950))'
				},
				'sl-blue': {
					50: 'hsl(var(--sl-blue-50))',
					100: 'hsl(var(--sl-blue-100))',
					200: 'hsl(var(--sl-blue-200))',
					300: 'hsl(var(--sl-blue-300))',
					400: 'hsl(var(--sl-blue-400))',
					500: 'hsl(var(--sl-blue-500))',
					600: 'hsl(var(--sl-blue-600))',
					700: 'hsl(var(--sl-blue-700))',
					800: 'hsl(var(--sl-blue-800))',
					900: 'hsl(var(--sl-blue-900))',
					950: 'hsl(var(--sl-blue-950))'
				},
				'sl-yellow': {
					50: 'hsl(var(--sl-yellow-50))',
					100: 'hsl(var(--sl-yellow-100))',
					200: 'hsl(var(--sl-yellow-200))',
					300: 'hsl(var(--sl-yellow-300))',
					400: 'hsl(var(--sl-yellow-400))',
					500: 'hsl(var(--sl-yellow-500))',
					600: 'hsl(var(--sl-yellow-600))',
					700: 'hsl(var(--sl-yellow-700))',
					800: 'hsl(var(--sl-yellow-800))',
					900: 'hsl(var(--sl-yellow-900))',
					950: 'hsl(var(--sl-yellow-950))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				status: {
					draft: 'hsl(var(--status-draft))',
					'in-progress': 'hsl(var(--status-in-progress))',
					approved: 'hsl(var(--status-approved))',
					rejected: 'hsl(var(--status-rejected))',
					completed: 'hsl(var(--status-completed))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)', 
				'gradient-subtle': 'var(--gradient-subtle)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'card': 'var(--shadow-card)',
				'glow': 'var(--shadow-glow)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'spring': 'var(--transition-spring)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
