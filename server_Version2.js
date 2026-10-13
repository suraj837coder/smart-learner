const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple mock response for testing without OpenAI key
const mockResponse = {
  explanation: "Photosynthesis is how plants use light to make energy. (easy-level explanation)",
  prerequisites: ["Basic cell structure", "Understanding light and energy"],
  steps: [
    "Learn chloroplasts and their role",
    "Understand light-dependent reactions",
    "Learn the Calvin cycle"
  ],
  mermaid: "graph TD\nA[Start: Photosynthesis] --> B[Chloroplasts]\nB --> C[Light reactions]\nB --> D[Calvin cycle]\nC --> E[ATP/NADPH]\nD --> F[Glucose production]"
};

app.post('/api/generate', async (req, res) => {
  const { topic, level, formats } = req.body || {};

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic' });
  }

  // If user sets USE_MOCK=true, return the mock response immediately
  if (process.env.USE_MOCK === 'true') {
    return res.json({ ok: true, input: { topic, level, formats }, result: mockResponse });
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not set. Set it or run with USE_MOCK=true.' });
  }

  // Small prompt template asking the model to return strict JSON
  const systemPrompt = `
You are an expert teacher. Produce a JSON object ONLY (no other commentary) with keys:
- explanation (a short paragraph tailored to the requested level: easy/intermediate/advanced)
- prerequisites (an ordered array of short strings)
- steps (an ordered array of short learning steps)
- mermaid (a mermaid.js graph string representing the learning tree/flowchart)

Keep text concise. If the topic needs sources say none in the fields.`;
  const userPrompt = `Topic: ${topic}
Level: ${level || 'easy'}
Formats: ${Array.isArray(formats) ? formats.join(', ') : formats || 'diagram'}

Return only valid JSON as described.`;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        // Change the model here if you don't have access to this one.
        // If you only have gpt-3.5 access, replace with "gpt-3.5-turbo".
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await r.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Invalid response from OpenAI', raw: data });
    }

    const text = data.choices[0].message.content;

    // Try to find first JSON object start and parse
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) {
      return res.status(500).json({ error: 'No JSON found in model response', raw: text });
    }
    const jsonText = text.slice(firstBrace);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      // If JSON parsing fails, return raw text for debugging
      return res.status(500).json({ error: 'Failed to parse JSON', parseError: e.message, raw: text });
    }

    return res.json({ ok: true, input: { topic, level, formats }, result: parsed, raw: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Serve a simple health
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));