import PracticeBox from './PracticeBox';
import { bootstrapPracticeSession } from '@/features/practice/actions';

type PracticePageProps = {
  searchParams?: {
    topicId?: string | string[];
    count?: string | string[];
  };
};

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Please log in to start a practice session.',
  'invalid-topic': 'Choose a topic to start practice.',
  'no-questions': 'No questions are available for this topic yet.',
};

export default async function PracticePage({
  searchParams,
}: PracticePageProps) {
  const topicId = typeof searchParams?.topicId === 'string' ? searchParams.topicId : '';
  const countValue =
    typeof searchParams?.count === 'string'
      ? Number.parseInt(searchParams.count, 10)
      : undefined;
  const count = Number.isFinite(countValue) ? countValue : undefined;

  const result = await bootstrapPracticeSession({ topicId, count });

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
      <PracticeBox sessionId={result.sessionId} initialQuestions={result.questions} />
    </main>
  );
}