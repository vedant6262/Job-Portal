const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const prisma = require('../config/prisma');
const {
  explainQuestion, getHint, solveQuestion, startMockInterview,
  evaluateMockAnswer, createMockReport, generateTechnicalMockQuestions,
} = require('../services/interviewService');

async function getUserId(clerkId) {
  const normalizedId = String(clerkId || '').trim();
  let user = await prisma.user.findUnique({ where: { clerkId: normalizedId } });

  if (!user && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_AUTH === 'true')) {
    user = await prisma.user.create({
      data: {
        clerkId: normalizedId,
        email: `${normalizedId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'mock-user'}@local.test`,
        firstName: 'Local',
        lastName: 'User',
        role: 'CANDIDATE',
      },
    });
  }

  if (!user) throw new Error('User profile not found');
  return user.id;
}

router.get('/companies', requireAuth, async (req, res) => {
  try {
    const companies = await prisma.interviewCompany.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { questions: true } } } });
    res.json(companies);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/questions', requireAuth, async (req, res) => {
  try {
    const { companyId, role, difficulty, topic } = req.query;
    const userId = await getUserId(req.userId);
    const questions = await prisma.interviewQuestion.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        ...(role ? { role: { equals: role, mode: 'insensitive' } } : {}),
        ...(difficulty && difficulty !== 'All' ? { difficulty } : {}),
        ...(topic && topic !== 'All Topics' ? { topic } : {}),
      },
      include: { company: true, progress: { where: { userId } } },
      orderBy: [{ frequency: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });
    res.json(questions.map(question => ({ ...question, progress: question.progress[0] || null })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.patch('/questions/:questionId/progress', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    const { solved, bookmarked, notes, status } = req.body;
    const data = {
      ...(typeof solved === 'boolean' ? { solved, status: solved ? 'SOLVED' : 'IN_PROGRESS' } : {}),
      ...(typeof bookmarked === 'boolean' ? { bookmarked } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(status ? { status } : {}),
      ...(solved ? { attempts: { increment: 1 }, lastAttemptedAt: new Date() } : {}),
    };
    const progress = await prisma.userQuestionProgress.upsert({
      where: { userId_questionId: { userId, questionId: req.params.questionId } },
      create: { userId, questionId: req.params.questionId, ...data },
      update: data,
    });
    res.json(progress);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/questions/:questionId/explain', requireAuth, async (req, res) => {
  try {
    const question = await prisma.interviewQuestion.findUnique({ where: { id: req.params.questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ answer: await explainQuestion(question, req.body.language) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/questions/:questionId/hint', requireAuth, async (req, res) => {
  try {
    const question = await prisma.interviewQuestion.findUnique({ where: { id: req.params.questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ level: Math.min(3, Number(req.body.level) || 1), answer: await getHint(question, req.body.level, req.body.language) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/questions/:questionId/solution', requireAuth, async (req, res) => {
  try {
    const question = await prisma.interviewQuestion.findUnique({ where: { id: req.params.questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ answer: await solveQuestion(question, req.body.language) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/mock/history', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    res.json(await prisma.mockInterview.findMany({ where: { userId }, include: { company: true }, orderBy: { createdAt: 'desc' } }));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/mock/start', requireAuth, async (req, res) => {
  try {
    const { companyId, role, interviewType, difficulty, careerGoal } = req.body;
    const company = await prisma.interviewCompany.findUnique({ where: { id: companyId } });
    if (!company || !role || !interviewType || !difficulty) return res.status(400).json({ error: 'Company, role, type, and difficulty are required' });

    let questions = await generateTechnicalMockQuestions({
      company: company.name,
      role,
      type: interviewType,
      difficulty,
      careerGoal,
      count: 5,
    });

    if (!questions.length) {
      const pool = await prisma.aptitudeQuestion.findMany({ where: { companyId }, take: 30 });
      questions = pool.sort(() => Math.random() - 0.5).slice(0, 5).map(item => ({
        id: item.id,
        question: item.question,
        options: { A: item.optionA, B: item.optionB, C: item.optionC, D: item.optionD },
        topic: item.topic,
        difficulty: item.difficulty,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
      }));
    }

    if (!questions.length) return res.status(400).json({ error: 'No quiz questions are available for this role yet.' });

    const firstQuestion = { ...questions[0] };
    delete firstQuestion.correctAnswer;
    delete firstQuestion.explanation;
    res.json({ company, role, interviewType, difficulty, careerGoal: careerGoal || 'Software Developer', questions, question: firstQuestion, questionIndex: 0, transcript: [] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/mock/answer', requireAuth, async (req, res) => {
  try {
    const { questions = [], questionIndex = 0, transcript = [], selectedOption } = req.body;
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion || !['A', 'B', 'C', 'D'].includes(selectedOption)) return res.status(400).json({ error: 'A question and answer option are required' });
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const evaluation = { correctness: isCorrect ? 100 : 0, relevance: isCorrect ? 100 : 25, clarity: 100, overall: isCorrect ? 100 : 42 };
    const answerRecord = { questionId: currentQuestion.id, question: currentQuestion.question, options: currentQuestion.options, selectedOption, correctAnswer: currentQuestion.correctAnswer, isCorrect, explanation: currentQuestion.explanation, evaluation };
    const nextIndex = questionIndex + 1;
    const nextQuestion = questions[nextIndex] ? { ...questions[nextIndex] } : null;
    if (nextQuestion) { delete nextQuestion.correctAnswer; delete nextQuestion.explanation; }
    res.json({ answerRecord, evaluation, feedback: isCorrect ? 'Correct. Good work.' : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`, nextQuestion, questionIndex: nextIndex, finished: !nextQuestion, transcript: [...transcript, answerRecord] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/mock/finish', requireAuth, async (req, res) => {
  try {
    const { companyId, role, interviewType, difficulty, transcript = [], careerGoal } = req.body;
    const userId = await getUserId(req.userId);
    const company = await prisma.interviewCompany.findUnique({ where: { id: companyId } });
    const report = JSON.parse(await createMockReport({ company: company.name, role, type: interviewType, difficulty, careerGoal, transcript }));
    const saved = await prisma.mockInterview.create({ data: { userId, companyId, role, interviewType, difficulty, score: report.score, strengths: report.strengths || [], weaknesses: report.weaknesses || [], recommendations: report.recommendations || [], duration: report.duration, transcript } });
    res.json({ ...report, interview: saved });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;