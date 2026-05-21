import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';

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
  options: { clear?: boolean; data?: SeedTopic[] } = {}
) {
  const existingCount = await prisma.question.count();

  if (existingCount > 0 && !options.clear) {
    console.warn(
      `Found ${existingCount} existing questions. Skipping seed. Use --clear to re-seed.`
    );
    return;
  }

  if (options.clear) {
    await prisma.question.deleteMany();
    await prisma.topic.deleteMany();
    console.log('Cleared existing questions and topics.');
  }

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
      await prisma.question.create({
        data: {
          topicId: topic.id,
          text: q.text,
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
}
