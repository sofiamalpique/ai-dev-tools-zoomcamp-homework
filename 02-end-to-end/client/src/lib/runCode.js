let pyodidePromise = null;

const runnerId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export async function runJavaScript(code, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';
    const id = runnerId();
    let logs = [];
    let finished = false;

    const cleanup = () => {
      finished = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const onMessage = (event) => {
      const data = event.data;
      if (!data || data.source !== 'js-runner' || data.runId !== id) return;
      if (data.message) logs.push(data.message);
      if (data.done) {
        cleanup();
        resolve({
          output: logs.filter(Boolean).join('\n'),
          error: data.error || null
        });
      }
    };

    const timer = setTimeout(() => {
      if (finished) return;
      cleanup();
      resolve({ output: logs.filter(Boolean).join('\n'), error: 'Timed out' });
    }, timeoutMs);

    window.addEventListener('message', onMessage);

    const sanitizedCode = JSON.stringify(code).replace(/<\\\/script/gi, '<\\\\/script');
    const html = `
<!DOCTYPE html>
<html>
<body>
<script>
  const send = (payload) => parent.postMessage(Object.assign({ source: 'js-runner', runId: '${id}' }, payload), '*');
  const toText = (value) => {
    try { return typeof value === 'string' ? value : JSON.stringify(value); }
    catch (_) { return String(value); }
  };
  console.log = (...args) => send({ message: args.map(toText).join(' ') });
  console.error = (...args) => send({ message: args.map(toText).join(' ') });
  (async () => {
    try {
      const userCode = ${sanitizedCode};
      const fn = new Function(userCode);
      const result = await fn();
      if (typeof result !== 'undefined') {
        send({ message: toText(result) });
      }
      send({ done: true });
    } catch (err) {
      send({ done: true, error: err && (err.stack || err.message) ? (err.stack || err.message) : String(err) });
    }
  })();
<\/script>
</body>
</html>`;

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}

async function loadPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = import('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs').then(({ loadPyodide }) =>
      loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' })
    );
  }
  return pyodidePromise;
}

export async function runPython(code) {
  const pyodide = await loadPyodide();
  let output = '';
  pyodide.setStdout({ batched: (msg) => { output += msg; } });
  pyodide.setStderr({ batched: (msg) => { output += msg; } });

  try {
    const result = await pyodide.runPythonAsync(code);
    if (typeof result !== 'undefined') {
      output += String(result);
    }
    return { output, error: null };
  } catch (err) {
    return { output, error: err?.message || String(err) };
  }
}
