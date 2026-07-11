const { askKocakAi } = require('../ai/gemini');
const {
    saveMessage,
    getHistory,
    clearHistory
} = require('../database/sqlite');

async function handleMessage(sock, msg) {
    try {
        const sender = msg.key.remoteJid;

        if (!msg.message) return;
        if (sender === 'status@broadcast') return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            '';

        if (!text) return;

        console.log(`📩 ${sender}: ${text}`);

        // Command reset memory
        if (text.toLowerCase() === '.reset') {
            await clearHistory(sender);

            await sock.sendMessage(sender, {
                text: '🧠 Memory percakapan berhasil dihapus!'
            });

            return;
        }

        // Command ping
        if (text.toLowerCase() === '.ping') {
            await sock.sendMessage(sender, {
                text: '🏓 Pong! KocakAi aktif 🤪'
            });

            return;
        }

        // Command joke
        if (text.toLowerCase() === '.joke') {
            const jokes = [
                '🤣 Kalau semut nikah, mahar-nya gula ya?',
                '😂 Hidup itu seperti WiFi, kadang terhubung kadang tidak.',
                '🤪 Kalau malas menghasilkan listrik, aku sudah jadi PLTA.',
                '😎 Jangan menyerah, printer saja sering error masih dipakai.',
                '🚀 Tetap semangat, mie instan saja punya masa depan.'
            ];

            const joke =
                jokes[Math.floor(Math.random() * jokes.length)];

            await sock.sendMessage(sender, {
                text: `${joke}\n\nCreated by Muhammad Sulaiman`
            });

            return;
        }

        // Simpan pesan user
        await saveMessage(sender, 'user', text);

        // Ambil memory
        const history = await getHistory(sender, 10);

        // Tanya Gemini
        const reply = await askKocakAi(history, text);

        // Simpan jawaban bot
        await saveMessage(sender, 'assistant', reply);

        // Kirim balasan
        await sock.sendMessage(sender, {
            text: reply
        });

    } catch (err) {
        console.error('❌ Message Handler Error:', err);

        await sock.sendMessage(msg.key.remoteJid, {
            text: '🤪 Waduh, KocakAi lagi tersandung kabel internet.\nCoba lagi ya!\n\nCreated by Muhammad Sulaiman'
        });
    }
}

module.exports = {
    handleMessage
};
