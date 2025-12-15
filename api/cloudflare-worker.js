/**
 * Cloudflare Worker для отправки email через Mailgun/SendGrid
 * 
 * Это serverless решение для отправки email без PHP сервера
 * Деплой: wrangler publish
 */

// ===== CONFIGURATION =====
const CONFIG = {
    // Option 1: Mailgun
    mailgun: {
        apiKey: 'YOUR_MAILGUN_API_KEY',
        domain: 'YOUR_MAILGUN_DOMAIN',
        from: 'DVE Estate <noreply@dve-estate.ru>',
        to: 'dvegroupp@gmail.com'
    },
    
    // Option 2: SendGrid
    sendgrid: {
        apiKey: 'YOUR_SENDGRID_API_KEY',
        from: 'noreply@dve-estate.ru',
        to: 'dvegroupp@gmail.com'
    },
    
    // Rate limiting
    rateLimit: {
        maxRequests: 5,
        windowMs: 3600000 // 1 hour
    }
};

// ===== CORS Headers =====
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// ===== Main Handler =====
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders
        });
    }
    
    // Only accept POST
    if (request.method !== 'POST') {
        return jsonResponse({
            success: false,
            message: 'Method not allowed'
        }, 405);
    }
    
    try {
        // Parse request body
        const data = await request.json();
        
        // Validate data
        const validation = validateData(data);
        if (!validation.valid) {
            return jsonResponse({
                success: false,
                message: validation.message
            }, 400);
        }
        
        // Check rate limit
        const clientIP = request.headers.get('CF-Connecting-IP');
        const rateLimitCheck = await checkRateLimit(clientIP);
        if (!rateLimitCheck.allowed) {
            return jsonResponse({
                success: false,
                message: 'Слишком много запросов. Попробуйте позже.'
            }, 429);
        }
        
        // Send email (choose method)
        const result = await sendEmailViaMailgun(data);
        // Or: const result = await sendEmailViaSendGrid(data);
        
        if (result.success) {
            return jsonResponse({
                success: true,
                message: 'Ваше сообщение успешно отправлено'
            });
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error:', error);
        return jsonResponse({
            success: false,
            message: 'Произошла ошибка. Попробуйте позже.'
        }, 500);
    }
}

// ===== Validation =====
function validateData(data) {
    const { name, email, message } = data;
    
    if (!name || name.trim().length < 2) {
        return {
            valid: false,
            message: 'Имя должно содержать минимум 2 символа'
        };
    }
    
    if (!email || !isValidEmail(email)) {
        return {
            valid: false,
            message: 'Введите корректный email адрес'
        };
    }
    
    if (!message || message.trim().length < 10) {
        return {
            valid: false,
            message: 'Сообщение должно содержать минимум 10 символов'
        };
    }
    
    return { valid: true };
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ===== Send via Mailgun =====
async function sendEmailViaMailgun(data) {
    const { name, email, phone, message } = data;
    const mailgunUrl = `https://api.mailgun.net/v3/${CONFIG.mailgun.domain}/messages`;
    
    const formData = new FormData();
    formData.append('from', CONFIG.mailgun.from);
    formData.append('to', CONFIG.mailgun.to);
    formData.append('subject', `Новая заявка от ${name}`);
    formData.append('text', `
Имя: ${name}
Email: ${email}
Телефон: ${phone || 'Не указан'}

Сообщение:
${message}
    `);
    formData.append('html', generateEmailHTML(name, email, phone, message));
    
    try {
        const response = await fetch(mailgunUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa('api:' + CONFIG.mailgun.apiKey)
            },
            body: formData
        });
        
        if (response.ok) {
            return { success: true };
        } else {
            const error = await response.text();
            return { success: false, error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== Send via SendGrid =====
async function sendEmailViaSendGrid(data) {
    const { name, email, phone, message } = data;
    const sendgridUrl = 'https://api.sendgrid.com/v3/mail/send';
    
    const payload = {
        personalizations: [{
            to: [{ email: CONFIG.sendgrid.to }],
            subject: `Новая заявка от ${name}`
        }],
        from: { email: CONFIG.sendgrid.from },
        reply_to: { email },
        content: [{
            type: 'text/html',
            value: generateEmailHTML(name, email, phone, message)
        }]
    };
    
    try {
        const response = await fetch(sendgridUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + CONFIG.sendgrid.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok || response.status === 202) {
            return { success: true };
        } else {
            const error = await response.text();
            return { success: false, error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== Email HTML Template =====
function generateEmailHTML(name, email, phone, message) {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9f6ef; 
        }
        .header { 
            background-color: #142434; 
            color: #fff; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-family: 'Playfair Display', Georgia, serif; 
        }
        .content { 
            background-color: #fff; 
            padding: 30px; 
            margin-top: 20px; 
        }
        .field { 
            margin-bottom: 20px; 
            padding-bottom: 20px; 
            border-bottom: 1px solid #ebe3e0; 
        }
        .field:last-child { 
            border-bottom: none; 
        }
        .label { 
            font-weight: bold; 
            color: #142434; 
            margin-bottom: 8px; 
        }
        .value { 
            color: #666; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #999; 
            font-size: 12px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DVE Estate</h1>
            <p style="margin: 10px 0 0 0; color: #c9ad98;">Новая заявка с сайта</p>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">👤 Имя:</div>
                <div class="value">${escapeHtml(name)}</div>
            </div>
            
            <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value">${escapeHtml(email)}</div>
            </div>
            
            <div class="field">
                <div class="label">📱 Телефон:</div>
                <div class="value">${escapeHtml(phone || 'Не указан')}</div>
            </div>
            
            <div class="field">
                <div class="label">💬 Сообщение:</div>
                <div class="value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Это автоматическое сообщение от формы обратной связи</p>
            <p>Дата: ${new Date().toLocaleString('ru-RU')}</p>
            <p style="margin-top: 10px; color: #c9ad98;">DVE Estate | Премиальная недвижимость</p>
        </div>
    </div>
</body>
</html>
    `;
}

// ===== Rate Limiting (using KV store) =====
async function checkRateLimit(ip) {
    // Note: Requires Cloudflare KV namespace binding
    // For simple version without KV, always return allowed
    return { allowed: true };
    
    /* With KV:
    const key = `ratelimit:${ip}`;
    const record = await RATE_LIMIT_KV.get(key, 'json');
    const now = Date.now();
    
    if (!record) {
        await RATE_LIMIT_KV.put(key, JSON.stringify({
            count: 1,
            resetAt: now + CONFIG.rateLimit.windowMs
        }), {
            expirationTtl: CONFIG.rateLimit.windowMs / 1000
        });
        return { allowed: true };
    }
    
    if (record.count >= CONFIG.rateLimit.maxRequests) {
        return { allowed: false };
    }
    
    record.count++;
    await RATE_LIMIT_KV.put(key, JSON.stringify(record), {
        expirationTtl: (record.resetAt - now) / 1000
    });
    
    return { allowed: true };
    */
}

// ===== Helper Functions =====
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== Usage Instructions =====
/*
1. Install Wrangler CLI:
   npm install -g @cloudflare/wrangler

2. Login to Cloudflare:
   wrangler login

3. Create wrangler.toml:
   name = "dve-estate-contact"
   type = "javascript"
   account_id = "YOUR_ACCOUNT_ID"
   workers_dev = true

4. Publish:
   wrangler publish

5. Update form.js to use worker URL:
   fetch('https://your-worker.workers.dev', { ... })
*/
