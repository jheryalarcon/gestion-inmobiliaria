# 🏠 Lógica de Negocio - Sistema de Negociaciones

## 📋 Resumen de Cambios Implementados

### ✅ **1. Validación de Propiedades Disponibles**
**ANTES**: Solo se validaba que la propiedad no estuviera "inactiva"
**AHORA**: Solo se permiten negociaciones con propiedades en estado "disponible"

```javascript
// ✅ SOLO permitir negociaciones con propiedades DISPONIBLES
if (propiedad.estado_publicacion !== 'disponible') {
    return res.status(400).json({ 
        mensaje: `No se puede crear negociación con una propiedad que no está disponible. Estado actual: ${propiedad.estado_publicacion}` 
    });
}
```

**Estados permitidos para negociaciones:**
- ✅ `disponible` - Se puede crear negociación
- ❌ `vendida` - No se puede crear negociación
- ❌ `arrendada` - No se puede crear negociación  
- ❌ `reservada` - No se puede crear negociación
- ❌ `inactiva` - No se puede crear negociación

### ✅ **2. Colaboración entre Agentes**
**ANTES**: Los agentes solo podían crear negociaciones con propiedades propias
**AHORA**: Los agentes pueden crear negociaciones con propiedades de otros agentes

```javascript
// 🏠 CREAR LA NEGOCIACIÓN
// LÓGICA DE NEGOCIO: 
// - El agenteId será SIEMPRE el agente del cliente (quien gestiona la relación)
// - Los agentes pueden crear negociaciones con propiedades de otros agentes
// - Esto permite colaboración entre agentes en el mercado inmobiliario
agenteId: cliente.agenteId, // Siempre el agente del cliente
```

### ✅ **3. Validación de Cliente con Agente Asignado**
**NUEVO**: Se verifica que el cliente tenga un agente asignado antes de crear la negociación

```javascript
// ✅ Verificar que el cliente tenga un agente asignado
if (!cliente.agenteId) {
    return res.status(400).json({ 
        mensaje: 'No se puede crear negociación para un cliente sin agente asignado' 
    });
}
```

---

## 🔄 Flujo de Creación de Negociación

### **Paso 1: Validación del Cliente**
1. ✅ Cliente existe en el sistema
2. ✅ Cliente está activo
3. ✅ Cliente tiene agente asignado
4. ✅ Usuario tiene permisos para gestionar el cliente

### **Paso 2: Validación de la Propiedad**
1. ✅ Propiedad existe en el sistema
2. ✅ Propiedad está en estado "disponible"
3. ✅ No hay negociación duplicada activa

### **Paso 3: Creación de la Negociación**
1. ✅ Se asigna el `agenteId` del cliente (no del usuario que crea)
2. ✅ Se establece la etapa inicial como "interes"
3. ✅ Se registra la fecha de inicio automáticamente

---

## 🎯 Casos de Uso Habilitados

### **Caso 1: Agente A crea negociación para su cliente con propiedad de Agente B**
```
Cliente: Juan Pérez (asignado a Agente A)
Propiedad: Casa en Quito (creada por Agente B)
Estado Propiedad: disponible

✅ RESULTADO: Se crea la negociación
✅ agenteId: Agente A (quien gestiona la relación)
✅ El Agente A puede gestionar la negociación completa
```

### **Caso 2: Agente A crea negociación para su cliente con su propia propiedad**
```
Cliente: María López (asignado a Agente A)
Propiedad: Apartamento en Guayaquil (creada por Agente A)
Estado Propiedad: disponible

✅ RESULTADO: Se crea la negociación
✅ agenteId: Agente A
✅ El Agente A gestiona tanto el cliente como la propiedad
```

### **Caso 3: Admin crea negociación para cualquier cliente con cualquier propiedad**
```
Cliente: Carlos Ruiz (asignado a Agente C)
Propiedad: Terreno en Cuenca (creada por Agente D)
Estado Propiedad: disponible

✅ RESULTADO: Se crea la negociación
✅ agenteId: Agente C (quien gestiona la relación)
✅ El Admin puede supervisar, pero la gestión es del Agente C
```

---

## 🚫 Casos de Uso Bloqueados

### **Caso 1: Propiedad no disponible**
```
Propiedad: Casa en Quito
Estado: vendida

❌ RESULTADO: Error 400
❌ Mensaje: "No se puede crear negociación con una propiedad que no está disponible. Estado actual: vendida"
```

### **Caso 2: Cliente sin agente asignado**
```
Cliente: Ana García
Agente: null

❌ RESULTADO: Error 400
❌ Mensaje: "No se puede crear negociación para un cliente sin agente asignado"
```

### **Caso 3: Negociación duplicada**
```
Cliente: Pedro López
Propiedad: Apartamento en Manta
Negociación existente: activa

❌ RESULTADO: Error 400
❌ Mensaje: "Ya existe una negociación activa entre este cliente y propiedad"
```

---

## 🔐 Reglas de Seguridad

### **1. Permisos por Rol**
- **Admin**: Puede crear negociaciones para cualquier cliente con cualquier propiedad
- **Agente**: Solo puede crear negociaciones para sus clientes asignados
- **Cliente**: No tiene acceso al sistema de negociaciones

### **2. Propiedad de la Negociación**
- **Siempre pertenece al agente del cliente** (quien gestiona la relación)
- **No depende de quién creó la propiedad**
- **Permite colaboración entre agentes**

### **3. Validaciones de Estado**
- **Propiedad debe estar disponible** para crear negociación
- **Cliente debe estar activo** y tener agente asignado
- **No se permiten duplicados** activos

---

## 💡 Beneficios de la Nueva Lógica

### **1. Colaboración entre Agentes**
- Los agentes pueden mostrar propiedades de otros agentes a sus clientes
- Se fomenta la colaboración en el mercado inmobiliario
- Mejor experiencia para el cliente final

### **2. Gestión Centralizada**
- Cada cliente tiene un agente responsable único
- El agente del cliente gestiona todas las negociaciones
- Facilita el seguimiento y la comunicación

### **3. Prevención de Errores**
- Solo propiedades disponibles pueden ser negociadas
- Se evitan negociaciones con clientes sin agente
- Se previenen duplicados y conflictos

### **4. Flexibilidad del Negocio**
- Los agentes pueden expandir su oferta
- Se aprovecha mejor el inventario disponible
- Mejora la competitividad del mercado

---

## 🔄 Próximas Mejoras Sugeridas

### **1. Sistema de Comisiones**
- Implementar lógica de reparto de comisiones entre agentes
- Cuando un agente vende propiedad de otro agente

### **2. Notificaciones Automáticas**
- Notificar al propietario de la propiedad cuando se crea negociación
- Notificar al agente del cliente sobre nuevas oportunidades

### **3. Historial de Colaboraciones**
- Registrar qué agentes han colaborado entre sí
- Métricas de colaboración y éxito

### **4. Workflow de Aprobación**
- Sistema de aprobación para negociaciones entre agentes
- Validaciones adicionales según políticas de la empresa
