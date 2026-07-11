require('dotenv').config();

const { askAI } = require('./ai');

async function start() {
  console.log('🚀 KocakAi v9 starting...');

  try {
    const reply = await askAI(
      'Perkenalkan dirimu sebagai KocakAi yang lucu'
    );

    console.log('AI Reply:');
    console.log(reply);

  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

start();
