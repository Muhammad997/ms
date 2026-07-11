require('dotenv').config();

const { default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { askAI } = require('./ai');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['KocakAi', 'Chrome', '1.0']
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const phone = process.env.PHONE_NUMBER;

        setTimeout(async () => {
            const code = await sock.requestPairingCode(phone);
            console.log('\n========================');
            console.log('PAIRING CODE :', code);
            console.log('========================\n');
        }, 3000);
    }

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            console.log('✅ WhatsApp Connected');
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            if (shouldReconnect) {
                startBot();
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message) return;
        if (msg.key.fromMe) return;

        const jid = msg.key.remoteJid;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            '';

        if (!text) return;

        try {
            const prompt = `
Kamu adalah KocakAi 🤪.
Lucu, santai, banyak jokes random.
Jawab dalam Bahasa Indonesia.
Selalu akhiri dengan:
Created by Muhammad Sulaiman

Pesan:
${text}
`;

            const reply = await askAI(prompt);

            await sock.sendMessage(jid, {
                text: reply
            });

        } catch (err) {
            console.error(err);

            await sock.sendMessage(jid, {
                text: 'Aduh otak KocakAi lagi loading 🤪'
            });
        }
    });
}

startBot();
