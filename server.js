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
    console.log('--- Новий запит на лід ---');
    console.log('Дані:', req.body);
    
    const { name, phone, source, device, timestamp } = req.body;
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Missing Telegram credentials');
        return res.status(500).json({ success: false });
    }

    const text = `
✨ **НОВА ЗАЯВКА: Shepit House** ✨
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

👤 **Клієнт:** ${name || 'Не вказано'}
📞 **Телефон:** \`${phone || 'Не вказано'}\`

📍 **Звідки:** ${source || 'Головна сторінка'}
📱 **Пристрій:** ${device || 'Невідомо'}
⏰ **Час:** ${timestamp || new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
#lead #shepit_house #crm
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
