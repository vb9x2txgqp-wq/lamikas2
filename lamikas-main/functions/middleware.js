const SecurityUtils = require('./security');

async function applySecurityMiddleware(handler, event, context) {
    const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    
    // Apply rate limiting
    if (!await SecurityUtils.checkRateLimit(clientIP)) {
        return {
            statusCode: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60'
            },
            body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
        };
    }

    // Validate JSON body for POST/PUT requests
    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
        try {
            if (event.body) {
                JSON.parse(event.body);
            }
        } catch (error) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://yourdomain.com',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'Invalid JSON format' })
            };
        }
    }

    // Set security headers
    const headers = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://yourdomain.com',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Execute the actual handler
    try {
        return await handler(event, context, headers);
    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}

module.exports = { applySecurityMiddleware };
