/**
 * src/mentor/modelos/blueprintsModel.js
 * Catálogo exhaustivo de Blueprints Arquitectónicos y Recursos de Producción.
 * Diseñado para guiar a los estudiantes en inicialización de archivos, patrones de diseño,
 * transacciones ACID, validaciones, CRUD, seguridad y observabilidad.
 */

export const BLUEPRINT_CATEGORIAS = [
  'Todos',
  'Modular',
  'Database',
  'Backend',
  'Seguridad',
  'Frontend',
  'Realtime',
  'Testing',
  'Cloud'
];

export const LISTA_BLUEPRINTS = [
  {
    id: 'bp_clean',
    titulo: 'Clean Architecture & UseCases',
    categoria: 'Modular',
    icono: 'Layers',
    tagClass: 'bp-tag-arch',
    desc: 'Aislamiento estricto de dominio, casos de uso puros y adaptadores de infraestructura para evitar acoplamiento y garantizar pruebas unitarias limpias.',
    snippet: `src/
├── domain/          # Entidades y reglas de negocio puras
│   └── entities/
├── application/     # Casos de uso (CreateOrder, TransferFunds, AuthUser)
│   └── usecases/
├── infrastructure/  # Repositorios DB, adaptadores externos, Prisma
│   ├── database/
│   └── repositories/
└── interfaces/      # Controladores HTTP, DTOs y Rutas REST
    └── http/`,
    copyText: `src/\n├── domain/entities/\n├── application/usecases/\n├── infrastructure/repositories/\n└── interfaces/http/`,
    askPrompt: (titulo) => `¿Cómo implemento Clean Architecture y Casos de Uso estructurados en ${titulo || 'mi proyecto'}?`
  },
  {
    id: 'bp_bank_trans',
    titulo: 'Servicio Bancario Integral & Transacciones ACID',
    categoria: 'Database',
    icono: 'Database',
    tagClass: 'bp-tag-db',
    desc: 'Inicialización de servicio para un banco o fintech, consulta de saldo/movimientos (GET), transferencia atómica con bloqueo FOR UPDATE (POST), actualización de límites (PUT), baja lógica (DELETE) y eventos de notificación.',
    snippet: `// src/services/bankService.js
import { pool } from '../config/database.js';
import { notificacionesQueue } from '../queues/notificationQueue.js';

export const BankService = {
  // 1. Consulta de saldo e historial reciente (GET)
  async consultarSaldoYMovimientos(cuentaId) {
    const cuenta = await pool.query('SELECT id, saldo, activa FROM cuentas WHERE id = $1', [cuentaId]);
    if (!cuenta.rows.length) throw new Error('Cuenta no encontrada');
    const movimientos = await pool.query(
      'SELECT id, tipo, monto, creado_en FROM transacciones WHERE origen_id = $1 OR destino_id = $1 ORDER BY creado_en DESC LIMIT 10',
      [cuentaId]
    );
    return { cuenta: cuenta.rows[0], movimientos: movimientos.rows };
  },

  // 2. Transacción atómica bancaria con bloqueo de concurrencia (POST)
  async transferirFondos({ origenId, destinoId, monto, concepto }) {
    if (monto <= 0) throw new Error('El monto debe ser estrictamente positivo');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const saldoRes = await client.query('SELECT saldo, activa FROM cuentas WHERE id = $1 FOR UPDATE', [origenId]);
      if (!saldoRes.rows.length || !saldoRes.rows[0].activa) throw new Error('Cuenta origen inactiva o inexistente');
      if (Number(saldoRes.rows[0].saldo) < monto) throw new Error('Saldo insuficiente para completar la transferencia');

      await client.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, origenId]);
      await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, destinoId]);
      const tx = await client.query(
        'INSERT INTO transacciones (origen_id, destino_id, monto, concepto, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [origenId, destinoId, monto, concepto || 'Transferencia', 'COMPLETADA']
      );
      await client.query('COMMIT');

      // 3. Notificación asíncrona de éxito al usuario
      await notificacionesQueue.add('notificar_transferencia', { txId: tx.rows[0].id, origenId, destinoId, monto });
      return { ok: true, transaccionId: tx.rows[0].id };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // 4. Actualización de límites o estado de cuenta (PUT/PATCH)
  async actualizarEstadoCuenta(cuentaId, { limiteDiario, activa }) {
    const res = await pool.query(
      'UPDATE cuentas SET limite_diario = COALESCE($1, limite_diario), activa = COALESCE($2, activa) WHERE id = $3 RETURNING id, saldo, activa',
      [limiteDiario, activa, cuentaId]
    );
    return res.rows[0];
  },

  // 5. Baja lógica o congelamiento de cuenta (DELETE)
  async congelarCuenta(cuentaId, motivo) {
    await pool.query('UPDATE cuentas SET activa = false, motivo_bloqueo = $1 WHERE id = $2', [motivo, cuentaId]);
    return { ok: true, mensaje: 'Cuenta congelada exitosamente' };
  }
};`,
    copyText: `// src/services/bankService.js
import { pool } from '../config/database.js';
export const BankService = {
  async consultarSaldoYMovimientos(cuentaId) { /* GET */ },
  async transferirFondos({ origenId, destinoId, monto }) { /* ACID Transaction with FOR UPDATE */ },
  async actualizarEstadoCuenta(cuentaId, data) { /* PUT/PATCH */ },
  async congelarCuenta(cuentaId, motivo) { /* DELETE/Soft-delete */ }
};`,
    askPrompt: (titulo) => `¿Cómo implemento el servicio bancario integral (inicialización, saldo, transferencias atómicas ACID y eventos) en ${titulo || 'mi aplicación'}?`
  },
  {
    id: 'bp_crud_zod',
    titulo: 'Controlador CRUD Completo + Validación Zod',
    categoria: 'Backend',
    icono: 'Code2',
    tagClass: 'bp-tag-back',
    desc: 'Controlador Express estándar con operaciones GET (paginado), POST, PUT/PATCH, DELETE, validación estricta de DTOs con Zod y respuestas uniformes.',
    snippet: `// controllers/accountController.js
import { z } from 'zod';

const AccountSchema = z.object({
  nombre: z.string().min(3).max(50),
  tipo: z.enum(['AHORROS', 'CORRIENTE']),
  saldoInicial: z.number().nonnegative().default(0)
});

export const AccountController = {
  // GET /api/cuentas (Listado con paginación)
  async listar(req, res, next) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const cuentas = await accountService.findAll({ limit: Number(limit), offset: Number(offset) });
      res.status(200).json({ ok: true, data: cuentas });
    } catch (err) { next(err); }
  },

  // POST /api/cuentas (Creación validada)
  async crear(req, res, next) {
    try {
      const payload = AccountSchema.parse(req.body);
      const nuevaCuenta = await accountService.create(payload);
      res.status(201).json({ ok: true, data: nuevaCuenta });
    } catch (err) { next(err); }
  },

  // PUT /api/cuentas/:id (Actualización total/parcial)
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const payload = AccountSchema.partial().parse(req.body);
      const cuentaActualizada = await accountService.update(id, payload);
      res.status(200).json({ ok: true, data: cuentaActualizada });
    } catch (err) { next(err); }
  },

  // DELETE /api/cuentas/:id (Baja lógica)
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await accountService.softDelete(id);
      res.status(200).json({ ok: true, mensaje: 'Cuenta dada de baja' });
    } catch (err) { next(err); }
  }
};`,
    copyText: `// controllers/accountController.js
import { z } from 'zod';
const Schema = z.object({ nombre: z.string().min(3) });
export const Controller = {
  async listar(req, res, next) { /* GET logic */ },
  async crear(req, res, next) { const body = Schema.parse(req.body); /* POST */ },
  async actualizar(req, res, next) { /* PUT/PATCH */ },
  async eliminar(req, res, next) { /* DELETE */ }
};`,
    askPrompt: (titulo) => `¿Cómo estructuro los controladores CRUD con validación Zod y manejo de errores para ${titulo || 'mi proyecto'}?`
  },
  {
    id: 'bp_express_db',
    titulo: 'Express REST + PostgreSQL & Prisma ORM',
    categoria: 'Database',
    icono: 'Database',
    tagClass: 'bp-tag-db',
    desc: 'Configuración de connection pool con pg/Prisma, migraciones versionadas y middleware de manejo de errores global.',
    snippet: `// middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
  res.status(status).json({
    ok: false,
    error: err.message || 'Internal Server Error',
    detalles: err.errors || null,
    code: err.code || 'ERR_INTERNAL'
  });
}`,
    copyText: `export function errorHandler(err, req, res, next) {\n  const status = err.statusCode || 500;\n  res.status(status).json({ ok: false, error: err.message });\n}`,
    askPrompt: (titulo) => `¿Cuál es el mejor esquema relacional e índices en PostgreSQL para ${titulo || 'este proyecto'}?`
  },
  {
    id: 'bp_jwt_rotation',
    titulo: 'Autenticación JWT Robusta & Refresh Rotation',
    categoria: 'Seguridad',
    icono: 'ShieldCheck',
    tagClass: 'bp-tag-sec',
    desc: 'Tokens de acceso de vida corta en memoria y refresh tokens en HttpOnly Cookies con rotación automática e invalidación en cierre de sesión.',
    snippet: `// auth/tokens.js
import jwt from 'jsonwebtoken';

export function generarParTokens(usuario) {
  const accessToken = jwt.sign({ uid: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ uid: usuario.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function setAuthCookies(res, { refreshToken }) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });
}`,
    copyText: `// auth/tokens.js\nres.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });`,
    askPrompt: (titulo) => `¿Cómo implemento la rotación de refresh tokens y protección CSRF para ${titulo || 'mi aplicación'}?`
  },
  {
    id: 'bp_zustand_state',
    titulo: 'Gestor de Estado Reactivo & Asíncrono (Zustand)',
    categoria: 'Frontend',
    icono: 'Cpu',
    tagClass: 'bp-tag-front',
    desc: 'Store modular con JavaScript/TypeScript, operaciones asíncronas para saldos/movimientos, optimistic updates y persistencia en almacenamiento local.',
    snippet: `// store/useBankStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBankStore = create(
  persist(
    (set, get) => ({
      saldo: 0,
      movimientos: [],
      cargando: false,
      error: null,

      cargarSaldo: async (cuentaId) => {
        set({ cargando: true, error: null });
        try {
          const res = await fetch(\`/api/cuentas/\${cuentaId}/saldo\`);
          const { data } = await res.json();
          set({ saldo: data.balance, cargando: false });
        } catch (err) {
          set({ error: 'Fallo al cargar saldo', cargando: false });
        }
      },

      transferir: async ({ destinoId, monto }) => {
        set({ cargando: true });
        // Actualización optimista de UI
        const saldoPrevio = get().saldo;
        set({ saldo: saldoPrevio - monto });
        try {
          const res = await fetch('/api/transferencias', {
            method: 'POST',
            body: JSON.stringify({ destinoId, monto })
          });
          if (!res.ok) throw new Error('Transferencia rechazada');
          set({ cargando: false });
        } catch (err) {
          // Reversión de estado si falla la petición
          set({ saldo: saldoPrevio, error: err.message, cargando: false });
        }
      }
    }),
    { name: 'bank-storage-session' }
  )
);`,
    copyText: `import { create } from 'zustand';\nexport const useBankStore = create((set, get) => ({\n  saldo: 0,\n  cargarSaldo: async (id) => { /* fetch */ }\n}));`,
    askPrompt: (titulo) => `¿Cómo estructuro el store de estado y las mutaciones optimistas para ${titulo || 'este proyecto'}?`
  },
  {
    id: 'bp_websockets_realtime',
    titulo: 'WebSockets & Notificaciones Push en Tiempo Real',
    categoria: 'Realtime',
    icono: 'Radio',
    tagClass: 'bp-tag-realtime',
    desc: 'Servidor WebSocket autenticado por JWT, emisión a salas privadas de usuario (ej. avisos de transferencias entrantes) y reconexión resiliente.',
    snippet: `// realtime/wsServer.js
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const userSockets = new Map(); // userId -> Set<ws>

  wss.on('connection', (ws, req) => {
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    let userId = null;
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET).uid;
    } catch (_) {
      return ws.close(4001, 'No autorizado');
    }

    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(ws);

    ws.on('close', () => {
      userSockets.get(userId)?.delete(ws);
    });
  });

  return {
    notificarUsuario(userId, evento, data) {
      const sockets = userSockets.get(userId);
      if (sockets) {
        const payload = JSON.stringify({ evento, data, timestamp: new Date() });
        sockets.forEach(ws => ws.readyState === 1 && ws.send(payload));
      }
    }
  };
}`,
    copyText: `// realtime/wsServer.js\nconst wss = new WebSocketServer({ server, path: '/ws' });`,
    askPrompt: (titulo) => `¿Cómo implemento notificaciones en tiempo real vía WebSockets para los eventos de ${titulo || 'mi app'}?`
  },
  {
    id: 'bp_mvvm_flutter',
    titulo: 'Arquitectura Móvil MVVM & Repositorios (Flutter)',
    categoria: 'Modular',
    icono: 'Smartphone',
    tagClass: 'bp-tag-arch',
    desc: 'Patrón MVVM en Flutter separando UI (Widgets), ViewModels (StateNotifier/ChangeNotifier) y Repositorios con inyección de dependencias.',
    snippet: `// lib/features/balance/viewmodel/balance_viewmodel.dart
import 'package:flutter/foundation.dart';
import '../repositories/balance_repository.dart';

class BalanceViewModel extends ChangeNotifier {
  final BalanceRepository _repository;
  double _balance = 0.0;
  bool _isLoading = false;
  String? _error;

  BalanceViewModel(this._repository);

  double get balance => _balance;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchBalance(String userId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _balance = await _repository.getUserBalance(userId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}`,
    copyText: `class BalanceViewModel extends ChangeNotifier {\n  double _balance = 0.0;\n  Future<void> fetchBalance(String uid) async { notifyListeners(); }\n}`,
    askPrompt: (titulo) => `¿Cómo configuro la arquitectura MVVM con Provider/Riverpod y Repositorios en Flutter para ${titulo || 'este MVP'}?`
  },
  {
    id: 'bp_presigned_s3',
    titulo: 'Subida a la Nube con URLs Firmadas (S3 / Storage)',
    categoria: 'Cloud',
    icono: 'Cloud',
    tagClass: 'bp-tag-cloud',
    desc: 'Generación de Presigned URLs en backend para que el cliente suba comprobantes o archivos directamente a S3/Storage sin congestionar el servidor.',
    snippet: `// services/storageService.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function generarUrlSubidaDirecta(userId, filename, mimeType) {
  const fileKey = \`uploads/\${userId}/\${Date.now()}_\${filename.replace(/\\s+/g, '_')}\`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: mimeType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutos de vigencia
  return { uploadUrl, fileKey };
}`,
    copyText: `const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType }), { expiresIn: 300 });`,
    askPrompt: (titulo) => `¿Cómo configuro la subida segura de archivos y comprobantes con URLs firmadas para ${titulo || 'mi aplicación'}?`
  },
  {
    id: 'bp_rate_limit',
    titulo: 'Rate Limiting & Protección Brute-Force (Redis / Express)',
    categoria: 'Seguridad',
    icono: 'ShieldCheck',
    tagClass: 'bp-tag-sec',
    desc: 'Protección de endpoints sensibles (login, transferencias, APIs públicas) limitando solicitudes por IP y usuario con cabeceras estándar.',
    snippet: `// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos fallidos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Demasiados intentos fallidos. Tu acceso está temporalmente bloqueado por 15 minutos.',
    retryAfterMinutes: 15
  }
});`,
    copyText: `import rateLimit from 'express-rate-limit';\nexport const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });`,
    askPrompt: (titulo) => `¿Cómo protejo los endpoints críticos de mi app ${titulo || ''} contra ataques de fuerza bruta y DDoS?`
  },
  {
    id: 'bp_testing_pyramid',
    titulo: 'Pirámide de Pruebas (Vitest + Supertest)',
    categoria: 'Testing',
    icono: 'Code2',
    tagClass: 'bp-tag-test',
    desc: 'Estructura de pruebas unitarias sobre cálculos financieros y pruebas de integración sobre endpoints de API simulando flujos reales.',
    snippet: `// tests/integration/api.test.js
import request from 'supertest';
import { app } from '../../src/app';

describe('POST /api/transferencias', () => {
  it('debe responder 200 y descontar saldo cuando la cuenta origen tiene fondos suficientes', async () => {
    const res = await request(app)
      .post('/api/transferencias')
      .set('Authorization', 'Bearer token_test_valido')
      .send({ origenId: 'acc_1', destinoId: 'acc_2', monto: 100.00 });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});`,
    copyText: `import request from 'supertest';\nimport { app } from '../../src/app';`,
    askPrompt: (titulo) => `¿Qué casos de prueba esenciales (unitarios e integración) debo programar para ${titulo || 'este proyecto'}?`
  },
  {
    id: 'bp_queue_worker',
    titulo: 'Worker de Tareas en Segundo Plano & Colas (BullMQ)',
    categoria: 'Backend',
    icono: 'Activity',
    tagClass: 'bp-tag-back',
    desc: 'Cola asíncrona sobre Redis para procesar tareas pesadas (estados de cuenta, emails, reportes PDF) con reintentos exponenciales y dead-letter queues.',
    snippet: `// queues/emailQueue.js
import { Queue, Worker } from 'bullmq';

const connection = { host: process.env.REDIS_HOST || '127.0.0.1', port: 6379 };
export const notificacionesQueue = new Queue('notificaciones', { connection });

// Worker en proceso independiente
new Worker('notificaciones', async (job) => {
  const { tipo, destinatario, datos } = job.data;
  console.log(\`[Worker] Procesando notificación \${tipo} para \${destinatario}\`);
  await notificacionesService.enviar(destinatario, tipo, datos);
}, { connection, concurrency: 5 });`,
    copyText: `import { Queue, Worker } from 'bullmq';\nexport const notificacionesQueue = new Queue('notificaciones', { connection });`,
    askPrompt: (titulo) => `¿Cómo implemento una cola de tareas en background para procesos asíncronos en ${titulo || 'mi backend'}?`
  },
  {
    id: 'bp_observability',
    titulo: 'Observabilidad, Correlation IDs & Logs JSON (Pino)',
    categoria: 'Cloud',
    icono: 'Terminal',
    tagClass: 'bp-tag-cloud',
    desc: 'Rastreo de solicitudes HTTP con X-Request-Id propagado, logs estructurados JSON de alta performance y endpoint de salud /health.',
    snippet: `// middleware/observability.js
import pino from 'pino';
import crypto from 'crypto';

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function requestTracker(req, res, next) {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  const inicio = Date.now();
  res.on('finish', () => {
    logger.info({
      reqId,
      metodo: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      latenciaMs: Date.now() - inicio
    }, 'HTTP Request Finalizado');
  });
  next();
}`,
    copyText: `export function requestTracker(req, res, next) {\n  const reqId = req.headers['x-request-id'] || crypto.randomUUID();\n  req.id = reqId; res.setHeader('X-Request-Id', reqId); next();\n}`,
    askPrompt: (titulo) => `¿Cómo estructuro el logging JSON y monitoreo de producción para ${titulo || 'este proyecto'}?`
  },
  {
    id: 'bp_webhook_crypto',
    titulo: 'Webhook Handler Idempotente & Verificación HMAC',
    categoria: 'Seguridad',
    icono: 'Lock',
    tagClass: 'bp-tag-sec',
    desc: 'Recepción de webhooks de pasarelas de pago o APIs bancarias con verificación de firma criptográfica SHA-256 y prevención de duplicados con idempotencia.',
    snippet: `// routes/webhooks.js
import crypto from 'crypto';

export async function handleWebhookPago(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const rawBody = req.rawBody; // Buffer de request sin parsear

  const expectedSig = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSig) {
    return res.status(401).json({ error: 'Firma criptográfica inválida' });
  }

  const { eventId, tipo, transaccion } = req.body;
  // Control de idempotencia: ignorar si ya fue procesado
  const yaProcesado = await db.query('SELECT id FROM processed_events WHERE event_id = $1', [eventId]);
  if (yaProcesado.rows.length) return res.status(200).json({ ok: true, repetido: true });

  await db.query('INSERT INTO processed_events (event_id, tipo) VALUES ($1, $2)', [eventId, tipo]);
  await procesarEvento(tipo, transaccion);
  res.status(200).json({ ok: true });
}`,
    copyText: `const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');\nif (signature !== expectedSig) return res.status(401).send('Invalid Sig');`,
    askPrompt: (titulo) => `¿Cómo implemento la verificación criptográfica de webhooks y control de idempotencia para ${titulo || 'mi app'}?`
  }
];
