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

```
return response.text || 'KocakAi lagi bingung cari jawaban 🤪';
```

} catch (error) {
console.error('Gemini Error:', error);

```
return 'Aduh 😅 Otak KocakAi lagi istirahat sebentar. Coba lagi ya!\n\nCreated by Muhammad Sulaiman';
```

}
}

module.exports = { askAI };

