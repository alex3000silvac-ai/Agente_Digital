#!/usr/bin/env python3
"""
API PARA FORMULARIO DINÁMICO ANCI V3.0
=====================================
Sistema robusto de gestión de formularios ANCI dinámicos con:
- 41 secciones adaptables por tipo de empresa
- Gestión segura de archivos (anti-huérfanos) 
- Control de edición concurrente
- Backup automático y recuperación
- Validación completa ANCI
"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import json
import logging
import hashlib
import os
import shutil
from datetime import datetime, timedelta
import pyodbc
from pathlib import Path
import uuid
import mimetypes

# Configuración
formulario_anci_bp = Blueprint('formulario_anci', __name__)
logger = logging.getLogger(__name__)

# Configuración de archivos
UPLOAD_FOLDER = 'uploads/incidentes'
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'zip', 'rar'}

class FormularioAnciManager:
    """Gestor principal del formulario ANCI dinámico"""
    
    def __init__(self, db_connection, upload_path=UPLOAD_FOLDER):
        self.db = db_connection
        self.upload_path = Path(upload_path)
        self.upload_path.mkdir(parents=True, exist_ok=True)
    
    def validar_archivo(self, archivo):
        """Valida archivo subido"""
        if not archivo or archivo.filename == '':
            return False, "No se seleccionó archivo"
        
        filename = secure_filename(archivo.filename)
        if not filename:
            return False, "Nombre de archivo inválido"
        
        # Verificar extensión
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Tipo de archivo no permitido. Permitidos: {', '.join(ALLOWED_EXTENSIONS)}"
        
        # Verificar tamaño
        archivo.seek(0, 2)  # Ir al final
        size = archivo.tell()
        archivo.seek(0)  # Volver al inicio
        
        if size > MAX_FILE_SIZE:
            return False, f"Archivo muy grande. Máximo {MAX_FILE_SIZE // (1024*1024)}MB"
        
        return True, filename
    
    def calcular_hash_archivo(self, archivo_path):
        """Calcula hash SHA256 del archivo"""
        hash_sha256 = hashlib.sha256()
        try:
            with open(archivo_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception as e:
            logger.error(f"Error calculando hash: {e}")
            return None
    
    def crear_estructura_carpetas(self, indice_unico):
        """Crea estructura de carpetas para el incidente"""
        carpeta_incidente = self.upload_path / indice_unico
        
        try:
            carpeta_incidente.mkdir(parents=True, exist_ok=True)
            
            # Crear subcarpetas por sección
            secciones = ['SEC_1', 'SEC_2', 'SEC_3', 'SEC_5', 'SEC_6', 'SEC_OIV']
            for seccion in secciones:
                (carpeta_incidente / seccion).mkdir(exist_ok=True)
            
            # Carpeta para taxonomías
            (carpeta_incidente / 'taxonomias').mkdir(exist_ok=True)
            
            logger.info(f"Estructura de carpetas creada para: {indice_unico}")
            return str(carpeta_incidente)
            
        except Exception as e:
            logger.error(f"Error creando carpetas: {e}")
            raise
    
    def obtener_formulario_configuracion(self, empresa_id):
        """Obtiene configuración del formulario para una empresa"""
        cursor = self.db.cursor()
        
        try:
            # Obtener información de la empresa
            cursor.execute("""
                SELECT EmpresaID, RazonSocial, TipoEmpresa
                FROM Empresas 
                WHERE EmpresaID = ? AND EstadoActivo = 1
            """, (empresa_id,))
            
            empresa = cursor.fetchone()
            if not empresa:
                return None, "Empresa no encontrada o inactiva"
            
            # Obtener secciones aplicables usando la vista
            cursor.execute("""
                SELECT 
                    CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden,
                    TituloSeccion, DescripcionSeccion, CamposJSON, EsObligatorio,
                    ColorSeccion, IconoSeccion, MaxArchivos, MaxComentarios, MaxTamanoMB,
                    TaxonomiaID, TaxonomiaArea, TaxonomiaEfecto, TaxonomiaCategoria,
                    AplicaAEmpresa
                FROM vw_SeccionesActivasPorEmpresa
                WHERE EmpresaID = ? AND AplicaAEmpresa = 1
                ORDER BY NumeroOrden
            """, (empresa_id,))
            
            secciones = []
            for row in cursor.fetchall():
                try:
                    campos_json = json.loads(row[6]) if row[6] else {}
                except json.JSONDecodeError:
                    campos_json = {}
                
                seccion = {
                    'codigoSeccion': row[0],
                    'tipoSeccion': row[1],
                    'categoriaSeccion': row[2],
                    'numeroOrden': row[3],
                    'titulo': row[4],
                    'descripcion': row[5],
                    'camposJSON': campos_json,
                    'esObligatorio': bool(row[7]),
                    'colorIndicador': row[8] or '#007bff',
                    'iconoSeccion': row[9] or 'file',
                    'maxArchivos': row[10] or 10,
                    'maxComentarios': row[11] or 6,
                    'maxSizeMB': row[12] or 10,
                    'taxonomiaInfo': {
                        'id': row[13],
                        'area': row[14],
                        'efecto': row[15],
                        'categoria': row[16]
                    } if row[13] else None,
                    'aplicaAEmpresa': bool(row[17])
                }
                secciones.append(seccion)
            
            # Obtener estadísticas
            cursor.execute("""
                SELECT 
                    COUNT(*) as TotalSecciones,
                    SUM(CASE WHEN TipoSeccion = 'FIJA' THEN 1 ELSE 0 END) as SeccionesFijas,
                    SUM(CASE WHEN TipoSeccion = 'TAXONOMIA' THEN 1 ELSE 0 END) as TaxonomiasAplicables,
                    SUM(CASE WHEN TipoSeccion IN ('ESPECIAL', 'CONDICIONAL') THEN 1 ELSE 0 END) as SeccionesEspeciales,
                    SUM(CASE WHEN EsObligatorio = 1 THEN 1 ELSE 0 END) as SeccionesObligatorias
                FROM vw_SeccionesActivasPorEmpresa
                WHERE EmpresaID = ? AND AplicaAEmpresa = 1
            """, (empresa_id,))
            
            estadisticas = cursor.fetchone()
            
            resultado = {
                'empresa': {
                    'id': empresa[0],
                    'razonSocial': empresa[1],
                    'tipoEmpresa': empresa[2]
                },
                'formulario': {
                    'secciones': secciones,
                    'totalSecciones': len(secciones),
                    'estadisticas': {
                        'seccionesAplicables': estadisticas[0] if estadisticas else 0,
                        'seccionesFijas': estadisticas[1] if estadisticas else 0,
                        'taxonomiasAplicables': estadisticas[2] if estadisticas else 0,
                        'seccionesEspeciales': estadisticas[3] if estadisticas else 0,
                        'seccionesObligatorias': estadisticas[4] if estadisticas else 0
                    }
                },
                'capacidades': {
                    'maxArchivosTotal': len(secciones) * 10,
                    'maxComentariosTotal': len(secciones) * 6,
                    'maxSizeMBPorArchivo': 10,
                    'maxCapacidadTotalMB': len(secciones) * 10 * 10
                },
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'version': '3.0',
                    'dinamico': True
                }
            }
            
            return resultado, None
            
        except Exception as e:
            logger.error(f"Error obteniendo configuración: {e}")
            return None, str(e)
        finally:
            cursor.close()
    
    def crear_formulario_dinamico(self, empresa_id, incidente_id, usuario_creador='SISTEMA'):
        """Crea un nuevo formulario dinámico"""
        cursor = self.db.cursor()
        
        try:
            # Verificar si ya existe formulario para este incidente
            cursor.execute("""
                SELECT FormularioID FROM ANCI_FORMULARIOS_DINAMICOS 
                WHERE IncidenteID = ?
            """, (incidente_id,))
            
            if cursor.fetchone():
                return None, "Ya existe un formulario para este incidente"
            
            # Crear formulario usando procedimiento
            cursor.execute("""
                EXEC sp_GenerarFormularioDinamicoCompleto 
                    @EmpresaID = ?, 
                    @IncidenteID = ?, 
                    @UsuarioCreador = ?
            """, (empresa_id, incidente_id, usuario_creador))
            
            resultado = cursor.fetchone()
            if not resultado:
                return None, "Error creando formulario"
            
            formulario_id = resultado[0]
            indice_unico = resultado[1]
            total_secciones = resultado[2]
            tipo_empresa = resultado[3]
            ruta_archivos = resultado[4]
            
            # Crear estructura de carpetas
            self.crear_estructura_carpetas(indice_unico)
            
            self.db.commit()
            
            return {
                'formularioId': formulario_id,
                'indiceUnico': indice_unico,
                'totalSecciones': total_secciones,
                'tipoEmpresa': tipo_empresa,
                'rutaArchivos': ruta_archivos,
                'estado': 'BORRADOR'
            }, None
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creando formulario: {e}")
            return None, str(e)
        finally:
            cursor.close()
    
    def iniciar_edicion_segura(self, formulario_id, usuario, ip_address=None):
        """Inicia edición segura con control de concurrencia"""
        cursor = self.db.cursor()
        
        try:
            cursor.execute("""
                EXEC sp_IniciarEdicionSegura 
                    @FormularioID = ?, 
                    @Usuario = ?, 
                    @IP = ?
            """, (formulario_id, usuario, ip_address))
            
            resultado = cursor.fetchone()
            if not resultado:
                return None, "Error iniciando edición"
            
            self.db.commit()
            
            return {
                'tokenEdicion': resultado[0],
                'fechaInicioEdicion': resultado[1].isoformat(),
                'estado': resultado[2]
            }, None
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error iniciando edición: {e}")
            return None, str(e)
        finally:
            cursor.close()
    
    def finalizar_edicion(self, formulario_id, usuario, token_edicion):
        """Finaliza edición segura"""
        cursor = self.db.cursor()
        
        try:
            cursor.execute("""
                EXEC sp_FinalizarEdicion 
                    @FormularioID = ?, 
                    @Usuario = ?, 
                    @TokenEdicion = ?
            """, (formulario_id, usuario, token_edicion))
            
            resultado = cursor.fetchone()
            self.db.commit()
            
            return {'estado': resultado[0]}, None
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error finalizando edición: {e}")
            return None, str(e)
        finally:
            cursor.close()
    
    def subir_archivo_seccion(self, formulario_id, codigo_seccion, numero_archivo, 
                             archivo, descripcion=None, usuario='SISTEMA', ip_address=None):
        """Sube archivo a una sección específica"""
        
        # Validar archivo
        es_valido, mensaje = self.validar_archivo(archivo)
        if not es_valido:
            return None, mensaje
        
        cursor = self.db.cursor()
        
        try:
            # Obtener información del formulario
            cursor.execute("""
                SELECT IndiceUnico, EstadoFormulario, EditandoActualmente, UsuarioEditando
                FROM ANCI_FORMULARIOS_DINAMICOS 
                WHERE FormularioID = ?
            """, (formulario_id,))
            
            formulario = cursor.fetchone()
            if not formulario:
                return None, "Formulario no encontrado"
            
            indice_unico = formulario[0]
            
            # Verificar si está en edición
            if formulario[2] and formulario[3] != usuario:
                return None, f"Formulario siendo editado por: {formulario[3]}"
            
            # Preparar archivo
            filename = secure_filename(archivo.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            nombre_almacenado = f"{timestamp}_{uuid.uuid4().hex[:8]}_{filename}"
            
            # Crear ruta de destino
            carpeta_seccion = self.upload_path / indice_unico / codigo_seccion
            carpeta_seccion.mkdir(parents=True, exist_ok=True)
            
            ruta_completa = carpeta_seccion / nombre_almacenado
            
            # Guardar archivo temporalmente para calcular hash
            archivo.save(str(ruta_completa))
            
            # Calcular hash
            hash_sha256 = self.calcular_hash_archivo(ruta_completa)
            if not hash_sha256:
                os.remove(ruta_completa)
                return None, "Error calculando hash del archivo"
            
            # Obtener tamaño
            tamano_bytes = os.path.getsize(ruta_completa)
            
            # Gestionar archivo en base de datos
            cursor.execute("""
                EXEC sp_GestionarArchivoSeguro 
                    @FormularioID = ?, 
                    @CodigoSeccion = ?, 
                    @NumeroArchivo = ?, 
                    @Accion = 'SUBIR',
                    @NombreOriginal = ?, 
                    @NombreAlmacenado = ?, 
                    @RutaCompleta = ?, 
                    @TamanoBytes = ?, 
                    @HashSHA256 = ?, 
                    @Usuario = ?, 
                    @IP = ?, 
                    @Descripcion = ?
            """, (formulario_id, codigo_seccion, numero_archivo, filename, 
                  nombre_almacenado, str(ruta_completa), tamano_bytes, 
                  hash_sha256, usuario, ip_address, descripcion))
            
            resultado = cursor.fetchone()
            if not resultado:
                os.remove(ruta_completa)
                return None, "Error registrando archivo en base de datos"
            
            self.db.commit()
            
            return {
                'archivoId': resultado[0],
                'nombreOriginal': filename,
                'nombreAlmacenado': nombre_almacenado,
                'rutaCompleta': str(ruta_completa),
                'tamanoBytes': tamano_bytes,
                'tamanoMB': round(tamano_bytes / (1024 * 1024), 2),
                'hashSHA256': hash_sha256,
                'accionRealizada': resultado[1],
                'resultado': resultado[2]
            }, None
            
        except Exception as e:
            self.db.rollback()
            # Limpiar archivo si hay error
            try:
                if 'ruta_completa' in locals():
                    os.remove(ruta_completa)
            except:
                pass
            
            logger.error(f"Error subiendo archivo: {e}")
            return None, str(e)
        finally:
            cursor.close()
    
    def eliminar_archivo_seccion(self, formulario_id, codigo_seccion, numero_archivo, 
                                motivo=None, usuario='SISTEMA'):
        """Elimina archivo de una sección (soft delete)"""
        cursor = self.db.cursor()
        
        try:
            # Crear backup antes de eliminar
            cursor.execute("""
                EXEC sp_CrearBackupFormulario 
                    @FormularioID = ?, 
                    @TipoBackup = 'PRE_ELIMINACION_ARCHIVO', 
                    @Usuario = ?, 
                    @MotivoBackup = ?
            """, (formulario_id, usuario, f"Backup antes de eliminar archivo {numero_archivo} de {codigo_seccion}"))
            
            # Eliminar archivo
            cursor.execute("""
                EXEC sp_GestionarArchivoSeguro 
                    @FormularioID = ?, 
                    @CodigoSeccion = ?, 
                    @NumeroArchivo = ?, 
                    @Accion = 'ELIMINAR',
                    @Usuario = ?, 
                    @Descripcion = ?
            """, (formulario_id, codigo_seccion, numero_archivo, usuario, motivo))
            
            resultado = cursor.fetchone()
            self.db.commit()
            
            return {
                'archivoId': resultado[0] if resultado else None,
                'accionRealizada': resultado[1] if resultado else 'ELIMINAR',
                'resultado': resultado[2] if resultado else 'EXITOSO'
            }, None
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error eliminando archivo: {e}")
            return None, str(e)
        finally:
            cursor.close()
    
    def limpiar_archivos_huerfanos(self, formulario_id=None, accion='MARCAR'):
        """Limpia archivos huérfanos"""
        cursor = self.db.cursor()
        
        try:
            cursor.execute("""
                EXEC sp_LimpiarArchivosHuerfanos 
                    @FormularioID = ?, 
                    @AccionHuerfanos = ?
            """, (formulario_id, accion))
            
            resultado = cursor.fetchone()
            self.db.commit()
            
            return {
                'archivosHuerfanosDetectados': resultado[0] if resultado else 0,
                'accionRealizada': resultado[1] if resultado else accion,
                'fechaLimpieza': resultado[2].isoformat() if resultado and resultado[2] else datetime.now().isoformat()
            }, None
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error limpiando huérfanos: {e}")
            return None, str(e)
        finally:
            cursor.close()
    
    def guardar_datos_formulario(self, formulario_id, codigo_seccion, datos, 
                                usuario='SISTEMA', token_edicion=None):
        """Guarda datos de una sección del formulario"""
        cursor = self.db.cursor()
        
        try:
            # Verificar token de edición si se proporciona
            if token_edicion:
                cursor.execute("""
                    SELECT TokenEdicion, UsuarioEditando 
                    FROM ANCI_FORMULARIOS_DINAMICOS 
                    WHERE FormularioID = ?
                """, (formulario_id,))
                
                resultado = cursor.fetchone()
                if not resultado or resultado[0] != token_edicion or resultado[1] != usuario:
                    return None, "Token de edición inválido"
            
            # Obtener datos actuales del formulario
            cursor.execute("""
                SELECT DatosFormularioJSON 
                FROM ANCI_FORMULARIOS_DINAMICOS 
                WHERE FormularioID = ?
            """, (formulario_id,))
            
            resultado = cursor.fetchone()
            if not resultado:
                return None, "Formulario no encontrado"
            
            # Actualizar datos de la sección
            datos_actuales = json.loads(resultado[0]) if resultado[0] else {}
            datos_actuales[codigo_seccion] = datos
            
            # Calcular progreso
            total_secciones = len(datos_actuales)
            secciones_completadas = sum(1 for seccion_datos in datos_actuales.values() 
                                      if seccion_datos and len(seccion_datos) > 0)
            porcentaje = (secciones_completadas / total_secciones * 100) if total_secciones > 0 else 0
            
            # Actualizar en base de datos
            cursor.execute("""
                UPDATE ANCI_FORMULARIOS_DINAMICOS 
                SET 
                    DatosFormularioJSON = ?,
                    SeccionesCompletadas = ?,
                    PorcentajeCompletado = ?,
                    FechaModificacion = GETDATE(),
                    UsuarioModificador = ?
                WHERE FormularioID = ?
            """, (json.dumps(datos_actuales, ensure_ascii=False), 
                  secciones_completadas, porcentaje, usuario, formulario_id))
            
            # Registrar auditoría
            cursor.execute("""
                INSERT INTO ANCI_AUDITORIA_EDICIONES (
                    FormularioID, CodigoSeccion, TipoAccion, MotivoAccion, 
                    Usuario, FechaAccion, TablaAfectada
                ) VALUES (?, ?, 'GUARDAR_DATOS_SECCION', 'Guardado de datos de sección', 
                         ?, GETDATE(), 'ANCI_FORMULARIOS_DINAMICOS')
            """, (formulario_id, codigo_seccion, usuario))
            
            self.db.commit()
            
            return {
                'seccionGuardada': codigo_seccion,
                'seccionesCompletadas': secciones_completadas,
                'porcentajeCompletado': round(porcentaje, 2),
                'fechaModificacion': datetime.now().isoformat()
            }, None
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error guardando datos: {e}")
            return None, str(e)
        finally:
            cursor.close()


# ===============================================
# ENDPOINTS DE LA API
# ===============================================

def get_db_connection():
    """Obtiene conexión a la base de datos"""
    # Esta función debe implementarse según tu configuración específica
    # Ejemplo genérico:
    try:
        conn = pyodbc.connect(current_app.config['DATABASE_CONNECTION_STRING'])
        return conn
    except Exception as e:
        logger.error(f"Error conectando a BD: {e}")
        raise

@formulario_anci_bp.route('/api/formulario-anci/configuracion/<int:empresa_id>', methods=['GET'])
def obtener_configuracion_formulario(empresa_id):
    """Obtiene configuración del formulario dinámico para una empresa"""
    try:
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        configuracion, error = manager.obtener_formulario_configuracion(empresa_id)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': configuracion
        })
        
    except Exception as e:
        logger.error(f"Error en configuración: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/crear', methods=['POST'])
def crear_formulario_dinamico():
    """Crea un nuevo formulario dinámico"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresaId')
        incidente_id = data.get('incidenteId')
        usuario = data.get('usuario', 'SISTEMA')
        
        if not empresa_id or not incidente_id:
            return jsonify({
                'success': False,
                'error': 'Faltan parámetros requeridos'
            }), 400
        
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        resultado, error = manager.crear_formulario_dinamico(empresa_id, incidente_id, usuario)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error creando formulario: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/iniciar-edicion', methods=['POST'])
def iniciar_edicion():
    """Inicia edición segura del formulario"""
    try:
        data = request.get_json()
        formulario_id = data.get('formularioId')
        usuario = data.get('usuario')
        ip_address = request.remote_addr
        
        if not formulario_id or not usuario:
            return jsonify({
                'success': False,
                'error': 'Faltan parámetros requeridos'
            }), 400
        
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        resultado, error = manager.iniciar_edicion_segura(formulario_id, usuario, ip_address)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error iniciando edición: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/finalizar-edicion', methods=['POST'])
def finalizar_edicion():
    """Finaliza edición del formulario"""
    try:
        data = request.get_json()
        formulario_id = data.get('formularioId')
        usuario = data.get('usuario')
        token_edicion = data.get('tokenEdicion')
        
        if not all([formulario_id, usuario, token_edicion]):
            return jsonify({
                'success': False,
                'error': 'Faltan parámetros requeridos'
            }), 400
        
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        resultado, error = manager.finalizar_edicion(formulario_id, usuario, token_edicion)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error finalizando edición: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/subir-archivo', methods=['POST'])
def subir_archivo():
    """Sube archivo a una sección del formulario"""
    try:
        formulario_id = request.form.get('formularioId')
        codigo_seccion = request.form.get('codigoSeccion')
        numero_archivo = request.form.get('numeroArchivo')
        descripcion = request.form.get('descripcion')
        usuario = request.form.get('usuario', 'SISTEMA')
        
        if not all([formulario_id, codigo_seccion, numero_archivo]):
            return jsonify({
                'success': False,
                'error': 'Faltan parámetros requeridos'
            }), 400
        
        if 'archivo' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se encontró archivo'
            }), 400
        
        archivo = request.files['archivo']
        ip_address = request.remote_addr
        
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        resultado, error = manager.subir_archivo_seccion(
            int(formulario_id), codigo_seccion, int(numero_archivo), 
            archivo, descripcion, usuario, ip_address
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error subiendo archivo: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/eliminar-archivo', methods=['DELETE'])
def eliminar_archivo():
    """Elimina archivo de una sección del formulario"""
    try:
        data = request.get_json()
        formulario_id = data.get('formularioId')
        codigo_seccion = data.get('codigoSeccion')
        numero_archivo = data.get('numeroArchivo')
        motivo = data.get('motivo')
        usuario = data.get('usuario', 'SISTEMA')
        
        if not all([formulario_id, codigo_seccion, numero_archivo]):
            return jsonify({
                'success': False,
                'error': 'Faltan parámetros requeridos'
            }), 400
        
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        resultado, error = manager.eliminar_archivo_seccion(
            formulario_id, codigo_seccion, numero_archivo, motivo, usuario
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error eliminando archivo: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/guardar-datos', methods=['POST'])
def guardar_datos_seccion():
    """Guarda datos de una sección del formulario"""
    try:
        data = request.get_json()
        formulario_id = data.get('formularioId')
        codigo_seccion = data.get('codigoSeccion')
        datos = data.get('datos')
        usuario = data.get('usuario', 'SISTEMA')
        token_edicion = data.get('tokenEdicion')
        
        if not all([formulario_id, codigo_seccion, datos]):
            return jsonify({
                'success': False,
                'error': 'Faltan parámetros requeridos'
            }), 400
        
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        resultado, error = manager.guardar_datos_formulario(
            formulario_id, codigo_seccion, datos, usuario, token_edicion
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error guardando datos: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/limpiar-huerfanos', methods=['POST'])
def limpiar_huerfanos():
    """Limpia archivos huérfanos"""
    try:
        data = request.get_json() or {}
        formulario_id = data.get('formularioId')
        accion = data.get('accion', 'MARCAR')  # MARCAR, ELIMINAR, ARCHIVAR
        
        conn = get_db_connection()
        manager = FormularioAnciManager(conn)
        
        resultado, error = manager.limpiar_archivos_huerfanos(formulario_id, accion)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error limpiando huérfanos: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@formulario_anci_bp.route('/api/formulario-anci/estadisticas/<int:formulario_id>', methods=['GET'])
def obtener_estadisticas(formulario_id):
    """Obtiene estadísticas del formulario"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener estadísticas usando la vista
        cursor.execute("""
            SELECT * FROM vw_EstadisticasFormularioDinamico 
            WHERE FormularioID = ?
        """, (formulario_id,))
        
        estadisticas = cursor.fetchone()
        
        if not estadisticas:
            return jsonify({
                'success': False,
                'error': 'Formulario no encontrado'
            }), 404
        
        # Convertir a diccionario
        columnas = [desc[0] for desc in cursor.description]
        resultado = dict(zip(columnas, estadisticas))
        
        # Convertir campos datetime a string
        for key, value in resultado.items():
            if isinstance(value, datetime):
                resultado[key] = value.isoformat()
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

# Función para registrar el blueprint
def registrar_formulario_anci(app):
    """Registra el blueprint del formulario ANCI dinámico"""
    app.register_blueprint(formulario_anci_bp)
    logger.info("✅ Blueprint formulario ANCI dinámico registrado")

if __name__ == '__main__':
    # Configuración de logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    print("🚀 API Formulario ANCI Dinámico V3.0 lista para uso")
    print("📋 Endpoints disponibles:")
    print("   GET  /api/formulario-anci/configuracion/<empresa_id>")
    print("   POST /api/formulario-anci/crear")
    print("   POST /api/formulario-anci/iniciar-edicion")
    print("   POST /api/formulario-anci/finalizar-edicion")
    print("   POST /api/formulario-anci/subir-archivo")
    print("   DELETE /api/formulario-anci/eliminar-archivo")
    print("   POST /api/formulario-anci/guardar-datos")
    print("   POST /api/formulario-anci/limpiar-huerfanos")
    print("   GET  /api/formulario-anci/estadisticas/<formulario_id>")