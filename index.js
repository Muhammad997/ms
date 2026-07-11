require('dotenv').config();

const { webcrypto } = require('crypto');
global.crypto = webcrypto;

const baileys = require('@whiskeysockets/baileys');
const makeWASocket = baileys.default;
const {
useMultiFileAuthState,
DisconnectReason
} = baileys;

const P = require('pino');
const { askAI } = require('./ai');

async function startBot() {
try {
console.log('🚀 KocakAi v9 starting...');

const { state, saveCreds } =
  await useMultiFileAuthState('./auth');

const sock = makeWASocket({
  auth: state,
  logger: P(),
  browser: ['KocakAi', 'Chrome', '1.0']
});

sock.ev.on('creds.update', saveCreds);

if (!state.creds.registered) {
  const phone = process.env.PHONE_NUMBER;

  if (!phone) {
    throw new Error('PHONE_NUMBER belum diisi');
  }

  setTimeout(async () => {
    try {
      const code = await sock.requestPairingCode(phone);

      console.log('\n========================');
      console.log('PAIRING CODE:', code);
      console.log('========================\n');
    } catch (err) {
      console.error('Pairing Error:', err);
    }
  }, 5000);
}

sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect } = update;

  if (connection === 'open') {
    console.log('✅ WhatsApp Connected');
  }

  if (connection === 'close') {
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !==
      DisconnectReason.loggedOut;

    console.log('❌ Connection Closed');

    if (shouldReconnect) {
      console.log('🔄 Reconnecting...');
      startBot();
    }
  }
});

sock.ev.on('messages.upsert', async ({ messages }) => {
  try {
    const msg = messages[0];

    if (!msg?.message) return;
    if (msg.key.fromMe) return;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      '';

    if (!text) return;

    const prompt = `

Kamu adalah KocakAi 🤪.

Karakter:

Lucu
Santai
Banyak jokes random
Bahasa Indonesia

Selalu akhiri jawaban dengan:
Created by Muhammad Sulaiman

Pesan:
${text}
`;

    const reply = await askAI(prompt);

    await sock.sendMessage(
      msg.key.remoteJid,
      { text: reply }
    );

    console.log('✅ Reply sent');
  } catch (err) {
    console.error('Message Error:', err);
  }
});

} catch (err) {
console.error('Startup Error:', err);
}
}

startBot();
