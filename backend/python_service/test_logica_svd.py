import random
import time
from recomendaciones_service import procesar_recomendaciones

def run_test():
    propiedades = []
    
    # 1. Creamos 5 casas en la PLAYA (costa)
    for i in range(1, 6):
        propiedades.append({
            'id': i,
            'precio': random.randint(150000, 200000),
            'tipo_propiedad': 'casa',
            'transaccion': 'venta',
            'ciudad': 'Manta', # Costa
            'nro_habitaciones': 3,
            'area_construccion': 120,
            'tiene_piscina': True,
            'tiene_area_bbq': True,
            'tiene_seguridad': True
        })
        
    # 2. Creamos 5 casas en la SIERRA (frío)
    for i in range(6, 11):
        propiedades.append({
            'id': i,
            'precio': random.randint(150000, 200000),
            'tipo_propiedad': 'casa',
            'transaccion': 'venta',
            'ciudad': 'Quito', # Sierra
            'nro_habitaciones': 3,
            'area_construccion': 120,
            'tiene_piscina': False,
            'tiene_area_bbq': True,
            'tiene_seguridad': True
        })

    # 3. Creamos 5 departamentos para SOLTEROS
    for i in range(11, 16):
        propiedades.append({
            'id': i,
            'precio': random.randint(50000, 80000),
            'tipo_propiedad': 'departamento',
            'transaccion': 'venta',
            'ciudad': 'Guayaquil',
            'nro_habitaciones': 1, # Soltero
            'area_construccion': 50,
            'tiene_piscina': False,
            'tiene_ascensor': True,
            'tiene_seguridad': True
        })

    # 4. Creamos 5 locales comerciales
    for i in range(16, 21):
        propiedades.append({
            'id': i,
            'precio': random.randint(100000, 300000),
            'tipo_propiedad': 'local_comercial',
            'transaccion': 'alquiler',
            'ciudad': 'Quito',
            'nro_habitaciones': 0,
            'area_construccion': 200,
            'tiene_piscina': False,
            'tiene_seguridad': True
        })


    # --- PRUEBA DE LÓGICA 1: El cliente busca casa en la playa ---
    # Interactuó con la casa ID 1 (Playa, Piscina, BBQ)
    print("\n--- PRUEBA DE LÓGICA 1: Cliente interactuó con CASA DE PLAYA CON PISCINA (ID 1) ---")
    interacciones = [{'propiedadId': 1, 'peso_total': 10}]
    
    res1 = procesar_recomendaciones(1, interacciones, propiedades, limit=5)
    
    print("Recomendaciones (¿Tienen sentido? Debería recomendar otras casas de playa con piscina, NO departamentos ni locales):")
    for r in res1['recomendaciones']:
        pid = r['id']
        p = next(p for p in propiedades if p['id'] == pid)
        print(f"  - ID {pid}: {p['tipo_propiedad'].upper()} en {p['ciudad']} | Piscina: {p['tiene_piscina']} | Habitaciones: {p['nro_habitaciones']} -> Score: {r['score']:.4f}")

    # --- PRUEBA DE LÓGICA 2: El cliente busca departamento pequeño ---
    # Interactuó con el depto ID 11 (1 cuarto, ascensor)
    print("\n--- PRUEBA DE LÓGICA 2: Cliente interactuó con DEPARTAMENTO PARA SOLTERO (ID 11) ---")
    interacciones2 = [{'propiedadId': 11, 'peso_total': 10}]
    
    res2 = procesar_recomendaciones(2, interacciones2, propiedades, limit=5)
    
    print("Recomendaciones (¿Tienen sentido? Debería recomendar otros deptos de 1 cuarto, NO casas familiares grandes):")
    for r in res2['recomendaciones']:
        pid = r['id']
        p = next(p for p in propiedades if p['id'] == pid)
        print(f"  - ID {pid}: {p['tipo_propiedad'].upper()} en {p['ciudad']} | Piscina: {p['tiene_piscina']} | Habitaciones: {p['nro_habitaciones']} -> Score: {r['score']:.4f}")

if __name__ == '__main__':
    run_test()
