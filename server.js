const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/api/lead', (req, res) => {
    console.log('--- НОВИЙ ЛІД ---');
    const { name, phone, source, device, timestamp } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Missing ENV variables');
        return res.status(500).json({ success: false });
    }

    // Use HTML for better stability with special characters
    const text = `
<b>✨ НОВА ЗАЯВКА: Shepit House ✨</b>
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

👤 <b>Клієнт:</b> ${name || 'Не вказано'}
📞 <b>Телефон:</b> <code>${phone || 'Не вказано'}</code>

📍 <b>Звідки:</b> ${source || 'Головна сторінка'}
📱 <b>Пристрій:</b> ${device || 'Невідомо'}
⏰ <b>Час:</b> ${timestamp || 'Щойно'}

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
#lead #shepit_house
    `.trim();

    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML'
    });

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
        let resData = '';
        telegramRes.on('data', (d) => resData += d);
        telegramRes.on('end', () => {
            const result = JSON.parse(resData);
            if (!result.ok) {
                console.error('TELEGRAM ERROR:', result);
            }
            res.json({ success: result.ok });
        });
    });

    telegramReq.on('error', (e) => {
        console.error('REQUEST ERROR:', e);
        res.status(500).json({ success: false });
    });

    telegramReq.write(data);
    telegramReq.end();
});

app.listen(PORT, () => {
    console.log(`SERVER_RUNNING_ON_${PORT}`);
});
