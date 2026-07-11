
const { GoogleGenAI } = require('@google/genai');
module.exports.askAI = async (prompt)=>{
 const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
 const r = await ai.models.generateContent({model:'gemini-2.5-flash',contents:prompt});
 return r.text;
};
