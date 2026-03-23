import random
import time
from recomendaciones_service import procesar_recomendaciones

def run_test():
    # Simulamos 50 propiedades realistas
    tipos = ['casa', 'departamento', 'terreno', 'local_comercial']
    transacciones = ['venta', 'alquiler']
    amenidades = ['tiene_piscina', 'tiene_seguridad', 'tiene_ascensor', 'tiene_area_bbq', 'amoblado']
    
    propiedades = []
    
    # 10 Casas de Lujo en Venta (Caras, muchas amenidades)
    for i in range(1, 11):
        prop = {
            'id': i,
            'precio': random.randint(200000, 500000),
            'tipo_propiedad': 'casa',
            'transaccion': 'venta',
            'nro_habitaciones': random.randint(3, 5),
            'nro_banos': random.randint(3, 5),
            'nro_parqueaderos': random.randint(2, 4),
            'area_construccion': random.randint(200, 400),
            'area_terreno': random.randint(300, 600),
            'tiene_piscina': True,
            'tiene_seguridad': True,
            'tiene_area_bbq': True,
            'amoblado': random.choice([True, False])
        }
        propiedades.append(prop)
        
    # 20 Departamentos normales en Alquiler (Baratos, pocas amenidades)
    for i in range(11, 31):
        prop = {
            'id': i,
            'precio': random.randint(400, 800),
            'tipo_propiedad': 'departamento',
            'transaccion': 'alquiler',
            'nro_habitaciones': random.randint(1, 3),
            'nro_banos': random.randint(1, 2),
            'nro_parqueaderos': 1,
            'area_construccion': random.randint(50, 100),
            'tiene_seguridad': True,
            'tiene_ascensor': True,
            'tiene_piscina': False,
            'amoblado': random.choice([True, False])
        }
        propiedades.append(prop)

    # 10 Terrenos en Venta (Sin amenidades de construcción)
    for i in range(31, 41):
        prop = {
            'id': i,
            'precio': random.randint(50000, 150000),
            'tipo_propiedad': 'terreno',
            'transaccion': 'venta',
            'area_terreno': random.randint(500, 2000),
            'nro_habitaciones': 0,
            'nro_banos': 0,
            'nro_parqueaderos': 0,
            'area_construccion': 0
        }
        propiedades.append(prop)

    # 10 Locales Comerciales
    for i in range(41, 51):
        prop = {
            'id': i,
            'precio': random.randint(50000, 200000),
            'tipo_propiedad': 'local_comercial',
            'transaccion': 'venta',
            'nro_habitaciones': 1,
            'nro_banos': 1,
            'nro_parqueaderos': random.randint(1, 3),
            'area_construccion': random.randint(50, 150),
            'tiene_seguridad': True
        }
        propiedades.append(prop)

    print(f"Total propiedades simuladas: {len(propiedades)}")
    print("-" * 50)

    # --- ESCENARIO 1: Usuario busca alquilar un departamento (interactúa con deptos baratos) ---
    print("\nESCENARIO 1: Usuario busca alquilar un departamento")
    interacciones_depto = [
        {'propiedadId': 12, 'peso_total': 10}, # Contactó por depto 12
        {'propiedadId': 15, 'peso_total': 5},  # Favorito depto 15
        {'propiedadId': 18, 'peso_total': 1}   # Vio depto 18
    ]
    
    start = time.time()
    res1 = procesar_recomendaciones(1, interacciones_depto, propiedades, limit=3)
    elapsed = time.time() - start
    
    print(f"Tiempo de cómputo: {elapsed*1000:.2f} ms")
    print("Recomendaciones (deberían ser IDs entre 11 y 30):")
    for r in res1['recomendaciones']:
        pid = r['id']
        p = next(p for p in propiedades if p['id'] == pid)
        print(f"  - ID: {pid} | {p['tipo_propiedad']} en {p['transaccion']} | Precio: {p['precio']} | Score: {r['score']:.4f}")


    # --- ESCENARIO 2: Usuario busca comprar casa de lujo ---
    print("\nESCENARIO 2: Usuario busca comprar casa de lujo")
    interacciones_casa = [
        {'propiedadId': 2, 'peso_total': 5},  # Favorito casa 2
        {'propiedadId': 8, 'peso_total': 5},  # Favorito casa 8
    ]
    
    start = time.time()
    res2 = procesar_recomendaciones(2, interacciones_casa, propiedades, limit=3)
    elapsed = time.time() - start
    
    print(f"Tiempo de cómputo: {elapsed*1000:.2f} ms")
    print("Recomendaciones (deberían ser IDs entre 1 y 10):")
    for r in res2['recomendaciones']:
        pid = r['id']
        p = next(p for p in propiedades if p['id'] == pid)
        print(f"  - ID: {pid} | {p['tipo_propiedad']} en {p['transaccion']} | Precio: {p['precio']} | Score: {r['score']:.4f}")


    # --- ESCENARIO 3: Usuario busca terreno ---
    print("\nESCENARIO 3: Usuario busca terreno")
    interacciones_terreno = [
        {'propiedadId': 35, 'peso_total': 10}, # Contactó terreno 35
    ]
    
    start = time.time()
    res3 = procesar_recomendaciones(3, interacciones_terreno, propiedades, limit=3)
    elapsed = time.time() - start
    
    print(f"Tiempo de cómputo: {elapsed*1000:.2f} ms")
    print("Recomendaciones (deberían ser IDs entre 31 y 40):")
    for r in res3['recomendaciones']:
        pid = r['id']
        p = next(p for p in propiedades if p['id'] == pid)
        print(f"  - ID: {pid} | {p['tipo_propiedad']} en {p['transaccion']} | Precio: {p['precio']} | Score: {r['score']:.4f}")

if __name__ == '__main__':
    run_test()
