from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database import get_db_connection
from ..modules.incidentes.unificador import cargar_incidente
import json
from datetime import datetime
import io

bp = Blueprint('generar_documento_anci', __name__)

@bp.route('/api/incidente/<int:incidente_id>/generar-documento-anci', methods=['POST'])
@jwt_required()
def generar_documento_anci(incidente_id):
    """
    Genera documentos ANCI en TXT basados en datos del incidente semilla
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        tipo_reporte = data.get('tipo_reporte')  # alerta_temprana, informe_preliminar, etc.
        formato = data.get('formato', 'txt')  # Solo TXT por ahora
        
        if not tipo_reporte:
            return jsonify({'error': 'Tipo de reporte requerido'}), 400
            
        # Obtener datos del incidente
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Cargar datos completos del incidente
            cursor.execute("""
                SELECT i.*, e.Razon_Social, e.RUT, e.Tipo_Entidad, e.Sector
                FROM INCIDENTES i
                LEFT JOIN EMPRESAS e ON i.Id_Empresa = e.Id_Empresa
                WHERE i.Id_Incidente = ? AND i.Id_Usuario = ?
            """, (incidente_id, user_id))
            
            incidente_row = cursor.fetchone()
            if not incidente_row:
                return jsonify({'error': 'Incidente no encontrado'}), 404
                
            # Convertir a diccionario
            columns = [description[0] for description in cursor.description]
            incidente_data = dict(zip(columns, incidente_row))
            
            # Cargar estructura completa del incidente
            incidente_completo = cargar_incidente(incidente_id, user_id)
            
        # Determinar tipo de empresa para aplicar formatos específicos
        tipo_empresa = incidente_data.get('Tipo_Entidad', 'PSE')
        
        # Generar contenido según tipo de reporte
        contenido = _generar_contenido_reporte(
            tipo_reporte, 
            incidente_data, 
            incidente_completo, 
            tipo_empresa
        )
        
        # Generar documento TXT
        documento = _generar_txt(contenido, tipo_reporte, tipo_empresa)
        content_type = 'text/plain; charset=utf-8'
        extension = 'txt'
            
        # Nombre del archivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"ANCI_{tipo_reporte}_{incidente_id}_{timestamp}.{extension}"
        
        return Response(
            documento,
            mimetype=content_type,
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Content-Length': len(documento)
            }
        )
        
    except Exception as e:
        print(f"Error generando documento ANCI: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

def _generar_contenido_reporte(tipo_reporte, incidente_data, incidente_completo, tipo_empresa):
    """
    Genera el contenido estructurado para cada tipo de reporte ANCI
    """
    secciones = incidente_completo.get('secciones', {})
    
    # Datos base del incidente
    contenido = {
        'titulo': _obtener_titulo_reporte(tipo_reporte),
        'tipo_empresa': tipo_empresa,
        'empresa': {
            'razon_social': incidente_data.get('Razon_Social', ''),
            'rut': incidente_data.get('RUT', ''),
            'sector': incidente_data.get('Sector', ''),
            'tipo_entidad': tipo_empresa
        },
        'fecha_generacion': datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
        'id_incidente': incidente_data.get('Id_Incidente'),
        'secciones': []
    }
    
    if tipo_reporte == 'alerta_temprana':
        contenido['secciones'] = _contenido_alerta_temprana(secciones, incidente_data)
    elif tipo_reporte == 'informe_preliminar':
        contenido['secciones'] = _contenido_informe_preliminar(secciones, incidente_data)
    elif tipo_reporte == 'informe_completo':
        contenido['secciones'] = _contenido_informe_completo(secciones, incidente_data)
    elif tipo_reporte == 'plan_accion':
        if tipo_empresa == 'OIV':
            contenido['secciones'] = _contenido_plan_accion(secciones, incidente_data)
        else:
            contenido['secciones'] = [{'titulo': 'No Aplicable', 'contenido': 'El Plan de Acción es exclusivo para OIV'}]
    elif tipo_reporte == 'informe_final':
        contenido['secciones'] = _contenido_informe_final(secciones, incidente_data)
        
    return contenido

def _obtener_titulo_reporte(tipo_reporte):
    """Obtiene el título apropiado para cada tipo de reporte"""
    titulos = {
        'alerta_temprana': 'ALERTA TEMPRANA ANCI',
        'informe_preliminar': 'INFORME PRELIMINAR ANCI', 
        'informe_completo': 'INFORME COMPLETO ANCI',
        'plan_accion': 'PLAN DE ACCIÓN ANCI (OIV)',
        'informe_final': 'INFORME FINAL ANCI'
    }
    return titulos.get(tipo_reporte, 'REPORTE ANCI')

def _contenido_alerta_temprana(secciones, incidente_data):
    """Genera contenido para Alerta Temprana (3 horas)"""
    s1 = secciones.get('1', {})
    s4 = secciones.get('4', {})
    s9 = secciones.get('9', {})
    
    return [
        {
            'titulo': '1. IDENTIFICACIÓN DE LA ENTIDAD',
            'contenido': [
                f"Razón Social: {s1.get('empresa', {}).get('razon_social', '')}",
                f"RUT: {s1.get('empresa', {}).get('rut', '')}",
                f"Tipo de Entidad: {s1.get('empresa', {}).get('tipo_entidad', '')}",
                f"Sector Esencial: {s1.get('empresa', {}).get('sector_esencial', '')}"
            ]
        },
        {
            'titulo': '2. DATOS DE CONTACTO',
            'contenido': [
                f"Nombre Reportante: {s1.get('contacto_emergencia', {}).get('nombre_reportante', '')}",
                f"Cargo: {s1.get('contacto_emergencia', {}).get('cargo_reportante', '')}",
                f"Teléfono 24/7: {s1.get('contacto_emergencia', {}).get('telefono_24_7', '')}",
                f"Email Oficial: {s1.get('contacto_emergencia', {}).get('email_oficial_seguridad', '')}"
            ]
        },
        {
            'titulo': '3. DATOS DEL INCIDENTE',
            'contenido': [
                f"Fecha/Hora Detección: {incidente_data.get('Fecha_Creacion', '')}",
                f"Descripción Breve: {s1.get('descripcion', '')}",
                f"Taxonomía: {s4.get('taxonomia_seleccionada', {}).get('nombre', '')}"
            ]
        },
        {
            'titulo': '4. IMPACTO INICIAL',
            'contenido': [
                f"Sistemas Afectados: {s9.get('sistemas_afectados', '')}",
                f"Servicios Interrumpidos: {s9.get('servicios_interrumpidos', '')}",
                f"Usuarios Afectados: {s9.get('usuarios_afectados_estimados', '')}",
                f"Alcance Geográfico: {s9.get('alcance_geografico', '')}"
            ]
        },
        {
            'titulo': '5. ESTADO ACTUAL',
            'contenido': [
                f"Incidente en Curso: {s9.get('incidente_en_curso', '')}",
                f"Contención Aplicada: {s9.get('contencion_aplicada', '')}",
                f"Descripción Estado: {s9.get('descripcion_estado_actual', '')}"
            ]
        }
    ]

def _contenido_informe_preliminar(secciones, incidente_data):
    """Genera contenido para Informe Preliminar"""
    return _contenido_alerta_temprana(secciones, incidente_data) + [
        {
            'titulo': '6. ANÁLISIS PRELIMINAR',
            'contenido': [
                f"Vector de Ataque: {secciones.get('9', {}).get('vector_ataque', '')}",
                f"Cronología: {secciones.get('9', {}).get('cronologia_detallada', '')}"
            ]
        }
    ]

def _contenido_informe_completo(secciones, incidente_data):
    """Genera contenido para Informe Completo"""
    s9 = secciones.get('9', {})
    iocs = s9.get('iocs', {})
    
    base = _contenido_informe_preliminar(secciones, incidente_data)
    base.extend([
        {
            'titulo': '7. INDICADORES DE COMPROMISO (IoCs)',
            'contenido': [
                f"IPs Sospechosas: {', '.join(iocs.get('ips_sospechosas', []))}",
                f"Hashes Malware: {', '.join(iocs.get('hashes_malware', []))}",
                f"Dominios Maliciosos: {', '.join(iocs.get('dominios_maliciosos', []))}",
                f"URLs Maliciosas: {', '.join(iocs.get('urls_maliciosas', []))}",
                f"Cuentas Comprometidas: {', '.join(iocs.get('cuentas_comprometidas', []))}"
            ]
        },
        {
            'titulo': '8. ANÁLISIS DE CAUSA RAÍZ',
            'contenido': [
                f"Vulnerabilidad Explotada: {s9.get('vulnerabilidad_explotada', '')}",
                f"Medidas de Contención: {s9.get('medidas_contencion_aplicadas', '')}"
            ]
        }
    ])
    return base

def _contenido_plan_accion(secciones, incidente_data):
    """Genera contenido para Plan de Acción (solo OIV)"""
    s9 = secciones.get('9', {})
    plan = s9.get('plan_accion_oiv', {})
    
    return [
        {
            'titulo': '1. PLAN DE RECUPERACIÓN',
            'contenido': [
                f"Programa de Restauración: {plan.get('plan_recuperacion', {}).get('programa_restauracion_datos', '')}",
                f"Responsables Técnicos: {plan.get('plan_recuperacion', {}).get('responsables_tecnicos', '')}",
                f"Tiempo Estimado: {plan.get('plan_recuperacion', {}).get('tiempo_estimado_restablecimiento', '')} horas"
            ]
        },
        {
            'titulo': '2. MEDIDAS DE MITIGACIÓN',
            'contenido': [
                f"Corto Plazo (0-24h): {plan.get('medidas_mitigacion', {}).get('acciones_corto_plazo', '')}",
                f"Mediano Plazo (1-7d): {plan.get('medidas_mitigacion', {}).get('acciones_mediano_plazo', '')}",
                f"Largo Plazo (1-4s): {plan.get('medidas_mitigacion', {}).get('acciones_largo_plazo', '')}"
            ]
        }
    ]

def _contenido_informe_final(secciones, incidente_data):
    """Genera contenido para Informe Final"""
    base = _contenido_informe_completo(secciones, incidente_data)
    s9 = secciones.get('9', {})
    
    base.append({
        'titulo': '9. IMPACTO ECONÓMICO',
        'contenido': [
            f"Costos de Recuperación: {s9.get('impacto_economico', {}).get('costos_recuperacion', '')}",
            f"Pérdidas Operativas: {s9.get('impacto_economico', {}).get('perdidas_operativas', '')}"
        ]
    })
    
    return base

def _generar_txt(contenido, tipo_reporte, tipo_empresa):
    """Genera documento TXT"""
    lines = []
    
    # Título
    lines.append("=" * 80)
    lines.append(contenido['titulo'].center(80))
    lines.append("=" * 80)
    lines.append("")
    
    # Información de empresa
    lines.append("INFORMACIÓN DE LA ENTIDAD")
    lines.append("-" * 30)
    lines.append(f"Razón Social: {contenido['empresa']['razon_social']}")
    lines.append(f"RUT: {contenido['empresa']['rut']}")
    lines.append(f"Tipo Entidad: {contenido['empresa']['tipo_entidad']}")
    lines.append(f"Sector: {contenido['empresa']['sector']}")
    lines.append(f"Fecha Generación: {contenido['fecha_generacion']}")
    lines.append("")
    
    # Contenido de secciones
    for seccion in contenido['secciones']:
        lines.append(seccion['titulo'])
        lines.append("-" * len(seccion['titulo']))
        
        if isinstance(seccion['contenido'], list):
            for item in seccion['contenido']:
                lines.append(f"• {item}")
        else:
            lines.append(seccion['contenido'])
            
        lines.append("")
    
    return "\n".join(lines).encode('utf-8')