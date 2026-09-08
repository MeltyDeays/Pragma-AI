import { useState, useMemo } from 'react';
import { 
  Search, Copy, Check, Sparkles, BookOpen, 
  Layers, Database, Code2, ShieldCheck, Cpu, Radio, Smartphone, Lock, Activity, Terminal, FolderGit2
} from 'lucide-react';
import { COLECCIONES_ESTRUCTURAS, LISTA_DICCIONARIO_ESTRUCTURAS } from '../modelos/diccionarioEstructuras';

const ICONS_MAP = {
  Layers,
  Database,
  Code2,
  ShieldCheck,
  Cpu,
  Radio,
  Smartphone,
  Cloud: Radio,
  Lock,
  Activity,
  Terminal,
  FolderGit2
};

const normalizar = (txt) =>
  (txt || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function inferirColeccion(titulo, idea, categoria, coleccionHint) {
  if (coleccionHint) {
    const hintNorm = normalizar(coleccionHint);
    const encontrada = COLECCIONES_ESTRUCTURAS.find(c => normalizar(c.nombre).includes(hintNorm) || normalizar(c.id).includes(hintNorm));
    if (encontrada) return encontrada;
  }

  const texto = normalizar(`${titulo} ${idea} ${categoria}`);
  if (/banc|fintech|dinero|transfer|saldo|wallet|tarjeta|pago|cuenta/.test(texto)) {
    return { id: 'bancos', nombre: 'Bancos & Fintech', icono: 'ShieldCheck', tagClass: 'bp-tag-sec' };
  }
  if (/vent|e-commerce|ecommerce|tienda|carrit|stripe|checkout|product|pedido/.test(texto)) {
    return { id: 'ventas', nombre: 'Ventas & E-Commerce', icono: 'Code2', tagClass: 'bp-tag-front' };
  }
  if (/almacen|kardex|stock|inventari|bodega|lote|fifo|merma/.test(texto)) {
    return { id: 'almacenes', nombre: 'Almacenes & Kardex', icono: 'Database', tagClass: 'bp-tag-db' };
  }
  if (/salud|clinic|medic|cita|paciente|hospital|triage|farmac/.test(texto)) {
    return { id: 'salud', nombre: 'Salud & Clínicas', icono: 'Activity', tagClass: 'bp-tag-realtime' };
  }
  if (/deliver|repart|ruta|tracking|gps|envio|logistic|paquet/.test(texto)) {
    return { id: 'delivery', nombre: 'Delivery & Logística', icono: 'Radio', tagClass: 'bp-tag-cloud' };
  }
  if (/educaci|curso|escuela|estudiant|tarea|profesor|lms|aula|evalua/.test(texto)) {
    return { id: 'educacion', nombre: 'Educación & LMS', icono: 'BookOpen', tagClass: 'bp-tag-arch' };
  }
  if (/emplead|nomina|rrhh|salari|asistenci|vacacion|recursos humanos/.test(texto)) {
    return { id: 'rrhh', nombre: 'RRHH & Nómina', icono: 'Terminal', tagClass: 'bp-tag-back' };
  }
  if (/movil|offline|sync|flutter|react native|sqlite|indexeddb/.test(texto)) {
    return { id: 'movil', nombre: 'Móvil & Offline-First', icono: 'Smartphone', tagClass: 'bp-tag-test' };
  }

  // Dominio personalizado según el título del proyecto
  const slug = normalizar(titulo).replace(/[^a-z0-9]+/g, '-').slice(0, 20) || 'custom';
  return {
    id: `col_${slug}`,
    nombre: titulo ? `${titulo.slice(0, 24)}...` : 'Proyectos Personalizados',
    icono: 'Layers',
    tagClass: 'bp-tag-arch',
    esPersonalizada: true
  };
}

export default function DiccionarioEstructuras({ planesMentor = [], onUsarEstructura, onVolverAProyectos }) {
  const [coleccionActiva, setColeccionActiva] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [copiadoId, setCopiadoId] = useState(null);

  // Extraer blueprints dinámicos de todos los proyectos creados por el estudiante
  const blueprintsDeProyectos = useMemo(() => {
    const list = [];
    (planesMentor || []).forEach(p => {
      let bps = [];
      if (Array.isArray(p.blueprints)) bps = p.blueprints;
      else if (typeof p.blueprints === 'string') {
        try { bps = JSON.parse(p.blueprints); } catch (_) {}
      }
      if (Array.isArray(bps)) {
        bps.forEach((bp, idx) => {
          if (!bp || !bp.titulo) return;
          const col = inferirColeccion(p.titulo, p.idea_proyecto, bp.categoria, bp.coleccion);
          list.push({
            id: bp.id || `bp_user_${p.id}_${idx}`,
            titulo: bp.titulo,
            coleccion: col.nombre,
            coleccionId: col.id,
            icono: bp.icono || col.icono || 'Code2',
            tagClass: bp.tagClass || col.tagClass || 'bp-tag-arch',
            categoria: bp.categoria || 'Modular',
            desc: bp.desc || `Andamio de código creado para el proyecto "${p.titulo}".`,
            beneficio: `Diseñado y refinado en el chat del proyecto "${p.titulo}".`,
            snippet: bp.snippet || bp.copyText || '// Código no disponible',
            copyText: bp.copyText || bp.snippet,
            proyectoOrigen: p.titulo,
            esDeProyecto: true,
            promptSugerido: bp.askPrompt || `Quiero crear un proyecto enfocado en ${bp.titulo} con arquitectura de producción.`
          });
        });
      }
    });
    return list;
  }, [planesMentor]);

  // Lista combinada (base predefinida + blueprints generados en proyectos)
  const catalogoCompleto = useMemo(() => {
    const idsExistentes = new Set(LISTA_DICCIONARIO_ESTRUCTURAS.map(e => e.id));
    const unicosDeProyectos = blueprintsDeProyectos.filter(bp => !idsExistentes.has(bp.id));
    return [...LISTA_DICCIONARIO_ESTRUCTURAS, ...unicosDeProyectos];
  }, [blueprintsDeProyectos]);

  // Colecciones dinámicas: base + nuevas colecciones descubiertas en proyectos
  const coleccionesDinamicas = useMemo(() => {
    const baseCols = [...COLECCIONES_ESTRUCTURAS];
    const idsBase = new Set(baseCols.map(c => c.id));

    // Agregar chip de "Mis Proyectos" si hay blueprints creados
    if (blueprintsDeProyectos.length > 0) {
      baseCols.splice(1, 0, {
        id: 'mis-proyectos',
        nombre: '⭐ Creados en Mis Chats',
        icono: 'FolderGit2',
        tagClass: 'bp-tag-realtime',
        esMisProyectos: true
      });
    }

    // Agregar nuevas colecciones personalizadas creadas por proyectos
    blueprintsDeProyectos.forEach(bp => {
      if (bp.coleccionId && !idsBase.has(bp.coleccionId) && bp.coleccionId !== 'mis-proyectos') {
        baseCols.push({
          id: bp.coleccionId,
          nombre: bp.coleccion,
          icono: bp.icono || 'Layers',
          tagClass: bp.tagClass || 'bp-tag-arch',
          esDinamica: true
        });
        idsBase.add(bp.coleccionId);
      }
    });

    return baseCols;
  }, [blueprintsDeProyectos]);

  const estructurasFiltradas = catalogoCompleto.filter(item => {
    let coincideColeccion = false;
    if (coleccionActiva === 'todas') {
      coincideColeccion = true;
    } else if (coleccionActiva === 'mis-proyectos') {
      coincideColeccion = item.esDeProyecto === true;
    } else {
      coincideColeccion = item.coleccionId === coleccionActiva;
    }

    const q = normalizar(busqueda.trim());
    const coincideBusqueda = !q ||
      normalizar(item.titulo).includes(q) ||
      normalizar(item.desc).includes(q) ||
      normalizar(item.beneficio).includes(q) ||
      normalizar(item.coleccion).includes(q) ||
      normalizar(item.categoria).includes(q) ||
      (item.proyectoOrigen && normalizar(item.proyectoOrigen).includes(q)) ||
      normalizar(item.snippet).includes(q);
    return coincideColeccion && coincideBusqueda;
  });

  const handleCopiar = (id, codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  return (
    <div className="diccionario-estructuras-view animate-fade-in">
      {/* Cabecera del Diccionario */}
      <div className="diccionario-hero">
        <div className="diccionario-hero-content">
          <div className="diccionario-badge-pill">
            <BookOpen size={14} />
            <span>DICCIONARIO ARQUITECTÓNICO & RECURSOS DE PRODUCCIÓN</span>
          </div>
          <h2>Catálogo de Estructuras por Dominio Industrial</h2>
          <p>
            Explora andamios técnicos y contratos de software organizados por colecciones de negocio (Bancos, Ventas, Almacenes, Salud, Logística, etc.). Examina los snippets de producción, copia su arquitectura o úsala como base para diseñar tu próximo proyecto con el Mentor IA.
          </p>
        </div>

        {onVolverAProyectos && (
          <button
            type="button"
            className="btn-volver-proyectos"
            onClick={onVolverAProyectos}
          >
            ← Volver a Mis Proyectos
          </button>
        )}
      </div>

      {/* Barra de Búsqueda y Selector de Colecciones */}
      <div className="diccionario-controles">
        <div className="diccionario-search-bar">
          <Search size={15} className="diccionario-search-icon" />
          <input
            type="text"
            placeholder="Buscar por estructura, colección, patrón o código (ej. ACID, Kardex, JWT, GPS)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="diccionario-search-input"
          />
          {busqueda && (
            <button
              type="button"
              className="diccionario-search-clear"
              onClick={() => setBusqueda('')}
              title="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        {/* Chips de Colecciones */}
        <div className="diccionario-colecciones-strip">
          {coleccionesDinamicas.map(col => {
            const Icon = ICONS_MAP[col.icono] || Layers;
            let count = 0;
            if (col.id === 'todas') {
              count = catalogoCompleto.length;
            } else if (col.id === 'mis-proyectos') {
              count = blueprintsDeProyectos.length;
            } else {
              count = catalogoCompleto.filter(e => e.coleccionId === col.id).length;
            }
            const activa = coleccionActiva === col.id;

            return (
              <button
                key={col.id}
                type="button"
                className={`btn-coleccion-chip ${activa ? 'active' : ''} ${col.tagClass || ''}`}
                onClick={() => setColeccionActiva(col.id)}
              >
                <Icon size={14} />
                <span>{col.nombre}</span>
                <span className="chip-count">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Indicador de Resultados */}
      <div className="diccionario-resumen-barra">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">
            Mostrando <strong>{estructurasFiltradas.length}</strong> de <strong>{catalogoCompleto.length}</strong> estructuras disponibles
            {coleccionActiva !== 'todas' && ` en ${coleccionesDinamicas.find(c => c.id === coleccionActiva)?.nombre || coleccionActiva}`}
          </span>
          {blueprintsDeProyectos.length > 0 && (
            <span className="badge-coleccion-dyn" title="Estructuras aprendidas y construidas en tus conversaciones con el Mentor">
              ✨ {blueprintsDeProyectos.length} aprendidas en tus chats
            </span>
          )}
        </div>
        {(busqueda || coleccionActiva !== 'todas') && (
          <button
            type="button"
            className="btn-restablecer-diccionario"
            onClick={() => {
              setBusqueda('');
              setColeccionActiva('todas');
            }}
          >
            Ver catálogo completo
          </button>
        )}
      </div>

      {/* Cuadrícula de Estructuras */}
      {estructurasFiltradas.length === 0 ? (
        <div className="diccionario-empty-state">
          <Layers size={36} className="text-indigo-400" />
          <h4>No se encontraron estructuras coincidentes</h4>
          <p>Intenta con otros términos o restablece la colección para ver más resultados.</p>
          <button
            type="button"
            className="btn-restablecer-grande"
            onClick={() => {
              setBusqueda('');
              setColeccionActiva('todas');
            }}
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="diccionario-grid">
          {estructurasFiltradas.map(est => {
            const Icon = ICONS_MAP[est.icono] || Layers;
            return (
              <div key={est.id} className="diccionario-card">
                <div className="diccionario-card-header">
                  <div className="flex items-start gap-2.5">
                    <div className="diccionario-icon-wrapper">
                      <Icon size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="diccionario-card-title">{est.titulo}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="diccionario-coleccion-badge">{est.coleccion}</span>
                        {est.esDeProyecto && (
                          <span className="badge-origen-chat" title={`Generado en el proyecto: ${est.proyectoOrigen}`}>
                            ⚡ En chat: {est.proyectoOrigen}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`bp-tag ${est.tagClass}`}>{est.categoria}</span>
                </div>

                <p className="diccionario-card-desc">{est.desc}</p>

                {est.beneficio && (
                  <div className="diccionario-card-beneficio">
                    <strong>💡 Por qué es clave:</strong> {est.beneficio}
                  </div>
                )}

                <div className="diccionario-snippet-wrapper">
                  <div className="diccionario-snippet-header">
                    <span>Código / Arquitectura de Producción</span>
                    <button
                      type="button"
                      className="btn-snippet-copy"
                      onClick={() => handleCopiar(est.id, est.snippet)}
                    >
                      {copiadoId === est.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiadoId === est.id ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <pre className="diccionario-code">{est.snippet}</pre>
                </div>

                <div className="diccionario-card-footer">
                  <button
                    type="button"
                    className="btn-usar-para-proyecto"
                    onClick={() => onUsarEstructura?.(est.promptSugerido || est.desc)}
                    title="Usar esta arquitectura como base para crear un nuevo proyecto guiado por el Mentor"
                  >
                    <Sparkles size={14} />
                    <span>🚀 Iniciar Proyecto con esta Estructura</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
