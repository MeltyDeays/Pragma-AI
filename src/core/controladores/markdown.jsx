import React from 'react';

export const parsearInlineMarkdown = (text) => {
  if (!text) return text;
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    let earliest = null;
    let earliestIdx = remaining.length;

    if (boldMatch && boldMatch.index < earliestIdx) { earliest = 'bold'; earliestIdx = boldMatch.index; }
    if (codeMatch && codeMatch.index < earliestIdx) { earliest = 'code'; earliestIdx = codeMatch.index; }
    if (linkMatch && linkMatch.index < earliestIdx) { earliest = 'link'; earliestIdx = linkMatch.index; }
    if (!earliest && italicMatch && italicMatch.index < earliestIdx) { earliest = 'italic'; earliestIdx = italicMatch.index; }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.substring(0, earliestIdx));
    }

    if (earliest === 'bold') {
      parts.push(<strong key={`b${keyIdx++}`}>{boldMatch[1]}</strong>);
      remaining = remaining.substring(earliestIdx + boldMatch[0].length);
    } else if (earliest === 'italic') {
      parts.push(<em key={`i${keyIdx++}`}>{italicMatch[1]}</em>);
      remaining = remaining.substring(earliestIdx + italicMatch[0].length);
    } else if (earliest === 'code') {
      parts.push(<code key={`c${keyIdx++}`} className="inline-code-mentor">{codeMatch[1]}</code>);
      remaining = remaining.substring(earliestIdx + codeMatch[0].length);
    } else if (earliest === 'link') {
      parts.push(<a key={`l${keyIdx++}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="mentor-link">{linkMatch[1]}</a>);
      remaining = remaining.substring(earliestIdx + linkMatch[0].length);
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
};

export const parsearMarkdownMentor = (md) => {
  if (!md) return null;
  
  const lines = md.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockContent.join('\n');
        const lang = codeBlockLang;
        elements.push(
          <div key={`code-${i}`} className="mentor-code-wrapper">
            <div className="code-block-header">
              <span className="code-lang-label">{lang ? lang.toUpperCase() : 'CODE'}</span>
              <button
                type="button"
                className="btn-copy-code"
                onClick={(e) => {
                  navigator.clipboard.writeText(codeText);
                  const btn = e.currentTarget;
                  btn.textContent = '✓ Copiado';
                  btn.classList.add('copied');
                  setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
                }}
              >Copiar</button>
            </div>
            <pre className="mentor-code-block">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={i} className="mentor-hr" />);
    } else if (trimmed.startsWith('####')) {
      elements.push(<h5 key={i}>{parsearInlineMarkdown(trimmed.replace('####', '').trim())}</h5>);
    } else if (trimmed.startsWith('###')) {
      elements.push(<h4 key={i}>{parsearInlineMarkdown(trimmed.replace('###', '').trim())}</h4>);
    } else if (trimmed.startsWith('##')) {
      elements.push(<h3 key={i}>{parsearInlineMarkdown(trimmed.replace('##', '').trim())}</h3>);
    } else if (trimmed.startsWith('#')) {
      elements.push(<h2 key={i}>{parsearInlineMarkdown(trimmed.replace('#', '').trim())}</h2>);
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      elements.push(
        <div key={i} className="numbered-item-mentor">
          <span className="numbered-item-num">{numMatch[1]}</span>
          <span className="numbered-item-text">{parsearInlineMarkdown(numMatch[2])}</span>
        </div>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(<li key={i} className="bullet-li-mentor">{parsearInlineMarkdown(trimmed.substring(2).trim())}</li>);
    } else if (trimmed.length === 0) {
      elements.push(<div key={i} className="md-spacing" />);
    } else {
      elements.push(<p key={i}>{parsearInlineMarkdown(line)}</p>);
    }
  }

  return elements;
};

export const parsearRequisitos = (descripcion) => {
  if (!descripcion) return [];
  const regexPasos = /(?:\d+\.\s+)(.*?)(?=\s*\d+\.\s+|$)/gs;
  const matches = [...descripcion.matchAll(regexPasos)];
  
  if (matches.length > 0) {
    return matches.map((m, idx) => ({
      numero: idx + 1,
      texto: m[1].trim()
    }));
  }
  
  const lineas = descripcion.split(/\r?\n/).filter(linea => linea.trim().length > 0);
  if (lineas.length > 1) {
    return lineas.map((linea, idx) => {
      const textoLimpio = linea.replace(/^\s*\d+[\.\)-]\s*/, '').trim();
      return {
        numero: idx + 1,
        texto: textoLimpio
      };
    });
  }
  
  return [{ numero: 1, texto: descripcion }];
};
