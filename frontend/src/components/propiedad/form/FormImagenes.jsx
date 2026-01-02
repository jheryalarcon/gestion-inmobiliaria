import ImageUploader from '../../ImageUploader';

import { Trash2 } from 'lucide-react';

export default function FormImagenes({ datos, handleChange, errores, imagenes, setImagenes, imagenesExistentes = [], onDeleteExistente }) {

    const handleImagesChange = (newImages) => {
        setImagenes(newImages);
    };

    return (
        <>
            {/* INFORMACIÓN PÚBLICA (WEB) */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                        Información Pública (Web)
                    </h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">Esta información es la que verán los clientes en el portal.</p>
                    <div className="grid grid-cols-1 gap-6">
                        {/* TÍTULO */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-1">Título de la Publicación <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="titulo"
                                value={datos.titulo}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.titulo ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Ej: Casa moderna en Quito con amplia vista"
                            />
                            {errores.titulo && <p className="text-red-600 text-sm mt-1 font-medium">{errores.titulo}</p>}
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-1">Descripción Pública</label>
                            <textarea
                                name="descripcion"
                                value={datos.descripcion}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.descripcion ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Describa los detalles atractivos de la propiedad para los clientes..."
                            ></textarea>
                            {errores.descripcion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.descripcion}</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* IMÁGENES */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                        Imágenes <span className="text-red-500">*</span>
                    </h3>
                </div>
                <div className="p-6">
                    {/* IMÁGENES EXISTENTES */}
                    {imagenesExistentes && imagenesExistentes.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Imágenes Actuales:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {imagenesExistentes.map((img, index) => (
                                    <div key={img.id || index} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                        <img
                                            src={img.url}
                                            alt={`Imagen ${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => onDeleteExistente && onDeleteExistente(index)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-all shadow-lg"
                                                title="Eliminar imagen"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <ImageUploader
                        images={imagenes}
                        onImagesChange={handleImagesChange}
                        error={errores.imagenes}
                        maxFiles={15}
                        maxSizeMB={5}
                    />
                </div>
            </section>
        </>
    );
}
