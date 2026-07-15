import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useAvatarStore } from '@/store/useAvatarStore'
import { CharacterCreationPage } from '@/pages/CharacterCreationPage'
import { MapPage } from '@/pages/MapPage'
import { RegionPage } from '@/pages/RegionPage'
import { MissionsPage } from '@/pages/MissionsPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { ProfilePage } from '@/pages/ProfilePage'

export default function App() {
  const hasCreatedCharacter = useAvatarStore((s) => s.hasCreatedCharacter)

  if (!hasCreatedCharacter) {
    return <CharacterCreationPage />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/region/:regionId" element={<RegionPage />} />
        <Route path="/misiones" element={<MissionsPage />} />
        <Route path="/inventario" element={<InventoryPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/personaje/editar" element={<CharacterCreationPage mode="edit-avatar" />} />
        <Route path="/personaje/bioma" element={<CharacterCreationPage mode="edit-biome" />} />
      </Routes>
    </AppShell>
  )
}
