const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// API Endpoint for Leads
app.post('/api/lead', async (req, res) => {
    const { name, phone, source } = req.body;
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Missing Telegram credentials in environment variables');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const text = `
🚀 **Новая заявка: Shepit House**
-----------------------------
👤 **Имя:** ${name || 'Не указано'}
📞 **Телефон:** ${phone || 'Не указано'}
📍 **Источник:** ${source || 'Главная форма'}
-----------------------------
#lead #shepithouse
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();

        if (result.ok) {
            return res.json({ success: true });
        } else {
            console.error('Telegram API error:', result);
            return res.status(500).json({ success: false, message: 'Failed to send to Telegram' });
        }
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fallback for SPA (though not needed for this landing yet)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
