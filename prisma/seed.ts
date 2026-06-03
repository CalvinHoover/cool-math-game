// prisma/seed.ts
// Run with: npx prisma db seed
// Seeds the Topic and Question tables from static question data.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Difficulty mapping ───────────────────────────────────────────────────────
// The JSON bank uses a 1-10 scale. The game uses 0 (easy) / 1 (medium) / 2 (hard).
function mapDifficulty(d: number): number {
  if (d <= 3) return 0;
  if (d <= 6) return 1;
  return 2;
}

// ─── Raw question data ────────────────────────────────────────────────────────

interface RawQuestion {
  topic: string;
  text: string;
  answer: string;
  hint?: string;
  difficulty: number; // already on the 0-2 scale for legacy questions
}

// Existing hardcoded questions (already on 0-2 scale, kept as-is)
const legacyQuestions: RawQuestion[] = [
  { topic: 'arithmetic', text: 'What is 12 + 10?',          answer: '22',  difficulty: 0 },
  { topic: 'arithmetic', text: 'What is 26 * 14?',           answer: '364', difficulty: 1 },
  {
    topic: 'arithmetic',
    text: 'A two-digit number and the number formed by reversing its digits are added. What is the largest integer that will always divide the sum?',
    answer: '11',
    difficulty: 2,
  },
  { topic: 'counting', text: 'How many ways are there to arrange the letters in the word "MATH"?',            answer: '24',  difficulty: 0 },
  { topic: 'counting', text: 'How many ways can six knights be arranged around a circular table?',           answer: '120', difficulty: 1 },
  { topic: 'counting', text: 'How many ways can 6 different books be arranged on a shelf if 2 of the books must be next to each other?', answer: '240', difficulty: 2 },
  { topic: 'algebra',  text: 'What is the value of x in the equation 2x + 5 = 15?',                         answer: '5',   difficulty: 0 },
  { topic: 'algebra',  text: 'If 3x - 2 = 4x + 1, what is the value of x?',                                answer: '-3',  difficulty: 1 },
  { topic: 'algebra',  text: 'If a + b = 6, b + c = 8, and a + c = 10, what is the value of a + b + c?',   answer: '12',  difficulty: 2 },
];

// Questions from the JSON bank (difficulties on 1-10 scale — mapped via mapDifficulty)
const jsonQuestions = [
  // ── Algebra ──────────────────────────────────────────────────────────────
  { topic: 'algebra', text: 'Factor the quadratic equation: x^2 - 5x + 6 = 0. What are the values of x?',                                                         answer: '2, 3',                         hint: 'Find two numbers that multiply to 6 and add to -5.',                                                     difficulty: 1 },
  { topic: 'algebra', text: 'Factor the quadratic expression: 2x^2 - 7x + 3.',                                                                                     answer: '(2x-1)(x-3)',                  hint: 'Use the ac-method. Multiply 2 and 3 to get 6, then find factors of 6 that add to -7.',                  difficulty: 2 },
  { topic: 'algebra', text: 'Solve the system of equations for x and y: x + y = 4 and 2x - y = 5.',                                                                answer: 'x=3, y=1',                     hint: 'Add the two equations together to eliminate y.',                                                        difficulty: 3 },
  { topic: 'algebra', text: 'Solve for x in the non-linear system: x^2 + y^2 = 25 and y = x + 1.',                                                                answer: '3, -4',                        hint: 'Substitute the expression for y from the second equation into the first equation.',                      difficulty: 4 },
  { topic: 'algebra', text: 'What is the order of the symmetric group S_4?',                                                                                        answer: '24',                           hint: 'The order of S_n is n!.',                                                                               difficulty: 5 },
  { topic: 'algebra', text: 'Is the alternating group A_4 simple? Answer Yes or No.',                                                                               answer: 'No',                           hint: 'Consider the Klein four-group V as a normal subgroup of A_4.',                                          difficulty: 6 },
  { topic: 'algebra', text: 'By Burnside\'s Lemma, how many distinct colorings of a square\'s vertices are there using 2 colors, up to rotational symmetry?',     answer: '6',                            hint: 'Calculate the number of fixed points for each of the 4 rotations and average them.',                    difficulty: 7 },
  { topic: 'algebra', text: 'If a group G of order 15 acts on a set of size 7, what is the minimum number of fixed points?',                                       answer: '1',                            hint: 'By the Orbit-Stabilizer theorem, the size of any orbit must divide 15.',                                 difficulty: 8 },
  { topic: 'algebra', text: 'What is the first homology group H_1(S^2; Z) of the 2-sphere?',                                                                       answer: '0',                            hint: 'The 2-sphere is simply connected.',                                                                     difficulty: 9 },
  { topic: 'algebra', text: 'Let 0 → A → B → C → 0 be a short exact sequence of chain complexes. What homomorphism connects their homology groups in the long exact sequence?', answer: 'connecting homomorphism', hint: 'It is often denoted by d* or delta and raises or lowers the degree by 1.',                             difficulty: 10 },

  // ── Topology ─────────────────────────────────────────────────────────────
  { topic: 'topology', text: 'Is the function f(x) = 1/x continuous on the open interval (0, infinity)? Answer Yes or No.',                                       answer: 'Yes',                          hint: 'Check if the denominator is ever zero on this specific domain.',                                        difficulty: 1 },
  { topic: 'topology', text: 'In the discrete topology on R, which functions from R to R are continuous?',                                                          answer: 'All functions',                hint: 'Recall that in the discrete topology, every subset is an open set.',                                    difficulty: 2 },
  { topic: 'topology', text: 'Is the set of rational numbers Q connected in the standard topology of R? Answer Yes or No.',                                        answer: 'No',                           hint: 'Pick any irrational number to separate the set into two disjoint, non-empty open sets.',                difficulty: 3 },
  { topic: 'topology', text: 'How many connected components does the general linear group GL(n, R) have?',                                                           answer: '2',                            hint: 'Consider the determinant function. Matrices must have either a strictly positive or strictly negative determinant.', difficulty: 4 },
  { topic: 'topology', text: 'By the Heine-Borel theorem, what two properties characterize a compact subset of R^n?',                                              answer: 'Closed and bounded',           hint: 'A set like [0,1] has these two properties, while (0,1) lacks one.',                                     difficulty: 5 },
  { topic: 'topology', text: 'Is the open interval (0, 1) compact in the standard topology? Answer Yes or No.',                                                    answer: 'No',                           hint: 'Consider the open cover formed by (1/n, 1) for integers n >= 2. Does it have a finite subcover?',       difficulty: 6 },
  { topic: 'topology', text: 'Are Euclidean space R^n and a single point homotopy equivalent? Answer Yes or No.',                                                  answer: 'Yes',                          hint: 'R^n is a contractible space, meaning it can be continuously shrunk to a point.',                        difficulty: 7 },
  { topic: 'topology', text: 'What is the degree of the map f(z) = z^3 from the unit circle S^1 to itself?',                                                       answer: '3',                            hint: 'Determine how many times the mapping wraps completely around the circle.',                               difficulty: 8 },
  { topic: 'topology', text: 'What is the fundamental group pi_1(S^1) of the circle?',                                                                              answer: 'Z',                            hint: 'It describes the number of times a loop winds around the circle, which can be any integer.',             difficulty: 9 },
  { topic: 'topology', text: 'What is the fundamental group of the figure-eight space (the wedge sum of two circles)?',                                             answer: 'Free group on 2 generators',   hint: 'Apply the Seifert-van Kampen theorem. There are no relations between the two generating loops.',        difficulty: 10 },

  // ── Calculus ─────────────────────────────────────────────────────────────
  { topic: 'calculus', text: 'What is the derivative of f(x) = x^3 with respect to x?',                                                                            answer: '3x^2',                         hint: 'Use the power rule: d/dx(x^n) = nx^(n-1).',                                                            difficulty: 1 },
  { topic: 'calculus', text: 'What is the derivative of f(x) = sin(e^x)?',                                                                                         answer: 'e^x cos(e^x)',                 hint: 'Apply the chain rule.',                                                                                 difficulty: 2 },
  { topic: 'calculus', text: 'Evaluate the limit: lim(x→0) sin(x)/x.',                                                                                             answer: '1',                            hint: 'You can use L\'Hopital\'s rule or the Maclaurin series for sin(x).',                                    difficulty: 3 },
  { topic: 'calculus', text: 'Evaluate the limit: lim(n→∞) (1 + 1/n)^n.',                                                                                         answer: 'e',                            hint: 'This limit is the standard definition of a fundamental mathematical constant.',                           difficulty: 4 },
  { topic: 'calculus', text: 'Evaluate the definite integral over all real numbers: integral of e^(-x^2) dx.',                                                     answer: 'sqrt(pi)',                     hint: 'This is the Gaussian integral. Square it and convert to polar coordinates.',                            difficulty: 5 },
  { topic: 'calculus', text: 'Evaluate the Dirichlet integral: integral from 0 to infinity of sin(x)/x dx.',                                                       answer: 'pi/2',                         hint: 'This can be solved using the Laplace transform or Feynman\'s trick.',                                   difficulty: 6 },
  { topic: 'calculus', text: 'According to the Arzelà-Ascoli theorem, a sequence of functions on a compact metric space has a uniformly convergent subsequence if it is uniformly bounded and what else?', answer: 'equicontinuous', hint: 'This property ensures the functions do not oscillate too wildly relative to each other.',              difficulty: 7 },
  { topic: 'calculus', text: 'Does the sequence of functions f_n(x) = sin(nx) on [0, 2pi] have a uniformly convergent subsequence? Answer Yes or No.',             answer: 'No',                           hint: 'Check if the sequence is equicontinuous. Look at the derivatives.',                                     difficulty: 8 },
  { topic: 'calculus', text: 'For what values of p is the sequence x_n = 1/n contained in the sequence space l^p?',                                               answer: 'p > 1',                        hint: 'Recall the p-series test.',                                                                             difficulty: 9 },
  { topic: 'calculus', text: 'In L^p spaces, what inequality states that ||fg||_1 <= ||f||_p ||g||_q where 1/p + 1/q = 1?',                                       answer: "Holder's inequality",          hint: 'It is a broad generalization of the Cauchy-Schwarz inequality.',                                        difficulty: 10 },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding topics and questions...');

  // Collect all unique topic names (normalised to lowercase)
  const allQuestions = [
    ...legacyQuestions,
    ...jsonQuestions.map((q) => ({ ...q, difficulty: mapDifficulty(q.difficulty) })),
  ];

  const topicNames = [...new Set(allQuestions.map((q) => q.topic.toLowerCase()))];

  // Upsert topics so re-running the seed is safe
  const topicMap: Record<string, string> = {};
  for (const name of topicNames) {
    const topic = await prisma.topic.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    topicMap[name] = topic.id;
    console.log(`  Topic ready: ${name}`);
  }

  // Insert questions (skip duplicates by checking text)
  let created = 0;
  let skipped = 0;
  for (const q of allQuestions) {
    const topicId = topicMap[q.topic.toLowerCase()];
    const existing = await prisma.question.findFirst({ where: { text: q.text } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.question.create({
      data: {
        text:       q.text,
        answer:     q.answer,
        hint:       q.hint ?? null,
        difficulty: q.difficulty,
        topicId,
      },
    });
    created++;
  }

  console.log(`Done. ${created} questions created, ${skipped} skipped (already existed).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
