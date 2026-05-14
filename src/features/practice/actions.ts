'use server';
// import prisma from '@/lib/prisma';

// Hardcoded answers (kept strictly on the server)
const ANSWERS = {
  q1: ['Paris', 'Duh'],
  q2: ['16', 'Duh'],
  q3: ['Mars', 'Duh'],
  q4: ['Au', 'Duh'],
  q5: ['8', 'Duh'],
};

export async function verifyAnswer(questionId: string, userAnswer: string, attempt: number) {
  // Prisma placeholder:
  // const question = await prisma.question.findUnique({ where: { id: questionId } });
  // const actualAnswer = question.answer;

  const actualAnswer = ANSWERS[questionId as keyof typeof ANSWERS];
  const isCorrect = userAnswer.trim().toLowerCase() === actualAnswer[0].toLowerCase();

  if (isCorrect) {
    return { correct: true, explanation: actualAnswer[1] };
  } else {
    // Only send the correct answer back if they failed their second attempt
    if (attempt === 2) {
      return { correct: false, answer: actualAnswer[0], explanation: actualAnswer[1] };
    }
    return { correct: false };
  }
}

export async function saveUserScore(userId: string, score: number) {
  try {
    // Security check: validate the input before touching the database
    if (typeof score !== 'number' || score < 0 || score > 5) {
      throw new Error('Invalid score data');
    }

    // await prisma.gameSession.create({
    //   data: {
    //     userId: userId,
    //     score: score,
    //     completedAt: new Date(),
    //   },
    // });

    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to save score' };
  }
}