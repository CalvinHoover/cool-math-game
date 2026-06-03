import Link from 'next/link';
import PracticeBox from './PracticeBox';
import BackButton from '@/components/interface/BackButton';
import { bootstrapPracticeSession } from '@/features/practice/actions';
import { prisma } from '@/lib/prisma';

type PracticePageProps = {
  searchParams?: Promise<{
    topicId?: string | string[];
    count?: string | string[];
  }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:    'Please log in to start a practice session.',
  'invalid-topic': 'Choose a topic to start practice.',
  'no-questions':  'No questions are available for this topic yet.',
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params  = await searchParams;
  const topicId = typeof params?.topicId === 'string' ? params.topicId : '';
  const countValue =
    typeof params?.count === 'string' ? Number.parseInt(params.count, 10) : undefined;
  const count = Number.isFinite(countValue) ? countValue : undefined;

  // ── No topic selected — show picker ───────────────────────────────────────
  if (!topicId) {
    const topics = await prisma.topic.findMany({ orderBy: { name: 'asc' } });

    return (
      <main className="p-8 max-w-2xl mx-auto">
        <BackButton />

        <h1 className="text-2xl font-bold mt-4 mb-6">Practice — Choose a Topic</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/practice?topicId=${topic.id}`}
              style={{
                padding: '0.75rem 1.25rem',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                textTransform: 'capitalize',
                textDecoration: 'none',
              }}
            >
              {topic.name}
            </Link>
          ))}
        </div>
      </main>
    );
  }

  // ── Topic selected — bootstrap session ────────────────────────────────────
  const result = await bootstrapPracticeSession({ topicId, count });

  if (!result.ok) {
    const message = ERROR_MESSAGES[result.error] ?? 'Unable to start practice session.';
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <BackButton label="Back to Topics" href="/practice" />
        <h1 className="text-2xl font-bold mt-4 mb-6">Practice Session</h1>
        <p className="text-red-600">{message}</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <BackButton label="Back to Topics" href="/practice" />
      <h1 className="text-2xl font-bold mt-4 mb-6">Practice Session</h1>
      <PracticeBox sessionId={result.sessionId} initialQuestions={result.questions} />
    </main>
  );
}
