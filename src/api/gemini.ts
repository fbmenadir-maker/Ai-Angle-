import type { Request, Response } from 'express';
import fetch from 'node-fetch';

export default async function handler(req: Request, res: Response) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return res.status(500).json({ error: 'Gemini API Key not found' });
  }

  try {
    const response = await fetch('https://api.gemini.com/v1/some_endpoint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${geminiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Gemini API', details: error });
  }
}
