# Directrices del Proyecto: IA-PROFESOR

Este archivo define las reglas operativas, comandos de desarrollo y la integración de skills locales para los agentes que interactúan con el repositorio.

---

## 📜 Reglas de Ejecución del Agente (Obligatorias)

1.  **Uso Automático de Skills:** 
    *   El agente debe leer e incorporar de forma proactiva las directrices de los archivos markdown ubicados en `.agents/skills/` (`frontend-design.md`, `caveman.md`, `ai-second-brain.md`) y `.agents/plugins/` en cada cambio de código o generación de respuestas.
    *   **Frontend Design:** Aplicar estilos HSL oscuros modernos, gradientes sutiles y micro-animaciones en los componentes de UI.
    *   **Caveman:** Aplicar en análisis de logs extensos para reducir el consumo de tokens en llamadas redundantes.
2.  **Tecnologías:** 
    *   Frontend: React + Vanilla CSS (usando Vite).
    *   Backend: Servidor local Express.js en CommonJS (`server.cjs`).
    *   Base de datos: PostgreSQL mediante Supabase dedicada (las credenciales se leen de `.env.local`).
3.  **Base de Datos Independiente:**
    *   No modificar la base de datos de CivicReport.
    *   Cualquier cambio estructural debe documentarse y agregarse en `database/schema_profesor.sql`.

---

## 🛠 Comandos de Desarrollo

*   **Arrancar Servidor Backend:** `npm run server` (Ejecuta `nodemon server.cjs` en puerto 5000)
*   **Arrancar Frontend:** `npm run dev` (Ejecuta `vite` en puerto 5173)
*   **Instalar Dependencias:** `npm install`
*   **Empaquetar Contexto:** `npx repomix`
