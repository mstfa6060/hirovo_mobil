const fs = require('fs');

module.exports = function decodeGoogleServices(config) {
    const b64 = process.env.GOOGLE_SERVICES_JSON_BASE64;
    if (!b64) {
        console.warn('GOOGLE_SERVICES_JSON_BASE64 not set');
        return config;
    }

    fs.writeFileSync('./google-services.json', Buffer.from(b64, 'base64').toString('utf-8'));
    return config;
};
