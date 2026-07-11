require('dotenv').config();

const { webcrypto } = require('crypto');
global.crypto = webcrypto;

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');

const { initDB } = require('./src/database/sqlite');
const { handleMessage } = require('./src/handlers/message');

async function startBot() {
    try {
        console.log('🚀 KocakAi v9 Starting...');

        initDB();

        const { state, saveCreds } =
            await useMultiFileAuthState('./auth');

        const sock = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            printQRInTerminal: false,
            browser: ['KocakAi', 'Chrome', '1.0.0']
        });

        sock.ev.on('creds.update', saveCreds);

        // Pairing Code
        if (!sock.authState.creds.registered) {
            const phoneNumber = process.env.PHONE_NUMBER;

            if (!phoneNumber) {
                console.log('❌ PHONE_NUMBER belum diisi di .env');
                process.exit(1);
            }

            const code = await sock.requestPairingCode(phoneNumber);

            console.log('\n📱 Pairing Code WhatsApp');
            console.log('========================');
            console.log(`🔑 ${code}`);
            console.log('========================\n');
        }

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log('✅ WhatsApp Connected');
                console.log('🤪 KocakAi Ready');
            }

            if (connection === 'close') {
                const shouldReconnect =
                    lastDisconnect?.error?.output?.statusCode !==
                    DisconnectReason.loggedOut;

                console.log('⚠️ Connection Closed');

                if (shouldReconnect) {
                    console.log('🔄 Reconnecting...');
                    startBot();
                } else {
                    console.log('❌ Device Logged Out');
                }
            }
        });

        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];

                if (!msg) return;
                if (msg.key.fromMe) return;

                await handleMessage(sock, msg);
            } catch (err) {
                console.error('❌ Message Error:', err);
            }
        });

    } catch (err) {
        console.error('❌ Startup Error:', err);

        setTimeout(() => {
            console.log('🔄 Restarting...');
            startBot();
        }, 5000);
    }
}

startBot();
