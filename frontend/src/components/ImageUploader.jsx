import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

export default function ImageUploader({
    images = [],
    onImagesChange,
    maxFiles = 15,
    maxSizeMB = 5,
    accept = "image/*",
    error
}) {
    const fileInputRef = useRef(null);
    const [previews, setPreviews] = useState([]);
    const [isCompressing, setIsCompressing] = useState(false);

    // Actualizar previews cuando cambian las imágenes externas
    useEffect(() => {
        // Limpiar previews anteriores para evitar fugas de memoria
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    useEffect(() => {
        const newPreviews = images.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        // Cleanup function for this specific effect run
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        // Validamos máximo total de archivos
        const currentCount = images.length;
        if (currentCount + files.length > maxFiles) {
            toast.error(`Solo puedes subir un máximo de ${maxFiles} imágenes.`, { duration: 4000 });
            return;
        }

        setIsCompressing(true);
        const validFiles = [];
        const compressionOptions = {
            maxSizeMB: 1, // Comprimir para que pese alrededor de 1MB o menos
            maxWidthOrHeight: 1920, // Full HD es suficiente para web
            useWebWorker: true,
            fileType: "image/webp" // Convertir a WebP para mejor compresión
        };

        try {
            for (const file of files) {
                // Validar que solo sean imágenes
                if (!file.type.startsWith('image/')) {
                    toast.error(`El archivo "${file.name}" no es una imagen válida. Solo se permiten JPG, PNG, WEBP.`, { duration: 4000 });
                    continue; // Saltar este archivo
                }

                // Comprimir imagen
                try {
                    const compressedFile = await imageCompression(file, compressionOptions);
                    // Truco para preservar el nombre original pero con extensión .webp si cambió
                    const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const finalFile = new File([compressedFile], newName, { type: compressedFile.type });
                    validFiles.push(finalFile);
                } catch (error) {
                    console.error("Error comprimiendo:", error);
                    // Si falla la compresión, intentamos subir el original si no es gigante
                    if (file.size <= maxSizeMB * 1024 * 1024) {
                        validFiles.push(file);
                    } else {
                        toast.error(`No se pudo procesar la imagen ${file.name}`);
                    }
                }
            }

            if (validFiles.length > 0) {
                onImagesChange([...images, ...validFiles]);
                toast.success(`${validFiles.length} imágenes procesadas correctamente`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error al procesar las imágenes");
        } finally {
            setIsCompressing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* DROPZONE / INPUT AREA */}
            <div
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 relative
                    ${error
                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                        : isCompressing
                            ? 'border-orange-300 bg-orange-50 cursor-wait'
                            : 'border-gray-300 bg-gray-50 hover:bg-orange-50 hover:border-orange-400'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isCompressing}
                />

                {isCompressing ? (
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                        <div>
                            <p className="font-semibold text-orange-700">
                                Optimizando imágenes...
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Comprimiendo para mayor velocidad
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className={`p-3 rounded-full ${error ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-600'}`}>
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`font-semibold ${error ? 'text-red-700' : 'text-gray-900'}`}>
                                Haga clic para seleccionar imágenes
                            </p>
                            <div className="text-sm text-gray-500 mt-1 space-y-1">
                                <p>Máximo {maxFiles} imágenes (JPG, PNG, WEBP)</p>
                                <p className="text-xs text-orange-600 font-medium">✨ Optimizamos automáticamente tus fotos de alta calidad</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && !isCompressing && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-fadeIn">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* PREVIEW GRID */}
            {images.length > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-medium text-gray-600">
                            {images.length} de {maxFiles} imágenes seleccionadas
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previews.map((src, index) => (
                            <div key={index} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <img
                                    src={src}
                                    alt={`Preview ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-all shadow-lg"
                                        title="Eliminar imagen"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    {images[index]?.size ? (images[index].size / 1024 / 1024).toFixed(1) : '0.0'} MB
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
