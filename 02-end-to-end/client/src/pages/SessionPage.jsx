import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '../components/Editor';
import { runJavaScript, runPython } from '../lib/runCode';

const getWsEndpoint = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = import.meta.env.VITE_WS_HOST || window.location.hostname;
  const port = import.meta.env.VITE_WS_PORT || (import.meta.env.DEV ? 4000 : window.location.port);
  const portPart = port ? `:${port}` : '';
  return `${protocol}://${host}${portPart}/yjs`;
};

export default function SessionPage() {
  const { roomId } = useParams();
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('connecting');
  const [code, setCode] = useState('');
  const wsRef = useRef(null);
  const sendTimerRef = useRef(null);

  useEffect(() => {
    const endpoint = `${getWsEndpoint()}?room=${roomId}`;
    const socket = new WebSocket(endpoint);
    wsRef.current = socket;
    setStatus('connecting');

    socket.onopen = () => setStatus('connected');
    socket.onclose = () => setStatus('disconnected');
    socket.onerror = () => setStatus('error');
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init' && typeof data.code === 'string') {
          setCode(data.code);
        }
        if (data.type === 'code' && typeof data.code === 'string') {
          setCode(data.code);
        }
      } catch (err) {
        console.error('WS message parse error', err);
      }
    };

    return () => {
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
      socket.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const broadcastCode = (nextCode) => {
    setCode(nextCode);
    if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
    sendTimerRef.current = setTimeout(() => {
      const socket = wsRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'code', roomId, code: nextCode }));
      }
    }, 150);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    const runner = language === 'python' ? runPython : runJavaScript;
    const result = await runner(code);
    const pieces = [];
    if (result.output) pieces.push(result.output.trim());
    if (result.error) pieces.push(`Error: ${result.error}`);
    setOutput(pieces.filter(Boolean).join('\n') || 'No output');
    setIsRunning(false);
  };

  const shareUrl = `${window.location.origin}/s/${roomId}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setOutput('Link copied to clipboard');
    } catch (err) {
      setOutput('Copy failed, copy manually from the address bar.');
    }
  };

  return (
    <div className="page session">
      <header className="session-header">
        <div>
          <p className="muted">Room</p>
          <h2>{roomId}</h2>
          <p className="muted">Status: {status}</p>
        </div>
        <div className="session-controls">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <button onClick={copyLink}>Copy link</button>
          <button onClick={runCode} disabled={isRunning}>
            {isRunning ? 'Running…' : 'Run'}
          </button>
        </div>
      </header>

      <div className="workspace">
        <div className="editor-pane">
          <Editor value={code} onChange={broadcastCode} language={language} />
        </div>
        <div className="output-pane">
          <div className="pane-header">Output</div>
          <pre className="output">{output}</pre>
        </div>
      </div>
      <p className="hint">
        Tip: open this room in another tab/window to see real-time collaboration in action.
      </p>
    </div>
  );
}
