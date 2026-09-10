import AppHeader from '../components/AppHeader'
import { useAuthStore } from '../stores/auth'

export default function HomeView() {
  const email = useAuthStore((s) => s.user?.email)

  return (
    <div>
      <AppHeader />
      <main style={{ padding: 24 }}>
        <p>
          Вы вошли как <strong>{email}</strong>
        </p>
      </main>
    </div>
  )
}
