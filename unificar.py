import os

# Carpetas que no queremos incluir
directorios_ignorados = {'.git', 'node_modules', 'venv', '__pycache__', 'env', 'dist', 'build', '.next'}
# Extensiones de los archivos de código que sí queremos leer
extensiones_permitidas = {'.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.php', '.prisma', '.env'}

contador = 0

with open('proyecto_completo.txt', 'w', encoding='utf-8') as archivo_salida:
    archivo_salida.write("PROYECTO INMOBILIARIA - CÓDIGO UNIFICADO\n")
    archivo_salida.write(f"{'='*60}\n\n")

    for raiz, directorios, archivos in os.walk('.'):
        # Filtrar carpetas ignoradas
        directorios[:] = [d for d in directorios if d not in directorios_ignorados]

        for archivo in archivos:
            if any(archivo.endswith(ext) for ext in extensiones_permitidas):
                ruta_completa = os.path.join(raiz, archivo)

                # Escribir el nombre del archivo como separador
                archivo_salida.write(f"\n{'='*60}\n")
                archivo_salida.write(f"Archivo: {ruta_completa}\n")
                archivo_salida.write(f"{'='*60}\n\n")

                # Leer y escribir el contenido del archivo
                try:
                    with open(ruta_completa, 'r', encoding='utf-8') as archivo_entrada:
                        archivo_salida.write(archivo_entrada.read())
                    contador += 1
                except Exception as e:
                    archivo_salida.write(f"Error al leer el archivo: {e}\n")

    archivo_salida.write(f"\n\n{'='*60}\n")
    archivo_salida.write(f"Total de archivos incluidos: {contador}\n")
    archivo_salida.write(f"{'='*60}\n")

print(f"Archivo proyecto_completo.txt generado con exito! ({contador} archivos incluidos)")