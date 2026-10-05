const BACKEND_URL = process.env.BACKEND_URL || 'https://ai-icu-backend.onrender.com';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
      signal: controller.signal
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : { success: false, error: await response.text() };

    res.setHeader('Cache-Control', 'no-store');
    return res.status(response.status).json(payload);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error.name === 'AbortError' ? 'Prediction request timed out' : error.message
    });
  } finally {
    clearTimeout(timeout);
  }
};
