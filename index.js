require('dotenv').config();

const db = require('./database');
const { askAI } = require('./ai');

async function start() {
  console.log('🚀 KocakAi v9 starting...');

  db.run(
    'INSERT INTO memory(user, message) VALUES(?, ?)',
    ['system', 'Bot started']
  );

  try {
    const reply = await askAI('Perkenalkan dirimu sebagai KocakAi');
    console.log('AI Reply:');
    console.log(reply);
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

start();
