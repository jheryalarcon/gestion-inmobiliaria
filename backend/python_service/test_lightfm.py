"""Test del servicio de recomendaciones SVD"""
from recomendaciones_service import procesar_recomendaciones

interacciones = [
    {'propiedadId': 1, 'peso_total': 6},   # Vista(1) + Favorito(5)
    {'propiedadId': 2, 'peso_total': 10},  # Solo Contacto(10)
]

propiedades = [
    {'id': 1, 'precio': 120000, 'tipo_propiedad': 'departamento', 'transaccion': 'venta', 'nro_habitaciones': 2, 'nro_banos': 1, 'nro_parqueaderos': 1, 'area_construccion': 85, 'area_terreno': 0, 'tiene_piscina': False, 'tiene_seguridad': True, 'tiene_ascensor': True, 'tiene_area_bbq': False, 'tiene_terraza': True, 'tiene_balcon': False, 'tiene_patio': False, 'tiene_bodega': True, 'tiene_areas_comunales': True, 'amoblado': False},
    {'id': 2, 'precio': 95000,  'tipo_propiedad': 'departamento', 'transaccion': 'venta', 'nro_habitaciones': 2, 'nro_banos': 1, 'nro_parqueaderos': 0, 'area_construccion': 72, 'area_terreno': 0, 'tiene_piscina': False, 'tiene_seguridad': False, 'tiene_ascensor': False, 'tiene_area_bbq': False, 'tiene_terraza': False, 'tiene_balcon': True, 'tiene_patio': False, 'tiene_bodega': False, 'tiene_areas_comunales': False, 'amoblado': True},
    {'id': 3, 'precio': 110000, 'tipo_propiedad': 'departamento', 'transaccion': 'venta', 'nro_habitaciones': 3, 'nro_banos': 2, 'nro_parqueaderos': 1, 'area_construccion': 95, 'area_terreno': 0, 'tiene_piscina': False, 'tiene_seguridad': True, 'tiene_ascensor': True, 'tiene_area_bbq': False, 'tiene_terraza': True, 'tiene_balcon': True, 'tiene_patio': False, 'tiene_bodega': False, 'tiene_areas_comunales': True, 'amoblado': False},
    {'id': 4, 'precio': 250000, 'tipo_propiedad': 'casa',         'transaccion': 'venta', 'nro_habitaciones': 4, 'nro_banos': 3, 'nro_parqueaderos': 2, 'area_construccion': 200, 'area_terreno': 300, 'tiene_piscina': True, 'tiene_seguridad': True, 'tiene_ascensor': False, 'tiene_area_bbq': True, 'tiene_terraza': False, 'tiene_balcon': False, 'tiene_patio': True, 'tiene_bodega': True, 'tiene_areas_comunales': False, 'amoblado': False},
    {'id': 5, 'precio': 135000, 'tipo_propiedad': 'departamento', 'transaccion': 'venta', 'nro_habitaciones': 2, 'nro_banos': 2, 'nro_parqueaderos': 1, 'area_construccion': 90, 'area_terreno': 0, 'tiene_piscina': True, 'tiene_seguridad': True, 'tiene_ascensor': True, 'tiene_area_bbq': False, 'tiene_terraza': True, 'tiene_balcon': True, 'tiene_patio': False, 'tiene_bodega': False, 'tiene_areas_comunales': True, 'amoblado': False},
]

resultado = procesar_recomendaciones(
    usuario_id=42,
    interacciones=interacciones,
    propiedades_disponibles=propiedades,
    limit=3
)

print("Algoritmo:", resultado['algoritmo'])
print("Metricas:", resultado['metricas'])
for r in resultado['recomendaciones']:
    print("  -> Propiedad ID:" + str(r['id']) + "  Score:" + str(round(r['score'], 4)))
print("TEST SVD EXITOSO!")
