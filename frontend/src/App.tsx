import { AppRouter } from '@/routes/AppRouter'
import { AuthProvider } from '@/providers/AuthContext'
import { QueryProvider } from '@/providers/QueryProvider'

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryProvider>
  )
}
