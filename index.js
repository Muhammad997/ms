require('dotenv').config();

const db = require('./database');
const { askAI } = require('./ai');

async function start() {
  console.log('🚀 KocakAi v9 starting...');

  db.all(
    "SELECT name FROM sqlite_master WHERE type='table'",
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Tables:', rows);
      }
    }
  );

  try {
    const reply = await askAI(
      'Perkenalkan dirimu sebagai KocakAi'
    );

    console.log('AI Reply:');
    console.log(reply);

  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

start();
