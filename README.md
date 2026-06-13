# ⚡ Pragma AI — Aprendizaje y Gamificación con Inteligencia Artificial

¡Bienvenido a **Pragma AI**! Una plataforma interactiva ciberpunk de nivel producción diseñada para gamificar el aprendizaje de programación mediante Inteligencia Artificial y una economía interna de recursos y cosméticos estelares.

---

## 🚀 Arquitectura y Stack Tecnológico

El proyecto está dividido en un cliente de React optimizado y un servidor Backend de alta velocidad potenciado por inferencia de LPU (Language Processing Units):

- **Frontend:** React + Vite (Vanilla CSS con HSL reactivo, Glassmorphism y micro-animaciones premium).
- **Backend:** Node.js / Express (más de 6,500 líneas de lógica en `server.cjs`).
- **Base de Datos:** Firebase Firestore (Persistencia completa de estudiantes, rúbricas de evaluación y estado de la cola multijugador).
- **Inferencia IA:** Groq API (LPU Inference con Pool circular / Round-Robin resiliente sobre 6 API keys para evasión de límites de cuota/Rate Limits).

---

## 🎮 Suite de Misiones y Minijuegos

Pragma AI cuenta con 9 vistas y minijuegos integrados directamente en el panel de control:

1. **⚔️ Matchmaking Multijugador Real:** Cola de emparejamiento asíncrona sobre Firestore. Busca oponentes reales y cuenta con un fallback automático de bots a los 6 segundos de inactividad, con opción de cancelación inmediata.
2. **🤖 Copiloto de Depuración:** Editor y analizador de algoritmos erróneos en tiempo real auditado por IA.
3. **🧘 Modo Zen:** Santuario de código sin estrés con reproductor de música Lo-Fi integrado y acertijos lógicos.
4. **🍺 La Taberna del Código:** Refactorización extrema Big-O y control de RAM simulado con gráficas SVG interactivas.
5. **🔨 La Forja Alquímica:** Crafteo de cosméticos y skins usando Silicon Shards con previsualización del Mapa Estelar 3D interactivo.
6. **📖 Grimorio de Runas:** Álbum ciberpunk de cartas que almacena tus códigos mejor evaluados (puntuación >95).
7. **🔥 Syntax Tinder:** Code Review de alta velocidad con temporizador de 15 segundos para deslizar izquierda (código sucio) o derecha (código limpio).
8. **🛡️ Syntax Defense:** Arcade de sintaxis interactivo para destruir bloques corruptos y proteger el Firewall.
9. **🗝️ SQL Dungeon Crawler:** Mazmorra relacional 2D donde cada compuerta requiere resolver consultas SQL complejas (JOIN/GROUP BY/ORDER).

---

## ⚙️ Configuración y Arranque Local

### 1. Variables de Entorno (`.env.local`)
Crea un archivo `.env.local` en la raíz del proyecto y agrega el pool de claves API de Groq:
```env
GROQ_API_KEYS="gsk_...,gsk_...,gsk_..."
```

### 2. Levantar el Backend
Para iniciar el servidor de Node.js en el puerto 5000:
```bash
npm run start
# o directamente:
node server.cjs
```

### 3. Levantar el Frontend
Para iniciar el servidor de desarrollo de Vite en el puerto 5173:
```bash
npm run dev
```

---

## 📦 Despliegue en Producción
Para compilar la aplicación optimizada para producción:
```bash
npm run build
```

Desarrollado con pasión para transformar el aprendizaje de software. 💻⚡
