import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
    try {
        const result = await cloudinary.api.ping();
        fs.writeFileSync('cloudinary_result.json', JSON.stringify({ success: true, result }));
    } catch (e) {
        fs.writeFileSync('cloudinary_result.json', JSON.stringify({ success: false, error: e.message, stack: e.stack }));
    }
}

test();
