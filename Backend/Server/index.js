import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Check API key
if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OpenAI API key. Please add OPENAI_API_KEY in your .env');
    process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Test route
app.get('/', (req, res) => {
    res.send('AI Chat Backend is running!');
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, documentContent, conversationHistory } = req.body;

        // Validate fields
        if (!message || !documentContent) {
            return res.status(400).json({ error: 'Missing message or documentContent' });
        }

        // Ensure conversationHistory is an array
        const history = Array.isArray(conversationHistory) ? conversationHistory : [];

        // Build prompt
        const prompt = `
You are an expert assistant. Answer questions based ONLY on the document content.

DOCUMENT:
${documentContent}

CONVERSATION HISTORY:
${history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}

CURRENT QUESTION: ${message}

Instructions:
- Answer clearly and concisely
- Explain concepts if needed
- Use examples if helpful
`;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or 'gpt-3.5-turbo'
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 800,
        });

        const aiResponse = response.choices[0].message.content;

        // Return AI response
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('OpenAI Error:', error.response?.data || error);
        res.status(500).json({ error: 'AI failed to respond. Check API key and usage.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
