/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        colors: {
          primary: '#EA580C',
          secondary: '#FFEDD5',
          background: '#FFFFFF',
          surface: '#F3F4F6', 
          primaryText: '#0F172A',
          secondaryText: '#6B7280',
          error: '#EA580C',
          "on-surface": '#0F172A'
        }
      },

      dark: {
        colors: {
          primary: '#EA580C',
          secondary: '#FFEDD5',
          background:  '#18181B',
          surface: '#27272A',
          primaryText: '#F4F4F5',
          secondaryText: '#6B7280',
          error: '#EA580C'
        }
      }
    }
  },
})
