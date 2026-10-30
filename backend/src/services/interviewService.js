const { askGroq } = require('./groqService');

function context(question, language) {
  return `Question title: ${question.title}\nQuestion: ${question.question}\nTopic: ${question.topic}\nDifficulty: ${question.difficulty}\nPreferred language: ${language || 'JavaScript'}`;
}

function normalizeCareerGoal(careerGoal) {
  if (!careerGoal) return 'Software Developer';
  const normalized = String(careerGoal).trim();
  const goalMap = {
    software: 'Software Developer',
    developer: 'Software Developer',
    'software developer': 'Software Developer',
    data: 'Data Analyst',
    'data analyst': 'Data Analyst',
    ai: 'AI / ML Engineer',
    'ml': 'AI / ML Engineer',
    'ai / ml engineer': 'AI / ML Engineer',
    cybersecurity: 'Cybersecurity Analyst',
    cyber: 'Cybersecurity Analyst',
    'cybersecurity analyst': 'Cybersecurity Analyst',
    electronics: 'Electronics Engineer',
    'electronics engineer': 'Electronics Engineer',
    other: 'General Career Path',
    'general career path': 'General Career Path',
  };

  return goalMap[normalized.toLowerCase()] || normalized;
}

async function generateCareerGoalQuestions({ company, role, type, difficulty, careerGoal, count = 5 }) {
  const goal = normalizeCareerGoal(careerGoal);

  const raw = await askGroq([
    {
      role: 'system',
      content: 'You are an expert technical interview coach. Generate realistic multiple-choice interview questions tailored to a specific career goal. Return valid JSON only. No markdown blocks.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        company,
        role,
        type,
        difficulty,
        careerGoal: goal,
        count,
        requirements: [
          'Make every question reflect the chosen career goal and relevant technical domain.',
          'For Software Developer: focus on DSA, OOP, backend/frontend architecture, JavaScript/TypeScript/Java/Python, DB, APIs, testing.',
          'For Data Analyst: focus on SQL, analytics, data wrangling, experimentation, statistics, data visualization, business metrics.',
          'For AI / ML Engineer: focus on ML pipelines, model evaluation, feature engineering, probability, optimization, Python, deployment trade-offs.',
          'For Cybersecurity Analyst: focus on network security, authentication, secure coding, Linux, incident response, OWASP threats.',
          'For Electronics Engineer: focus on embedded systems, digital logic, signals, circuits, microcontrollers, debugging, control systems.',
          'For General Career Path: focus on conceptual problem solving, communication, teamwork, and domain-aware reasoning.',
          'Questions must be multiple-choice with options A, B, C, D.',
          'Include one correct answer and a short explanation.',
          'Keep the wording realistic for a hiring interview and avoid repetition between questions.',
          'Output JSON in this exact shape: { "questions": [{ "id": "q1", "question": "...", "topic": "...", "difficulty": "...", "type": "Technical", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correctAnswer": "B", "explanation": "..." }] }',
        ],
      }),
    },
  ], { json: true, maxTokens: 3000 });

  try {
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    return questions
      .map((item, index) => ({
        id: item.id || `career-${goal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
        question: String(item.question || '').trim(),
        topic: String(item.topic || goal).trim(),
        difficulty: String(item.difficulty || difficulty || 'Medium').trim(),
        type: String(item.type || type || 'Technical').trim(),
        options: {
          A: String(item.options?.A || '').trim(),
          B: String(item.options?.B || '').trim(),
          C: String(item.options?.C || '').trim(),
          D: String(item.options?.D || '').trim(),
        },
        correctAnswer: String(item.correctAnswer || 'A').toUpperCase().slice(0, 1),
        explanation: String(item.explanation || '').trim(),
      }))
      .filter(question => question.question && question.options.A && question.options.B && question.options.C && question.options.D);
  } catch (error) {
    console.error('Career goal question generation failed:', error.message);
    return [];
  }
}

async function generateTechnicalMockQuestions({ company, role, type, difficulty, count = 5, careerGoal }) {
  const goal = normalizeCareerGoal(careerGoal);
  const raw = await askGroq([
    {
      role: 'system',
      content: `You are an expert technical interview coach for ${goal}. Generate realistic technical multiple-choice interview questions with one correct answer. Return valid JSON only. No markdown blocks.`,
    },
    {
      role: 'user',
      content: JSON.stringify({
        company,
        role,
        type,
        difficulty,
        careerGoal: goal,
        count,
        requirements: [
          'Each question should be relevant to the role and technical level.',
          'Use real engineering concepts such as data structures, algorithms, JavaScript/TypeScript/Java/Python concepts, system design, database design, OOP, async patterns, or backend/frontend architecture.',
          'Questions must be multiple-choice with options A, B, C, D.',
          'Include one correct answer and a short explanation.',
          'Keep the question realistic for a hiring interview and not too trivial.',
          'Output JSON in this exact shape: { "questions": [{ "id": "q1", "question": "...", "topic": "...", "difficulty": "...", "type": "Technical", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correctAnswer": "B", "explanation": "..." }] }',
        ],
      }),
    },
  ], { json: true, maxTokens: 2600 });

  try {
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    return questions
      .map((item, index) => ({
        id: item.id || `q${index + 1}`,
        question: String(item.question || '').trim(),
        topic: String(item.topic || 'Technical').trim(),
        difficulty: String(item.difficulty || difficulty || 'Medium').trim(),
        type: String(item.type || type || 'Technical').trim(),
        options: {
          A: String(item.options?.A || '').trim(),
          B: String(item.options?.B || '').trim(),
          C: String(item.options?.C || '').trim(),
          D: String(item.options?.D || '').trim(),
        },
        correctAnswer: String(item.correctAnswer || 'A').toUpperCase().slice(0, 1),
        explanation: String(item.explanation || '').trim(),
      }))
      .filter(question => question.question && question.options.A && question.options.B && question.options.C && question.options.D);
  } catch (error) {
    console.error('Technical question generation failed:', error.message);
    return [];
  }
}

async function explainQuestion(question, language) {
  return askGroq([
    { role: 'system', content: 'You are a patient interview coach. Explain the problem without giving complete code or a complete solution.' },
    { role: 'user', content: `${context(question, language)}\n\nReturn these headings: Problem explanation, What it asks, Important observations, Recommended approach, Step-by-step reasoning, Algorithm, Time complexity, Space complexity, Common mistakes. Do not reveal complete code.` },
  ]);
}

async function getHint(question, level, language) {
  const hintLevel = Math.min(3, Math.max(1, Number(level) || 1));
  return askGroq([
    { role: 'system', content: 'You are an interview coach. Encourage the candidate to solve the problem. Never provide complete code in a hint.' },
    { role: 'user', content: `${context(question, language)}\n\nGive progressive hint ${hintLevel} of 3. Hint 1 is conceptual, hint 2 names a useful algorithm or data structure, and hint 3 gives a near-solution plan. Give only the requested hint.` },
  ]);
}

async function solveQuestion(question, language) {
  return askGroq([
    { role: 'system', content: 'You are an expert coding interviewer. Provide a clear, copyable solution.' },
    { role: 'user', content: `${context(question, language)}\n\nReturn: Approach, Algorithm, Pseudocode, Complete ${language || 'JavaScript'} code in a fenced code block, Explanation, Time complexity, Space complexity, Edge cases.` },
  ], { maxTokens: 2600 });
}

async function startMockInterview({ company, role, type, difficulty }) {
  return askGroq([
    { role: 'system', content: 'You are an AI interviewer. Ask exactly one concise interview question and no evaluation yet.' },
    { role: 'user', content: `Start a ${type} interview for ${role} at ${company}, difficulty ${difficulty}. Ask the first question only.` },
  ]);
}

async function evaluateMockAnswer({ company, role, type, difficulty, transcript, answer }) {
  return askGroq([
    { role: 'system', content: 'You are an AI interviewer. Evaluate the candidate answer, then ask exactly one next relevant question. Return valid JSON with feedback (string), correctness (0-100), relevance (0-100), clarity (0-100), overall (0-100), score (same as overall), nextQuestion, and finished (boolean). Set finished true after enough evidence or when the transcript contains 5 answered questions. Keep feedback concise and actionable.' },
    { role: 'user', content: JSON.stringify({ company, role, type, difficulty, transcript, answer }) },
  ], { json: true });
}

async function createMockReport({ company, role, type, difficulty, transcript }) {
  return askGroq([
    { role: 'system', content: 'You are an interview evaluator. Return valid JSON only with score, evaluation object containing problemSolving, technicalKnowledge, communication, accuracy, timeManagement, confidenceClarity, arrays strengths, weaknesses, recommendations, and duration.' },
    { role: 'user', content: JSON.stringify({ company, role, type, difficulty, transcript }) },
  ], { json: true });
}

module.exports = {
  explainQuestion,
  getHint,
  solveQuestion,
  startMockInterview,
  evaluateMockAnswer,
  createMockReport,
  generateTechnicalMockQuestions,
};