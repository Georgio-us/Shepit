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

function postJson({ hostname, path, headers = {}, body }) {
    const data = JSON.stringify(body);
    return new Promise((resolve, reject) => {
        const request = https.request({
            hostname,
            port: 443,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                ...headers
            }
        }, (response) => {
            let responseBody = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => { responseBody += chunk; });
            response.on('end', () => {
                let parsedBody = null;
                try { parsedBody = responseBody ? JSON.parse(responseBody) : null; } catch (_) {}
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(parsedBody);
                    return;
                }
                reject(new Error(`Request failed with status ${response.statusCode}`));
            });
        });
        request.on('error', reject);
        request.setTimeout(15000, () => request.destroy(new Error('Upstream request timed out')));
        request.write(data);
        request.end();
    });
}

function getJson({ hostname, path, headers = {} }) {
    return new Promise((resolve, reject) => {
        const request = https.request({
            hostname,
            port: 443,
            path,
            method: 'GET',
            headers: { Accept: 'application/json', ...headers }
        }, (response) => {
            let responseBody = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => { responseBody += chunk; });
            response.on('end', () => {
                let parsedBody = null;
                try { parsedBody = responseBody ? JSON.parse(responseBody) : null; } catch (_) {}
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(parsedBody);
                    return;
                }
                reject(new Error(`Request failed with status ${response.statusCode}`));
            });
        });
        request.on('error', reject);
        request.setTimeout(15000, () => request.destroy(new Error('Upstream request timed out')));
        request.end();
    });
}

function getKommoApiConfig() {
    const subdomain = String(process.env.KOMMO_SUBDOMAIN || '').trim();
    const token = String(process.env.KOMMO_LONG_LIVED_TOKEN || '').trim();

    if (!/^[a-z0-9-]+$/i.test(subdomain) || !token) return null;
    return { subdomain, token };
}

function getKommoConfig() {
    const apiConfig = getKommoApiConfig();
    const pipelineId = Number(process.env.KOMMO_PIPELINE_ID);
    const statusId = Number(process.env.KOMMO_STATUS_ID);

    if (!apiConfig || !Number.isInteger(pipelineId) || !Number.isInteger(statusId)) {
        return null;
    }

    return { ...apiConfig, pipelineId, statusId };
}

const facebookLeadSyncStartedAt = Math.floor(Date.now() / 1000);
const sentFacebookLeadUids = new Set();
let facebookLeadSyncInProgress = false;

function isFacebookLead(lead) {
    return /facebook/i.test(JSON.stringify({
        sourceName: lead.source_name,
        sourceUid: lead.source_uid,
        metadata: lead.metadata,
        tags: lead._embedded?.tags
    }));
}

function getCustomFieldValue(entity, fieldCode) {
    const field = entity?.custom_fields_values?.find((item) => item.field_code === fieldCode);
    return field?.values?.map((item) => item.value).filter(Boolean).join(', ') || '';
}

async function getIncomingLeadContact(config, lead) {
    const contactId = lead._embedded?.contacts?.[0]?.id;
    if (!contactId) return null;

    return getJson({
        hostname: `${config.subdomain}.kommo.com`,
        path: `/api/v4/contacts/${contactId}`,
        headers: { Authorization: `Bearer ${config.token}` }
    });
}

async function sendFacebookLeadToTelegram(lead, contact) {
    const botToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const chatId = String(process.env.TELEGRAM_CHAT_ID || '').trim();
    if (!botToken || !chatId) throw new Error('Telegram credentials missing');

    const metadata = lead.metadata || {};
    const name = contact?.name || metadata.name || lead.name || '—';
    const phone = normalizePhoneForTelegram(getCustomFieldValue(contact, 'PHONE') || metadata.phone);
    const comment = metadata.form_name || metadata.form_id || metadata.name || 'Facebook Lead Ads';
    const timestamp = lead.created_at
        ? new Intl.DateTimeFormat('uk-UA', {
            timeZone: 'Europe/Kyiv', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(new Date(lead.created_at * 1000))
        : getKyivTimestamp();
    const text = `
<b>📣 НОВА ЗАЯВКА: Facebook</b>
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

👤 <b>Клієнт:</b> ${escapeHtml(name)}
📞 <b>Телефон:</b> ${escapeHtml(phone || '—')}
📝 <b>Форма:</b> ${escapeHtml(comment)}
📍 <b>Джерело:</b> ${escapeHtml(lead.source_name || 'Facebook')}
⏰ <b>Час:</b> ${escapeHtml(timestamp)}

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
#lead #facebook #shepit_house`.trim();

    await postJson({
        hostname: 'api.telegram.org',
        path: `/bot${botToken}/sendMessage`,
        body: { chat_id: chatId, text, parse_mode: 'HTML' }
    });
}

async function syncFacebookLeads() {
    const config = getKommoApiConfig();
    if (!config || !process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID || facebookLeadSyncInProgress) return;
    facebookLeadSyncInProgress = true;

    try {
        const response = await getJson({
            hostname: `${config.subdomain}.kommo.com`,
            path: '/api/v4/leads/unsorted?filter[category]=forms&order[created_at]=desc&limit=250',
            headers: { Authorization: `Bearer ${config.token}` }
        });
        const leads = response?._embedded?.unsorted || [];

        for (const lead of leads) {
            if (!lead?.uid || lead.created_at < facebookLeadSyncStartedAt || sentFacebookLeadUids.has(lead.uid) || !isFacebookLead(lead)) continue;
            try {
                const fullLead = await getJson({
                    hostname: `${config.subdomain}.kommo.com`,
                    path: `/api/v4/leads/unsorted/${encodeURIComponent(lead.uid)}`,
                    headers: { Authorization: `Bearer ${config.token}` }
                });
                const contact = await getIncomingLeadContact(config, fullLead);
                await sendFacebookLeadToTelegram(fullLead, contact);
                sentFacebookLeadUids.add(lead.uid);
                console.log(`[Kommo] Facebook lead ${lead.uid} sent to Telegram`);
            } catch (error) {
                console.error(`[Kommo] Could not send Facebook lead ${lead.uid} to Telegram: ${error.message}`);
            }
        }
    } catch (error) {
        console.error(`[Kommo] Facebook lead sync failed: ${error.message}`);
    } finally {
        facebookLeadSyncInProgress = false;
    }
}

async function createKommoLead({ name, phone, source, viewingTime, device, timestamp }) {
    const config = getKommoConfig();
    if (!config) throw new Error('Kommo credentials missing or invalid');

    const safeName = String(name || '').trim().slice(0, 255);
    const safePhone = String(phone || '').trim().slice(0, 100);
    const leadName = `Заявка з сайту — ${safeName || safePhone}`.slice(0, 255);
    const hostname = `${config.subdomain}.kommo.com`;
    const authorization = { Authorization: `Bearer ${config.token}` };

    const created = await postJson({
        hostname,
        path: '/api/v4/leads/complex',
        headers: authorization,
        body: [{
            name: leadName,
            pipeline_id: config.pipelineId,
            status_id: config.statusId,
            _embedded: {
                contacts: [{
                    name: safeName || safePhone,
                    custom_fields_values: [{
                        field_code: 'PHONE',
                        values: [{ value: safePhone }]
                    }]
                }]
            }
        }]
    });

    const leadId = Array.isArray(created) ? created[0]?.id : null;
    if (!leadId) throw new Error('Kommo did not return a lead ID');

    const details = [
        'Заявка з сайту Shepit House',
        `Джерело: ${String(source || 'Головна').slice(0, 500)}`,
        `Пристрій: ${String(device || '—').slice(0, 100)}`,
        `Час: ${String(timestamp || '—').slice(0, 100)}`,
        viewingTime ? `Перегляд: ${viewingTime}` : null
    ].filter(Boolean).join('\n');

    try {
        await postJson({
            hostname,
            path: '/api/v4/leads/notes',
            headers: authorization,
            body: [{ entity_id: leadId, note_type: 'common', params: { text: details } }]
        });
    } catch (error) {
        console.error(`[Kommo] Lead ${leadId} created, but note was not added: ${error.message}`);
    }

    return leadId;
}

app.post('/api/lead', async (req, res) => {
    const { name, phone, source, date, time } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!phone || String(phone).trim().length < 7) {
        return res.status(400).json({ success: false, error: 'Invalid phone' });
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

    try {
        const telegramDelivery = BOT_TOKEN && CHAT_ID
            ? postJson({
                hostname: 'api.telegram.org',
                path: `/bot${BOT_TOKEN}/sendMessage`,
                body: { chat_id: CHAT_ID, text, parse_mode: 'HTML' }
            })
            : Promise.reject(new Error('Telegram credentials missing'));
        const [telegramResult, kommoResult] = await Promise.allSettled([
            telegramDelivery,
            createKommoLead({ name, phone: formattedPhone, source, viewingTime, device, timestamp })
        ]);

        const telegramDelivered = telegramResult.status === 'fulfilled';
        const kommoDelivered = kommoResult.status === 'fulfilled';
        if (!telegramDelivered && !kommoDelivered) {
            const telegramError = telegramResult.reason?.message || 'unknown Telegram error';
            const kommoError = kommoResult.reason?.message || 'unknown Kommo error';
            console.error(`[Lead] Delivery failed: Telegram: ${telegramError}; Kommo: ${kommoError}`);
            return res.status(502).json({ success: false });
        }

        if (!telegramDelivered) console.error(`[Lead] Telegram delivery failed: ${telegramResult.reason?.message || 'unknown error'}`);
        if (!kommoDelivered) console.error(`[Lead] Kommo delivery failed: ${kommoResult.reason?.message || 'unknown error'}`);
        console.log(`[Lead] Received from ${escapeHtml(name)} (${escapeHtml(phone)}), Telegram: ${telegramDelivered}, Kommo: ${kommoDelivered}`);
        res.json({ success: true });
    } catch (error) {
        console.error(`[Lead] Unexpected delivery error: ${error.message}`);
        res.status(502).json({ success: false });
    }
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const configuredInterval = Number(process.env.KOMMO_FACEBOOK_SYNC_INTERVAL_MS);
    const syncInterval = Number.isInteger(configuredInterval) && configuredInterval >= 30000
        ? configuredInterval
        : 60000;
    console.log(`[Kommo] Facebook lead sync enabled; checking Incoming Leads every ${Math.round(syncInterval / 1000)}s`);
    setTimeout(syncFacebookLeads, 5000);
    setInterval(syncFacebookLeads, syncInterval);
});
