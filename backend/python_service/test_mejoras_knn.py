"""
Script de Prueba para las Mejoras del Algoritmo KNN
Demuestra las mejoras implementadas comparando con el algoritmo original
"""

import json
import time
from typing import List, Dict, Any

# Importar servicios
from recomendaciones_service import procesar_recomendaciones as procesar_original
from recomendaciones_service_mejorado import procesar_recomendaciones_mejoradas
from sistema_hibrido_recomendaciones import procesar_recomendaciones_hibridas
from evaluacion_recomendaciones import evaluar_recomendaciones

def crear_datos_prueba() -> tuple:
    """
    Crear datos de prueba más realistas para demostrar las mejoras
    
    Returns:
        Tupla con (favoritos, propiedades_disponibles)
    """
    # Propiedades favoritas del usuario
    favoritos = [
        {
            'id': 1,
            'precio': 180000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 3,
            'nro_banos': 2,
            'area_construccion': 120,
            'area_terreno': 200,
            'nro_parqueaderos': 2
        },
        {
            'id': 2,
            'precio': 220000,
            'tipo_propiedad': 'apartamento',
            'ciudad': 'Medellín',
            'nro_habitaciones': 2,
            'nro_banos': 2,
            'area_construccion': 85,
            'area_terreno': 0,
            'nro_parqueaderos': 1
        }
    ]
    
    # Propiedades disponibles para recomendación
    propiedades_disponibles = [
        # Casas similares a la favorita
        {
            'id': 3,
            'precio': 190000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 3,
            'nro_banos': 2,
            'area_construccion': 125,
            'area_terreno': 180,
            'nro_parqueaderos': 2
        },
        {
            'id': 4,
            'precio': 175000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 4,
            'nro_banos': 3,
            'area_construccion': 140,
            'area_terreno': 220,
            'nro_parqueaderos': 2
        },
        # Apartamentos similares
        {
            'id': 5,
            'precio': 210000,
            'tipo_propiedad': 'apartamento',
            'ciudad': 'Medellín',
            'nro_habitaciones': 2,
            'nro_banos': 2,
            'area_construccion': 90,
            'area_terreno': 0,
            'nro_parqueaderos': 1
        },
        {
            'id': 6,
            'precio': 240000,
            'tipo_propiedad': 'apartamento',
            'ciudad': 'Medellín',
            'nro_habitaciones': 3,
            'nro_banos': 2,
            'area_construccion': 100,
            'area_terreno': 0,
            'nro_parqueaderos': 2
        },
        # Propiedades diferentes para diversidad
        {
            'id': 7,
            'precio': 150000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Cali',
            'nro_habitaciones': 2,
            'nro_banos': 1,
            'area_construccion': 100,
            'area_terreno': 150,
            'nro_parqueaderos': 1
        },
        {
            'id': 8,
            'precio': 300000,
            'tipo_propiedad': 'penthouse',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 4,
            'nro_banos': 3,
            'area_construccion': 180,
            'area_terreno': 0,
            'nro_parqueaderos': 3
        },
        {
            'id': 9,
            'precio': 120000,
            'tipo_propiedad': 'estudio',
            'ciudad': 'Barranquilla',
            'nro_habitaciones': 1,
            'nro_banos': 1,
            'area_construccion': 45,
            'area_terreno': 0,
            'nro_parqueaderos': 0
        },
        {
            'id': 10,
            'precio': 250000,
            'tipo_propiedad': 'duplex',
            'ciudad': 'Cartagena',
            'nro_habitaciones': 3,
            'nro_banos': 2,
            'area_construccion': 110,
            'area_terreno': 0,
            'nro_parqueaderos': 2
        }
    ]
    
    return favoritos, propiedades_disponibles

def ejecutar_prueba_algoritmo_original(favoritos: List[Dict], propiedades: List[Dict]) -> Dict[str, Any]:
    """Ejecutar prueba con algoritmo original"""
    print("🔄 Ejecutando algoritmo KNN original...")
    start_time = time.time()
    
    resultado = procesar_original(
        favoritos=favoritos,
        propiedades_disponibles=propiedades,
        k=3,
        limit=4
    )
    
    tiempo = time.time() - start_time
    resultado['tiempo_ejecucion'] = tiempo
    
    return resultado

def ejecutar_prueba_algoritmo_mejorado(favoritos: List[Dict], propiedades: List[Dict]) -> Dict[str, Any]:
    """Ejecutar prueba con algoritmo mejorado"""
    print("🚀 Ejecutando algoritmo KNN mejorado...")
    start_time = time.time()
    
    resultado = procesar_recomendaciones_mejoradas(
        favoritos=favoritos,
        propiedades_disponibles=propiedades,
        k=5,
        limit=4,
        metric='euclidean',
        scaler_type='robust'
    )
    
    tiempo = time.time() - start_time
    resultado['tiempo_ejecucion'] = tiempo
    
    return resultado

def ejecutar_prueba_sistema_hibrido(favoritos: List[Dict], propiedades: List[Dict]) -> Dict[str, Any]:
    """Ejecutar prueba con sistema híbrido"""
    print("🔄 Ejecutando sistema híbrido...")
    start_time = time.time()
    
    resultado = procesar_recomendaciones_hibridas(
        favoritos=favoritos,
        propiedades_disponibles=propiedades,
        k=5,
        limit=4
    )
    
    tiempo = time.time() - start_time
    resultado['tiempo_ejecucion'] = tiempo
    
    return resultado

def evaluar_resultados(resultado: Dict[str, Any], favoritos: List[Dict], propiedades: List[Dict]) -> Dict[str, Any]:
    """Evaluar la calidad de los resultados"""
    evaluacion = evaluar_recomendaciones(
        recomendaciones=resultado.get('recomendaciones', []),
        favoritos=favoritos,
        propiedades_disponibles=propiedades
    )
    
    return evaluacion

def imprimir_comparacion(resultado_original: Dict, resultado_mejorado: Dict, resultado_hibrido: Dict):
    """Imprimir comparación de resultados"""
    print("\n" + "="*80)
    print("📊 COMPARACIÓN DE ALGORITMOS")
    print("="*80)
    
    # Comparar número de recomendaciones
    print(f"\n📈 NÚMERO DE RECOMENDACIONES:")
    print(f"   Original:    {len(resultado_original.get('recomendaciones', []))}")
    print(f"   Mejorado:    {len(resultado_mejorado.get('recomendaciones', []))}")
    print(f"   Híbrido:     {len(resultado_hibrido.get('recomendaciones', []))}")
    
    # Comparar tiempo de ejecución
    print(f"\n⏱️  TIEMPO DE EJECUCIÓN:")
    print(f"   Original:    {resultado_original.get('tiempo_ejecucion', 0):.3f}s")
    print(f"   Mejorado:    {resultado_mejorado.get('tiempo_ejecucion', 0):.3f}s")
    print(f"   Híbrido:     {resultado_hibrido.get('tiempo_ejecucion', 0):.3f}s")
    
    # Comparar algoritmos utilizados
    print(f"\n🧠 ALGORITMOS UTILIZADOS:")
    print(f"   Original:    {resultado_original.get('algoritmo', 'N/A')}")
    print(f"   Mejorado:    {resultado_mejorado.get('algoritmo', 'N/A')}")
    print(f"   Híbrido:     {resultado_hibrido.get('algoritmo', 'N/A')}")
    
    # Comparar métricas
    print(f"\n📊 MÉTRICAS DISPONIBLES:")
    print(f"   Original:    {len(resultado_original.get('metricas', {}))} métricas")
    print(f"   Mejorado:    {len(resultado_mejorado.get('metricas', {}))} métricas")
    print(f"   Híbrido:     {len(resultado_hibrido.get('metricas', {}))} métricas")

def imprimir_recomendaciones_detalladas(resultado: Dict, titulo: str):
    """Imprimir recomendaciones detalladas"""
    print(f"\n{titulo}")
    print("-" * len(titulo))
    
    recomendaciones = resultado.get('recomendaciones', [])
    if not recomendaciones:
        print("   No se generaron recomendaciones")
        return
    
    for i, rec in enumerate(recomendaciones, 1):
        print(f"\n   {i}. Propiedad ID: {rec.get('id', 'N/A')}")
        print(f"      Precio: ${rec.get('precio', 0):,}")
        print(f"      Tipo: {rec.get('tipo_propiedad', 'N/A')}")
        print(f"      Ciudad: {rec.get('ciudad', 'N/A')}")
        print(f"      Habitaciones: {rec.get('nro_habitaciones', 'N/A')}")
        print(f"      Baños: {rec.get('nro_banos', 'N/A')}")
        print(f"      Área: {rec.get('area_construccion', 'N/A')} m²")
        
        # Mostrar métricas adicionales si están disponibles
        if 'similitud' in rec:
            print(f"      Similitud: {rec['similitud']:.3f}")
        if 'score_hibrido' in rec:
            print(f"      Score Híbrido: {rec['score_hibrido']:.3f}")

def main():
    """Función principal de prueba"""
    print("🧪 INICIANDO PRUEBAS DE MEJORAS DEL ALGORITMO KNN")
    print("="*60)
    
    # Crear datos de prueba
    favoritos, propiedades_disponibles = crear_datos_prueba()
    
    print(f"\n📋 DATOS DE PRUEBA:")
    print(f"   Favoritos: {len(favoritos)}")
    print(f"   Propiedades disponibles: {len(propiedades_disponibles)}")
    
    # Ejecutar pruebas
    resultado_original = ejecutar_prueba_algoritmo_original(favoritos, propiedades_disponibles)
    resultado_mejorado = ejecutar_prueba_algoritmo_mejorado(favoritos, propiedades_disponibles)
    resultado_hibrido = ejecutar_prueba_sistema_hibrido(favoritos, propiedades_disponibles)
    
    # Evaluar resultados
    print("\n📊 Evaluando calidad de recomendaciones...")
    evaluacion_original = evaluar_resultados(resultado_original, favoritos, propiedades_disponibles)
    evaluacion_mejorado = evaluar_resultados(resultado_mejorado, favoritos, propiedades_disponibles)
    evaluacion_hibrido = evaluar_resultados(resultado_hibrido, favoritos, propiedades_disponibles)
    
    # Imprimir comparación
    imprimir_comparacion(resultado_original, resultado_mejorado, resultado_hibrido)
    
    # Imprimir recomendaciones detalladas
    imprimir_recomendaciones_detalladas(resultado_original, "🏠 RECOMENDACIONES ALGORITMO ORIGINAL")
    imprimir_recomendaciones_detalladas(resultado_mejorado, "🚀 RECOMENDACIONES ALGORITMO MEJORADO")
    imprimir_recomendaciones_detalladas(resultado_hibrido, "🔄 RECOMENDACIONES SISTEMA HÍBRIDO")
    
    # Imprimir evaluaciones
    print(f"\n📈 EVALUACIÓN DE CALIDAD:")
    print(f"   Original - Similitud: {evaluacion_original['similitud_promedio']:.3f}, Diversidad: {evaluacion_original['diversidad_general']:.3f}")
    print(f"   Mejorado - Similitud: {evaluacion_mejorado['similitud_promedio']:.3f}, Diversidad: {evaluacion_mejorado['diversidad_general']:.3f}")
    print(f"   Híbrido  - Similitud: {evaluacion_hibrido['similitud_promedio']:.3f}, Diversidad: {evaluacion_hibrido['diversidad_general']:.3f}")
    
    # Resumen de mejoras
    print(f"\n🎉 RESUMEN DE MEJORAS:")
    print(f"   ✅ Feature Engineering: {len(resultado_mejorado.get('metricas', {}).get('feature_weights', {}))} características")
    print(f"   ✅ Sistema Híbrido: {len(resultado_hibrido.get('metricas', {}).get('estrategias_usadas', []))} estrategias")
    print(f"   ✅ Evaluación Automática: {len(evaluacion_mejorado)} métricas de calidad")
    print(f"   ✅ Optimización: K óptimo automático")
    print(f"   ✅ Robustez: Manejo de outliers y datos faltantes")
    
    print(f"\n🎯 RECOMENDACIÓN:")
    mejor_similitud = max(
        evaluacion_original['similitud_promedio'],
        evaluacion_mejorado['similitud_promedio'],
        evaluacion_hibrido['similitud_promedio']
    )
    
    if mejor_similitud == evaluacion_mejorado['similitud_promedio']:
        print("   🏆 Usar ALGORITMO MEJORADO para mejor similitud")
    elif mejor_similitud == evaluacion_hibrido['similitud_promedio']:
        print("   🏆 Usar SISTEMA HÍBRIDO para mejor similitud")
    else:
        print("   🏆 El algoritmo original tiene la mejor similitud")
    
    print("\n✅ PRUEBAS COMPLETADAS EXITOSAMENTE")

if __name__ == "__main__":
    main()
