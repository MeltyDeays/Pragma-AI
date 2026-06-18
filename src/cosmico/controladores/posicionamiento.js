export const obtenerPosicionesProcedurales = (nombreEstudiante) => {
  const seedString = nombreEstudiante || 'PragmaUser';
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = Math.imul(31, hash) + seedString.charCodeAt(i) | 0;
  }
  const random = () => {
    hash = Math.imul(hash ^ hash >>> 16, 2246822507);
    hash = Math.imul(hash ^ hash >>> 13, 3266489909);
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
  };

  const posiciones = {};

  // JavaScript siempre cerca del centro con leve offset procedural
  posiciones['JavaScript'] = {
    x: 50 + (random() - 0.5) * 6,
    y: 50 + (random() - 0.5) * 6
  };

  // Mezclar los otros 8 lenguajes de forma determinista usando el random de la semilla
  const lenguajesRestantes = ['React', 'HTML', 'CSS', 'Node.js', 'Supabase', 'Python', 'Java', 'C++'];
  const lenguajesMezclados = [...lenguajesRestantes];
  for (let i = lenguajesMezclados.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = lenguajesMezclados[i];
    lenguajesMezclados[i] = lenguajesMezclados[j];
    lenguajesMezclados[j] = temp;
  }

  // Posicionar en 8 sectores angulares alternando órbitas internas y externas
  lenguajesMezclados.forEach((lang, index) => {
    const baseAngulo = (index / 8) * Math.PI * 2;
    const angulo = baseAngulo + (random() - 0.5) * 0.45; // Desfase angular
    const baseRadio = (index % 2 === 0) ? 22 : 38; // Alternar órbitas
    const radio = baseRadio + (random() - 0.5) * 8; // Desfase radial

    posiciones[lang] = {
      x: 50 + Math.cos(angulo) * radio,
      y: 50 + Math.sin(angulo) * radio
    };
  });

  return posiciones;
};
