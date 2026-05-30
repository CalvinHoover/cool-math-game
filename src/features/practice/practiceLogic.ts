// pure scoring and progression helpers shared by UI and tests
export type PracticeQuestion = {
  id: string;
  text: string;
  points: number;
  attempts: number;
  correct: boolean;
};

export type PracticeState = {
  score: number;
  currentIndex: number;
  attempt: number;
};

export function getEarnedPoints(question: PracticeQuestion): number {
  if (!question.correct) {
    return 0;
  }

  return question.attempts <= 1 ? question.points : question.points / 2;
}

export function getNextQuestionIndex(
  questions: PracticeQuestion[],
  startIndex: number
): number {
  for (let index = startIndex; index < questions.length; index += 1) {
    const question = questions[index];
    if (!question.correct && question.attempts < 2) {
      return index;
    }
  }

  return questions.length;
}

export function getAttemptForQuestion(question?: PracticeQuestion): number {
  if (!question) {
    return 1;
  }

  return Math.min(2, question.attempts + 1);
}

export function deriveInitialState(questions: PracticeQuestion[]): PracticeState {
  const score = questions.reduce(
    (total, question) => total + getEarnedPoints(question),
    0
  );
  const currentIndex = getNextQuestionIndex(questions, 0);
  const attempt = getAttemptForQuestion(questions[currentIndex]);

  return { score, currentIndex, attempt };
}
