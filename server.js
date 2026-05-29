const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20kb' }));
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.status(200).send('OK'));

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .slice(0, 500);
}

function normalizePhoneForTelegram(phone) {
    let clean = String(phone || '').replace(/\D/g, '');
    if (!clean) return '';
    
    if (clean.startsWith('0') && clean.length === 10) {
        clean = '38' + clean;
    } else if (clean.startsWith('80') && clean.length === 11) {
        clean = '3' + clean;
    } else if (clean.length === 9) {
        clean = '380' + clean;
    }
    
    return '+' + clean;
}

app.post('/api/lead', (req, res) => {
    const { name, phone, source, device, timestamp } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!phone || String(phone).trim().length < 7) {
        return res.status(400).json({ success: false, error: 'Invalid phone' });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('[Error] Telegram credentials missing');
        return res.status(500).json({ success: false });
    }

    const formattedPhone = normalizePhoneForTelegram(phone);

    const text = `
<b>✨ НОВА ЗАЯВКА: Shepit House ✨</b>
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

👤 <b>Клієнт:</b> ${escapeHtml(name) || '—'}
📞 <b>Телефон:</b> ${formattedPhone}

📍 <b>Звідки:</b> ${escapeHtml(source) || 'Головна'}
📱 <b>Пристрій:</b> ${escapeHtml(device) || '—'}
⏰ <b>Час:</b> ${escapeHtml(timestamp) || '—'}

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
        telegramRes.on('data', () => {});
        telegramRes.on('end', () => res.json({ success: telegramRes.statusCode === 200 }));
    });

    telegramReq.on('error', () => res.status(500).json({ success: false }));
    telegramReq.write(data);
    telegramReq.end();
    
    console.log(`[Lead] Received from ${escapeHtml(name)} (${escapeHtml(phone)})`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
