"""
Módulo de Persistencia de Incidentes - Ley 21.663
Garantiza formato idéntico en crear/editar/guardar
Mantiene la estructura exacta del acordeón de 7 secciones
"""

import json
import os
import hashlib
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class GestorPersistenciaIncidentes:
    """
    Gestiona la persistencia de datos para mantener formato IDÉNTICO
    en todas las operaciones del incidente
    """
    
    def __init__(self):
        self.estructura_base = self._definir_estructura_base()
        
    def _definir_estructura_base(self) -> Dict:
        """Define la estructura EXACTA del acordeón de 7 secciones"""
        return {
            "seccion_1": {
                "titulo": "Identificación General",
                "campos": {
                    "1.1": {"nombre": "Tipo de registro del Incidente", "requerido": True, "tipo": "select"},
                    "1.2": {"nombre": "Título del Incidente", "requerido": True, "tipo": "text"},
                    "1.3": {"nombre": "Fecha y hora de Detección", "requerido": True, "tipo": "datetime"},
                    "1.4": {"nombre": "Fecha y hora de ocurrencia", "requerido": True, "tipo": "datetime"},
                    "1.5": {"nombre": "Criticidad", "requerido": True, "tipo": "select"},
                    "1.6": {"nombre": "Alcance Geográfico", "requerido": False, "tipo": "text"}
                }
            },
            "seccion_2": {
                "titulo": "Descripción y Alcance",
                "campos": {
                    "2.1": {"nombre": "Descripción inicial detallada", "requerido": True, "tipo": "textarea"},
                    "2.2": {"nombre": "Impacto Preliminar Observado", "requerido": True, "tipo": "textarea"},
                    "2.3": {"nombre": "Sistemas, activos o personal afectado", "requerido": True, "tipo": "textarea"},
                    "2.4": {"nombre": "Servicios interrumpidos y duración", "requerido": True, "tipo": "textarea"},
                    "2.5": {"nombre": "Evidencias", "requerido": False, "tipo": "archivo_multiple", "permite_comentarios": True}
                }
            },
            "seccion_3": {
                "titulo": "Análisis Preliminar",
                "campos": {
                    "3.1": {"nombre": "Tipo Amenaza Probable", "requerido": True, "tipo": "select"},
                    "3.2": {"nombre": "Origen/vector de ataque probable", "requerido": True, "tipo": "text"},
                    "3.3": {"nombre": "Responsable del cliente", "requerido": False, "tipo": "text"},
                    "3.4": {"nombre": "Evidencias", "requerido": False, "tipo": "archivo_multiple", "permite_comentarios": True}
                }
            },
            "seccion_4": {
                "titulo": "Clasificación de Taxonomías",
                "campos": {
                    "4.1": {"nombre": "Selección de taxonomía", "requerido": True, "tipo": "taxonomia_dinamica"},
                    # Los campos 4.2, 4.3, 4.4 se generan dinámicamente por cada taxonomía seleccionada
                }
            },
            "seccion_5": {
                "titulo": "Acciones Inmediatas",
                "campos": {
                    "5.1": {"nombre": "Medidas de contención Iniciales", "requerido": True, "tipo": "textarea"},
                    "5.2": {"nombre": "Evidencia Acciones", "requerido": False, "tipo": "archivo_multiple", "permite_comentarios": True}
                }
            },
            "seccion_6": {
                "titulo": "Análisis de Causa Raíz",
                "campos": {
                    "6.1": {"nombre": "Análisis de Causa Raíz", "requerido": True, "tipo": "textarea"},
                    "6.2": {"nombre": "Lecciones aprendidas", "requerido": False, "tipo": "textarea"},
                    "6.3": {"nombre": "Recomendaciones de mejora", "requerido": False, "tipo": "textarea"},
                    "6.4": {"nombre": "Evidencias", "requerido": False, "tipo": "archivo_multiple", "permite_comentarios": True}
                }
            },
            "seccion_7": {
                "titulo": "Resumen de todos los archivos",
                "campos": {
                    "7.1": {"nombre": "Resumen automático", "requerido": False, "tipo": "resumen_archivos"}
                }
            }
        }
    
    def generar_indice_unico(self, empresa_id: int, rut_empresa: str) -> str:
        """
        Genera índice único según especificación:
        CORRELATIVO + RUT_SIN_DV + MODULO + SUBMODULO + DESCRIPCION
        """
        import time
        correlativo = int(time.time() * 1000) % 1000000  # 6 dígitos
        rut_sin_dv = rut_empresa.split('-')[0] if '-' in rut_empresa else rut_empresa
        modulo = "INC"  # Módulo de incidentes
        submodulo = "REG"  # Registro
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        indice = f"{correlativo:06d}_{rut_sin_dv}_{modulo}_{submodulo}_{timestamp}"
        return indice
    
    def normalizar_datos_incidente(self, datos_raw: Dict, tipo_empresa: str) -> Dict:
        """
        Normaliza los datos del incidente para garantizar formato consistente
        CRÍTICO: Este método garantiza que el formato sea IDÉNTICO siempre
        """
        datos_normalizados = {
            "indice_unico": datos_raw.get("indice_unico", ""),
            "metadata": {
                "fecha_creacion": datos_raw.get("fecha_creacion", datetime.now().isoformat()),
                "fecha_modificacion": datetime.now().isoformat(),
                "version": "1.0",
                "tipo_empresa": tipo_empresa
            },
            "secciones": {}
        }
        
        # Procesar cada sección manteniendo estructura exacta
        for seccion_key, seccion_def in self.estructura_base.items():
            seccion_datos = {
                "titulo": seccion_def["titulo"],
                "campos": {},
                "archivos": [],
                "comentarios": {}
            }
            
            # Sección 4 - Taxonomías dinámicas
            if seccion_key == "seccion_4":
                seccion_datos = self._procesar_taxonomias(datos_raw, tipo_empresa)
            else:
                # Procesar campos normales
                for campo_key, campo_def in seccion_def["campos"].items():
                    valor = self._obtener_valor_campo(datos_raw, seccion_key, campo_key)
                    
                    if campo_def["tipo"] == "archivo_multiple":
                        archivos_data = self._procesar_archivos(datos_raw, seccion_key, campo_key)
                        seccion_datos["archivos"] = archivos_data["archivos"]
                        seccion_datos["comentarios"][campo_key] = archivos_data["comentarios"]
                    else:
                        seccion_datos["campos"][campo_key] = {
                            "nombre": campo_def["nombre"],
                            "valor": valor,
                            "requerido": campo_def["requerido"],
                            "tipo": campo_def["tipo"]
                        }
            
            datos_normalizados["secciones"][seccion_key] = seccion_datos
        
        # Sección 7 - Resumen automático de archivos
        datos_normalizados["secciones"]["seccion_7"] = self._generar_resumen_archivos(datos_normalizados)
        
        return datos_normalizados
    
    def _procesar_taxonomias(self, datos_raw: Dict, tipo_empresa: str) -> Dict:
        """Procesa la sección 4 de taxonomías de forma dinámica"""
        seccion_taxonomias = {
            "titulo": "Clasificación de Taxonomías",
            "campos": {},
            "taxonomias_seleccionadas": [],
            "detalles_taxonomias": {}
        }
        
        # Obtener taxonomías seleccionadas
        taxonomias = datos_raw.get("taxonomias_seleccionadas", [])
        
        for idx, taxonomia in enumerate(taxonomias):
            tax_id = taxonomia.get("id", f"tax_{idx}")
            
            # Estructura para cada taxonomía seleccionada
            detalle = {
                f"4.2.{idx+1}": {
                    "pregunta": "¿Por qué fue seleccionada esta taxonomía?",
                    "valor": taxonomia.get("justificacion", ""),
                    "requerido": True
                },
                f"4.3.{idx+1}": {
                    "pregunta": "Observaciones Adicionales",
                    "valor": taxonomia.get("observaciones", ""),
                    "requerido": False
                },
                f"4.4.{idx+1}": {
                    "pregunta": "Evidencias",
                    "archivos": self._procesar_archivos_taxonomia(datos_raw, tax_id),
                    "requerido": False
                }
            }
            
            seccion_taxonomias["detalles_taxonomias"][tax_id] = detalle
            seccion_taxonomias["taxonomias_seleccionadas"].append({
                "id": tax_id,
                "nombre": taxonomia.get("nombre", ""),
                "tipo": taxonomia.get("tipo", "")  # OIV/PSE/AMBAS
            })
        
        return seccion_taxonomias
    
    def _procesar_archivos(self, datos_raw: Dict, seccion: str, campo: str) -> Dict:
        """
        Procesa archivos manteniendo la estructura con comentarios
        CRÍTICO: Mantiene referencia a archivos sin perderlos
        """
        archivos_info = {
            "archivos": [],
            "comentarios": {}
        }
        
        # Buscar archivos en diferentes posibles ubicaciones en datos_raw
        archivos_key = f"{seccion}_{campo}_archivos"
        archivos = datos_raw.get(archivos_key, [])
        
        for idx, archivo in enumerate(archivos):
            archivo_normalizado = {
                "id": f"{campo}.{idx+1}",
                "nombre": archivo.get("nombre", ""),
                "ruta": archivo.get("ruta", ""),
                "hash": archivo.get("hash", ""),
                "fecha_carga": archivo.get("fecha_carga", datetime.now().isoformat()),
                "descripcion": archivo.get("descripcion", ""),
                "tamaño": archivo.get("tamaño", 0)
            }
            archivos_info["archivos"].append(archivo_normalizado)
            
            # Comentarios asociados al archivo
            comentario_key = f"{campo}.{idx+1}_comentario"
            archivos_info["comentarios"][comentario_key] = archivo.get("comentario", "")
        
        return archivos_info
    
    def _procesar_archivos_taxonomia(self, datos_raw: Dict, taxonomia_id: str) -> List[Dict]:
        """Procesa archivos específicos de una taxonomía"""
        archivos = []
        archivos_tax = datos_raw.get(f"taxonomia_{taxonomia_id}_archivos", [])
        
        for idx, archivo in enumerate(archivos_tax):
            archivos.append({
                "id": f"4.4.{taxonomia_id}.{idx+1}",
                "nombre": archivo.get("nombre", ""),
                "ruta": archivo.get("ruta", ""),
                "descripcion": archivo.get("descripcion", ""),
                "fecha_carga": archivo.get("fecha_carga", datetime.now().isoformat())
            })
        
        return archivos
    
    def _obtener_valor_campo(self, datos_raw: Dict, seccion: str, campo: str) -> Any:
        """Obtiene el valor de un campo de forma segura"""
        # Intentar diferentes formas de acceder al valor
        posibles_keys = [
            f"{seccion}_{campo}",
            f"{campo}",
            campo.replace(".", "_")
        ]
        
        for key in posibles_keys:
            if key in datos_raw:
                return datos_raw[key]
        
        # Buscar en estructura anidada
        if "secciones" in datos_raw:
            seccion_data = datos_raw["secciones"].get(seccion, {})
            campos_data = seccion_data.get("campos", {})
            if campo in campos_data:
                return campos_data[campo].get("valor", "")
        
        return ""
    
    def _generar_resumen_archivos(self, datos_normalizados: Dict) -> Dict:
        """Genera el resumen automático de todos los archivos (Sección 7)"""
        resumen = {
            "titulo": "Resumen de todos los archivos",
            "archivos_totales": [],
            "estadisticas": {
                "total_archivos": 0,
                "por_seccion": {}
            }
        }
        
        # Recopilar todos los archivos de todas las secciones
        for seccion_key, seccion_data in datos_normalizados["secciones"].items():
            if seccion_key == "seccion_7":
                continue
                
            archivos_seccion = seccion_data.get("archivos", [])
            
            for archivo in archivos_seccion:
                resumen_archivo = {
                    "submodulo": seccion_key.replace("seccion_", ""),
                    "item": archivo["id"],
                    "nombre_archivo": archivo["nombre"],
                    "descripcion": archivo.get("descripcion", ""),
                    "fecha_carga": archivo["fecha_carga"],
                    "seccion_titulo": seccion_data["titulo"]
                }
                resumen["archivos_totales"].append(resumen_archivo)
            
            # Contar archivos por sección
            if archivos_seccion:
                resumen["estadisticas"]["por_seccion"][seccion_key] = len(archivos_seccion)
        
        resumen["estadisticas"]["total_archivos"] = len(resumen["archivos_totales"])
        
        return resumen
    
    def validar_consistencia(self, datos_creacion: Dict, datos_edicion: Dict) -> Dict:
        """
        Valida que los datos mantengan consistencia entre creación y edición
        Retorna un reporte de inconsistencias
        """
        inconsistencias = {
            "archivos_perdidos": [],
            "comentarios_perdidos": [],
            "campos_modificados": [],
            "formato_incorrecto": []
        }
        
        # Validar que todos los archivos de creación estén en edición
        for seccion_key in datos_creacion.get("secciones", {}):
            archivos_creacion = datos_creacion["secciones"][seccion_key].get("archivos", [])
            archivos_edicion = datos_edicion["secciones"][seccion_key].get("archivos", [])
            
            ids_creacion = {a["id"] for a in archivos_creacion}
            ids_edicion = {a["id"] for a in archivos_edicion}
            
            perdidos = ids_creacion - ids_edicion
            if perdidos:
                inconsistencias["archivos_perdidos"].extend(list(perdidos))
        
        return inconsistencias
    
    def restaurar_archivos_perdidos(self, datos_actuales: Dict, datos_historicos: Dict) -> Dict:
        """
        Restaura archivos que se hayan perdido en la edición
        """
        for seccion_key in datos_historicos.get("secciones", {}):
            archivos_historicos = datos_historicos["secciones"][seccion_key].get("archivos", [])
            archivos_actuales = datos_actuales["secciones"][seccion_key].get("archivos", [])
            
            # Crear índice de archivos actuales
            ids_actuales = {a["id"]: a for a in archivos_actuales}
            
            # Restaurar archivos faltantes
            for archivo_hist in archivos_historicos:
                if archivo_hist["id"] not in ids_actuales:
                    archivos_actuales.append(archivo_hist)
                    logger.info(f"Archivo restaurado: {archivo_hist['id']} - {archivo_hist['nombre']}")
        
        return datos_actuales

# Funciones auxiliares para uso en el sistema

def garantizar_persistencia_formato(datos_incidente: Dict, tipo_empresa: str, operacion: str) -> Dict:
    """
    Función principal que garantiza formato idéntico en todas las operaciones
    
    Args:
        datos_incidente: Datos del incidente
        tipo_empresa: OIV/PSE/AMBAS
        operacion: 'crear', 'editar', 'guardar'
    
    Returns:
        Datos normalizados con formato garantizado
    """
    gestor = GestorPersistenciaIncidentes()
    
    # Normalizar datos según operación
    datos_normalizados = gestor.normalizar_datos_incidente(datos_incidente, tipo_empresa)
    
    # Si es edición, validar contra datos originales
    if operacion == 'editar' and 'datos_originales' in datos_incidente:
        inconsistencias = gestor.validar_consistencia(
            datos_incidente['datos_originales'], 
            datos_normalizados
        )
        
        if inconsistencias['archivos_perdidos']:
            logger.warning(f"Archivos perdidos detectados: {inconsistencias['archivos_perdidos']}")
            datos_normalizados = gestor.restaurar_archivos_perdidos(
                datos_normalizados,
                datos_incidente['datos_originales']
            )
    
    return datos_normalizados

def procesar_seccion_taxonomias_dinamica(tipo_empresa: str, taxonomias_disponibles: List[Dict]) -> List[Dict]:
    """
    Filtra y procesa las taxonomías según el tipo de empresa
    """
    taxonomias_aplicables = []
    
    for tax in taxonomias_disponibles:
        tipo_tax = tax.get('tipo', '').upper()
        if tipo_tax == 'AMBAS' or tipo_tax == tipo_empresa.upper():
            taxonomias_aplicables.append({
                'id': tax['id'],
                'nombre': tax['nombre'],
                'descripcion': tax.get('descripcion', ''),
                'tipo': tipo_tax
            })
    
    return taxonomias_aplicables