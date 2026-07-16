# Questly

**Questly** es un planificador de vida y metas personales gamificado: convierte tus objetivos reales (salud, finanzas, trabajo, aprendizaje, relaciones, mentalidad, proyectos) en un RPG donde cada meta cumplida hace avanzar a tu personaje.

En lugar de una lista de tareas plana, tu vida se organiza como un **mapa de regiones**. Cada región representa un área de tu vida, contiene tus **metas**, y cada meta se descompone en **misiones** (tareas concretas con fecha) que aparecen en tu calendario. Al completar misiones ganas XP y monedas, subes de nivel, avanza el progreso de la meta y de la región, y desbloqueas logros.

## Mecánica principal

- **Regiones (mapa de vida):** 7 áreas fijas — Montaña de Salud, Bosque Dorado (finanzas), Ciudad Tecnológica (trabajo), Biblioteca Antigua (aprendizaje), Pueblo (relaciones), Santuario Interior (mentalidad) e Isla Creativa (proyectos). Cada una tiene su propio nivel y progreso, calculado según el % de misiones completadas de sus metas.
- **Metas (Goals):** objetivos dentro de una región, con prioridad, fecha de inicio/vencimiento, recompensa de XP y una recompensa opcional. Una meta se marca como completada automáticamente cuando todas sus misiones están hechas.
- **Misiones (Missions):** las tareas accionables del día a día. Viven siempre en el calendario (fecha obligatoria), tienen prioridad, XP, monedas, duración estimada, etiquetas y pueden repetirse (diaria, semanal, mensual o personalizada). Una misión repetitiva, al completarse, no desaparece: avanza a su próxima ocurrencia.
- **Personaje y progreso:** el jugador tiene nivel, XP, XP para el siguiente nivel (con curva de crecimiento ×1.15), monedas, racha de días (streak) y horas invertidas.
- **Logros (Achievements):** se desbloquean por hitos — primera misión, 10/100 misiones completadas, racha de 30 días, 100 horas invertidas, nivel 10, etc.
- **Avatar y biomas:** creación de personaje estilo pixel-art (basado en sprites LPC), con editor propio para pintar prendas (camisa, pantalón, zapatos, máscara) pixel a pixel, respetando la silueta de la prenda. El jugador también elige un bioma (valle, ciudad, playa, bosque, montaña, espacio) que ambienta su experiencia.
- **Inventario:** objetos vinculados a las metas logradas, visible dentro del Perfil.

## Estructura de la app

- **Mapa** (`/`): vista general de las regiones y su progreso.
- **Región** (`/region/:regionId`): metas y misiones de una región específica.
- **Misiones** (`/misiones`): listado y vista de calendario de misiones.
- **Perfil** (`/perfil`): personaje, nivel, XP, estadísticas, logros e inventario, con accesos rápidos a Mundo y Misiones.
- **Creación/edición de personaje** (`/personaje/editar`, `/personaje/bioma`): editor de avatar y bioma.

## Stack técnico

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** para estilos
- **Zustand** con persistencia en `localStorage` para el estado del juego (`useGameStore`) y del avatar (`useAvatarStore`)
- **React Router** para la navegación
- **Framer Motion** para animaciones
- **Supabase** (`@supabase/supabase-js`) como base para backend/autenticación
- **lucide-react** para iconografía

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción (tsc + vite build)
npm run preview   # sirve el build de producción
```
