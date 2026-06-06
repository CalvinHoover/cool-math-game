'use client';

import { useRouter } from 'next/navigation';
import { usePracticeSetup } from '@/features/practice/usePracticeSetup';

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontFamily: 'Courier New, monospace',
  fontSize: '1rem',
  background: '#111111',
  color: '#FFFFFF',
  border: '4px inset #CCCCCC',
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Courier New, monospace',
  color: '#00FFFF',
  fontSize: '0.9rem',
  marginBottom: '6px',
  textTransform: 'uppercase',
};

const btnStyle = (color: string, textColor = '#000000'): React.CSSProperties => ({
  padding: '12px 24px',
  fontFamily: 'Courier New, monospace',
  fontWeight: 'bold',
  fontSize: '1rem',
  border: '4px outset #CCCCCC',
  cursor: 'pointer',
  background: color,
  color: textColor,
  textTransform: 'uppercase',
  width: '100%',
  marginBottom: '10px',
});

export default function PracticeSetup() {
  const router = useRouter();
  const {
    topics,
    isLoading,
    error,
    selectedTopic,
    setSelectedTopic,
    selectedCount,
    setSelectedCount,
    timedMode,
    setTimedMode,
    timeLimit,
    setTimeLimit,
    hasActiveSession,
    handleStart,
    sessionLengths,
  } = usePracticeSetup();

  if (isLoading) {
    return <p style={{ color: '#888888', fontFamily: 'Courier New' }}>Loading topics...</p>;
  }

  if (error) {
    return <p style={{ color: '#FF4444', fontFamily: 'Courier New' }}>{error}</p>;
  }

  return (
    <div style={{
      border: '4px outset #CCCCCC',
      background: '#111111',
      padding: '28px 32px',
      width: '100%',
      maxWidth: '420px',
    }}>
      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Topic</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          style={selectStyle}
        >
          <option value="">-- Select a topic --</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Session Length</label>
        <select
          value={selectedCount}
          onChange={(e) => setSelectedCount(Number(e.target.value))}
          style={selectStyle}
        >
          {sessionLengths.map((n) => (
            <option key={n} value={n}>
              {n} questions
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={timedMode}
            onChange={(e) => setTimedMode(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          Timed Mode
        </label>
        {timedMode && (
          <input
            type="number"
            min={5}
            max={300}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            style={{ ...selectStyle, marginTop: '8px' }}
          />
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedTopic}
        style={{
          ...btnStyle(!selectedTopic ? '#444444' : '#00FF00'),
          cursor: !selectedTopic ? 'not-allowed' : 'pointer',
          opacity: !selectedTopic ? 0.6 : 1,
        }}
      >
        {hasActiveSession ? 'Resume Session' : 'Start Session'}
      </button>

      <button
        onClick={() => router.push('/dashboard')}
        style={btnStyle('#C0C0C0')}
      >
        ← Back to Menu
      </button>
    </div>
  );
}
