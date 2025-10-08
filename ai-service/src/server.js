const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' | 'ollama'
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';

app.get('/healthz', (req, res) => {
    return res.json({ ok: true, service: 'scandish-ai-service' });
});

app.post('/generate-description', async (req, res) => {
    try {
        const { dishName } = req.body || {};
        if (!dishName) {
            return res.status(400).json({ error: 'dishName is required' });
        }
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
        }

        if (AI_PROVIDER === 'ollama') {
            const resp = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
                    prompt: `You write concise, appetizing menu descriptions. Write a menu description for ${dishName}. Keep it under 40 words.`
                })
            });
            if (!resp.ok) throw new Error(`Ollama error: ${resp.status}`);
            // Streaming responses come line-delimited; accumulate succinctly
            const text = await resp.text();
            // Try to grab last {"response": "..."}
            const matches = [...text.matchAll(/\"response\"\s*:\s*\"([\s\S]*?)\"/g)];
            const last = matches.length ? matches[matches.length - 1][1] : text;
            return res.json({ description: last.trim() });
        } else {
            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You write concise, appetizing menu descriptions.' },
                    { role: 'user', content: `Write a menu description for ${dishName}. Keep it under 40 words.` }
                ]
            });
            const description = response.choices?.[0]?.message?.content?.trim() || '';
            return res.json({ description });
        }
    } catch (err) {
        console.error('generate-description error:', err?.response?.data || err?.message || err);
        return res.status(500).json({ error: err?.message || 'Failed to generate description' });
    }
});

app.post('/insights', async (req, res) => {
    try {
        const { menuItems } = req.body || {};
        if (!Array.isArray(menuItems)) {
            return res.status(400).json({ error: 'menuItems array is required' });
        }
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
        }

        const prompt = `Analyze this menu: ${JSON.stringify(menuItems)}\nReturn JSON with: {\n  "score": number,\n  "highPerformers": [ { "item": "", "reason": "" } ],\n  "lowPerformers": [ { "item": "", "reason": "" } ],\n  "pricingOpportunities": [ "..." ],\n  "recommendations": [ "..." ]\n}`;

        if (AI_PROVIDER === 'ollama') {
            const resp = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
                    prompt: `${prompt}\nOnly return valid minified JSON for the object above, nothing else.`
                })
            });
            if (!resp.ok) throw new Error(`Ollama error: ${resp.status}`);
            const text = await resp.text();
            const chunks = text.split('\n').filter(Boolean);
            const lastChunk = chunks[chunks.length - 1];
            // Try to find JSON in last chunk
            let insights = {};
            try {
                const jsonMatch = lastChunk.match(/\{[\s\S]*\}$/);
                insights = JSON.parse(jsonMatch ? jsonMatch[0] : lastChunk);
            } catch (_) {
                insights = { rawText: lastChunk };
            }
            return res.json({ success: true, insights });
        } else {
            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            });
            const content = response.choices?.[0]?.message?.content;
            let insights = {};
            try {
                insights = JSON.parse(content);
            } catch (_) {
                insights = { rawText: content };
            }
            return res.json({ success: true, insights });
        }
    } catch (err) {
        console.error('insights error:', err?.response?.data || err?.message || err);
        return res.status(500).json({ success: false, error: err?.message || 'Failed to generate insights' });
    }
});

// Vibe Coder - AI-powered CSS/JS code generation
app.post('/vibe-coder', async (req, res) => {
    try {
        const { prompt, context, language = 'css' } = req.body || {};
        if (!prompt) {
            return res.status(400).json({ error: 'prompt is required' });
        }

        const systemPrompt = `You are a creative coding assistant specializing in ${language}. Generate clean, modern, and visually appealing code based on user requests. Focus on:
- Modern CSS techniques (Grid, Flexbox, CSS Variables, etc.)
- Smooth animations and transitions
- Responsive design principles
- Clean, readable code structure
- Creative visual effects

Context: ${context || 'Restaurant menu styling'}

Return ONLY the code, no explanations or markdown formatting.`;

        if (AI_PROVIDER === 'ollama') {
            const resp = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
                    prompt: `${systemPrompt}\n\nUser request: ${prompt}`
                })
            });
            if (!resp.ok) throw new Error(`Ollama error: ${resp.status}`);
            const text = await resp.text();
            // Extract code from response
            const codeMatch = text.match(/```(?:css|js|javascript)?\s*([\s\S]*?)\s*```/) ||
                text.match(/(?:\.css|\.js|\.scss)[\s\S]*?\{[\s\S]*?\}/) ||
                [null, text.trim()];
            const code = codeMatch[1] || text.trim();
            return res.json({ success: true, code: code });
        } else {
            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ]
            });
            const content = response.choices?.[0]?.message?.content?.trim() || '';
            return res.json({ success: true, code: content });
        }
    } catch (err) {
        console.error('vibe-coder error:', err?.response?.data || err?.message || err);
        return res.status(500).json({ success: false, error: err?.message || 'Failed to generate code' });
    }
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`🧠 AI service listening on http://localhost:${port}`);
});


