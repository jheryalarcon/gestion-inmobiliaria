import fs from 'fs';
import path from 'path';

// Directorio raíz de los componentes de React
const dir = path.join(process.cwd(), 'src');

// Busca todos los archivos js/jsx recursivamente
function getFiles(d) {
    let results = [];
    const list = fs.readdirSync(d);
    list.forEach(function (file) {
        file = path.join(d, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(getFiles(file));
        } else {
            /* Is a file */
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = getFiles(dir);
let modifiedCount = 0;

for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Patrón 1: String delimitado por comillas simples o dobles
    // ej: axios.get('http://localhost:3000/api/endpoint') -> axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/endpoint`)
    content = content.replace(/['"]http:\/\/localhost:3000([^'"]*)['"]/g, '`${import.meta.env.VITE_BACKEND_URL}$1`');

    // Patrón 2: Ya es un template string
    // ej: axios.get(`http://localhost:3000/api/${id}`) -> axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/${id}`)
    content = content.replace(/`http:\/\/localhost:3000([^`]*)`/g, '`${import.meta.env.VITE_BACKEND_URL}$1`');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Modificado: ${path.relative(process.cwd(), file)}`);
        modifiedCount++;
    }
}

console.log(`\n🎉 Reemplazos completados. ${modifiedCount} archivos modificados.`);
