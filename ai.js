const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function askAI(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text;
  } catch (err) {
    console.error('Gemini Error:', err);
    return 'Maaf, Gemini sedang bermasalah 😅';
  }
}

module.exports = { askAI };
