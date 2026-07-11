require('dotenv').config();

const { webcrypto } = require('crypto');
global.crypto = webcrypto;

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { askAI } = require('./ai');

async function startBot() {
try {
console.log('🚀 KocakAi v9 starting...');

```
const { state, saveCreds } = await useMultiFileAuthState('./auth');

const sock = makeWASocket({
  auth: state,
  printQRInTerminal: false,
  logger: pino({ level: 'silent' }),
  browser: ['KocakAi', 'Chrome', '1.0']
});

sock.ev.on('creds.update', saveCreds);

// Pairing Code
if (!state.creds.registered) {
  const phone = process.env.PHONE_NUMBER;

  if (!phone) {
    console.log('❌ PHONE_NUMBER belum diisi pada .env');
    process.exit(1);
  }

  setTimeout(async () => {
    try {
      console.log('📱 Request Pairing Code untuk:', phone);

      const code = await sock.requestPairingCode(phone);

      console.log('\n========================');
      console.log('PAIRING CODE :', code);
      console.log('========================\n');
    } catch (err) {
      console.error('❌ Pairing Error:', err);
    }
  }, 5000);
}

sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'open') {
    console.log('✅ WhatsApp Connected');
  }

  if (connection === 'close') {
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !==
      DisconnectReason.loggedOut;

    console.log('⚠️ Connection Closed');

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

    const jid = msg.key.remoteJid;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      '';

    if (!text) return;

    console.log('📩', jid, ':', text);

    const prompt = `
```

Kamu adalah KocakAi 🤪.

Karakter:

* Lucu
* Santai
* Banyak jokes random
* Tetap membantu
* Bahasa Indonesia

Selalu akhiri jawaban dengan:
Created by Muhammad Sulaiman

Pesan pengguna:
${text}
`;

```
    const reply = await askAI(prompt);

    await sock.sendMessage(jid, {
      text: reply
    });

    console.log('✅ Reply sent');
  } catch (err) {
    console.error('Message Error:', err);
  }
});
```

} catch (err) {
console.error('Startup Error:', err);
}
}

startBot();
