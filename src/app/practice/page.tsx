import PracticeBox from './PracticeBox';
import PracticeSetup from './PracticeSetup';
import { bootstrapPracticeSession } from '@/features/practice/actions';

type SearchParams = {
  topicId?: string | string[];
  count?: string | string[];
  timeLimit?: string | string[];
};

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Please log in to start a practice session.',
  'invalid-topic': 'Choose a topic to start practice.',
  'no-questions': 'No questions are available for this topic yet.',
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const topicId = typeof params?.topicId === 'string' ? params.topicId : '';

  if (!topicId) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Practice Session</h1>
        <PracticeSetup />
      </main>
    );
  }

  const countValue =
    typeof params?.count === 'string'
      ? Number.parseInt(params.count, 10)
      : undefined;
  const count = Number.isFinite(countValue) ? countValue : undefined;

  const timeLimitValue =
    typeof params?.timeLimit === 'string'
      ? Number.parseInt(params.timeLimit, 10)
      : undefined;
  const timeLimit = Number.isFinite(timeLimitValue) ? timeLimitValue : undefined;

  const result = await bootstrapPracticeSession({ topicId, count, timeLimit });

  if (!result.ok) {
    const message = ERROR_MESSAGES[result.error] ?? 'Unable to start practice session.';
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Practice Session</h1>
        <p className="text-red-600">{message}</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Practice Session</h1>
      <PracticeBox
        sessionId={result.sessionId}
        initialQuestions={result.questions}
        timeLimit={result.timeLimit}
      />
    </main>
  );
}