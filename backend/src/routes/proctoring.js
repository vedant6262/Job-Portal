const express = require('express');
const router = express.Router();
const { CV_SERVICE_URL, ensureCVService, isHealthy, markUnhealthy } = require('../services/cvService');

async function callCvService(pathname, { method = 'POST', body, timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${CV_SERVICE_URL}${pathname}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const error = new Error(data.error || `CV service responded with status ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('CV proctoring service timed out');
      timeoutError.status = 504;
      throw timeoutError;
    }
    if (!error.status) {
      error.status = 503;
      error.message = `CV proctoring service is unavailable: ${error.message}`;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function callWithRecovery(pathname, options) {
  const ready = await ensureCVService();
  if (!ready) {
    const error = new Error('CV proctoring service is unavailable');
    error.status = 503;
    throw error;
  }

  try {
    return await callCvService(pathname, options);
  } catch (error) {
    if (error.status !== 503 && error.status !== 504) throw error;

    markUnhealthy();
    const recovered = await ensureCVService();
    if (!recovered) throw error;
    return callCvService(pathname, options);
  }
}

router.get('/health', async (req, res) => {
  try {
    if (!(await isHealthy())) {
      ensureCVService().catch(() => {});
      return res.status(503).json({ available: false, starting: true, error: 'CV proctoring service is starting' });
    }

    const data = await callCvService('/health', { method: 'GET', timeoutMs: 5000 });
    res.json({ available: true, ...data });
  } catch (error) {
    res.status(error.status || 503).json({ available: false, error: error.message });
  }
});

router.post('/session', async (req, res, next) => {
  const { sessionId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const data = await callWithRecovery('/session', { body: { sessionId }, timeoutMs: 10000 });
    res.json({ available: true, ...data });
  } catch (error) {
    markUnhealthy();
    next(error);
  }
});

router.post('/analyze', async (req, res, next) => {
  const { sessionId, image } = req.body || {};
  if (!sessionId || !image) {
    return res.status(400).json({ error: 'sessionId and image are required' });
  }

  try {
    const data = await callWithRecovery('/analyze', { body: { sessionId, image }, timeoutMs: 30000 });
    res.json({ available: true, ...data });
  } catch (error) {
    markUnhealthy();
    next(error);
  }
});

router.post('/stop', async (req, res) => {
  const { sessionId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const data = await callCvService('/stop', { body: { sessionId }, timeoutMs: 10000 });
    res.json({ available: true, ...data });
  } catch (error) {
    res.json({ available: false, error: error.message });
  }
});

module.exports = router;
