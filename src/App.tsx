import { ThemeProvider } from '@/features/theme'
import { LoadingBar, ToastHost } from '@/ui'
import { AppRouter } from '@/app/AppRouter'

/** Composition root: providers, the global indicators, and the router. */
export function App() {
  return (
    <ThemeProvider>
      <LoadingBar />
      <AppRouter />
      <ToastHost />
    </ThemeProvider>
  )
}
