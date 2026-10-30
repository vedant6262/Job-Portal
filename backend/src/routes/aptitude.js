const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const prisma = require('../config/prisma');
const { askGroq } = require('../services/groqService');

const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many AI requests. Please try again later.' } });
const categories = ['quantitative', 'logical', 'verbal', 'mixed'];
const difficulties = ['easy', 'medium', 'hard', 'mixed'];

async function getUserId(clerkId) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error('User profile not found');
  return user.id;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function publicQuestion(question) {
  return {
    id: question.id,
    category: question.category,
    topic: question.topic,
    question: question.question,
    options: { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD },
    difficulty: question.difficulty,
  };
}

router.get('/companies', requireAuth, async (req, res) => {
  try {
    const companies = await prisma.interviewCompany.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { aptitudeQuestions: true } } } });
    res.json(companies);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/questions', requireAuth, async (req, res) => {
  try {
    const { companyId, category, difficulty, topic } = req.query;
    const questions = await prisma.aptitudeQuestion.findMany({
      where: { ...(companyId ? { companyId } : {}), ...(category && category !== 'mixed' ? { category } : {}), ...(difficulty && difficulty !== 'mixed' ? { difficulty } : {}), ...(topic ? { topic: { contains: topic, mode: 'insensitive' } } : {}) },
      include: { company: { select: { id: true, name: true, logo: true } } },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
    res.json(questions.map(publicQuestion));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/test/start', requireAuth, async (req, res) => {
  try {
    const { companyId, category = 'mixed', difficulty = 'mixed', questionCount = 10, practiceMode = false } = req.body;
    const count = Number(questionCount);
    if (!companyId || !categories.includes(category) || !difficulties.includes(difficulty) || ![10, 20, 30, 50].includes(count)) return res.status(400).json({ error: 'Invalid test configuration' });
    const userId = await getUserId(req.userId);
    const company = await prisma.interviewCompany.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const pool = await prisma.aptitudeQuestion.findMany({ where: { companyId, ...(category !== 'mixed' ? { category } : {}), ...(difficulty !== 'mixed' ? { difficulty } : {}) } });
    if (pool.length < count) return res.status(400).json({ error: `Only ${pool.length} questions are available for this configuration. Try Mixed filters or a smaller test.` });
    const selected = shuffle(pool).slice(0, count);
    const session = await prisma.aptitudeTestSession.create({ data: { userId, companyId, category, difficulty, totalQuestions: count, questionIds: selected.map(question => question.id), practiceMode } });
    res.status(201).json({ sessionId: session.id, startedAt: session.startedAt, practiceMode, durationSeconds: practiceMode ? null : count * 60, company: { id: company.id, name: company.name }, questions: selected.map(publicQuestion) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/test/submit', requireAuth, async (req, res) => {
  try {
    const { sessionId, answers = [], timeTaken = 0 } = req.body;
    const userId = await getUserId(req.userId);
    const session = await prisma.aptitudeTestSession.findFirst({ where: { id: sessionId, userId }, include: { company: true } });
    if (!session) return res.status(404).json({ error: 'Test session not found' });
    if (session.completedAt) return res.status(409).json({ error: 'This test has already been submitted' });
    const questions = await prisma.aptitudeQuestion.findMany({ where: { id: { in: session.questionIds } } });
    const answerMap = new Map(answers.map(answer => [answer.questionId, answer.answer]));
    const records = questions.map(question => { const selectedAnswer = answerMap.get(question.id) || null; return { sessionId, questionId: question.id, selectedAnswer, isCorrect: selectedAnswer === question.correctAnswer, timeSpent: Number(answers.find(answer => answer.questionId === question.id)?.timeSpent || 0) }; });
    const correctAnswers = records.filter(answer => answer.isCorrect).length;
    const answered = records.filter(answer => answer.selectedAnswer).length;
    const result = await prisma.$transaction(async tx => {
      await tx.aptitudeAnswer.createMany({ data: records });
      return tx.aptitudeTestSession.update({ where: { id: sessionId }, data: { score: correctAnswers, percentage: Math.round(correctAnswers / session.totalQuestions * 100), correctAnswers, wrongAnswers: answered - correctAnswers, unanswered: session.totalQuestions - answered, timeTaken: Number(timeTaken), completedAt: new Date() } });
    });
    res.json({ sessionId, company: session.company.name, score: result.score, percentage: result.percentage, correctAnswers: result.correctAnswers, wrongAnswers: result.wrongAnswers, unanswered: result.unanswered, timeTaken: result.timeTaken });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/test/:sessionId', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    const session = await prisma.aptitudeTestSession.findFirst({ where: { id: req.params.sessionId, userId }, include: { company: true, answers: { include: { question: true } } } });
    if (!session) return res.status(404).json({ error: 'Test session not found' });
    if (!session.completedAt) return res.json({ sessionId: session.id, status: 'IN_PROGRESS', questions: session.questionIds });
    res.json({ ...session, answers: session.answers.map(answer => ({ questionId: answer.questionId, question: answer.question.question, options: { A: answer.question.optionA, B: answer.question.optionB, C: answer.question.optionC, D: answer.question.optionD }, selectedAnswer: answer.selectedAnswer, correctAnswer: answer.question.correctAnswer, isCorrect: answer.isCorrect, explanation: answer.question.explanation })) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/history', requireAuth, async (req, res) => {
  try { const userId = await getUserId(req.userId); res.json(await prisma.aptitudeTestSession.findMany({ where: { userId, completedAt: { not: null } }, include: { company: true }, orderBy: { completedAt: 'desc' }, take: 30 })); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/progress', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    const companyId = req.query.companyId;
    const sessions = await prisma.aptitudeTestSession.findMany({ where: { userId, completedAt: { not: null }, ...(companyId ? { companyId } : {}) } });
    const attempted = await prisma.aptitudeAnswer.count({ where: { session: { userId, ...(companyId ? { companyId } : {}) } } });
    const solved = await prisma.aptitudeAnswer.count({ where: { session: { userId, ...(companyId ? { companyId } : {}) } , isCorrect: true } });
    const scores = sessions.map(session => session.percentage || 0);
    res.json({ questionsAttempted: attempted, questionsSolved: solved, accuracy: attempted ? Math.round(solved / attempted * 100) : 0, averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0, bestScore: scores.length ? Math.max(...scores) : 0, testsCompleted: sessions.length, timeSpent: sessions.reduce((sum, session) => sum + (session.timeTaken || 0), 0) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/explain', requireAuth, aiLimiter, async (req, res) => {
  try {
    const question = await prisma.aptitudeQuestion.findUnique({ where: { id: req.body.questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    const answer = await askGroq([{ role: 'system', content: 'You are an aptitude coach. Explain the answer clearly and concisely.' }, { role: 'user', content: `Question: ${question.question}\nOptions: A ${question.optionA}; B ${question.optionB}; C ${question.optionC}; D ${question.optionD}\nCorrect answer: ${question.correctAnswer}\n\nProvide: correct answer, step-by-step solution or reasoning, shortcut if applicable, important formula, and common mistake.` }]);
    res.json({ answer });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/generate', requireAuth, aiLimiter, async (req, res) => {
  try {
    const { companyId, category, topic, difficulty, numberOfQuestions = 10 } = req.body;
    if (!companyId || !category || !topic || !difficulty || ![10, 20, 30, 50].includes(Number(numberOfQuestions))) return res.status(400).json({ error: 'Invalid generation request' });
    const company = await prisma.interviewCompany.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const raw = await askGroq([{ role: 'system', content: 'Generate original aptitude practice questions. These are not actual company questions. Return valid JSON only.' }, { role: 'user', content: `Generate ${numberOfQuestions} original ${difficulty} ${category} aptitude MCQs about ${topic} for practice related to ${company.name}. Return {"questions":[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correctAnswer":"A","explanation":"...","difficulty":"${difficulty}","topic":"${topic}"}]}. Ensure exactly four non-empty options and correctAnswer is A, B, C, or D.` }], { json: true, maxTokens: 5000 });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.questions)) throw new Error('Groq returned an invalid question set');
    const questions = parsed.questions.filter(item => item.question && item.options && ['A', 'B', 'C', 'D'].includes(item.correctAnswer) && ['A', 'B', 'C', 'D'].every(key => item.options[key])).slice(0, Number(numberOfQuestions)).map(item => ({ ...item, aiGenerated: true }));
    res.json({ disclaimer: 'AI-generated practice questions. These are not guaranteed to be actual company questions.', questions });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
