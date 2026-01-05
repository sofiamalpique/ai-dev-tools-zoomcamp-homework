import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

const apiUrl = '/api/session';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');

  const createSession = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(apiUrl, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Session creation failed (${response.status})`);
      }
      const data = await response.json();
      navigate(`/s/${data.roomId}`);
    } catch (err) {
      const fallbackId = nanoid(10);
      setError('Session service unavailable, using a local room id.');
      navigate(`/s/${fallbackId}`);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = () => {
    if (!joinId.trim()) return;
    navigate(`/s/${joinId.trim()}`);
  };

  return (
    <div className="page shell">
      <div className="card">
        <div className="card-header">
          <h1>Collaborative Code Interview</h1>
          <p>Create a room, share the link, and code together in real time.</p>
        </div>
        <div className="actions">
          <button onClick={createSession} disabled={loading}>
            {loading ? 'Creating…' : 'Create session'}
          </button>
          {error && <p className="hint error">{error}</p>}
        </div>
        <div className="divider">
          <span>or join existing</span>
        </div>
        <div className="join">
          <input
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Enter room id"
            onKeyDown={(e) => e.key === 'Enter' && joinSession()}
          />
          <button onClick={joinSession} disabled={!joinId.trim()}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
