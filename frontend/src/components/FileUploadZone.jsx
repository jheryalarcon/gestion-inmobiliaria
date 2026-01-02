import { useState, useRef } from 'react';
import { CloudUpload, FileText, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export default function FileUploadZone({ label, accept, files, onFilesAdded, onRemove, infoText }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesAdded(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesAdded(e.target.files);
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return <ImageIcon className="w-5 h-5 text-blue-500" />;
        }
        if (['pdf'].includes(ext)) {
            return <FileText className="w-5 h-5 text-red-500" />;
        }
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm">{label}</span>
                {infoText && (
                    <div className="group relative">
                        <AlertCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute right-0 top-6 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {infoText}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                {/* Drag Zone */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    className={`
                        border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-3
                        ${isDragging
                            ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                            : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300'
                        }
                    `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        className="hidden"
                        multiple
                        accept={accept}
                    />

                    <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-white shadow-sm'}`}>
                        <CloudUpload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-blue-500'}`} />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-blue-900">
                            Arrastra tus archivos aquí
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            o haz clic para seleccionar
                        </p>
                    </div>

                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                        {accept ? accept.replace(/,/g, ' • ') : 'Cualquier archivo'}
                    </p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {files.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                        {getFileIcon(file.name)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-gray-700 truncate block">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatBytes(file.size)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(idx);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar archivo"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
