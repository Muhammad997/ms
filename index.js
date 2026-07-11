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
let reconnecting = false;

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
            markOnlineOnConnect: false,
            printQRInTerminal: false,
            syncFullHistory: false
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const {
                connection,
                lastDisconnect
            } = update;

            console.log('⏰ Pairing dibuat:', new Date().toLocaleString());

            if (
                connection === 'connecting' &&
                !state.creds.registered &&
                !pairingRequested
            ) {
                pairingRequested = true;

                const phoneNumber =
                    process.env.PHONE_NUMBER;

                if (!phoneNumber) {
                    console.log(
                        '❌ PHONE_NUMBER belum diisi'
                    );
                    return;
                }

                console.log(
                    '📱 Nomor:',
                    phoneNumber
                );

                setTimeout(async () => {
                    try {
                        const code =
                            await sock.requestPairingCode(
                                phoneNumber
                            );

                        console.log('');
                        console.log(
                            '📱 PAIRING CODE'
                        );
                        console.log(
                            '===================='
                        );
                        console.log(code);
                        console.log(
                            '===================='
                        );
                        console.log('');
                    } catch (err) {
                        console.error(
                            '❌ Pairing Error:',
                            err.message
                        );
                    }
                }, 3000);
            }

            if (connection === 'open') {
                reconnecting = false;

                console.log(
                    '✅ WhatsApp Connected'
                );
                console.log(
                    '🤪 KocakAi Ready'
                );
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
                        DisconnectReason.loggedOut &&
                    !reconnecting
                ) {
                    reconnecting = true;

                    console.log(
                        '🔄 Reconnecting in 5 seconds...'
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
                    const msg = messages?.[0];

                    if (!msg) return;
                    if (msg.key.fromMe) return;
                    if (
                        msg.key.remoteJid ===
                        'status@broadcast'
                    )
                        return;

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

        setTimeout(() => {
            startBot();
        }, 5000);
    }
}

startBot();

