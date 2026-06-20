import React, { createContext, useContext, useState, useEffect } from 'react';

const EstudianteContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export function EstudianteProvider({ children }) {
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [tareas, setTareas] = useState([]);
  const [temario, setTemario] = useState([]);

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
  };

  const cargarEstado = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/estudiantes/${id}/estado`);
      const data = await res.json();
      if (res.ok) {
        setEstudiante(data.estudiante);
        setTareas(data.tareas);
        setTemario(data.temario);
      } else {
        mostrarMensaje(data.error || 'Error al cargar el estado', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('No se pudo conectar con el servidor backend', 'error');
    }
  };

  const iniciarSesion = async (nombre, tecnologia) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/estudiantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, tecnologia })
      });
      const data = await res.json();
      if (res.ok) {
        setEstudiante(data);
        localStorage.setItem('estudiante_sesion', JSON.stringify(data));
        await cargarEstado(data.id);
        mostrarMensaje(`¡Bienvenido de vuelta, ${data.nombre}!`, 'exito');
        return data;
      } else {
        mostrarMensaje(data.error || 'Error al iniciar sesión', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión con el backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('estudiante_sesion');
    setEstudiante(null);
    setTareas([]);
    setTemario([]);
  };

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('estudiante_sesion');
    if (sesionGuardada) {
      const parsed = JSON.parse(sesionGuardada);
      setEstudiante(parsed);
      cargarEstado(parsed.id);
    }
  }, []);

  return (
    <EstudianteContext.Provider value={{
      estudiante,
      setEstudiante,
      tareas,
      setTareas,
      temario,
      setTemario,
      loading,
      mensaje,
      mostrarMensaje,
      cargarEstado,
      iniciarSesion,
      cerrarSesion
    }}>
      {children}
    </EstudianteContext.Provider>
  );
}

export function useEstudiante() {
  const context = useContext(EstudianteContext);
  if (!context) throw new Error('useEstudiante debe usarse dentro de EstudianteProvider');
  return context;
}
