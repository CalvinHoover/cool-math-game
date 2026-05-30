'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTopics } from '@/features/practice/actions';

type Topic = {
  id: string;
  name: string;
};

const SESSION_LENGTHS = [5, 10, 20];

export default function PracticeSetup() {
  console.log("PracticeSetup mounted");
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCount, setSelectedCount] = useState(5);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);

  useEffect(() => {
    let cancelled = false;
    getTopics().then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
      } else {
        setTopics(result.topics);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = () => {
    if (!selectedTopic) return;
    const params = new URLSearchParams();
    params.set('topicId', selectedTopic);
    params.set('count', String(selectedCount));
    if (timedMode) {
      params.set('timeLimit', String(timeLimit));
    }
    router.push(`/practice?${params.toString()}`);
  };

  if (loading) {
    return <p className="text-gray-600">Loading topics...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="border p-6 rounded shadow max-w-md">
      <h2 className="text-xl font-bold mb-4">Practice Setup</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Topic</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Select a topic --</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Session Length</label>
        <select
          value={selectedCount}
          onChange={(e) => setSelectedCount(Number(e.target.value))}
          className="w-full border p-2 rounded"
        >
          {SESSION_LENGTHS.map((n) => (
            <option key={n} value={n}>
              {n} questions
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={timedMode}
            onChange={(e) => setTimedMode(e.target.checked)}
          />
          <span className="text-sm">Timed mode (seconds per question)</span>
        </label>
        {timedMode && (
          <input
            type="number"
            min={5}
            max={300}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="mt-2 w-full border p-2 rounded"
          />
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedTopic}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Start Session
      </button>
    </div>
  );
}
