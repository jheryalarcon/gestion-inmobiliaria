import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits

function getKey() {
    const keyHex = process.env.NOTES_ENCRYPTION_KEY;
    if (!keyHex) {
        throw new Error('NOTES_ENCRYPTION_KEY no está definida en las variables de entorno');
    }
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
        throw new Error('NOTES_ENCRYPTION_KEY debe ser exactamente 64 caracteres hex (256 bits)');
    }
    return key;
}

/**
 * Cifra un texto usando AES-256-GCM.
 * @param {string} texto - Texto plano a cifrar.
 * @returns {string} - Texto cifrado en formato "iv:authTag:contenido" (todo en hex).
 */
export function cifrar(texto) {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const cifrado = Buffer.concat([
        cipher.update(texto, 'utf8'),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${cifrado.toString('hex')}`;
}

/**
 * Descifra un texto previamente cifrado con cifrar().
 * @param {string} textoCifrado - String en formato "iv:authTag:contenido".
 * @returns {string} - Texto original en claro.
 * @throws {Error} - Si el formato es inválido o el authTag falla (datos manipulados).
 */
export function descifrar(textoCifrado) {
    const partes = textoCifrado.split(':');
    if (partes.length !== 3) {
        throw new Error('FORMATO_INVALIDO');
    }

    const key = getKey();
    const iv = Buffer.from(partes[0], 'hex');
    const authTag = Buffer.from(partes[1], 'hex');
    const contenidoCifrado = Buffer.from(partes[2], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const descifrado = Buffer.concat([
        decipher.update(contenidoCifrado),
        decipher.final()
    ]);

    return descifrado.toString('utf8');
}

/**
 * Detecta si un string ya está cifrado por este módulo.
 * @param {string} texto
 * @returns {boolean}
 */
export function estaCifrado(texto) {
    const partes = texto.split(':');
    if (partes.length !== 3) return false;
    // El IV debe ser exactamente 32 hex chars (16 bytes)
    return partes[0].length === 32 && /^[0-9a-f]+$/i.test(partes[0]);
}
