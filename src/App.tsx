import { ThemeProvider } from '@/features/theme'
import { AppShell } from '@/app/layout/AppShell'

/** Composition root: providers wrapping the application frame. */
export function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
