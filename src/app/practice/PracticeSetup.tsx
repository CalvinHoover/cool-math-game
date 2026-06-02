'use client';

import { usePracticeSetup } from '@/features/practice/usePracticeSetup';

export default function PracticeSetup() {
  // All data-fetching and routing logic lives in the hook so this component stays presentational.
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
    handleStart,
    sessionLengths,
  } = usePracticeSetup();

  if (isLoading) {
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
          {sessionLengths.map((n) => (
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
