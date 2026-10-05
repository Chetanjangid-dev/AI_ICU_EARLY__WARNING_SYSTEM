const BACKEND_URL = process.env.BACKEND_URL || 'https://ai-icu-backend.onrender.com';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    });

    const body = await response.text();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(response.ok ? 200 : 503).json({
      ok: response.ok,
      status: response.status,
      body
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: error.name === 'AbortError' ? 'Backend wake check timed out' : error.message
    });
  } finally {
    clearTimeout(timeout);
  }
};
