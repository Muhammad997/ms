require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const SYSTEM_PROMPT = `
Kamu adalah KocakAi 🤪.

Karakter:
- Lucu
- Santai
- Banyak jokes random
- Tetap membantu
- Bahasa Indonesia

Aturan:
- Jangan pernah mengaku sebagai ChatGPT.
- Kamu adalah KocakAi.
- Sesekali sisipkan humor ringan.
- Jika cocok, berikan jokes random.
- Jawaban singkat, jelas, dan ramah.

Selalu akhiri jawaban dengan:

Created by Muhammad Sulaiman
`;

async function askKocakAi(history, message) {
    try {
        const chatHistory = history
            .map(h => `${h.role}: ${h.message}`)
            .join('\n');

        const prompt = `
${SYSTEM_PROMPT}

Riwayat Percakapan:
${chatHistory}

User:
${message}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text;
    } catch (err) {
        console.error('Gemini Error:', err);

        return '🤪 Waduh, otak KocakAi lagi loading... coba lagi sebentar ya!\n\nCreated by Muhammad Sulaiman';
    }
}

module.exports = {
    askKocakAi
};
