import { toast } from 'sonner';

// Configuración centralizada de toasts para mejor UX
export const toastConfig = {
    // Duraciones estándar
    durations: {
        short: 2000,    // Para acciones rápidas (favoritos, copiar)
        medium: 3000,   // Para mensajes informativos
        long: 4000,     // Para errores importantes
        veryLong: 6000  // Para información crítica (credenciales)
    },

    // Funciones helper para diferentes tipos de mensajes
    success: {
        quick: (message) => toast.success(message, { duration: toastConfig.durations.short }),
        normal: (message, description) => toast.success(message, { 
            duration: toastConfig.durations.medium,
            ...(description && { description })
        }),
        withAction: (message, description, action) => toast.success(message, {
            duration: toastConfig.durations.veryLong,
            ...(description && { description }),
            ...(action && { action })
        })
    },

    error: {
        quick: (message) => toast.error(message, { duration: toastConfig.durations.short }),
        normal: (message) => toast.error(message, { duration: toastConfig.durations.medium }),
        important: (message) => toast.error(message, { duration: toastConfig.durations.long })
    },

    info: {
        quick: (message) => toast.info(message, { duration: toastConfig.durations.short }),
        normal: (message) => toast.info(message, { duration: toastConfig.durations.medium })
    },

    warning: {
        normal: (message) => toast.warning(message, { duration: toastConfig.durations.medium })
    }
};

// Función para limpiar toasts duplicados
export const clearDuplicateToasts = () => {
    // Sonner maneja automáticamente los toasts duplicados con el mismo mensaje
    // pero podemos agregar lógica adicional si es necesario
};

// Función para mostrar toasts de carga
export const showLoadingToast = (message) => {
    return toast.loading(message);
};

// Función para actualizar un toast de carga
export const updateLoadingToast = (toastId, message, type = 'success') => {
    toast.dismiss(toastId);
    return toastConfig[type].normal(message);
};
