-- Ghost Schema from Supabase - Dedicated IA-PROFESOR database
-- Ejecutar este script en el editor SQL de tu base de datos Supabase dedicada.

-- 1. Crear tabla de estudiantes
CREATE TABLE IF NOT EXISTS public.profesor_estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    nivel_actual VARCHAR(50) NOT NULL DEFAULT 'Novato', -- Novato, Principiante, Intermedio, Avanzado, Experto
    tecnologia_actual VARCHAR(100) NOT NULL DEFAULT 'JavaScript', -- Java, JavaScript, Python, HTML/CSS, React, Node, etc.
    tema_indice INT NOT NULL DEFAULT 1, -- Índice del tema actual dentro del temario de la tecnología
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de progreso de estudiante por tecnología (Guarda el progreso de cada ruta de forma independiente)
CREATE TABLE IF NOT EXISTS public.profesor_estudiante_progreso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES public.profesor_estudiantes(id) ON DELETE CASCADE,
    tecnologia VARCHAR(100) NOT NULL,
    nivel_actual VARCHAR(50) NOT NULL DEFAULT 'Novato',
    tema_indice INT NOT NULL DEFAULT 1,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(estudiante_id, tecnologia)
);

-- 3. Crear tabla de tareas
CREATE TABLE IF NOT EXISTS public.profesor_tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES public.profesor_estudiantes(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    tema VARCHAR(100) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    conceptos_clave JSONB NOT NULL, -- Contiene términos, explicaciones y ejemplos
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', -- Pendiente, Aprobado
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de entregas
CREATE TABLE IF NOT EXISTS public.profesor_entregas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID REFERENCES public.profesor_tareas(id) ON DELETE CASCADE,
    github_url TEXT NOT NULL,
    puntaje INT NOT NULL CHECK (puntaje BETWEEN 0 AND 100),
    observaciones TEXT NOT NULL,
    recomendaciones TEXT NOT NULL,
    fecha_entrega TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar Seguridad RLS
ALTER TABLE public.profesor_estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesor_estudiante_progreso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesor_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesor_entregas ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas públicas temporales para desarrollo (Permite todo para prototipado rápido)
CREATE POLICY "Permitir todo estudiantes" ON public.profesor_estudiantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo progreso" ON public.profesor_estudiante_progreso FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo tareas" ON public.profesor_tareas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo entregas" ON public.profesor_entregas FOR ALL USING (true) WITH CHECK (true);

-- 7. Crear tabla de logros
CREATE TABLE IF NOT EXISTS public.profesor_logros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES public.profesor_estudiantes(id) ON DELETE CASCADE,
    logro_id VARCHAR(100) NOT NULL,
    desbloqueado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(estudiante_id, logro_id)
);
ALTER TABLE public.profesor_logros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo logros" ON public.profesor_logros FOR ALL USING (true) WITH CHECK (true);

-- 8. Índices para acelerar consultas críticas y evitar Table Scans
CREATE INDEX IF NOT EXISTS idx_profesor_tareas_estudiante ON public.profesor_tareas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_profesor_entregas_tarea ON public.profesor_entregas(tarea_id);
CREATE INDEX IF NOT EXISTS idx_profesor_estudiante_progreso_estudiante ON public.profesor_estudiante_progreso(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_profesor_logros_estudiante ON public.profesor_logros(estudiante_id);

