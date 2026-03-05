import fs from 'fs';
import path from 'path';

const filesToUpdate = [
    'frontend/src/pages/Registro.jsx',
    'frontend/src/pages/RecuperarPassword.jsx',
    'frontend/src/pages/NuevaPassword.jsx',
    'frontend/src/pages/Login.jsx',
    'frontend/src/pages/DetallePropiedad.jsx',
    'frontend/src/components/Sidebar.jsx',
    'frontend/src/components/LayoutPublic.jsx',
    'frontend/index.html',
    'backend/src/config/email.js'
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

    // Reemplazos de texto Insensible a mayúsculas
    content = content.replace(/Inmobiliaria Escudero/gi, 'PropTech Hub');
    content = content.replace(/Logo Escudero/gi, 'Logo PropTech Hub');
    content = content.replace(/Constructora Inmobiliaria Escudero/gi, 'PropTech Hub');
    content = content.replace(/>Escudero</g, '>PropTech Hub<');

    // Cambios URL Logo temporal
    content = content.replace(/text=Inmobiliaria\+Escudero/gi, 'text=PropTech+Hub');

    // Cambiando la referencia de importación si aplica
    // content = content.replace(/logoEmpresaEscudero\.png/g, 'proptech-hub-logo.png');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Modificado: ${fil}`);
        modifiedCount++;
    }
}

console.log(`\n🎉 Reemplazos completados. ${modifiedCount} archivos modificados.`);
