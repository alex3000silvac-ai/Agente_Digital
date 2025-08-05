"""
API de Taxonomías para Incidentes - Ley 21.663
Gestión completa de taxonomías y archivos de evidencias
"""

from flask import Blueprint, request, jsonify, send_file
import os
import hashlib
import shutil
from datetime import datetime
from werkzeug.utils import secure_filename
import logging
from typing import Dict, List, Optional, Tuple
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Blueprint para las rutas
taxonomias_bp = Blueprint('taxonomias', __name__)

# Configuración
UPLOAD_BASE_PATH = os.environ.get('UPLOAD_PATH', '/uploads/ciberseguridad')
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.txt', '.zip'}

class GestorTaxonomiasIncidentes:
    """
    Gestiona taxonomías y archivos de evidencias según normas de ciberseguridad
    """
    
    def __init__(self):
        self.base_path = UPLOAD_BASE_PATH
        self._asegurar_directorio_base()
    
    def _asegurar_directorio_base(self):
        """Crea el directorio base si no existe"""
        if not os.path.exists(self.base_path):
            os.makedirs(self.base_path, mode=0o750)
            logger.info(f"Directorio base creado: {self.base_path}")
    
    def obtener_taxonomias_por_tipo(self, tipo_empresa: str) -> List[Dict]:
        """
        Obtiene taxonomías filtradas por tipo de empresa
        """
        try {
            # Aquí deberías conectar con tu base de datos
            # Por ahora usamos datos de ejemplo
            
            # SQL esperado:
            # SELECT Id_Incidente, Area, Efecto, Categoria_del_Incidente, 
            #        Subcategoria_del_Incidente, Descripcion, AplicaTipoEmpresa
            # FROM Taxonomia_incidentes 
            # WHERE AplicaTipoEmpresa IN (?, 'AMBAS')
            # ORDER BY Area, Categoria_del_Incidente
            
            taxonomias_demo = [
                {
                    "Id_Incidente": "INC_USO_UNRI_AFBE",
                    "Area": "Uso no autorizado",
                    "Efecto": "Redes e infraestructura",
                    "Categoria_del_Incidente": "Ataque de fuerza bruta",
                    "Subcategoria_del_Incidente": "Exitoso",
                    "Descripcion": "Acceso no autorizado mediante ataque de fuerza bruta exitoso",
                    "AplicaTipoEmpresa": tipo_empresa
                },
                {
                    "Id_Incidente": "INC_CONF_EXDA_FDP",
                    "Area": "Confidencialidad",
                    "Efecto": "Exfiltración de datos",
                    "Categoria_del_Incidente": "Filtración de datos",
                    "Subcategoria_del_Incidente": "Personales",
                    "Descripcion": "Filtración de datos personales sensibles",
                    "AplicaTipoEmpresa": "AMBAS"
                },
                {
                    "Id_Incidente": "INC_DISP_INDS_DSEV",
                    "Area": "Disponibilidad",
                    "Efecto": "Indisponibilidad",
                    "Categoria_del_Incidente": "Denegación de servicio",
                    "Subcategoria_del_Incidente": "Servicios esenciales",
                    "Descripcion": "Ataque de denegación de servicio a servicios esenciales",
                    "AplicaTipoEmpresa": tipo_empresa
                }
            ]
            
            return taxonomias_demo
            
        } catch (Exception as e) {
            logger.error(f"Error obteniendo taxonomías: {str(e)}")
            raise
    
    def construir_ruta_archivo(self, empresa_id: str, incidente_id: str, 
                              taxonomia_id: str) -> str:
        """
        Construye la ruta del archivo según estructura de ciberseguridad
        /uploads/ciberseguridad/{empresa_id}/incidentes/{incidente_id}/taxonomias/{taxonomia_id}/
        """
        ruta = os.path.join(
            self.base_path,
            str(empresa_id),
            'incidentes',
            str(incidente_id),
            'taxonomias',
            str(taxonomia_id)
        )
        
        # Crear directorio si no existe
        if not os.path.exists(ruta):
            os.makedirs(ruta, mode=0o750)
            logger.info(f"Directorio creado: {ruta}")
        
        return ruta
    
    def validar_archivo(self, archivo) -> Tuple[bool, str]:
        """
        Valida el archivo según políticas de seguridad
        """
        if not archivo:
            return False, "No se proporcionó archivo"
        
        # Validar nombre
        filename = secure_filename(archivo.filename)
        if not filename:
            return False, "Nombre de archivo inválido"
        
        # Validar extensión
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Tipo de archivo no permitido: {ext}"
        
        # Validar tamaño (se hace al leer el archivo)
        # archivo.content_length puede no ser confiable
        
        return True, filename
    
    def calcular_hash_archivo(self, contenido: bytes) -> Dict[str, str]:
        """
        Calcula hashes MD5 y SHA256 del archivo
        """
        md5_hash = hashlib.md5(contenido).hexdigest()
        sha256_hash = hashlib.sha256(contenido).hexdigest()
        
        return {
            'md5': md5_hash,
            'sha256': sha256_hash
        }
    
    def guardar_archivo_evidencia(self, archivo, empresa_id: str, 
                                 incidente_id: str, taxonomia_id: str) -> Dict:
        """
        Guarda archivo de evidencia con validaciones de seguridad
        """
        # Validar archivo
        es_valido, resultado = self.validar_archivo(archivo)
        if not es_valido:
            raise ValueError(resultado)
        
        filename = resultado
        
        # Leer contenido y validar tamaño
        contenido = archivo.read()
        if len(contenido) > MAX_FILE_SIZE:
            raise ValueError(f"Archivo excede tamaño máximo de {MAX_FILE_SIZE/1024/1024}MB")
        
        # Calcular hashes
        hashes = self.calcular_hash_archivo(contenido)
        
        # Construir ruta
        ruta_directorio = self.construir_ruta_archivo(
            empresa_id, incidente_id, taxonomia_id
        )
        
        # Generar nombre único
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        nombre_unico = f"{timestamp}_{hashes['md5'][:8]}_{filename}"
        ruta_completa = os.path.join(ruta_directorio, nombre_unico)
        
        # Guardar archivo
        with open(ruta_completa, 'wb') as f:
            f.write(contenido)
        
        # Establecer permisos restrictivos
        os.chmod(ruta_completa, 0o640)
        
        logger.info(f"Archivo guardado: {ruta_completa}")
        
        return {
            'archivo_id': f"{taxonomia_id}_{timestamp}_{hashes['md5'][:8]}",
            'nombre_original': archivo.filename,
            'nombre_guardado': nombre_unico,
            'ruta': ruta_completa,
            'tamaño': len(contenido),
            'md5': hashes['md5'],
            'sha256': hashes['sha256'],
            'fecha_carga': datetime.now().isoformat()
        }
    
    def eliminar_archivo_evidencia(self, archivo_id: str, empresa_id: str,
                                  incidente_id: str, taxonomia_id: str) -> bool:
        """
        Elimina archivo físicamente para evitar archivos huérfanos
        """
        try:
            # Construir ruta base
            ruta_base = self.construir_ruta_archivo(
                empresa_id, incidente_id, taxonomia_id
            )
            
            # Buscar archivo que coincida con el ID
            archivos_eliminados = 0
            for archivo in os.listdir(ruta_base):
                if archivo_id in archivo:
                    ruta_completa = os.path.join(ruta_base, archivo)
                    
                    # Crear backup antes de eliminar
                    backup_path = ruta_completa + '.deleted_' + datetime.now().strftime('%Y%m%d_%H%M%S')
                    shutil.copy2(ruta_completa, backup_path)
                    
                    # Eliminar archivo
                    os.remove(ruta_completa)
                    archivos_eliminados += 1
                    
                    logger.info(f"Archivo eliminado: {ruta_completa}, backup en: {backup_path}")
            
            # Si el directorio queda vacío, eliminarlo
            if not os.listdir(ruta_base):
                os.rmdir(ruta_base)
                logger.info(f"Directorio vacío eliminado: {ruta_base}")
            
            return archivos_eliminados > 0
            
        except Exception as e:
            logger.error(f"Error eliminando archivo: {str(e)}")
            raise
    
    def limpiar_archivos_huerfanos(self, empresa_id: str, incidente_id: str):
        """
        Limpia archivos que no estén referenciados en la base de datos
        """
        # TODO: Implementar verificación contra base de datos
        pass

# Instancia global del gestor
gestor = GestorTaxonomiasIncidentes()

# ========== RUTAS API ==========

@taxonomias_bp.route('/api/taxonomias/obtener/<tipo_empresa>', methods=['GET'])
def obtener_taxonomias(tipo_empresa):
    """
    Obtiene taxonomías filtradas por tipo de empresa
    """
    try:
        tipo_empresa = tipo_empresa.upper()
        if tipo_empresa not in ['OIV', 'PSE']:
            return jsonify({'error': 'Tipo de empresa inválido'}), 400
        
        taxonomias = gestor.obtener_taxonomias_por_tipo(tipo_empresa)
        
        return jsonify({
            'success': True,
            'tipo_empresa': tipo_empresa,
            'total': len(taxonomias),
            'taxonomias': taxonomias
        })
        
    except Exception as e:
        logger.error(f"Error en obtener_taxonomias: {str(e)}")
        return jsonify({'error': str(e)}), 500

@taxonomias_bp.route('/api/taxonomias/subir-evidencia', methods=['POST'])
def subir_evidencia_taxonomia():
    """
    Sube archivo de evidencia para una taxonomía
    """
    try:
        # Validar datos requeridos
        if 'archivo' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo'}), 400
        
        archivo = request.files['archivo']
        taxonomia_id = request.form.get('taxonomia_id')
        empresa_id = request.form.get('empresa_id')
        incidente_id = request.form.get('incidente_id', 'nuevo')
        
        if not all([taxonomia_id, empresa_id]):
            return jsonify({'error': 'Faltan datos requeridos'}), 400
        
        # Guardar archivo
        resultado = gestor.guardar_archivo_evidencia(
            archivo, empresa_id, incidente_id, taxonomia_id
        )
        
        # TODO: Registrar en base de datos
        # INSERT INTO archivos_evidencias_taxonomias 
        # (archivo_id, taxonomia_id, incidente_id, empresa_id, 
        #  nombre_original, ruta, hash_md5, hash_sha256, tamaño, fecha_carga)
        # VALUES (...)
        
        return jsonify({
            'success': True,
            'archivo_id': resultado['archivo_id'],
            'nombre': resultado['nombre_original'],
            'tamaño': resultado['tamaño'],
            'hash': resultado['sha256'][:16],  # Primeros 16 caracteres
            'fecha_carga': resultado['fecha_carga']
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error subiendo archivo: {str(e)}")
        return jsonify({'error': 'Error interno al subir archivo'}), 500

@taxonomias_bp.route('/api/taxonomias/eliminar-evidencia/<archivo_id>', methods=['DELETE'])
def eliminar_evidencia_taxonomia(archivo_id):
    """
    Elimina archivo de evidencia física y lógicamente
    """
    try:
        # Obtener datos del request
        data = request.get_json()
        taxonomia_id = data.get('taxonomia_id')
        empresa_id = data.get('empresa_id')
        incidente_id = data.get('incidente_id')
        
        if not all([taxonomia_id, empresa_id, incidente_id]):
            return jsonify({'error': 'Faltan datos requeridos'}), 400
        
        # Eliminar archivo
        eliminado = gestor.eliminar_archivo_evidencia(
            archivo_id, empresa_id, incidente_id, taxonomia_id
        )
        
        if not eliminado:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        # TODO: Eliminar registro de base de datos
        # DELETE FROM archivos_evidencias_taxonomias 
        # WHERE archivo_id = ?
        
        return jsonify({
            'success': True,
            'mensaje': 'Archivo eliminado exitosamente'
        })
        
    except Exception as e:
        logger.error(f"Error eliminando archivo: {str(e)}")
        return jsonify({'error': 'Error interno al eliminar archivo'}), 500

@taxonomias_bp.route('/api/taxonomias/ver-evidencia/<archivo_id>', methods=['GET'])
def ver_evidencia_taxonomia(archivo_id):
    """
    Devuelve archivo para visualización/descarga
    """
    try:
        # TODO: Obtener ruta desde base de datos
        # SELECT ruta, nombre_original FROM archivos_evidencias_taxonomias
        # WHERE archivo_id = ?
        
        # Por ahora buscar en filesystem
        empresa_id = request.args.get('empresa_id')
        incidente_id = request.args.get('incidente_id')
        taxonomia_id = request.args.get('taxonomia_id')
        
        if not all([empresa_id, incidente_id, taxonomia_id]):
            return jsonify({'error': 'Faltan parámetros'}), 400
        
        ruta_base = gestor.construir_ruta_archivo(
            empresa_id, incidente_id, taxonomia_id
        )
        
        # Buscar archivo
        for archivo in os.listdir(ruta_base):
            if archivo_id in archivo:
                ruta_completa = os.path.join(ruta_base, archivo)
                return send_file(
                    ruta_completa,
                    as_attachment=True,
                    download_name=archivo
                )
        
        return jsonify({'error': 'Archivo no encontrado'}), 404
        
    except Exception as e:
        logger.error(f"Error obteniendo archivo: {str(e)}")
        return jsonify({'error': 'Error interno'}), 500

@taxonomias_bp.route('/api/taxonomias/actualizar-comentario', methods=['PUT'])
def actualizar_comentario_archivo():
    """
    Actualiza el comentario de un archivo de evidencia
    """
    try:
        data = request.get_json()
        archivo_id = data.get('archivo_id')
        comentario = data.get('comentario', '')
        
        if not archivo_id:
            return jsonify({'error': 'ID de archivo requerido'}), 400
        
        # TODO: Actualizar en base de datos
        # UPDATE archivos_evidencias_taxonomias 
        # SET comentario = ?, fecha_modificacion = NOW()
        # WHERE archivo_id = ?
        
        return jsonify({
            'success': True,
            'mensaje': 'Comentario actualizado'
        })
        
    except Exception as e:
        logger.error(f"Error actualizando comentario: {str(e)}")
        return jsonify({'error': 'Error interno'}), 500

# Función para registrar el blueprint en la app Flask
def registrar_rutas_taxonomias(app):
    """
    Registra el blueprint de taxonomías en la aplicación Flask
    """
    app.register_blueprint(taxonomias_bp)
    logger.info("Rutas de taxonomías registradas")

if __name__ == '__main__':
    # Para pruebas
    print("Módulo de taxonomías cargado")