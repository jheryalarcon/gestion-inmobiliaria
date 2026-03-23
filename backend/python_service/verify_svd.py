"""
Verificación del comportamiento del algoritmo SVD.

Datos: PROPIEDADES REALES extraídas de la base de datos de la aplicación.
Filtro: Únicamente propiedades ACTIVAS localizadas en "Santo Domingo".

Escenario:
  - Mario vio y marcó favorito el Terreno Comercial en Av. Río Toachi ID:7 (peso=6)
  - Mario envió formulario de contacto por el Terreno en Vía Quevedo ID:5 (peso=10) <- señal más fuerte
  → El SVD debe reconocer el patrón (Terrenos vacíos en Santo Domingo) 
  → Las casas y departamentos (ID:1, 2, 8) deben ser penalizados y enviados al final del ranking

Puntuación esperada:
  Alta:   No hay más terrenos, así que las casas grandes o baratas competirán, pero con scores bajísimos.
  Baja:   Departamentos pequeños que no tienen nada que ver con terrenos comerciales.
"""
from recomendaciones_service import procesar_recomendaciones

print("=" * 60)
print("VERIFICACIÓN DEL ALGORITMO SVD — DATOS REALES (ACTIVOS)")
print("Santo Domingo de los Tsáchilas, Ecuador")
print("=" * 60)

# Interacciones del usuario simulado "Mario" (Buscador de Terrenos)
interacciones = [
    # Mario vio Y guardó como favorito el Terreno en Av. Río Toachi (ID:7)
    {'propiedadId': 7, 'peso_total': 6},

    # Mario envió formulario de contacto por el Terreno Vía Quevedo (ID:5)
    {'propiedadId': 5, 'peso_total': 10},
]

# Propiedades REALES de la base de datos (Excluyendo Quito y las Inactivas)
propiedades = [
    # ─── INTERACTUADAS (IDs 5 y 7 — no deben aparecer en el resultado) ────
    {
        'id': 7,
        'titulo': 'Terreno Comercial en Venta en Avenida Rio Toachi, al frente del Grand Hotel Santo Domingo',
        'precio': 110000,
        'tipo_propiedad': 'terreno', 'transaccion': 'venta',
        'ciudad': 'Santo Domingo', 'provincia': 'Santo_Domingo',
        'nro_habitaciones': 0, 'nro_banos': 0, 'nro_parqueaderos': 0,
        'area_construccion': 0.0, 'area_terreno': 112.0,
        'amoblado': False, 'tiene_piscina': False, 'tiene_seguridad': False,
        'tiene_ascensor': False, 'tiene_area_bbq': False, 'tiene_terraza': False,
        'tiene_balcon': False, 'tiene_patio': False, 'tiene_bodega': False, 'tiene_areas_comunales': False,
    },
    {
        'id': 5,
        'titulo': 'Terreno en Venta a 600 metros del Complejo Karibe (Vía Quevedo km 5)',
        'precio': 15000,
        'tipo_propiedad': 'terreno', 'transaccion': 'venta',
        'ciudad': 'Santo Domingo', 'provincia': 'Santo_Domingo',
        'nro_habitaciones': 0, 'nro_banos': 0, 'nro_parqueaderos': 0,
        'area_construccion': 0.0, 'area_terreno': 123.0,
        'amoblado': False, 'tiene_piscina': False, 'tiene_seguridad': False,
        'tiene_ascensor': False, 'tiene_area_bbq': False, 'tiene_terraza': False,
        'tiene_balcon': False, 'tiene_patio': False, 'tiene_bodega': False, 'tiene_areas_comunales': False,
    },

    # ─── CANDIDATAS REALES DE SANTO DOMINGO (Deben salir recomendadas) ──────
    {
        'id': 1,
        'titulo': '¡Gran Oportunidad! Casa en Venta en la Urbanización "Sueño de Bolívar"',
        'precio': 47000,
        'tipo_propiedad': 'casa', 'transaccion': 'venta',
        'ciudad': 'Santo Domingo', 'provincia': 'Santo_Domingo',
        'nro_habitaciones': 2, 'nro_banos': 2, 'nro_parqueaderos': 1,
        'area_construccion': 100.0, 'area_terreno': 135.0,
        'amoblado': False, 'tiene_piscina': False, 'tiene_seguridad': False,
        'tiene_ascensor': False, 'tiene_area_bbq': False, 'tiene_terraza': True,
        'tiene_balcon': False, 'tiene_patio': True, 'tiene_bodega': False, 'tiene_areas_comunales': False,
    },
    {
        'id': 8,
        'titulo': 'Casa en Venta a pocos metros del hospital Saludesa en la Urbanización "Sueño de Bolívar"',
        'precio': 60000,
        'tipo_propiedad': 'casa', 'transaccion': 'venta',
        'ciudad': 'Santo Domingo', 'provincia': 'Santo_Domingo',
        'nro_habitaciones': 3, 'nro_banos': 2, 'nro_parqueaderos': 1,
        'area_construccion': 130.0, 'area_terreno': 135.0,
        'amoblado': False, 'tiene_piscina': False, 'tiene_seguridad': False,
        'tiene_ascensor': False, 'tiene_area_bbq': False, 'tiene_terraza': True,
        'tiene_balcon': True, 'tiene_patio': True, 'tiene_bodega': False, 'tiene_areas_comunales': False,
    },
    {
        'id': 2,
        # Único Departamento en Arriendo — DEBE quedar al final por ser diametralmente opuesto a comprar un Terreno
        'titulo': 'Departamento en Arriendo en la Avenida La Lorena, por la escuela Benjamín Carrion',
        'precio': 150,
        'tipo_propiedad': 'departamento', 'transaccion': 'alquiler',
        'ciudad': 'Santo Domingo', 'provincia': 'Santo_Domingo',
        'nro_habitaciones': 2, 'nro_banos': 1, 'nro_parqueaderos': 0,
        'area_construccion': 100.0, 'area_terreno': 100.0,
        'amoblado': False, 'tiene_piscina': False, 'tiene_seguridad': False,
        'tiene_ascensor': False, 'tiene_area_bbq': False, 'tiene_terraza': True,
        'tiene_balcon': True, 'tiene_patio': False, 'tiene_bodega': False, 'tiene_areas_comunales': False,
    },
]

resultado = procesar_recomendaciones(
    usuario_id=99,
    interacciones=interacciones,
    propiedades_disponibles=propiedades,
    limit=3
)

print()
print("Perfil del cliente 'Mario' (Inversor de Terrenos):")
print("  ID:7 -> Vista + Favorito = peso 6   (Terreno Av. Río Toachi, $110.000)")
print("  ID:5 -> Contacto         = peso 10  (Terreno Vía Quevedo, $15.000) <- señal más fuerte")
print()
print("Algoritmo:", resultado['algoritmo'])
print("Métricas:", resultado['metricas'])
print()
print("RECOMENDACIONES SVD (Del inventario real activo de Sto. Domingo):")
print("-" * 60)

for i, r in enumerate(resultado['recomendaciones'], 1):
    pid = r['id']
    score = r['score']
    
    # Extraer titulo de propiedades
    prop_tit = next(p['titulo'] for p in propiedades if p['id'] == pid)
    
    anotacion = ""
    if pid == 2:
        anotacion = " ← DEBE ser último (Arriendo Dpto vs. Venta Terreno)"
    elif i == 1:
        anotacion = " ← Mejor opción disponible (Venta - Amplia)"
        
    print(f"  {i}. [{score:.4f}]  ID:{pid} — {prop_tit[:40]}... {anotacion}")

print()
# ── Verificaciones automáticas ────────────────────────────────────────────
ids_resultado = [r['id'] for r in resultado['recomendaciones']]

pos_dpto = ids_resultado.index(2) + 1 if 2 in ids_resultado else None
if pos_dpto is None or pos_dpto >= 3:
    print("✅ CORRECTO: El Departamento en arriendo (ID:2) quedó en la última posición — penalizado por perfil inmobiliario distinto.")
else:
    print("⚠️  El departamento obtuvo una posición errónea para un buscador de terrenos.")

if 5 not in ids_resultado and 7 not in ids_resultado:
    print("✅ CORRECTO: Los lotes de interactuados (ID:5 e ID:7) fueron excluidos del ranking de sugerencias.")
else:
    print("❌ ERROR: Una propiedad ya interactuada aparece en las recomendaciones.")

print()
print("VERIFICACIÓN COMPLETADA")
print("=" * 60)
