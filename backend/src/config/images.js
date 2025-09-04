// 🖼️ Configuración de URLs de imágenes
const config = {
    // URL base del servidor backend
    baseUrl: process.env.BACKEND_URL || 'http://localhost:3000',
    
    // Función para convertir URLs relativas a absolutas
    convertirUrlAbsoluta: (urlRelativa) => {
        console.log('🔧 Helper - Convirtiendo URL:', urlRelativa);
        
        if (!urlRelativa) {
            console.log('🔧 Helper - URL vacía, retornando cadena vacía');
            return '';
        }
        
        // Si ya es una URL absoluta, retornarla tal como está
        if (urlRelativa.startsWith('http://') || urlRelativa.startsWith('https://')) {
            console.log('🔧 Helper - URL ya es absoluta, retornando tal como está');
            return urlRelativa;
        }
        
        // Si es una URL relativa, convertirla a absoluta
        const urlAbsoluta = `${config.baseUrl}/${urlRelativa.replace(/^\/+/, '')}`;
        console.log('🔧 Helper - URL convertida:', urlRelativa, '→', urlAbsoluta);
        return urlAbsoluta;
    },
    
    // Función para procesar imágenes de propiedades
    procesarImagenes: (propiedades) => {
        console.log('🔧 Helper - Procesando propiedades:', propiedades);
        
        if (!propiedades) return propiedades;
        
        if (!Array.isArray(propiedades)) {
            // Si es una sola propiedad
            console.log('🔧 Helper - Procesando propiedad individual');
            const resultado = {
                ...propiedades,
                imagenes: propiedades.imagenes?.map(imagen => {
                    const urlAbsoluta = config.convertirUrlAbsoluta(imagen.url);
                    console.log('🔧 Helper - URL relativa:', imagen.url, '→ URL absoluta:', urlAbsoluta);
                    return {
                        ...imagen,
                        url: urlAbsoluta
                    };
                }) || []
            };
            console.log('🔧 Helper - Resultado propiedad individual:', resultado);
            return resultado;
        }
        
        // Si es un array de propiedades
        console.log('🔧 Helper - Procesando array de propiedades');
        const resultado = propiedades.map(propiedad => ({
            ...propiedad,
            imagenes: propiedad.imagenes?.map(imagen => {
                const urlAbsoluta = config.convertirUrlAbsoluta(imagen.url);
                console.log('🔧 Helper - URL relativa:', imagen.url, '→ URL absoluta:', urlAbsoluta);
                return {
                    ...imagen,
                    url: urlAbsoluta
                };
            }) || []
        }));
        console.log('🔧 Helper - Resultado array de propiedades:', resultado);
        return resultado;
    }
};

export default config;
