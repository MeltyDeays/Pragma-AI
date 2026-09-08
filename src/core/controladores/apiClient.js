/**
 * src/core/controladores/apiClient.js
 * Cliente HTTP resiliente con protección anti-SyntaxError, validación de Content-Type y timeouts vía AbortController.
 */

export async function safeFetchJson(url, options = {}) {
  const { timeoutMs = 45000, headers = {}, signal: externalSignal, ...fetchOptions } = options;
  const controller = new AbortController();

  let onExternalAbort = null;
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      onExternalAbort = () => controller.abort();
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Accept': 'application/json',
        ...headers
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (externalSignal && onExternalAbort) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const isJson = contentType.includes('application/json');

    let data = null;
    let parseError = null;

    if (isJson) {
      try {
        data = await res.json();
      } catch (err) {
        parseError = 'Respuesta del servidor con formato JSON inválido.';
      }
    } else {
      // Consumir el body como texto si es posible para liberar el socket HTTP
      await res.text().catch(() => '');
    }

    if (!res.ok) {
      const mensajeServidor = (isJson && data && (data.error || data.mensaje || data.message))
        || (res.status >= 500
          ? `El servidor experimentó un error temporal (${res.status}). Intenta de nuevo en unos momentos.`
          : `Error en la solicitud (${res.status} ${res.statusText || ''}).`);

      return {
        ok: false,
        status: res.status,
        data,
        error: mensajeServidor,
        isJson
      };
    }

    if (!isJson) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: 'El servidor no devolvió una respuesta con formato JSON esperado.',
        isJson: false
      };
    }

    if (parseError) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: parseError,
        isJson: true
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
      error: null,
      isJson: true
    };
  } catch (netErr) {
    clearTimeout(timer);
    if (externalSignal && onExternalAbort) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }

    const esTimeout = netErr.name === 'AbortError' || netErr.code === 20;
    const fueCanceladoExternamente = externalSignal && externalSignal.aborted;

    return {
      ok: false,
      status: esTimeout ? 408 : 0,
      data: null,
      error: fueCanceladoExternamente
        ? 'Solicitud cancelada por el usuario.'
        : esTimeout
        ? 'Tiempo de espera agotado. El servidor tardó demasiado en responder.'
        : 'Error de red. No se pudo conectar con el servidor backend.',
      isJson: false
    };
  }
}

export default safeFetchJson;
