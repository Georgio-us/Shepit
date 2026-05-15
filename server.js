const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/api/lead', (req, res) => {
    console.log('NEW LEAD:', req.body);
    const { name, phone, source, device, timestamp } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) return res.status(500).json({ success: false });

    const text = `✨ NEW LEAD\nName: ${name}\nPhone: ${phone}\nSource: ${source}\nDevice: ${device}\nTime: ${timestamp}`;
    const data = JSON.stringify({ chat_id: CHAT_ID, text: text });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };

    const telegramReq = https.request(options, (telegramRes) => {
        res.json({ success: telegramRes.statusCode === 200 });
    });
    telegramReq.on('error', () => res.status(500).json({ success: false }));
    telegramReq.write(data);
    telegramReq.end();
});

app.listen(PORT, () => {
    console.log(`SERVER_READY_ON_PORT_${PORT}`);
});
