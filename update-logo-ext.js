import fs from 'fs';
import path from 'path';

const filesToUpdate = [
    'frontend/src/pages/Registro.jsx',
    'frontend/src/pages/RecuperarPassword.jsx',
    'frontend/src/pages/NuevaPassword.jsx',
    'frontend/src/pages/Login.jsx',
    'frontend/src/components/Sidebar.jsx',
    'frontend/src/components/LayoutPublic.jsx'
];

let modifiedCount = 0;

for (let fil of filesToUpdate) {
    let filePath = path.join(process.cwd(), fil);
    if (!fs.existsSync(filePath)) {
        console.warn(`Archivo no encontrado: ${filePath}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/logo-rectangular\.jpg/g, 'logo-rectangular.png');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Modificado: ${fil}`);
        modifiedCount++;
    }
}

console.log(`\n🎉 Reemplazos completados. ${modifiedCount} archivos modificados.`);
