require('dotenv').config();

module.exports = {
    BOT_NAME: process.env.BOT_NAME || 'KocakAi',
    OWNER_NAME: process.env.OWNER_NAME || 'Muhammad Sulaiman',
    PHONE_NUMBER: process.env.PHONE_NUMBER || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

    SESSION_FOLDER: './auth',
    DATABASE_PATH: './database/memory.db',

    MAX_HISTORY: 10,

    PREFIX: '.',

    VERSION: '9.0.0',

    CREATED_BY: 'Muhammad Sulaiman'
};
