import { ThemeProvider } from '@/features/theme'
import { LoadingBar } from '@/ui'
import { AppRouter } from '@/app/AppRouter'

/** Composition root: providers, the global loading indicator, and the router. */
export function App() {
  return (
    <ThemeProvider>
      <LoadingBar />
      <AppRouter />
    </ThemeProvider>
  )
}
