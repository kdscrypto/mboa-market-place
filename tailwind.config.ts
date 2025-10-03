
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Modern Mboa Market colors
				'mboa-orange': 'var(--color-primary-accent)',
				'mboa-green': 'var(--color-green)', 
				'mboa-blue': 'var(--color-blue)',
				'mboa-gray': 'var(--color-surface-elevated)',
				'mboa-dark': 'var(--color-text-primary)',
				
				// Theme-aware semantic colors
				'theme-bg': 'var(--color-background)',
				'theme-surface': 'var(--color-surface)',
				'theme-surface-elevated': 'var(--color-surface-elevated)',
				'theme-text': 'var(--color-text-primary)',
				'theme-text-secondary': 'var(--color-text-secondary)',
				'theme-border': 'var(--color-border)',
				'theme-header-bg': 'var(--color-header-bg)',
				'theme-header-text': 'var(--color-header-text)',
				'theme-header-border': 'var(--color-header-border)',
				
				// Extended semantic colors
				'theme-success': 'var(--color-success)',
				'theme-warning': 'var(--color-warning)',
				'theme-error': 'var(--color-error)',
				'theme-info': 'var(--color-info)',
				
				// Neutral scale
				'theme-neutral': {
					50: 'var(--color-neutral-50)',
					100: 'var(--color-neutral-100)',
					200: 'var(--color-neutral-200)',
					300: 'var(--color-neutral-300)',
					400: 'var(--color-neutral-400)',
					500: 'var(--color-neutral-500)',
					600: 'var(--color-neutral-600)',
					700: 'var(--color-neutral-700)',
					800: 'var(--color-neutral-800)',
					900: 'var(--color-neutral-900)',
				},
				
				// Gradient colors
				'gradient-start': 'var(--color-gradient-start)',
				'gradient-end': 'var(--color-gradient-end)',
				'gradient-accent': 'var(--color-gradient-accent)',
				
				// Modern color palette additions
				'modern-orange': {
					50: '#FFF5F2',
					100: '#FFE8E0',
					200: '#FFD1C1',
					300: '#FFB4A1',
					400: '#FF8A65',
					500: '#FF6B35',
					600: '#E55A2B',
					700: '#CC4A21',
					800: '#B23B17',
					900: '#992C0D',
				},
				'modern-green': {
					50: '#F0FDFA',
					100: '#CCFBF1',
					200: '#99F6E4',
					300: '#5EEAD4',
					400: '#2DD4BF',
					500: '#00C896',
					600: '#0DB092',
					700: '#059669',
					800: '#047857',
					900: '#064E3B',
				},
				'modern-blue': {
					50: '#EFF6FF',
					100: '#DBEAFE',
					200: '#BFDBFE',
					300: '#93C5FD',
					400: '#60A5FA',
					500: '#4A90E2',
					600: '#2563EB',
					700: '#1D4ED8',
					800: '#1E40AF',
					900: '#1E3A8A',
				},
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
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
					},
					'100%': {
						opacity: '0',
					}
				},
				'gradient-shift': {
					'0%, 100%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					}
				},
				'modern-pulse': {
					'0%, 100%': {
						opacity: '1',
					},
					'50%': {
						opacity: '0.8',
					}
				},
				'smooth-bounce': {
					'0%, 100%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
					},
					'50%': {
						transform: 'translateY(-25%)',
						animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
				'modern-pulse': 'modern-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'smooth-bounce': 'smooth-bounce 1s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-mboa': 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%)',
				'gradient-mboa-accent': 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-accent) 50%, var(--color-gradient-end) 100%)',
				'gradient-modern': 'linear-gradient(135deg, #FF6B35 0%, #4A90E2 100%)',
				'gradient-modern-dark': 'linear-gradient(135deg, #FF8A65 0%, #64B5F6 100%)',
			},
			boxShadow: {
				'modern': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'modern-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'modern-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/line-clamp")],
} satisfies Config;
