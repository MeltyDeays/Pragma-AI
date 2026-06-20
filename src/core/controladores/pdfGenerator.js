import { jsPDF } from 'jspdf';

/**
 * Genera y descarga un archivo PDF estético y de calidad editorial premium.
 * Recrea el diseño y maquetación estructurada del documento de Word original para no perder estilo.
 * @param {string} titulo El título del documento
 * @param {string} contenido El contenido en markdown o texto a formatear
 * @param {string} subtitulo Subtítulo o tecnología del documento
 */
export function descargarDocumentoPDF(titulo, contenido, subtitulo = 'PRAGMA AI - RUTA DE APRENDIZAJE') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 25;

  // Pie de página y Cabecera Minimalista
  const drawHeaderFooter = (pageNumber) => {
    // Cabecera (a partir de la página 1)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(99, 102, 241); // Indigo suave
    doc.text('PRAGMA AI', margin, 14);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(` |  ${subtitulo.toUpperCase()}`, margin + 18, 14);
    
    // Línea divisoria de cabecera
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, 16, pageWidth - margin, 16);

    // Pie de página
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text('DOCUMENTO DE FORMACIÓN EXCLUSIVO', margin, pageHeight - 12);
  };

  // Función interna para verificar salto de página
  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 22) {
      const currentPage = doc.internal.getNumberOfPages();
      drawHeaderFooter(currentPage);
      
      doc.addPage();
      currentY = 25; // Reiniciar Y en la nueva página
    }
  };

  // --- PRIMERA PÁGINA: DISEÑO EDITORIAL ---
  // Franja de cabecera decorativa premium
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 18, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(52, 211, 153); // Esmeralda brillante
  doc.text('★ MENTORÍA EXPERTA IA - PLAN DE ESTUDIOS SECUENCIAL', margin, 11);

  currentY = 32;

  // Subtítulo de contexto (con protección multilinea)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(99, 102, 241); // Indigo de marca
  const splitSubtitulo = doc.splitTextToSize(subtitulo.toUpperCase(), contentWidth);
  doc.text(splitSubtitulo, margin, currentY);
  currentY += (splitSubtitulo.length * 4.5) + 3;

  // Título Principal en caja elegante
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate 900
  const splitTitulo = doc.splitTextToSize(titulo, contentWidth);
  doc.text(splitTitulo, margin, currentY);
  currentY += (splitTitulo.length * 7.5) + 5;

  // Línea divisoria gruesa de marca
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(1.2);
  doc.line(margin, currentY, margin + 60, currentY);
  currentY += 12;

  // --- PROCESAMIENTO DE TEXTO Y MARKDOWN ---
  const lineas = contenido.split('\n');

  for (let i = 0; i < lineas.length; i++) {
    let linea = lineas[i].trim();

    // Líneas vacías
    if (linea === '') {
      currentY += 4;
      continue;
    }

    // Encabezados (#, ##, ###)
    if (linea.startsWith('#')) {
      const nivel = (linea.match(/^#+/) || ['#'])[0].length;
      const textoEncabezado = linea.replace(/^#+\s*/, '');
      
      let fontSize = 12;
      let fontStyle = 'bold';
      let textColor = [30, 41, 59];
      let spacingBefore = 8;
      let spacingAfter = 4;

      if (nivel === 1) {
        fontSize = 15;
        textColor = [79, 70, 229]; // Indigo oscuro
        spacingBefore = 10;
        spacingAfter = 6;
      } else if (nivel === 2) {
        fontSize = 13;
        textColor = [16, 185, 129]; // Verde esmeralda
        spacingBefore = 8;
        spacingAfter = 5;
      } else {
        fontSize = 11;
        textColor = [15, 23, 42];
        spacingBefore = 6;
        spacingAfter = 4;
      }

      checkPageBreak(fontSize / 2 + spacingBefore + spacingAfter + 6);
      currentY += spacingBefore;

      doc.setFont('Helvetica', fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      const splitHeader = doc.splitTextToSize(textoEncabezado, contentWidth);
      
      // Dibujar borde sutil a la izquierda para encabezados H1
      if (nivel === 1) {
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(0.8);
        doc.line(margin - 4, currentY - 1, margin - 4, currentY + (splitHeader.length * 5) - 2);
      }

      doc.text(splitHeader, margin, currentY);
      currentY += (splitHeader.length * (fontSize / 2)) + spacingAfter;
      continue;
    }

    // Bloques de código (```)
    if (linea.startsWith('```')) {
      let bloqueCodigo = [];
      i++;
      while (i < lineas.length && !lineas[i].trim().startsWith('```')) {
        bloqueCodigo.push(lineas[i]);
        i++;
      }

      if (bloqueCodigo.length > 0) {
        const lineSpacing = 4.2;
        const padding = 6;
        const rectHeight = (bloqueCodigo.length * lineSpacing) + padding;
        
        checkPageBreak(rectHeight + 8);
        
        // Caja de fondo estilizada
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, contentWidth, rectHeight, 1.5, 1.5, 'FD');
        
        // Indicador lateral izquierdo
        doc.setFillColor(99, 102, 241);
        doc.rect(margin, currentY, 1.5, rectHeight, 'F');

        doc.setFont('Courier', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42); // Texto oscuro legible

        let codeY = currentY + 4.5;
        bloqueCodigo.forEach((codeLine) => {
          // Reemplazar tabulaciones por espacios para evitar fallos de renderizado
          const cleanCodeLine = codeLine.replace(/\t/g, '  ');
          const splitCode = doc.splitTextToSize(cleanCodeLine, contentWidth - 8);
          doc.text(splitCode, margin + 4, codeY);
          codeY += (splitCode.length * lineSpacing);
        });

        currentY += rectHeight + 6;
      }
      continue;
    }

    // Listas viñetas o numeradas
    const esListaVineta = linea.startsWith('- ') || linea.startsWith('* ');
    const esListaNumerada = /^\d+\.\s*/.test(linea);

    if (esListaVineta || esListaNumerada) {
      let textoLista = linea.replace(/^(-\s*|\*\s*|\d+\.\s*)/, '');
      const prefijo = esListaVineta ? '• ' : (linea.match(/^\d+\.\s*/) || ['1. '])[0];
      
      checkPageBreak(8);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(99, 102, 241); // Indigo para viñetas
      doc.text(prefijo, margin + 2, currentY);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85); // Slate 700

      const splitText = doc.splitTextToSize(textoLista, contentWidth - 8);
      doc.text(splitText, margin + 8, currentY);
      currentY += (splitText.length * 5) + 2.5;
      continue;
    }

    // Párrafos normales
    checkPageBreak(8);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // Slate 700

    // Quitar marcas de negritas del markdown para que no salgan literal
    const textoLimpio = linea.replace(/\*\*/g, '');

    const splitText = doc.splitTextToSize(textoLimpio, contentWidth);
    doc.text(splitText, margin, currentY);
    currentY += (splitText.length * 5) + 2.5;
  }

  // Dibujar Header y Footer en la última página
  const totalPages = doc.internal.getNumberOfPages();
  drawHeaderFooter(totalPages);

  // Guardar archivo PDF con nombre optimizado
  const nombreLimpio = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  doc.save(`${nombreLimpio}.pdf`);
}
