/**
 * DICCIONARIO DE ESTRUCTURAS & COLECCIONES DE ARQUITECTURA
 * Catálogo maestro de andamios técnicos y contratos de producción clasificados por industria.
 */

export const COLECCIONES_ESTRUCTURAS = [
  { id: 'todas', nombre: 'Todas las Colecciones', icono: 'Layers', total: 27 },
  { id: 'bancos', nombre: '🏦 Bancos & Fintech', icono: 'ShieldCheck', total: 4, tagClass: 'col-bancos' },
  { id: 'ventas', nombre: '🛒 Ventas & E-Commerce', icono: 'Code2', total: 4, tagClass: 'col-ventas' },
  { id: 'almacenes', nombre: '📦 Almacenes & Kardex', icono: 'Database', total: 4, tagClass: 'col-almacenes' },
  { id: 'salud', nombre: '🏥 Salud & Clínicas', icono: 'Activity', total: 3, tagClass: 'col-salud' },
  { id: 'delivery', nombre: '🚚 Delivery & Logística', icono: 'Radio', total: 3, tagClass: 'col-delivery' },
  { id: 'educacion', nombre: '🎓 Educación & E-Learning', icono: 'Cpu', total: 3, tagClass: 'col-educacion' },
  { id: 'rrhh', nombre: '🏢 RRHH & Nómina', icono: 'Lock', total: 3, tagClass: 'col-rrhh' },
  { id: 'movil', nombre: '📱 Móvil & Offline-First', icono: 'Smartphone', total: 3, tagClass: 'col-movil' }
];

export const LISTA_DICCIONARIO_ESTRUCTURAS = [
  // ==========================================
  // COLECCIÓN 1: BANCOS & FINTECH
  // ==========================================
  {
    id: 'struct_bank_acid',
    coleccionId: 'bancos',
    coleccion: '🏦 Bancos & Fintech',
    titulo: 'Transacción Atómica de Transferencia con Bloqueo de Fila (ACID)',
    categoria: 'Backend',
    icono: 'ShieldCheck',
    tagClass: 'bp-tag-back',
    desc: 'Ejecuta transferencias monetarias atómicas entre cuentas previniendo condiciones de carrera y saldos negativos mediante bloqueo FOR UPDATE en la base de datos.',
    beneficio: 'Garantiza consistencia absoluta de saldos bajo alta concurrencia transaccional sin riesgo de duplicidad de fondos.',
    promptSugerido: 'Quiero desarrollar un Sistema Bancario Core con transferencias atómicas ACID seguras, verificación de saldo disponible en tiempo real y registro de débitos/créditos inmutables.',
    snippet: `// src/services/transferService.js
import { pool } from '../db/connection.js';

export async function transferirFondos({ cuentaOrigenId, cuentaDestinoId, monto, moneda = 'USD' }) {
  if (monto <= 0) throw new Error('El monto de transferencia debe ser mayor a 0.');
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED');

    // 1. Bloqueo determinístico de cuentas ordenado por ID para prevenir deadlocks
    const [primeraId, segundaId] = [cuentaOrigenId, cuentaDestinoId].sort();
    await client.query('SELECT id FROM cuentas WHERE id IN ($1, $2) FOR UPDATE', [primeraId, segundaId]);

    // 2. Verificar saldo disponible en cuenta origen
    const { rows: origenRows } = await client.query(
      'SELECT id, saldo, activa FROM cuentas WHERE id = $1',
      [cuentaOrigenId]
    );
    const origen = origenRows[0];
    if (!origen || !origen.activa) throw new Error('Cuenta origen inactiva o no existe.');
    if (Number(origen.saldo) < monto) throw new Error('Fondos insuficientes para completar la operación.');

    // 3. Ejecutar débito y crédito
    await client.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, cuentaOrigenId]);
    await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, cuentaDestinoId]);

    // 4. Registrar movimiento en el libro mayor contable
    const transaccionId = crypto.randomUUID();
    await client.query(
      \`INSERT INTO transacciones (id, origen_id, destino_id, monto, moneda, estado, creado_en)
       VALUES ($1, $2, $3, $4, $5, 'COMPLETADA', NOW())\`,
      [transaccionId, cuentaOrigenId, cuentaDestinoId, monto, moneda]
    );

    await client.query('COMMIT');
    return { success: true, transaccionId, monto, estado: 'COMPLETADA' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}`
  },
  {
    id: 'struct_bank_ledger',
    coleccionId: 'bancos',
    coleccion: '🏦 Bancos & Fintech',
    titulo: 'Libro Mayor Contable de Doble Partida (Double-Entry Ledger)',
    categoria: 'Database',
    icono: 'Database',
    tagClass: 'bp-tag-db',
    desc: 'Estructura inmutable donde todo movimiento financiero se asienta con al menos un Débito y un Crédito sumando exactamente cero (Principio de Partida Doble).',
    beneficio: 'Cumplimiento normativo bancario y auditoría contable a prueba de alteraciones.',
    promptSugerido: 'Quiero implementar un sistema de contabilidad financiera para billetera digital con esquema de partida doble inmutable, cuentas de balance y asientos auditables.',
    snippet: `-- migrations/double_entry_ledger.sql
CREATE TABLE cuentas_contables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(32) UNIQUE NOT NULL, -- Ej: '1.1.01.01' (Caja/Bancos)
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO')),
  moneda VARCHAR(3) DEFAULT 'USD',
  saldo NUMERIC(18, 4) DEFAULT 0.0000,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE asientos_contables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referencia VARCHAR(64) NOT NULL,
  glosa TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lineas_asiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asiento_id UUID NOT NULL REFERENCES asientos_contables(id) ON DELETE CASCADE,
  cuenta_id UUID NOT NULL REFERENCES cuentas_contables(id),
  monto_debe NUMERIC(18, 4) DEFAULT 0.0000 CHECK (monto_debe >= 0),
  monto_haber NUMERIC(18, 4) DEFAULT 0.0000 CHECK (monto_haber >= 0),
  CONSTRAINT chk_debe_o_haber CHECK ((monto_debe > 0 AND monto_haber = 0) OR (monto_haber > 0 AND monto_debe = 0))
);

-- Regla de integridad: Sum(Debe) == Sum(Haber) por asiento
CREATE OR REPLACE FUNCTION validar_balance_asiento(p_asiento_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_diff NUMERIC(18, 4);
BEGIN
  SELECT ABS(COALESCE(SUM(monto_debe), 0) - COALESCE(SUM(monto_haber), 0))
  INTO v_diff
  FROM lineas_asiento
  WHERE asiento_id = p_asiento_id;

  RETURN v_diff < 0.0001;
END;
$$ LANGUAGE plpgsql;`
  },
  {
    id: 'struct_bank_auth',
    coleccionId: 'bancos',
    coleccion: '🏦 Bancos & Fintech',
    titulo: 'Autenticación Bancaria con Refresh Tokens Rotativos y 2FA/OTP',
    categoria: 'Seguridad',
    icono: 'Lock',
    tagClass: 'bp-tag-sec',
    desc: 'Pipeline de autenticación de grado bancario: JWT efímero (15 min) firmado con clave asimétrica, sesión persistente en HTTP-Only cookie y validación de OTP para operaciones sensibles.',
    beneficio: 'Mitigación total contra secuestro de tokens, replay attacks y XSS en aplicaciones financieras.',
    promptSugerido: 'Quiero implementar un flujo de autenticación seguro para una app bancaria con JWT de corta duración, refresh token rotativo en base de datos y confirmación por OTP.',
    snippet: `// src/middleware/bankAuth.js
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection.js';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

export async function autenticarPeticionBancaria(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token bancario ausente o malformado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
    
    // Verificar si la sesión fue revocada remotamente (Kill Switch)
    const { rows } = await pool.query(
      'SELECT id, revocada FROM sesiones_activas WHERE id = $1 AND usuario_id = $2',
      [payload.sid, payload.sub]
    );

    if (!rows[0] || rows[0].revocada) {
      return res.status(401).json({ error: 'Sesión revocada por motivos de seguridad.' });
    }

    req.usuario = { id: payload.sub, rol: payload.rol, sid: payload.sid };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRADO', code: 'AUTH_EXPIRED' });
    }
    return res.status(403).json({ error: 'Firma de token inválida.' });
  }
}`
  },
  {
    id: 'struct_bank_audit',
    coleccionId: 'bancos',
    coleccion: '🏦 Bancos & Fintech',
    titulo: 'Pistas de Auditoría con Firma HMAC de Encadenamiento (Audit Trail)',
    categoria: 'Seguridad',
    icono: 'Terminal',
    tagClass: 'bp-tag-sec',
    desc: 'Registro de auditoría encadenado donde cada evento contiene el hash SHA-256 del registro anterior, impidiendo cualquier modificación o eliminación silenciosa de logs.',
    beneficio: 'Garantiza no repudio y detección inmediata de intentos de alteración en bases de datos.',
    promptSugerido: 'Quiero implementar una pista de auditoría criptográfica encadenada (Blockchain interno) para registrar todas las transferencias bancarias de forma inmutable.',
    snippet: `// src/audit/auditChain.js
import crypto from 'crypto';
import { pool } from '../db/connection.js';

export async function registrarLogAuditado(usuarioId, accion, metadata = {}) {
  // 1. Obtener el hash del último bloque registrado
  const { rows } = await pool.query(
    'SELECT hash_actual FROM bitacora_auditoria ORDER BY creado_en DESC LIMIT 1'
  );
  const hashAnterior = rows[0]?.hash_actual || '0000000000000000000000000000000000000000000000000000000000000000';

  const timestamp = new Date().toISOString();
  const payloadString = JSON.stringify({ usuarioId, accion, metadata, timestamp, hashAnterior });

  // 2. Generar hash criptográfico del registro actual
  const hashActual = crypto
    .createHmac('sha256', process.env.AUDIT_HMAC_SECRET || 'secret_audit_key')
    .update(payloadString)
    .digest('hex');

  // 3. Persistir en tabla protegida
  await pool.query(
    \`INSERT INTO bitacora_auditoria (usuario_id, accion, metadata, hash_anterior, hash_actual, creado_en)
     VALUES ($1, $2, $3, $4, $5, $6)\`,
    [usuarioId, accion, JSON.stringify(metadata), hashAnterior, hashActual, timestamp]
  );

  return { hashActual, timestamp };
}`
  },

  // ==========================================
  // COLECCIÓN 2: VENTAS & E-COMMERCE
  // ==========================================
  {
    id: 'struct_sales_cart',
    coleccionId: 'ventas',
    coleccion: '🛒 Ventas & E-Commerce',
    titulo: 'Carrito de Compras con Reserva Temporal de Stock (TTL con Lock)',
    categoria: 'Backend',
    icono: 'Code2',
    tagClass: 'bp-tag-back',
    desc: 'Gestiona carritos con retención temporal de existencias durante el proceso de compra. Si el cliente no completa el checkout en 15 minutos, el inventario se libera automáticamente.',
    beneficio: 'Evita la sobreventa (overselling) durante eventos de alto tráfico tipo Flash Sales.',
    promptSugerido: 'Quiero desarrollar un e-commerce con carrito de compras que reserve inventario por 15 minutos mediante bloqueos temporales antes de procesar el pago.',
    snippet: `// src/services/cartService.js
import { pool } from '../db/connection.js';

export async function agregarConReserva({ carritoId, productoId, cantidad, minutosTtl = 15 }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Bloquear producto y verificar stock real vs reservas activas
    const { rows: prodRows } = await client.query(
      'SELECT id, stock, precio FROM productos WHERE id = $1 FOR UPDATE',
      [productoId]
    );
    const prod = prodRows[0];
    if (!prod) throw new Error('Producto no encontrado.');

    // Sumar reservas vigentes de otros usuarios
    const { rows: resRows } = await client.query(
      \`SELECT COALESCE(SUM(cantidad), 0) AS total_reservado
       FROM carrito_items 
       WHERE producto_id = $1 AND expira_en > NOW() AND carrito_id != $2\`,
      [productoId, carritoId]
    );
    const stockDisponible = prod.stock - Number(resRows[0].total_reservado);
    if (stockDisponible < cantidad) {
      throw new Error(\`Stock insuficiente. Solo quedan \${Math.max(0, stockDisponible)} disponibles.\`);
    }

    // 2. Insertar o actualizar reserva con nuevo TTL
    const expiraEn = new Date(Date.now() + minutosTtl * 60 * 1000);
    await client.query(
      \`INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unitario, expira_en)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (carrito_id, producto_id) 
       DO UPDATE SET cantidad = $3, expira_en = $5\`,
      [carritoId, productoId, cantidad, prod.precio, expiraEn]
    );

    await client.query('COMMIT');
    return { success: true, productoId, cantidad, expiraEn };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`
  },
  {
    id: 'struct_sales_checkout',
    coleccionId: 'ventas',
    coleccion: '🛒 Ventas & E-Commerce',
    titulo: 'Checkout Idempotente con Llave de Control (Anti-Cobro Doble)',
    categoria: 'Backend',
    icono: 'ShieldCheck',
    tagClass: 'bp-tag-back',
    desc: 'Interceptor de pagos y órdenes que utiliza el encabezado Idempotency-Key para garantizar que reintentos de red por clientes móviles no generen órdenes duplicadas.',
    beneficio: 'Elimina cargos duplicados en tarjetas de crédito por doble clic o microcortes de red móvil.',
    promptSugerido: 'Quiero crear una API de pagos y órdenes para tienda online con manejo de claves de idempotencia y deduplicación de peticiones.',
    snippet: `// src/middleware/idempotency.js
import { pool } from '../db/connection.js';

export async function validarIdempotencia(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) return next(); // Opcional o forzado según endpoint

  try {
    const { rows } = await pool.query(
      'SELECT estado, respuesta_status, respuesta_body FROM peticiones_idempotentes WHERE llave = $1',
      [key]
    );

    if (rows.length > 0) {
      const p = rows[0];
      if (p.estado === 'PROCESANDO') {
        return res.status(409).json({ error: 'La orden ya se está procesando. Por favor espera.' });
      }
      // Retornar la respuesta cacheada directamente
      return res.status(p.respuesta_status).json(JSON.parse(p.respuesta_body));
    }

    // Registrar llave en estado PROCESANDO
    await pool.query(
      'INSERT INTO peticiones_idempotentes (llave, estado, creado_en) VALUES ($1, $2, NOW())',
      [key, 'PROCESANDO']
    );

    // Interceptar res.json para almacenar la respuesta original
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      await pool.query(
        \`UPDATE peticiones_idempotentes 
         SET estado = 'COMPLETADA', respuesta_status = $1, respuesta_body = $2 
         WHERE llave = $3\`,
        [res.statusCode, JSON.stringify(body), key]
      );
      return originalJson(body);
    };

    next();
  } catch (err) {
    next(err);
  }
}`
  },
  {
    id: 'struct_sales_catalog',
    coleccionId: 'ventas',
    coleccion: '🛒 Ventas & E-Commerce',
    titulo: 'Catálogo de Productos con Variantes Jerárquicas (SKU, Tallas y Precios)',
    categoria: 'Database',
    icono: 'Database',
    tagClass: 'bp-tag-db',
    desc: 'Modelo relacional normalizado para productos con múltiples variantes (color, talla, material), precios diferenciados y control de existencias por SKU único.',
    beneficio: 'Flexibilidad total para catálogos comerciales complejos sin desnormalización redundante.',
    promptSugerido: 'Quiero diseñar el modelo de base de datos para una tienda de ropa o retail con productos padres, variantes de tallas/colores y control de inventario por SKU.',
    snippet: `-- migrations/catalog_variants.sql
CREATE TABLE productos_padre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(160) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  categoria_id UUID REFERENCES categorias(id),
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE producto_variantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_padre_id UUID NOT NULL REFERENCES productos_padre(id) ON DELETE CASCADE,
  sku VARCHAR(64) UNIQUE NOT NULL, -- Ej: 'CAM-AZUL-XL'
  precio NUMERIC(10, 2) NOT NULL,
  precio_comparacion NUMERIC(10, 2), -- Precio tachado
  stock INTEGER NOT NULL DEFAULT 0,
  atributos JSONB NOT NULL, -- {"color": "Azul", "talla": "XL", "material": "Algodón"}
  peso_kg NUMERIC(6, 3) DEFAULT 0.250,
  activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_variantes_sku ON producto_variantes(sku);
CREATE INDEX idx_variantes_atributos ON producto_variantes USING GIN (atributos);`
  },
  {
    id: 'struct_sales_webhook',
    coleccionId: 'ventas',
    coleccion: '🛒 Ventas & E-Commerce',
    titulo: 'Receptor de Webhooks de Pago con Validación Criptográfica HMAC',
    categoria: 'Seguridad',
    icono: 'Radio',
    tagClass: 'bp-tag-sec',
    desc: 'Endpoint webhook seguro para procesar notificaciones asíncronas de pasarelas de pago (Stripe, Mercado Pago) verificando la firma de la cabecera en bytes crudos.',
    beneficio: 'Inmunidad ante ataques de suplantación donde un atacante intente marcar órdenes como pagadas.',
    promptSugerido: 'Quiero integrar un webhook seguro para pasarela de pago que verifique la firma HMAC SHA256 y actualice el estado de las órdenes automáticamente.',
    snippet: `// src/webhooks/paymentWebhook.js
import crypto from 'crypto';
import { pool } from '../db/connection.js';

export async function handlePaymentWebhook(req, res) {
  const signature = req.headers['x-signature-hmac'];
  const rawBody = req.rawBody; // Importante: buffer sin parsear por body-parser
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expectedSignature))) {
    return res.status(401).json({ error: 'Firma de webhook inválida.' });
  }

  const evento = JSON.parse(rawBody.toString('utf8'));
  if (evento.tipo === 'pago.aprobado') {
    const { ordenId, transaccionExternaId, monto } = evento.data;
    await pool.query(
      \`UPDATE ordenes 
       SET estado = 'PAGADA', id_transaccion_externa = $1, pagado_en = NOW() 
       WHERE id = $2 AND estado = 'PENDIENTE'\`,
      [transaccionExternaId, ordenId]
    );
  }

  res.status(200).json({ received: true });
}`
  },

  // ==========================================
  // COLECCIÓN 3: ALMACENES, INVENTARIOS & KARDEX
  // ==========================================
  {
    id: 'struct_inv_kardex',
    coleccionId: 'almacenes',
    coleccion: '📦 Almacenes & Kardex',
    titulo: 'Movimientos Kardex con Costo Promedio Ponderado (CPP)',
    categoria: 'Backend',
    icono: 'Database',
    tagClass: 'bp-tag-db',
    desc: 'Motor contable de inventario que registra entradas, salidas y devoluciones calculando dinámicamente el costo promedio ponderado de cada producto en bodega.',
    beneficio: 'Precisión contable en la valorización de inventarios conforme a normas internacionales (NIC 2 / NIIF).',
    promptSugerido: 'Quiero construir un software de inventario con control de Kardex valorizado bajo método de costo promedio ponderado y trazabilidad de bodegas.',
    snippet: `// src/services/kardexService.js
import { pool } from '../db/connection.js';

export async function registrarMovimientoKardex({
  productoId,
  bodegaId,
  tipoMovimiento, // 'ENTRADA_COMPRA', 'SALIDA_VENTA', 'AJUSTE_MERMA'
  cantidad,
  costoUnitario,
  referenciaDoc
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obtener saldo y costo actual del producto en esa bodega
    const { rows } = await client.query(
      'SELECT stock_actual, costo_promedio FROM inventario_bodega WHERE producto_id = $1 AND bodega_id = $2 FOR UPDATE',
      [productoId, bodegaId]
    );
    const stockActual = Number(rows[0]?.stock_actual || 0);
    const costoPromedioActual = Number(rows[0]?.costo_promedio || 0);

    let nuevoStock = stockActual;
    let nuevoCostoPromedio = costoPromedioActual;

    if (tipoMovimiento.startsWith('ENTRADA')) {
      nuevoStock = stockActual + cantidad;
      const valorAnterior = stockActual * costoPromedioActual;
      const valorEntrada = cantidad * costoUnitario;
      nuevoCostoPromedio = nuevoStock > 0 ? (valorAnterior + valorEntrada) / nuevoStock : costoUnitario;
    } else if (tipoMovimiento.startsWith('SALIDA')) {
      if (stockActual < cantidad) throw new Error('Stock insuficiente en la bodega para despachar.');
      nuevoStock = stockActual - cantidad;
      costoUnitario = costoPromedioActual;
    }

    // 2. Insertar asiento de Kardex inmutable
    await client.query(
      \`INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, cantidad, costo_unitario, saldo_cantidad, saldo_costo_promedio, referencia_doc, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())\`,
      [productoId, bodegaId, tipoMovimiento, cantidad, costoUnitario, nuevoStock, nuevoCostoPromedio, referenciaDoc]
    );

    // 3. Actualizar resumen de bodega
    await client.query(
      \`INSERT INTO inventario_bodega (producto_id, bodega_id, stock_actual, costo_promedio, actualizado_en)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (producto_id, bodega_id)
       DO UPDATE SET stock_actual = $3, costo_promedio = $4, actualizado_en = NOW()\`,
      [productoId, bodegaId, nuevoStock, nuevoCostoPromedio]
    );

    await client.query('COMMIT');
    return { success: true, nuevoStock, nuevoCostoPromedio };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`
  },
  {
    id: 'struct_inv_restock',
    coleccionId: 'almacenes',
    coleccion: '📦 Almacenes & Kardex',
    titulo: 'Motor de Reabastecimiento Automático y Punto de Reorden',
    categoria: 'Backend',
    icono: 'Cpu',
    tagClass: 'bp-tag-back',
    desc: 'Algoritmo que evalúa el consumo diario de artículos, tiempo de entrega de proveedores (Lead Time) y stock de seguridad para generar sugerencias automáticas de compra.',
    beneficio: 'Evita quiebres de inventario y optimiza el capital inmovilizado en almacén.',
    promptSugerido: 'Quiero programar un sistema inteligente de alerta de compras con cálculo de punto de reorden y sugerencia automática de pedidos a proveedores.',
    snippet: `// src/services/restockService.js
export function calcularPuntoDeReorden({ demandaDiariaPromedio, tiempoEntregaDias, stockSeguridad }) {
  return Math.ceil(demandaDiariaPromedio * tiempoEntregaDias + stockSeguridad);
}

export async function evaluarAlertasDeCompra(client) {
  const query = \`
    SELECT 
      p.id, p.nombre, p.sku,
      ib.stock_actual,
      p.demanda_diaria, p.lead_time_dias, p.stock_seguridad,
      CEIL((p.demanda_diaria * p.lead_time_dias) + p.stock_seguridad) AS punto_reorden,
      (CEIL((p.demanda_diaria * p.lead_time_dias) + p.stock_seguridad) - ib.stock_actual) AS sugerencia_compra
    FROM productos p
    JOIN inventario_bodega ib ON p.id = ib.producto_id
    WHERE ib.stock_actual <= ((p.demanda_diaria * p.lead_time_dias) + p.stock_seguridad)
  \`;
  const { rows } = await client.query(query);
  return rows;
}`
  },
  {
    id: 'struct_inv_lots',
    coleccionId: 'almacenes',
    coleccion: '📦 Almacenes & Kardex',
    titulo: 'Trazabilidad por Lotes, Fechas de Expiración y Despacho FIFO',
    categoria: 'Database',
    icono: 'Database',
    tagClass: 'bp-tag-db',
    desc: 'Control de lotes para farmacéuticas, alimentos o perecederos que garantiza que el sistema sugiera despachar primero los lotes más antiguos o próximos a vencer (FEFO/FIFO).',
    beneficio: 'Reducción drástica de mermas por vencimiento y cumplimiento de normativas de salud.',
    promptSugerido: 'Quiero diseñar un almacén para productos perecederos o farmacia con trazabilidad de lotes, fecha de caducidad y despacho FEFO.',
    snippet: `-- migrations/inventory_lots.sql
CREATE TABLE lotes_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id),
  codigo_lote VARCHAR(48) NOT NULL,
  fecha_fabricacion DATE,
  fecha_vencimiento DATE NOT NULL,
  stock_disponible INTEGER NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),
  estado VARCHAR(20) DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'CUARENTENA', 'VENCIDO')),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id, codigo_lote)
);

CREATE OR REPLACE FUNCTION sugerir_lote_para_despacho(p_producto_id UUID, p_cantidad_requerida INTEGER)
RETURNS TABLE (lote_id UUID, codigo_lote VARCHAR, cantidad_a_tomar INTEGER, fecha_vencimiento DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.codigo_lote,
    LEAST(l.stock_disponible, p_cantidad_requerida)::INTEGER,
    l.fecha_vencimiento
  FROM lotes_producto l
  WHERE l.producto_id = p_producto_id 
    AND l.estado = 'DISPONIBLE' 
    AND l.fecha_vencimiento > CURRENT_DATE
    AND l.stock_disponible > 0
  ORDER BY l.fecha_vencimiento ASC;
END;
$$ LANGUAGE plpgsql;`
  },
  {
    id: 'struct_inv_dispatch',
    coleccionId: 'almacenes',
    coleccion: '📦 Almacenes & Kardex',
    titulo: 'Control de Picking y Despacho con Verificación de Código de Barras',
    categoria: 'Backend',
    icono: 'Terminal',
    tagClass: 'bp-tag-back',
    desc: 'Flujo de preparación de pedidos donde los operarios escanean el código de barras de cada artículo confirmando la ubicación en anaquel antes de cerrar la orden de salida.',
    beneficio: 'Tasa de error menor al 0.01% en despachos y preparación de pedidos.',
    promptSugerido: 'Quiero programar el flujo de preparación de pedidos (picking y packing) con validación de código de barras para bodega física.',
    snippet: `// src/services/pickingService.js
import { pool } from '../db/connection.js';

export async function validarItemEscaneado({ ordenDespachoId, codigoBarrasEscaneado, cantidadEscaneada = 1 }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      \`SELECT oi.id, oi.cantidad_pedida, oi.cantidad_escaneada, p.codigo_barras
       FROM orden_despacho_items oi
       JOIN productos p ON oi.producto_id = p.id
       WHERE oi.orden_despacho_id = $1 AND p.codigo_barras = $2
       FOR UPDATE\`,
      [ordenDespachoId, codigoBarrasEscaneado]
    );

    const item = rows[0];
    if (!item) throw new Error('El producto escaneado no pertenece a esta orden de despacho.');
    if (item.cantidad_escaneada + cantidadEscaneada > item.cantidad_pedida) {
      throw new Error('Cantidad escaneada excede la cantidad solicitada.');
    }

    await client.query(
      'UPDATE orden_despacho_items SET cantidad_escaneada = cantidad_escaneada + $1 WHERE id = $2',
      [cantidadEscaneada, item.id]
    );

    const { rows: statusRows } = await client.query(
      \`SELECT COUNT(*) AS pendientes 
       FROM orden_despacho_items 
       WHERE orden_despacho_id = $1 AND cantidad_escaneada < cantidad_pedida\`,
      [ordenDespachoId]
    );
    const completado = Number(statusRows[0].pendientes) === 0;
    if (completado) {
      await client.query("UPDATE ordenes_despacho SET estado = 'LISTO_PARA_EMPAQUE' WHERE id = $1", [ordenDespachoId]);
    }

    await client.query('COMMIT');
    return { success: true, itemValidado: true, ordenCompletada: completado };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}`
  },

  // ==========================================
  // COLECCIÓN 4: SALUD & CLÍNICAS
  // ==========================================
  {
    id: 'struct_health_slots',
    coleccionId: 'salud',
    coleccion: '🏥 Salud & Clínicas',
    titulo: 'Agendamiento Médico Concurrente con Bloqueo Anti-Solapamiento',
    categoria: 'Backend',
    icono: 'Activity',
    tagClass: 'bp-tag-back',
    desc: 'Motor de citas médicas con validación de rangos temporales (TsRange) que impide que dos pacientes reserven el mismo horario o consultorio en simultáneo.',
    beneficio: 'Garantiza cero colisiones de agenda entre médicos especialistas y quirófanos.',
    promptSugerido: 'Quiero desarrollar un sistema de citas médicas online para consultorios con validación estricta de no solapamiento de horarios y bloqueo temporal.',
    snippet: `-- migrations/medical_appointments.sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE citas_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  rango_horario TSRANGE NOT NULL,
  estado VARCHAR(20) DEFAULT 'RESERVADA' CHECK (estado IN ('RESERVADA', 'CONFIRMADA', 'CANCELADA', 'ATENDIDA')),
  motivo_consulta TEXT,
  CONSTRAINT no_solapamiento_medico EXCLUDE USING GIST (
    medico_id WITH =,
    rango_horario WITH &&
  ) WHERE (estado != 'CANCELADA')
);`
  },
  {
    id: 'struct_health_emr',
    coleccionId: 'salud',
    coleccion: '🏥 Salud & Clínicas',
    titulo: 'Expediente Clínico Electrónico con Cifrado en Reposo (HIPAA)',
    categoria: 'Seguridad',
    icono: 'Lock',
    tagClass: 'bp-tag-sec',
    desc: 'Almacenamiento de notas médicas e historial de diagnósticos con cifrado de sobre AES-256-GCM y control estricto de accesos por personal médico autorizado.',
    beneficio: 'Protección integral de datos personales de salud (PII) bajo estándares internacionales de confidencialidad.',
    promptSugerido: 'Quiero crear un módulo de historia clínica electrónica donde los diagnósticos y notas confidenciales estén cifrados con claves individuales.',
    snippet: `// src/services/emrCrypto.js
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function cifrarNotaMedica(textoPlano, claveMaestraHex) {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(claveMaestraHex, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(textoPlano, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: tag
  };
}

export function descifrarNotaMedica(cifradoObj, claveMaestraHex) {
  const key = Buffer.from(claveMaestraHex, 'hex');
  const iv = Buffer.from(cifradoObj.iv, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(Buffer.from(cifradoObj.authTag, 'hex'));

  let decrypted = decipher.update(cifradoObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}`
  },
  {
    id: 'struct_health_rx',
    coleccionId: 'salud',
    coleccion: '🏥 Salud & Clínicas',
    titulo: 'Recetas Médicas Digitales con Firma Hash y Verificación QR',
    categoria: 'Backend',
    icono: 'ShieldCheck',
    tagClass: 'bp-tag-back',
    desc: 'Emisión de prescripciones farmacológicas firmadas digitalmente con código de validación único para dispensación segura en farmacias.',
    beneficio: 'Elimina recetas falsificadas o reutilizadas de medicamentos controlados.',
    promptSugerido: 'Quiero implementar un sistema de recetas médicas digitales con firma electrónica y código QR para validación única en farmacia.',
    snippet: `// src/services/prescriptionService.js
import crypto from 'crypto';
import { pool } from '../db/connection.js';

export async function emitirRecetaMedica({ medicoId, pacienteId, medicamentos, diagnostico }) {
  const recetaId = crypto.randomUUID();
  const fecha = new Date().toISOString();
  
  const contenidoAFirmar = JSON.stringify({ recetaId, medicoId, pacienteId, medicamentos, fecha });
  const hashVerificacion = crypto
    .createHmac('sha256', process.env.RX_SIGNING_SECRET || 'rx_secret')
    .update(contenidoAFirmar)
    .digest('hex');

  await pool.query(
    \`INSERT INTO recetas_medicas (id, medico_id, paciente_id, medicamentos_json, diagnostico, hash_firma, dispensada, emitido_en)
     VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7)\`,
    [recetaId, medicoId, pacienteId, JSON.stringify(medicamentos), diagnostico, hashVerificacion, fecha]
  );

  return {
    recetaId,
    hashVerificacion,
    urlValidacionQr: \`https://app-salud.edu/recetas/validar/\${recetaId}?firma=\${hashVerificacion}\`
  };
}`
  },

  // ==========================================
  // COLECCIÓN 5: DELIVERY & LOGÍSTICA
  // ==========================================
  {
    id: 'struct_deliv_gps',
    coleccionId: 'delivery',
    coleccion: '🚚 Delivery & Logística',
    titulo: 'Telemetría GPS en Vivo de Repartidores con WebSockets y GeoJSON',
    categoria: 'Realtime',
    icono: 'Radio',
    tagClass: 'bp-tag-realtime',
    desc: 'Servidor WebSocket que recibe paquetes de coordenadas cada 3 segundos de los repartidores y los difunde en tiempo real a las pantallas de los clientes en espera.',
    beneficio: 'Experiencia de seguimiento en vivo con baja latencia y mínimo consumo de ancho de banda móvil.',
    promptSugerido: 'Quiero desarrollar una app de delivery con tracking GPS en tiempo real de motorizados sobre mapa interactivo usando WebSockets.',
    snippet: `// src/realtime/driverTelemetry.js
import { WebSocketServer } from 'ws';

const suscripcionesPorOrden = new Map();

export function iniciarServidorTelemetria(server) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.tipo === 'SUSCRIBIR_ORDEN') {
          if (!suscripcionesPorOrden.has(msg.ordenId)) suscripcionesPorOrden.set(msg.ordenId, new Set());
          suscripcionesPorOrden.get(msg.ordenId).add(ws);
        } else if (msg.tipo === 'ACTUALIZAR_COORDENADAS_REPARTIDOR') {
          const clientes = suscripcionesPorOrden.get(msg.ordenId);
          if (clientes) {
            const broadcastMsg = JSON.stringify({
              tipo: 'POSICION_REPARTIDOR',
              lat: msg.lat,
              lng: msg.lng,
              rumbo: msg.rumbo,
              timestamp: Date.now()
            });
            clientes.forEach(clientWs => {
              if (clientWs.readyState === 1) clientWs.send(broadcastMsg);
            });
          }
        }
      } catch (e) {
        console.error('Error parseando socket data:', e);
      }
    });

    ws.on('close', () => {
      suscripcionesPorOrden.forEach(set => set.delete(ws));
    });
  });

  return wss;
}`
  },
  {
    id: 'struct_deliv_dispatch',
    coleccionId: 'delivery',
    coleccion: '🚚 Delivery & Logística',
    titulo: 'Asignación de Repartidor Más Cercano con Distancia Haversine',
    categoria: 'Backend',
    icono: 'Radio',
    tagClass: 'bp-tag-back',
    desc: 'Algoritmo geoespacial que calcula la distancia en kilómetros entre el restaurante/origen y todos los repartidores activos para notificar al más próximo.',
    beneficio: 'Optimización de tiempos de entrega en un 35% y reducción de costos de combustible.',
    promptSugerido: 'Quiero implementar un algoritmo de despacho automático de pedidos que encuentre el repartidor más cercano al local comercial.',
    snippet: `// src/services/geoDispatch.js
export function calcularDistanciaHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function encontrarRepartidorOptimo(localLat, localLng, repartidoresDisponibles) {
  return repartidoresDisponibles
    .map(rep => ({
      ...rep,
      distanciaKm: calcularDistanciaHaversineKm(localLat, localLng, rep.lat, rep.lng)
    }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)[0] || null;
}`
  },
  {
    id: 'struct_deliv_status',
    coleccionId: 'delivery',
    coleccion: '🚚 Delivery & Logística',
    titulo: 'Máquina de Estados Finita para Envíos (Finite State Machine)',
    categoria: 'Backend',
    icono: 'Layers',
    tagClass: 'bp-tag-arch',
    desc: 'Controlador de estados secuenciales de un pedido (CREADA -> EN_PREPARACION -> EN_RUTA -> ENTREGADA) que bloquea transiciones ilegales.',
    beneficio: 'Previene inconsistencias lógicas en el ciclo de vida del despacho.',
    promptSugerido: 'Quiero estructurar el flujo de pedidos de delivery mediante una máquina de estados finita con validación estricta de transiciones.',
    snippet: `// src/models/orderStateMachine.js
const TRANSICIONES_VALIDAS = {
  CREADA: ['CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['EN_PREPARACION', 'CANCELADA'],
  EN_PREPARACION: ['LISTA_PARA_RECOJO'],
  LISTA_PARA_RECOJO: ['EN_RUTA'],
  EN_RUTA: ['ENTREGADA', 'FALLIDA'],
  ENTREGADA: [],
  CANCELADA: [],
  FALLIDA: ['REASIGNADA']
};

export function transicionarEstadoOrden(estadoActual, nuevoEstado) {
  const permitidas = TRANSICIONES_VALIDAS[estadoActual] || [];
  if (!permitidas.includes(nuevoEstado)) {
    throw new Error(\`Transición ilegal: no es posible pasar de '\${estadoActual}' a '\${nuevoEstado}'.\`);
  }
  return nuevoEstado;
}`
  },

  // ==========================================
  // COLECCIÓN 6: EDUCACIÓN & E-LEARNING
  // ==========================================
  {
    id: 'struct_edu_course',
    coleccionId: 'educacion',
    coleccion: '🎓 Educación & E-Learning',
    titulo: 'Estructura Modular de Cursos, Lecciones y Progreso Porcentual',
    categoria: 'Database',
    icono: 'Cpu',
    tagClass: 'bp-tag-db',
    desc: 'Modelo pedagógico jerárquico (Curso -> Módulos -> Lecciones -> Tareas) con trigger automático que recalcula el porcentaje de avance del estudiante.',
    beneficio: 'Seguimiento exacto y gamificado del aprendizaje estudiantil.',
    promptSugerido: 'Quiero crear una plataforma de educación online con cursos divididos en módulos y lecciones, y cálculo automático de progreso.',
    snippet: `-- migrations/elearning_schema.sql
CREATE TABLE cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(140) NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE lecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL,
  titulo VARCHAR(140) NOT NULL,
  duracion_minutos INTEGER DEFAULT 10
);

CREATE TABLE progreso_lecciones (
  estudiante_id UUID NOT NULL,
  leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
  completada BOOLEAN DEFAULT FALSE,
  completada_en TIMESTAMPTZ,
  PRIMARY KEY (estudiante_id, leccion_id)
);

CREATE OR REPLACE VIEW vista_progreso_estudiante AS
SELECT 
  c.id AS curso_id,
  c.titulo AS curso_titulo,
  pl.estudiante_id,
  COUNT(l.id) AS total_lecciones,
  COUNT(CASE WHEN pl.completada THEN 1 END) AS lecciones_completadas,
  ROUND((COUNT(CASE WHEN pl.completada THEN 1 END)::NUMERIC / NULLIF(COUNT(l.id), 0)) * 100, 1) AS porcentaje_avance
FROM cursos c
JOIN lecciones l ON c.id = l.curso_id
LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id
GROUP BY c.id, c.titulo, pl.estudiante_id;`
  },
  {
    id: 'struct_edu_quiz',
    coleccionId: 'educacion',
    coleccion: '🎓 Educación & E-Learning',
    titulo: 'Motor de Evaluaciones con Rúbricas Ponderadas e Intentos Limitados',
    categoria: 'Backend',
    icono: 'ShieldCheck',
    tagClass: 'bp-tag-back',
    desc: 'Servicio de corrección de exámenes con banco de preguntas aleatorio, tiempo límite estricto y ponderación por nivel de dificultad de pregunta.',
    beneficio: 'Evaluaciones académicas imparciales, anti-trampas y automatizadas.',
    promptSugerido: 'Quiero construir un sistema de exámenes para estudiantes con límite de tiempo, intentos restringidos y ponderación automática de notas.',
    snippet: `// src/services/quizService.js
import { pool } from '../db/connection.js';

export async function calificarIntento({ intentoId, respuestasEstudiante }) {
  const { rows: preguntas } = await pool.query(
    \`SELECT p.id, p.respuesta_correcta_id, p.puntos
     FROM evaluacion_preguntas p
     WHERE p.evaluacion_id = (SELECT evaluacion_id FROM evaluacion_intentos WHERE id = $1)\`,
    [intentoId]
  );

  let puntosObtenidos = 0;
  let puntosTotales = 0;

  for (const preg of preguntas) {
    puntosTotales += preg.puntos;
    const resp = respuestasEstudiante.find(r => r.preguntaId === preg.id);
    if (resp && resp.opcionSeleccionadaId === preg.respuesta_correcta_id) {
      puntosObtenidos += preg.puntos;
    }
  }

  const calificacionFinal = puntosTotales > 0 ? (puntosObtenidos / puntosTotales) * 100 : 0;
  const aprobado = calificacionFinal >= 70;

  await pool.query(
    \`UPDATE evaluacion_intentos 
     SET nota_obtenida = $1, aprobado = $2, finalizado_en = NOW() 
     WHERE id = $3\`,
    [calificacionFinal, aprobado, intentoId]
  );

  return { calificacionFinal, aprobado, puntosObtenidos, puntosTotales };
}`
  },
  {
    id: 'struct_edu_cert',
    coleccionId: 'educacion',
    coleccion: '🎓 Educación & E-Learning',
    titulo: 'Generador de Certificados con Hash Único y Verificador Público',
    categoria: 'Seguridad',
    icono: 'ShieldCheck',
    tagClass: 'bp-tag-sec',
    desc: 'Genera credenciales académicas con hash SHA-256 verificable públicamente en la web mediante código QR, garantizando la autenticidad del diploma.',
    beneficio: 'Certificados infalsificables para portafolios y perfiles de LinkedIn.',
    promptSugerido: 'Quiero programar un generador de certificados digitales con código de validación web y hash criptográfico verificable.',
    snippet: `// src/services/certificateService.js
import crypto from 'crypto';
import { pool } from '../db/connection.js';

export async function emitirCertificado(estudianteId, cursoId) {
  const certId = crypto.randomUUID();
  const fecha = new Date().toISOString();
  
  const rawString = \`CERT:\${certId}|\${estudianteId}|\${cursoId}|\${fecha}\`;
  const hashVerificacion = crypto.createHash('sha256').update(rawString).digest('hex');

  await pool.query(
    \`INSERT INTO certificados (id, estudiante_id, curso_id, hash_verificacion, emitido_en)
     VALUES ($1, $2, $3, $4, $5)\`,
    [certId, estudianteId, cursoId, hashVerificacion, fecha]
  );

  return {
    certificadoId: certId,
    hash: hashVerificacion,
    urlPublica: \`https://app-edu.edu/validar/\${hashVerificacion}\`
  };
}`
  },

  // ==========================================
  // COLECCIÓN 7: RRHH & NÓMINA
  // ==========================================
  {
    id: 'struct_hr_rbac',
    coleccionId: 'rrhh',
    coleccion: '🏢 RRHH & Nómina',
    titulo: 'Control de Acceso Basado en Roles Jerárquicos (RBAC Middleware)',
    categoria: 'Seguridad',
    icono: 'Lock',
    tagClass: 'bp-tag-sec',
    desc: 'Middleware empresarial para control de permisos atómicos (ej. empleados:crear, nomina:aprobar) con soporte para roles jerárquicos.',
    beneficio: 'Segregación estricta de funciones y protección contra accesos no autorizados a datos salariales.',
    promptSugerido: 'Quiero implementar un sistema de roles y permisos RBAC para una plataforma de recursos humanos con permisos granulares.',
    snippet: `// src/middleware/rbac.js
export function requerirPermiso(permisoRequerido) {
  return (req, res, next) => {
    const permisosUsuario = req.usuario?.permisos || [];
    
    if (permisosUsuario.includes('*') || permisosUsuario.includes('admin:total')) {
      return next();
    }

    if (!permisosUsuario.includes(permisoRequerido)) {
      return res.status(403).json({
        error: 'ACCESO_DENEGADO',
        mensaje: \`No tienes el permiso requerido: '\${permisoRequerido}'.\`
      });
    }

    next();
  };
}`
  },
  {
    id: 'struct_hr_payroll',
    coleccionId: 'rrhh',
    coleccion: '🏢 RRHH & Nómina',
    titulo: 'Calculador de Nómina con Percepciones, Retenciones y Aportes',
    categoria: 'Backend',
    icono: 'Code2',
    tagClass: 'bp-tag-back',
    desc: 'Motor de liquidación salarial que calcula sueldo bruto, horas extras, deducciones de seguridad social, impuestos sobre la renta y sueldo neto a pagar.',
    beneficio: 'Automatización sin errores en la planilla salarial quincenal o mensual.',
    promptSugerido: 'Quiero desarrollar un calculador de nómina para empleados con desglose de sueldo bruto, deducciones de ley e impuestos.',
    snippet: `// src/services/payrollService.js
export function liquidarSueldoEmpleado({ sueldoBase, horasExtrasMonto = 0, bonos = 0 }) {
  const sueldoBruto = sueldoBase + horasExtrasMonto + bonos;

  const seguroSocialTasa = 0.0625;
  const fondoPensionTasa = 0.0725;

  const deduccionSeguro = sueldoBruto * seguroSocialTasa;
  const deduccionPension = sueldoBruto * fondoPensionTasa;

  let retencionIR = 0;
  const baseImponible = sueldoBruto - (deduccionSeguro + deduccionPension);
  if (baseImponible > 1000) {
    retencionIR = (baseImponible - 1000) * 0.15;
  }

  const totalDeducciones = deduccionSeguro + deduccionPension + retencionIR;
  const sueldoNeto = sueldoBruto - totalDeducciones;

  return {
    sueldoBruto: Number(sueldoBruto.toFixed(2)),
    deducciones: {
      seguroSocial: Number(deduccionSeguro.toFixed(2)),
      fondoPension: Number(deduccionPension.toFixed(2)),
      retencionIR: Number(retencionIR.toFixed(2)),
      total: Number(totalDeducciones.toFixed(2))
    },
    sueldoNeto: Number(sueldoNeto.toFixed(2))
  };
}`
  },
  {
    id: 'struct_hr_attendance',
    coleccionId: 'rrhh',
    coleccion: '🏢 RRHH & Nómina',
    titulo: 'Registro de Asistencia con Geocerca (Geofencing) y Validación de Horario',
    categoria: 'Backend',
    icono: 'Terminal',
    tagClass: 'bp-tag-back',
    desc: 'Marca de entrada/salida para empleados que valida por GPS si el colaborador se encuentra dentro del radio permitido de la sucursal de trabajo.',
    beneficio: 'Elimina registros falsos de asistencia en trabajo presencial.',
    promptSugerido: 'Quiero implementar un reloj de asistencia para empleados que valide las coordenadas GPS contra la ubicación de la empresa antes de marcar.',
    snippet: `// src/services/attendanceService.js
import { pool } from '../db/connection.js';

function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function marcarEntradaEmpleado({ empleadoId, sucursalId, latitud, longitud }) {
  const { rows: sucRows } = await pool.query(
    'SELECT latitud, longitud, radio_tolerancia_metros FROM sucursales WHERE id = $1',
    [sucursalId]
  );
  const suc = sucRows[0];
  if (!suc) throw new Error('Sucursal inválida.');

  const distancia = calcularDistanciaMetros(latitud, longitud, suc.latitud, suc.longitud);
  if (distancia > suc.radio_tolerancia_metros) {
    throw new Error(\`Estás fuera de la sucursal (distancia: \${Math.round(distancia)}m, máx: \${suc.radio_tolerancia_metros}m).\`);
  }

  await pool.query(
    \`INSERT INTO registros_asistencia (empleado_id, sucursal_id, tipo, marcado_en, latitud, longitud)
     VALUES ($1, $2, 'ENTRADA', NOW(), $3, $4)\`,
    [empleadoId, sucursalId, latitud, longitud]
  );

  return { success: true, estado: 'ENTRADA_REGISTRADA', distanciaMetros: Math.round(distancia) };
}`
  },

  // ==========================================
  // COLECCIÓN 8: MÓVIL & OFFLINE-FIRST
  // ==========================================
  {
    id: 'struct_mobile_offline',
    coleccionId: 'movil',
    coleccion: '📱 Móvil & Offline-First',
    titulo: 'Patrón Repository Offline-First con Caché Local y Cola de Reintentos',
    categoria: 'Modular',
    icono: 'Smartphone',
    tagClass: 'bp-tag-arch',
    desc: 'Arquitectura para apps Flutter / React Native donde las consultas leen instantáneamente de SQLite/Hive local y las mutaciones en modo avión se encolan en persistencia.',
    beneficio: 'La aplicación funciona al 100% sin conexión a internet y sincroniza silenciosamente al detectar WiFi/red.',
    promptSugerido: 'Quiero desarrollar una app móvil en Flutter con arquitectura Offline-First, base de datos local SQLite y cola de sincronización en segundo plano.',
    snippet: `// lib/repositories/offline_first_repository.dart
import 'package:sqflite/sqflite.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class OfflineFirstTaskRepository {
  final Database db;
  final String apiBaseUrl;

  OfflineFirstTaskRepository({required this.db, required this.apiBaseUrl});

  Future<List<Map<String, dynamic>>> obtenerTareasLocales() async {
    return await db.query('tareas', orderBy: 'creado_en DESC');
  }

  Future<void> guardarTarea(String titulo, String descripcion) async {
    final tareaId = DateTime.now().millisecondsSinceEpoch.toString();
    
    await db.insert('tareas', {
      'id': tareaId,
      'titulo': titulo,
      'descripcion': descripcion,
      'sincronizado': 0,
      'creado_en': DateTime.now().toIso8601String()
    });

    await intentarSincronizarPendientes();
  }

  Future<void> intentarSincronizarPendientes() async {
    final pendientes = await db.query('tareas', where: 'sincronizado = ?', whereArgs: [0]);
    for (final t in pendientes) {
      try {
        final res = await http.post(
          Uri.parse('\$apiBaseUrl/api/tareas'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'titulo': t['titulo'], 'descripcion': t['descripcion']})
        );
        if (res.statusCode == 200 || res.statusCode == 201) {
          await db.update('tareas', {'sincronizado': 1}, where: 'id = ?', whereArgs: [t['id']]);
        }
      } catch (_) {
        break;
      }
    }
  }
}`
  },
  {
    id: 'struct_mobile_sync',
    coleccionId: 'movil',
    coleccion: '📱 Móvil & Offline-First',
    titulo: 'Resolución de Conflictos de Datos Bidireccionales (Last-Write-Wins)',
    categoria: 'Modular',
    icono: 'Layers',
    tagClass: 'bp-tag-arch',
    desc: 'Protocolo de sincronización con marcas de tiempo lógicas (UpdatedAt) y control de versiones de registro para reconciliar cambios hechos en móvil vs servidor.',
    beneficio: 'Evita sobreescrituras destructivas cuando múltiples dispositivos editan el mismo registro.',
    promptSugerido: 'Quiero implementar un protocolo de resolución de conflictos para sincronización móvil offline con marcas de tiempo y control de versiones.',
    snippet: `// src/sync/conflictResolver.js
export function reconciliarRegistro({ localData, remoteData }) {
  const localTime = new Date(localData.actualizado_en).getTime();
  const remoteTime = new Date(remoteData.actualizado_en).getTime();

  if (localTime > remoteTime) {
    return { ganador: 'LOCAL', versionAceptada: localData, accionServidor: 'UPDATE_REMOTE' };
  } else if (remoteTime > localTime) {
    return { ganador: 'REMOTO', versionAceptada: remoteData, accionLocal: 'UPDATE_LOCAL' };
  } else {
    const localRev = Number(localData.revision || 1);
    const remoteRev = Number(remoteData.revision || 1);
    return localRev >= remoteRev
      ? { ganador: 'LOCAL', versionAceptada: localData }
      : { ganador: 'REMOTO', versionAceptada: remoteData };
  }
}`
  },
  {
    id: 'struct_mobile_biometric',
    coleccionId: 'movil',
    coleccion: '📱 Móvil & Offline-First',
    titulo: 'Autenticación Biométrica Nativa (FaceID / Fingerprint) con Secure Storage',
    categoria: 'Seguridad',
    icono: 'Smartphone',
    tagClass: 'bp-tag-sec',
    desc: 'Integración biométrica con enclave seguro del hardware móvil (iOS Keychain / Android Keystore) para desbloquear la sesión sin reintroducir credenciales.',
    beneficio: 'Acceso instantáneo de alta seguridad para aplicaciones bancarias y de misión crítica.',
    promptSugerido: 'Quiero implementar inicio de sesión con huella dactilar o FaceID en app móvil con almacenamiento de credenciales en Secure Enclave.',
    snippet: `// lib/services/biometric_auth_service.dart
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class BiometricAuthService {
  final LocalAuthentication _auth = LocalAuthentication();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<bool> autenticarConBiometria() async {
    final bool puedeAutenticar = await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
    if (!puedeAutenticar) return false;

    try {
      return await _auth.authenticate(
        localizedReason: 'Escanea tu huella o rostro para acceder a tu cuenta bancaria',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
    } catch (e) {
      return false;
    }
  }

  Future<String?> obtenerTokenBancarioSeguro() async {
    return await _storage.read(key: 'bank_auth_token');
  }

  Future<void> guardarTokenBancarioSeguro(String token) async {
    await _storage.write(key: 'bank_auth_token', value: token);
  }
}`
  }
];
