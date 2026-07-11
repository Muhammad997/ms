require('dotenv').config();

const { webcrypto } = require('crypto');
global.crypto = webcrypto;

const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');

const { initDB } = require('./src/database/sqlite');
const { handleMessage } = require('./src/handlers/message');

let pairingRequested = false;

async function startBot() {
try {
console.log('🚀 KocakAi v9 Starting...');

    initDB();

    const { state, saveCreds } =
        await useMultiFileAuthState('./auth');

    const { version } =
        await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['KocakAi', 'Chrome', '1.0.0'],
        markOnlineOnConnect: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect
        } = update;

        if (connection === 'connecting') {
            console.log('🔄 Connecting to WhatsApp...');
        }

        if (
            !state.creds.registered &&
            !pairingRequested
        ) {
            pairingRequested = true;

            try {
                const phoneNumber =
                    process.env.PHONE_NUMBER;

                if (!phoneNumber) {
                    throw new Error(
                        'PHONE_NUMBER belum diisi'
                    );
                }

                setTimeout(async () => {
                    try {
                        const code =
                            await sock.requestPairingCode(
                                phoneNumber
                            );

                        console.log('\n📱 Pairing Code');
                        console.log(
                            '===================='
                        );
                        console.log(code);
                        console.log(
                            '====================\n'
                        );
                    } catch (err) {
                        console.error(
                            '❌ Pairing Error:',
                            err.message
                        );
                    }
                }, 5000);
            } catch (err) {
                console.error(err);
            }
        }

        if (connection === 'open') {
            console.log(
                '✅ WhatsApp Connected'
            );
            console.log('🤪 KocakAi Ready');
        }

        if (connection === 'close') {
            const statusCode =
                lastDisconnect?.error?.output
                    ?.statusCode;

            console.log(
                '⚠️ Connection Closed:',
                statusCode
            );

            if (
                statusCode !==
                DisconnectReason.loggedOut
            ) {
                console.log(
                    '🔄 Reconnecting...'
                );

                setTimeout(() => {
                    pairingRequested = false;
                    startBot();
                }, 5000);
            } else {
                console.log(
                    '❌ Device Logged Out'
                );
            }
        }
    });

    sock.ev.on(
        'messages.upsert',
        async ({ messages }) => {
            try {
                const msg = messages[0];

                if (!msg) return;
                if (msg.key.fromMe) return;

                await handleMessage(
                    sock,
                    msg
                );
            } catch (err) {
                console.error(
                    '❌ Message Error:',
                    err
                );
            }
        }
    );
} catch (err) {
    console.error(
        '❌ Startup Error:',
        err
    );
}


}

startBot();
