export interface AlgebraQuestion {
  text:       string;
  answer:     string;
  difficulty: number;
  topic:      'algebra';
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(...options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

// easy stuff here

function easyLinear(): AlgebraQuestion {
  const x = randomInt(1, 10);
  const a = randomInt(2, 8);
  const b = randomInt(1, 20);
  const c = a * x + b;
  return {
    text:       `What is the value of x in the equation ${a}x + ${b} = ${c}?`,
    answer:     String(x),
    difficulty: 0,
    topic:      'algebra',
  };
}

function easyEvaluate(): AlgebraQuestion {
  // f(x) = ax² + b,  find f(n)
  const a = randomInt(1, 5);
  const b = randomInt(0, 20);
  const n = randomInt(1, 6);
  const result = a * n * n + b;
  return {
    text:       `If f(x) = ${a}x² + ${b}, what is f(${n})?`,
    answer:     String(result),
    difficulty: 0,
    topic:      'algebra',
  };
}

// mediu stuff here

function mediumTwoStep(): AlgebraQuestion {
  const x     = randomInt(1, 10);
  const aDiff = randomInt(1, 5);
  const c     = randomInt(1, 6);
  const a     = c + aDiff;
  const b     = randomInt(0, 15);
  const d     = aDiff * x + b;
  return {
    text:       `If ${a}x + ${b} = ${c}x + ${d}, what is the value of x?`,
    answer:     String(x),
    difficulty: 1,
    topic:      'algebra',
  };
}

function mediumQuadratic(): AlgebraQuestion {
  const p = randomInt(1, 8);
  const q = randomInt(1, 8);
  const b = -(p + q); 
  const c = p * q;   

  const bStr = b === -1 ? '-' : `${b}`;
  const text = `What are the values of x in x² ${b < 0 ? `- ${p+q}` : `+ ${b}`}x + ${c} = 0?`;
  const [r1, r2] = [p, q].sort((a, b) => a - b);
  return {
    text,
    answer:     `${r1}, ${r2}`,
    difficulty: 1,
    topic:      'algebra',
  };
}

// hard stuff here

function hardSystem(): AlgebraQuestion {
  const x = randomInt(1, 10);
  const y = randomInt(1, 10);
  const a = x + y;
  const b = x - y;
  return {
    text:       `Solve the system: x + y = ${a} and x - y = ${b}. What is the value of x?`,
    answer:     String(x),
    difficulty: 2,
    topic:      'algebra',
  };
}

function hardMixedQuadratic(): AlgebraQuestion {
  const p = randomInt(1, 8);
  const q = randomInt(1, 8);
  const bCoeff = q - p;        
  const cCoeff = -(p * q);        
  const bStr   = bCoeff === 0
    ? ''
    : bCoeff > 0
      ? ` + ${bCoeff}x`
      : ` - ${Math.abs(bCoeff)}x`;
  const cStr   = cCoeff >= 0 ? ` + ${cCoeff}` : ` - ${Math.abs(cCoeff)}`;
  const roots  = [-q, p].sort((a, b) => a - b);
  return {
    text:       `What are the values of x in x²${bStr}${cStr} = 0?`,
    answer:     `${roots[0]}, ${roots[1]}`,
    difficulty: 2,
    topic:      'algebra',
  };
}

function hardExponents(): AlgebraQuestion {
  // x^a · x^b = x^?  (product rule)
  const a = randomInt(1, 8);
  const b = randomInt(1, 8);
  return {
    text:       `Simplify: x^${a} · x^${b} = x^?`,
    answer:     String(a + b),
    difficulty: 2,
    topic:      'algebra',
  };
}

export function generateAlgebraQuestion(difficulty: number): AlgebraQuestion {
  switch (difficulty) {
    case 0: return pick(easyLinear, easyEvaluate)();
    case 1: return pick(mediumTwoStep, mediumQuadratic)();
    case 2: return pick(hardSystem, hardMixedQuadratic, hardExponents)();
    default: return generateAlgebraQuestion(0);
  }
}
