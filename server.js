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

function getDeviceLabel(userAgent) {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent || '') ? '📱 Мобільний' : '💻 Десктоп';
}

function getKyivTimestamp() {
    return new Intl.DateTimeFormat('uk-UA', {
        timeZone: 'Europe/Kyiv',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date());
}

function formatViewingTime(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || '')) || !/^\d{2}:\d{2}$/.test(String(time || ''))) return '';
    const [year, month, day] = date.split('-').map(Number);
    const viewingDate = new Date(Date.UTC(year, month - 1, day, 12));
    const formattedDate = new Intl.DateTimeFormat('uk-UA', {
        timeZone: 'Europe/Kyiv', day: 'numeric', month: 'long', year: 'numeric'
    }).format(viewingDate);
    return `${formattedDate} · ${time}`;
}

app.post('/api/lead', (req, res) => {
    const { name, phone, source, date, time } = req.body;
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
    const viewingTime = formatViewingTime(date, time);
    const device = getDeviceLabel(req.get('user-agent'));
    const timestamp = getKyivTimestamp();
    const viewingLine = viewingTime ? `\n🗓 <b>Перегляд:</b> ${escapeHtml(viewingTime)}\n` : '';

    const text = `
<b>✨ НОВА ЗАЯВКА: Shepit House ✨</b>
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

👤 <b>Клієнт:</b> ${escapeHtml(name) || '—'}
📞 <b>Телефон:</b> ${formattedPhone}

📍 <b>Звідки:</b> ${escapeHtml(source) || 'Головна'}
📱 <b>Пристрій:</b> ${escapeHtml(device) || '—'}
⏰ <b>Час:</b> ${escapeHtml(timestamp) || '—'}
${viewingLine}

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

app.post('/api/newsletter', (req, res) => {
    const { email, source, timestamp } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('[Error] Telegram credentials missing');
        return res.status(500).json({ success: false });
    }

    const text = `
<b>✉️ НОВА ПІДПИСКА: SHEPIT Journal</b>
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

📧 <b>Email:</b> ${escapeHtml(cleanEmail)}
📍 <b>Звідки:</b> ${escapeHtml(source) || 'Журнал'}
⏰ <b>Час:</b> ${escapeHtml(timestamp) || '—'}

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
#newsletter #shepit_house`.trim();

    const data = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' });
    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const telegramReq = https.request(options, (telegramRes) => {
        telegramRes.on('data', () => {});
        telegramRes.on('end', () => res.json({ success: telegramRes.statusCode === 200 }));
    });
    telegramReq.on('error', () => res.status(500).json({ success: false }));
    telegramReq.write(data);
    telegramReq.end();
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
