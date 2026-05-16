const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/api/lead', (req, res) => {
    const { name, phone, source, device, timestamp } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('[Error] Telegram credentials missing');
        return res.status(500).json({ success: false });
    }

    const text = `
<b>✨ НОВА ЗАЯВКА: Shepit House ✨</b>
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

👤 <b>Клієнт:</b> ${name || '—'}
📞 <b>Телефон:</b> <code>${phone || '—'}</code>

📍 <b>Звідки:</b> ${source || 'Головна'}
📱 <b>Пристрій:</b> ${device || '—'}
⏰ <b>Час:</b> ${timestamp || '—'}

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
#lead #shepit_house`.trim();

    const data = JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'HTML' });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const telegramReq = https.request(options, (telegramRes) => {
        telegramRes.on('data', () => {}); // Consume stream
        telegramRes.on('end', () => res.json({ success: telegramRes.statusCode === 200 }));
    });

    telegramReq.on('error', () => res.status(500).json({ success: false }));
    telegramReq.write(data);
    telegramReq.end();
    
    console.log(`[Lead] Received from ${name} (${phone})`);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
