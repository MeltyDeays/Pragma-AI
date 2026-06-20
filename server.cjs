const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());

// Cabeceras de seguridad esenciales (Seguridad de Nivel de Producción)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Directorio público para tareas descargables
const tareasPublicDir = path.join(__dirname, 'public', 'tareas');
fs.mkdirSync(tareasPublicDir, { recursive: true });
app.use('/descargas', express.static(tareasPublicDir));

// Importar Express Routers modulares
const estudiantesRouter = require('./routes/estudiantes.cjs');
const tareasRouter = require('./routes/tareas.cjs');
const mentorRouter = require('./routes/mentor.cjs');
const juegosRouter = require('./routes/juegos.cjs');
const logrosRouter = require('./routes/logros.cjs');
const pragmaRouter = require('./routes/pragma.cjs');
const amistadesRouter = require('./routes/amistades.cjs');

// Montar rutas
app.use(estudiantesRouter);
app.use(tareasRouter);
app.use(mentorRouter);
app.use(juegosRouter);
app.use(logrosRouter);
app.use(pragmaRouter);
app.use(amistadesRouter);

// Levantar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de IA-PROFESOR (Potenciada) ejecutándose en puerto ${PORT}`);
});
