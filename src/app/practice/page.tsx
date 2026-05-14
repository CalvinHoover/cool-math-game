import PracticeBox from './PracticeBox';

// Hardcoded questions without answers
const QUESTIONS = [
  { id: 'q1', text: 'What is the capital of France?', points: 1 },
  { id: 'q2', text: 'What is 4 x 4?', points: 2 },
  { id: 'q3', text: 'What is the fourth planet from the sun?', points: 3 },
  { id: 'q4', text: 'What is the chemical symbol for Gold?', points: 4 },
  { id: 'q5', text: 'What is 2 to the power of 3?', points: 5 },
];

export default async function PracticePage() {
  // Prisma placeholder:
  // const questions = await prisma.question.findMany({ select: { id: true, text: true, points: true } });

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Practice Session</h1>
      <PracticeBox initialQuestions={QUESTIONS} />
    </main>
  );
}