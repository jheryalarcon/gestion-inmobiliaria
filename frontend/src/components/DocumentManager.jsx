import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, FileText, Upload, Trash2, CheckCircle, AlertCircle, IdCard, Scale, Handshake, ScrollText, Building2, Zap, Download } from 'lucide-react';

const DocumentRow = ({ label, files, onUpload, onDelete, required = false, accept = ".pdf,.jpg,.png", error = false }) => {
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
        }
    };

    const hasFiles = files && files.length > 0;

    return (
        <div className={`flex items-center justify-between py-3 px-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${error ? 'bg-red-50 border-red-200' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${hasFiles ? 'bg-green-100' : error ? 'bg-red-100' : 'bg-gray-100'}`}>
                    {error ? <AlertCircle className="w-5 h-5 text-red-600" /> : <FileText className={`w-5 h-5 ${hasFiles ? 'text-green-600' : 'text-gray-500'}`} />}
                </div>
                <div>
                    <h4 className={`text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}>{label}</h4>
                    {!hasFiles && required && (
                        <div className="flex gap-1.5 items-center mt-1">
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Requerido</span>
                            {error && <span className="text-[10px] text-red-600 font-medium">Debes subir este documento</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {hasFiles ? (
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Subido
                            </span>
                            <span className="text-[10px] text-gray-400 max-w-[150px] truncate">
                                {files[0].name} {files.length > 1 && `+${files.length - 1}`}
                            </span>
                        </div>

                        {files[0].url && (
                            <a
                                href={`${import.meta.env.VITE_BACKEND_URL}${files[0].url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                title="Descargar"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={() => onDelete(0)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept={accept}
                            multiple
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-200 text-orange-600 text-xs font-medium rounded-lg shadow-sm hover:bg-orange-50 transition-colors"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Subir
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default function DocumentManager({ documentos, onUpload, onDelete, tipoContrato, mode = 'propiedad', errores = {} }) {

    const handleUploadWrapper = (files, key) => {
        const syntheticEvent = { target: { files } };
        onUpload(syntheticEvent, key);
    };

    if (mode === 'cliente') {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-4">
                <Accordion.Root type="multiple" defaultValue={['identificacion', 'legal']} className="space-y-4">
                    {/* 1. DOCUMENTOS DE IDENTIFICACIÓN */}
                    <Accordion.Item value="identificacion" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <Accordion.Header className="flex">
                            <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-2">
                                    <IdCard className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-800 font-bold">Identificación</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                            <div className="flex flex-col">
                                <DocumentRow
                                    label="Cédula de Identidad"
                                    files={documentos.cedula}
                                    onUpload={(f) => handleUploadWrapper(f, 'cedula')}
                                    onDelete={(idx) => onDelete('cedula', idx)}
                                    required={false}
                                    accept=".pdf,.jpg,.png"
                                />
                                <DocumentRow
                                    label="Papeleta de Votación"
                                    files={documentos.papeleta_votacion}
                                    onUpload={(f) => handleUploadWrapper(f, 'papeleta_votacion')}
                                    onDelete={(idx) => onDelete('papeleta_votacion', idx)}
                                    accept=".pdf,.jpg,.png"
                                />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>

                    {/* 2. DOCUMENTOS LEGALES (PODERES) */}
                    <Accordion.Item value="legal" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <Accordion.Header className="flex">
                            <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-800 font-semibold">Legal (Opcional)</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                            <div className="flex flex-col">
                                <DocumentRow
                                    label="Poder Especial"
                                    files={documentos.poder}
                                    onUpload={(f) => handleUploadWrapper(f, 'poder')}
                                    onDelete={(idx) => onDelete('poder', idx)}
                                    accept=".pdf,.doc,.docx"
                                />
                                <DocumentRow
                                    label="Otros Documentos"
                                    files={documentos.otro}
                                    onUpload={(f) => handleUploadWrapper(f, 'otro')}
                                    onDelete={(idx) => onDelete('otro', idx)}
                                    accept=".pdf,.jpg,.png,.doc,.docx"
                                />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>
        );
    }

    if (mode === 'agente') {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-4">
                <Accordion.Root type="multiple" defaultValue={['identidad', 'contractual', 'profesional']} className="space-y-4">
                    {/* 1. IDENTIDAD */}
                    <Accordion.Item value="identidad" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <Accordion.Header className="flex">
                            <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-2">
                                    <IdCard className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-800 font-bold">Identidad</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                            <div className="flex flex-col">
                                <DocumentRow
                                    label="Cédula / Pasaporte"
                                    files={documentos.identificacion}
                                    onUpload={(f) => handleUploadWrapper(f, 'identificacion')}
                                    onDelete={(idx) => onDelete('identificacion', idx)}
                                    required={true}
                                    error={!!errores?.identificacion}
                                />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>

                    {/* 2. CONTRACTUAL */}
                    <Accordion.Item value="contractual" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <Accordion.Header className="flex">
                            <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-2">
                                    <ScrollText className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-800 font-semibold">Contractual</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                            <div className="flex flex-col">
                                <DocumentRow
                                    label="Contrato Firmado"
                                    files={documentos.contrato}
                                    onUpload={(f) => handleUploadWrapper(f, 'contrato')}
                                    onDelete={(idx) => onDelete('contrato', idx)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>

                    {/* 3. PROFESIONAL */}
                    <Accordion.Item value="profesional" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <Accordion.Header className="flex">
                            <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-2">
                                    <IdCard className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-800 font-semibold">Profesional</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                            <div className="flex flex-col">
                                <DocumentRow
                                    label="Hoja de Vida (CV)"
                                    files={documentos.hoja_vida}
                                    onUpload={(f) => handleUploadWrapper(f, 'hoja_vida')}
                                    onDelete={(idx) => onDelete('hoja_vida', idx)}
                                    accept=".pdf"
                                />
                                <DocumentRow
                                    label="Certificados"
                                    files={documentos.certificado}
                                    onUpload={(f) => handleUploadWrapper(f, 'certificado')}
                                    onDelete={(idx) => onDelete('certificado', idx)}
                                />
                                <DocumentRow
                                    label="Otros"
                                    files={documentos.otro}
                                    onUpload={(f) => handleUploadWrapper(f, 'otro')}
                                    onDelete={(idx) => onDelete('otro', idx)}
                                />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <Accordion.Root type="multiple" defaultValue={['legales', 'comercializacion']} className="space-y-4">

                {/* 1. DOCUMENTOS DE PROPIEDAD Y COMERCIALIZACIÓN */}
                <Accordion.Item value="comercializacion" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <Accordion.Header className="flex">
                        <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 bg-orange-50/50 hover:bg-orange-50 transition-all group">
                            <div className="flex items-center gap-2">
                                <Handshake className="w-5 h-5 text-orange-600" />
                                <span className="text-orange-900 font-bold">Documentos de Comercialización</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-orange-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                        <div className="flex flex-col">
                            {/* Lógica condicional según tipo de contrato */}
                            {tipoContrato === 'exclusividad' ? (
                                <DocumentRow
                                    label="Contrato de Exclusividad"
                                    files={documentos.contrato_exclusividad}
                                    onUpload={(f) => handleUploadWrapper(f, 'contrato_exclusividad')}
                                    onDelete={(idx) => onDelete('contrato_exclusividad', idx)}
                                    required={true}
                                    accept=".pdf,.doc,.docx"
                                    error={!!errores?.documentos && (!documentos.contrato_exclusividad || documentos.contrato_exclusividad.length === 0)}
                                />
                            ) : (
                                <DocumentRow
                                    label="Autorización de Venta / Arriendo"
                                    files={documentos.autorizacion_venta}
                                    onUpload={(f) => handleUploadWrapper(f, 'autorizacion_venta')}
                                    onDelete={(idx) => onDelete('autorizacion_venta', idx)}
                                    required={true}
                                    accept=".pdf,.doc,.docx"
                                    error={!!errores?.documentos && (!documentos.autorizacion_venta || documentos.autorizacion_venta.length === 0)}
                                />
                            )}
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                {/* 2. DOCUMENTOS LEGALES (ESCRITURA) - MANTENIDOS COMO BASE */}
                <Accordion.Item value="legales" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <Accordion.Header className="flex">
                        <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                            <div className="flex items-center gap-2">
                                <Scale className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700 font-semibold">Documentos Legales de Propiedad</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                        <div className="flex flex-col">
                            <DocumentRow
                                label="Escritura Pública"
                                files={documentos.escritura}
                                onUpload={(f) => handleUploadWrapper(f, 'escritura')}
                                onDelete={(idx) => onDelete('escritura', idx)}
                                accept=".pdf,.doc,.docx"
                            />
                            <DocumentRow
                                label="Certificado de Gravámenes"
                                files={documentos.gravamenes}
                                onUpload={(f) => handleUploadWrapper(f, 'gravamenes')}
                                onDelete={(idx) => onDelete('gravamenes', idx)}
                                accept=".pdf"
                            />
                            <DocumentRow
                                label="Pago Impuesto Predial"
                                files={documentos.predial}
                                onUpload={(f) => handleUploadWrapper(f, 'predial')}
                                onDelete={(idx) => onDelete('predial', idx)}
                                accept=".pdf,.jpg,.png"
                            />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                {/* 3. DOCUMENTOS TÉCNICOS */}
                <Accordion.Item value="tecnicos" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <Accordion.Header className="flex">
                        <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                            <div className="flex items-center gap-2">
                                <ScrollText className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700 font-semibold">Documentos Técnicos</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                        <div className="flex flex-col">
                            <DocumentRow
                                label="Planos Arquitectónicos"
                                files={documentos.planos}
                                onUpload={(f) => handleUploadWrapper(f, 'planos')}
                                onDelete={(idx) => onDelete('planos', idx)}
                                accept=".pdf,.jpg,.png"
                            />
                            <DocumentRow
                                label="Ficha Catastral"
                                files={documentos.ficha_catastral}
                                onUpload={(f) => handleUploadWrapper(f, 'ficha_catastral')}
                                onDelete={(idx) => onDelete('ficha_catastral', idx)}
                                accept=".pdf,.jpg,.png"
                            />
                            <DocumentRow
                                label="Certificado de Uso de Suelo"
                                files={documentos.uso_suelo}
                                onUpload={(f) => handleUploadWrapper(f, 'uso_suelo')}
                                onDelete={(idx) => onDelete('uso_suelo', idx)}
                                accept=".pdf,.jpg,.png"
                            />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                {/* 4. PROPIEDAD HORIZONTAL */}
                <Accordion.Item value="ph" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <Accordion.Header className="flex">
                        <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700 font-semibold">Régimen de Propiedad Horizontal</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                        <div className="flex flex-col">
                            <DocumentRow
                                label="Reglamento de PH"
                                files={documentos.reglamento_ph}
                                onUpload={(f) => handleUploadWrapper(f, 'reglamento_ph')}
                                onDelete={(idx) => onDelete('reglamento_ph', idx)}
                                accept=".pdf"
                            />
                            <DocumentRow
                                label="Certificado de Expensas"
                                files={documentos.certificado_expensas}
                                onUpload={(f) => handleUploadWrapper(f, 'certificado_expensas')}
                                onDelete={(idx) => onDelete('certificado_expensas', idx)}
                                accept=".pdf"
                            />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                {/* 5. SERVICIOS BÁSICOS */}
                <Accordion.Item value="servicios" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <Accordion.Header className="flex">
                        <Accordion.Trigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700 font-semibold">Servicios Básicos</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="bg-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                        <div className="flex flex-col">
                            <DocumentRow
                                label="Planilla de Luz"
                                files={documentos.planilla_luz}
                                onUpload={(f) => handleUploadWrapper(f, 'planilla_luz')}
                                onDelete={(idx) => onDelete('planilla_luz', idx)}
                                accept=".pdf,.jpg,.png"
                            />
                            <DocumentRow
                                label="Planilla de Agua"
                                files={documentos.planilla_agua}
                                onUpload={(f) => handleUploadWrapper(f, 'planilla_agua')}
                                onDelete={(idx) => onDelete('planilla_agua', idx)}
                                accept=".pdf,.jpg,.png"
                            />
                            <DocumentRow
                                label="Planilla de Alícuota"
                                files={documentos.planilla_alicuota}
                                onUpload={(f) => handleUploadWrapper(f, 'planilla_alicuota')}
                                onDelete={(idx) => onDelete('planilla_alicuota', idx)}
                                accept=".pdf,.jpg,.png"
                            />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

            </Accordion.Root>
        </div>
    );
}
