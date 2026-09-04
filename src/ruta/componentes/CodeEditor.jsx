import React, { useRef, useEffect, useMemo } from 'react';
import { normalizarLenguaje } from '../controladores/codeExecutionService';

/**
 * Resaltador de sintaxis regex ultraligero y de alto rendimiento.
 * Tokeniza líneas de código generando spans semánticos sin dependencias externas.
 */
function resaltarLinea(linea, lenguajeNormalizado) {
  if (!linea) return [<span key="empty">&nbsp;</span>];

  // 1. Reglas para SQL
  if (lenguajeNormalizado === 'sql') {
    const sqlRegex = /(--[^\n]*)|('(?:''|[^'])*')|(\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|JOIN|LEFT|RIGHT|INNER|ON|GROUP|BY|ORDER|HAVING|LIMIT|AS|AND|OR|NOT|IN|LIKE|IS|NULL|COUNT|SUM|AVG|MIN|MAX|DISTINCT|PRIMARY|KEY|INT|TEXT)\b)|(\b\d+(?:\.\d+)?\b)|([=<>!]+|[(),;*])/gi;
    return renderTokens(linea, sqlRegex, (match, mComment, mStr, mKw, mNum, mOp, idx) => {
      if (mComment) return <span key={idx} className="token-comment">{match}</span>;
      if (mStr) return <span key={idx} className="token-string">{match}</span>;
      if (mKw) return <span key={idx} className="token-keyword">{match}</span>;
      if (mNum) return <span key={idx} className="token-number">{match}</span>;
      if (mOp) return <span key={idx} className="token-operator">{match}</span>;
      return <span key={idx}>{match}</span>;
    });
  }

  // 2. Reglas para Python
  if (lenguajeNormalizado === 'python') {
    const pyRegex = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*')|(\b(?:def|return|if|elif|else|for|while|in|is|not|and|or|import|from|as|class|try|except|finally|raise|with|pass|break|continue|yield|lambda|global|assert)\b)|(\b(?:True|False|None)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\())|([+\-*/%=&|^!~<>:]+|[(),.\[\]{}])/g;
    return renderTokens(linea, pyRegex, (match, mComment, mStr, mKw, mBool, mNum, mFn, mOp, idx) => {
      if (mComment) return <span key={idx} className="token-comment">{match}</span>;
      if (mStr) return <span key={idx} className="token-string">{match}</span>;
      if (mKw) return <span key={idx} className="token-keyword">{match}</span>;
      if (mBool) return <span key={idx} className="token-boolean">{match}</span>;
      if (mNum) return <span key={idx} className="token-number">{match}</span>;
      if (mFn) return <span key={idx} className="token-function">{match}</span>;
      if (mOp) return <span key={idx} className="token-operator">{match}</span>;
      return <span key={idx}>{match}</span>;
    });
  }

  // 3. Reglas para HTML / CSS
  if (lenguajeNormalizado === 'html') {
    const htmlRegex = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z0-9-]+)|(\b[a-zA-Z-]+(?==))|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|([<>/=])/g;
    return renderTokens(linea, htmlRegex, (match, mComment, mTag, mAttr, mStr, mOp, idx) => {
      if (mComment) return <span key={idx} className="token-comment">{match}</span>;
      if (mTag) return <span key={idx} className="token-tag">{match}</span>;
      if (mAttr) return <span key={idx} className="token-attribute">{match}</span>;
      if (mStr) return <span key={idx} className="token-string">{match}</span>;
      if (mOp) return <span key={idx} className="token-operator">{match}</span>;
      return <span key={idx}>{match}</span>;
    });
  }

  // 4. Reglas por defecto: JavaScript / React
  const jsRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|default|class|extends|import|export|from|new|this|typeof|instanceof|async|await|try|catch|finally|throw|yield|React)\b)|(\b(?:true|false|null|undefined|NaN)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())|(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=&|^!~<>?:]+|[{}[\](),.;])/g;

  return renderTokens(linea, jsRegex, (match, mComment, mStr, mKw, mBool, mNum, mFn, mOp, idx) => {
    if (mComment) return <span key={idx} className="token-comment">{match}</span>;
    if (mStr) return <span key={idx} className="token-string">{match}</span>;
    if (mKw) return <span key={idx} className="token-keyword">{match}</span>;
    if (mBool) return <span key={idx} className="token-boolean">{match}</span>;
    if (mNum) return <span key={idx} className="token-number">{match}</span>;
    if (mFn) return <span key={idx} className="token-function">{match}</span>;
    if (mOp) return <span key={idx} className="token-operator">{match}</span>;
    return <span key={idx}>{match}</span>;
  });
}

function renderTokens(linea, regex, tokenMap) {
  const elements = [];
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(linea)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${idx++}`}>{linea.slice(lastIndex, match.index)}</span>);
    }
    elements.push(tokenMap(match[0], match[1], match[2], match[3], match[4], match[5], match[6], match[7], `tok-${idx++}`));
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < linea.length) {
    elements.push(<span key={`text-${idx++}`}>{linea.slice(lastIndex)}</span>);
  }

  return elements.length > 0 ? elements : [<span key="empty">&nbsp;</span>];
}

export default function CodeEditor({
  value = '',
  onChange,
  language = 'javascript',
  disabled = false,
  placeholder = '// Escribe tu código aquí...',
  onRun
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const preRef = useRef(null);

  const normalizedLang = useMemo(() => normalizarLenguaje(language), [language]);

  const lines = useMemo(() => {
    return (value || '').split('\n');
  }, [value]);

  // Sincronización precisa de scroll entre textarea, gutter y capa de coloreado
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const top = textareaRef.current.scrollTop;
    const left = textareaRef.current.scrollLeft;

    if (gutterRef.current) {
      gutterRef.current.scrollTop = top;
    }
    if (preRef.current) {
      preRef.current.scrollTop = top;
      preRef.current.scrollLeft = left;
    }
  };

  const handleKeyDown = (e) => {
    // Atajo de ejecución rápida: Ctrl + Enter o Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (onRun) {
        e.preventDefault();
        onRun();
      }
      return;
    }

    // Soporte de Tabulador (2 espacios)
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const nextVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
      return;
    }

    // Auto-indentación al presionar Enter
    if (e.key === 'Enter') {
      const start = e.target.selectionStart;
      const textBefore = value.substring(0, start);
      const currentLine = textBefore.split('\n').pop() || '';
      const matchIndent = currentLine.match(/^[ ]*/);
      const baseIndent = matchIndent ? matchIndent[0] : '';
      const extraIndent = currentLine.trim().endsWith('{') || currentLine.trim().endsWith(':') ? '  ' : '';
      const totalIndent = baseIndent + extraIndent;

      if (totalIndent) {
        e.preventDefault();
        const nextVal = value.substring(0, start) + '\n' + totalIndent + value.substring(start);
        onChange(nextVal);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1 + totalIndent.length;
          }
        }, 0);
      }
    }
  };

  useEffect(() => {
    handleScroll();
  }, [value]);

  return (
    <div className="code-editor-wrapper">
      {/* Gutter con números de línea */}
      <div className="code-editor-gutter" ref={gutterRef} aria-hidden="true">
        {lines.map((_, i) => (
          <span key={i} className="code-editor-line-num">{i + 1}</span>
        ))}
      </div>

      {/* Superficie de edición superpuesta */}
      <div className="code-editor-surface">
        <pre className="code-editor-pre" ref={preRef} aria-hidden="true">
          <code>
            {lines.map((l, i) => (
              <React.Fragment key={i}>
                {resaltarLinea(l, normalizedLang)}
                {i < lines.length - 1 ? '\n' : ''}
              </React.Fragment>
            ))}
          </code>
        </pre>

        <textarea
          ref={textareaRef}
          className="code-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck="false"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
}
