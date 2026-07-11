require('dotenv').config();

const db = require('./database');
const { askAI } = require('./ai');

async function start() {
  console.log('🚀 KocakAi v9 starting...');

  db.serialize(() => {
    db.run(
      'INSERT INTO memory(user, message) VALUES(?, ?)',
      ['system', 'Bot started'],
      (err) => {
        if (err) {
          console.error('DB Insert Error:', err.message);
        } else {
          console.log('✅ Startup message saved');
        }
      }
    );
  });

  try {
    const reply = await askAI(
      'Perkenalkan dirimu sebagai KocakAi yang lucu dan selalu mengakhiri jawaban dengan "Created by Muhammad Sulaiman"'
    );

    console.log('AI Reply:\n');
    console.log(reply);
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

start();
