import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useAvatarStore } from '@/store/useAvatarStore'
import { useAuthStore } from '@/store/useAuthStore'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { setActiveUser } from '@/lib/supabase/cloudSync'
import { AuthPage } from '@/pages/AuthPage'
import { CharacterCreationPage } from '@/pages/CharacterCreationPage'
import { MapPage } from '@/pages/MapPage'
import { RegionPage } from '@/pages/RegionPage'
import { MissionsPage } from '@/pages/MissionsPage'
import { ProfilePage } from '@/pages/ProfilePage'

export default function App() {
  const hasCreatedCharacter = useAvatarStore((s) => s.hasCreatedCharacter)
  const { user, initializing } = useAuthStore()

  useEffect(() => {
    setActiveUser(user?.id ?? null)
  }, [user?.id])

  if (isSupabaseConfigured && initializing) {
    return <div className="flex min-h-full items-center justify-center text-sm text-ink-400">Cargando...</div>
  }

  if (isSupabaseConfigured && !user) {
    return <AuthPage />
  }

  if (!hasCreatedCharacter) {
    return <CharacterCreationPage />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/region/:regionId" element={<RegionPage />} />
        <Route path="/misiones" element={<MissionsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/personaje/editar" element={<CharacterCreationPage mode="edit-avatar" />} />
        <Route path="/personaje/bioma" element={<CharacterCreationPage mode="edit-biome" />} />
      </Routes>
    </AppShell>
  )
}
