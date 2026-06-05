import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { seedAchievements } from './achievements';

export type SeedQuestion = {
  text: string;
  answer: string;
  hint?: string;
  explanation: string;
  difficulty: number;
};

export type SeedTopic = {
  topic: string;
  questions: SeedQuestion[];
};

export async function seed(
  prisma: PrismaClient,
  options: { data?: SeedTopic[] } = {}
) {
  const data =
    options.data ??
    (JSON.parse(
      readFileSync(
        join(process.cwd(), 'prisma', 'seed', 'questions.json'),
        'utf-8'
      )
    ) as SeedTopic[]);

  for (const topicData of data) {
    const topic = await prisma.topic.upsert({
      where: { name: topicData.topic },
      create: { name: topicData.topic },
      update: {},
    });

    for (const q of topicData.questions) {
      await prisma.question.upsert({
        where: {
          topicId_text: { topicId: topic.id, text: q.text },
        },
        create: {
          topicId: topic.id,
          text: q.text,
          answer: q.answer,
          hint: q.hint,
          explanation: q.explanation,
          difficulty: q.difficulty,
        },
        update: {
          answer: q.answer,
          hint: q.hint,
          explanation: q.explanation,
          difficulty: q.difficulty,
        },
      });
    }
  }

  const totalQuestions = data.reduce(
    (sum, topic) => sum + topic.questions.length,
    0
  );
  console.log(
    `Seeded ${totalQuestions} questions across ${data.length} topics.`
  );

  await seedAchievements(prisma);
}
