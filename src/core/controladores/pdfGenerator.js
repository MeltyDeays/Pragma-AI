import { jsPDF } from 'jspdf';

/**
 * Genera y descarga un archivo PDF estético y premium a partir de texto o markdown sencillo.
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

  // Función interna para comprobar salto de página y añadir pie de página
  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 20) {
      // Dibujar número de página antes de cambiar
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // color-text-muted
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      doc.addPage();
      currentY = 25;
      
      // Dibujar cabecera minimalista en páginas subsecuentes
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(124, 58, 237); // púrpura
      doc.text('PRAGMA AI', margin, 15);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(` |  ${subtitulo.toUpperCase()}`, margin + 18, 15);
      
      // Línea divisoria sutil
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, 17, pageWidth - margin, 17);
    }
  };

  // --- Cabecera Premium (Primera Página) ---
  // Fondo de cabecera decorativo
  doc.setFillColor(15, 23, 42); // Gris oscuro
  doc.rect(0, 0, pageWidth, 12, 'F');
  
  // Texto decorativo de cabecera
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 255, 204); // verde brillante
  doc.text('★ MENTORÍA EXPERTA IA', margin, 8);

  // Espaciado inicial
  currentY = 22;

  // Subtítulo de contexto
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(124, 58, 237); // Púrpura de la marca
  doc.text(subtitulo.toUpperCase(), margin, currentY);
  currentY += 8;

  // Título Principal del documento
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // color-text-primary oscuro
  const splitTitulo = doc.splitTextToSize(titulo, contentWidth);
  doc.text(splitTitulo, margin, currentY);
  currentY += (splitTitulo.length * 7) + 5;

  // Línea divisoria elegante
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, margin + 40, currentY);
  currentY += 10;

  // --- Procesamiento del Contenido ---
  // Limpiar un poco el Markdown básico para representarlo de forma limpia
  const lineas = contenido.split('\n');

  for (let i = 0; i < lineas.length; i++) {
    let linea = lineas[i].trim();

    // Líneas vacías
    if (linea === '') {
      currentY += 4;
      continue;
    }

    // Encabezados Markdown (###, ##, #)
    if (linea.startsWith('#')) {
      const nivel = (linea.match(/^#+/) || ['#'])[0].length;
      const textoEncabezado = linea.replace(/^#+\s*/, '');
      
      let fontSize = 12;
      let fontStyle = 'bold';
      let textColor = [30, 41, 59];
      let spacingBefore = 8;
      let spacingAfter = 4;

      if (nivel === 1) {
        fontSize = 16;
        textColor = [124, 58, 237]; // Púrpura
        spacingBefore = 10;
      } else if (nivel === 2) {
        fontSize = 14;
        textColor = [16, 185, 129]; // Verde esmeralda
        spacingBefore = 8;
      } else {
        fontSize = 12;
        textColor = [30, 41, 59];
        spacingBefore = 6;
      }

      checkPageBreak(fontSize / 2 + spacingBefore + spacingAfter);
      currentY += spacingBefore;

      doc.setFont('Helvetica', fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      const splitHeader = doc.splitTextToSize(textoEncabezado, contentWidth);
      doc.text(splitHeader, margin, currentY);
      currentY += (splitHeader.length * (fontSize / 2)) + spacingAfter;
      continue;
    }

    // Bloques de Código o Comandos (Markdown ``` o similar)
    if (linea.startsWith('```')) {
      // Capturar todo el bloque de código hasta el siguiente ```
      let bloqueCodigo = [];
      i++;
      while (i < lineas.length && !lineas[i].trim().startsWith('```')) {
        bloqueCodigo.push(lineas[i]);
        i++;
      }

      if (bloqueCodigo.length > 0) {
        checkPageBreak(bloqueCodigo.length * 4 + 8);
        
        // Caja de fondo para el código
        doc.setFillColor(248, 250, 252); // Fondo gris muy claro
        doc.setDrawColor(226, 232, 240); // Borde claro
        doc.setLineWidth(0.2);
        
        const rectHeight = (bloqueCodigo.length * 4.5) + 6;
        doc.roundedRect(margin, currentY, contentWidth, rectHeight, 2, 2, 'FD');
        
        doc.setFont('Courier', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(225, 29, 72); // Color rosa/morado de código

        let codeY = currentY + 5;
        bloqueCodigo.forEach((codeLine) => {
          const splitCode = doc.splitTextToSize(codeLine, contentWidth - 6);
          doc.text(splitCode, margin + 3, codeY);
          codeY += (splitCode.length * 4);
        });

        currentY += rectHeight + 6;
      }
      continue;
    }

    // Listas (Viñetas - o * o 1.)
    const esListaVineta = linea.startsWith('- ') || linea.startsWith('* ');
    const esListaNumerada = /^\d+\.\s*/.test(linea);

    if (esListaVineta || esListaNumerada) {
      let textoLista = linea.replace(/^(-\s*|\*\s*|\d+\.\s*)/, '');
      const prefijo = esListaVineta ? '• ' : (linea.match(/^\d+\.\s*/) || ['1. '])[0];
      
      checkPageBreak(8);

      // Dibujar viñeta/número
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(124, 58, 237); // Púrpura para el indicador
      doc.text(prefijo, margin + 2, currentY);

      // Dibujar texto de la lista
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105); // color-text-regular

      const splitText = doc.splitTextToSize(textoLista, contentWidth - 8);
      doc.text(splitText, margin + 8, currentY);
      currentY += (splitText.length * 5) + 2;
      continue;
    }

    // Párrafo de texto normal
    checkPageBreak(8);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // color-text-regular

    // Limpiar negritas básicas de markdown (**texto**)
    const textoLimpio = linea.replace(/\*\*/g, '');

    const splitText = doc.splitTextToSize(textoLimpio, contentWidth);
    doc.text(splitText, margin, currentY);
    currentY += (splitText.length * 5) + 2;
  }

  // Dibujar número de página en la última página
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Guardar/Descargar el PDF
  const nombreLimpio = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  doc.save(`${nombreLimpio}.pdf`);
}
