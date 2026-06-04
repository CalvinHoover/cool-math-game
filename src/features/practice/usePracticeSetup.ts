// Loads available practice topics and navigates to the session page once a topic is chosen.

'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getTopics, hasActiveSession } from './actions';

type Topic = {
  id: string;
  name: string;
};

const SESSION_LENGTHS = [5, 10, 20];

export function usePracticeSetup() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCount, setSelectedCount] = useState(5);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [hasActive, setHasActive] = useState(false);

  // Pull the topic list on mount so the dropdown is never empty.
  useEffect(() => {
    let cancelled = false;
    getTopics().then((result) => {
      if (cancelled) return;
      startTransition(() => {
        if (!result.ok) {
          setError(result.error);
        } else {
          setTopics(result.topics);
        }
        setIsLoading(false);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Detect whether an unfinished session exists for the selected topic.
  useEffect(() => {
    if (!selectedTopic) {
      setHasActive(false);
      return;
    }
    let cancelled = false;
    hasActiveSession({ topicId: selectedTopic }).then((result) => {
      if (cancelled) return;
      startTransition(() => {
        setHasActive(result.ok);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [selectedTopic]);

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

  return {
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
    hasActiveSession: hasActive,
    handleStart,
    sessionLengths: SESSION_LENGTHS,
  };
}
