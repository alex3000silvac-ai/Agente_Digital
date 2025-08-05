#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corregir la validación ANCI en incidentes_crear.py
"""

import os
import re

def main():
    """Corregir el archivo incidentes_crear.py"""
    
    archivo = os.path.join(
        os.path.dirname(__file__), 
        'agente_digital_api', 
        'app', 
        'modules', 
        'admin', 
        'incidentes_crear.py'
    )
    
    print(f"Corrigiendo archivo: {archivo}")
    
    # Leer el archivo
    with open(archivo, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Correcciones necesarias
    correcciones = [
        # Tabla INCIDENTES -> Incidentes
        (r'FROM INCIDENTES\s+i', 'FROM Incidentes i'),
        (r'UPDATE INCIDENTES\s+', 'UPDATE Incidentes '),
        (r'INSERT INTO INCIDENTES', 'INSERT INTO Incidentes'),
        
        # Columnas de Incidentes
        (r'i\.Id_Incidente\b', 'i.IncidenteID'),
        (r'WHERE i\.Id_Incidente = \?', 'WHERE i.IncidenteID = ?'),
        (r'WHERE Id_Incidente = \?', 'WHERE IncidenteID = ?'),
        
        # Tabla EMPRESAS -> Empresas
        (r'FROM EMPRESAS\s+e', 'FROM Empresas e'),
        (r'INNER JOIN EMPRESAS\s+e', 'INNER JOIN Empresas e'),
        
        # Columnas de Empresas
        (r'e\.Id_Empresa\b', 'e.EmpresaID'),
        (r'i\.EmpresaID = e\.Id_Empresa', 'i.EmpresaID = e.EmpresaID'),
        (r'e\.Nombre\s+as\s+NombreEmpresa', 'e.RazonSocial as NombreEmpresa'),
        
        # TipoFlujo -> TipoRegistro
        (r"'TipoFlujo':\s*'Tipo de registro'", "'TipoRegistro': 'Tipo de registro'"),
        (r'i\.TipoFlujo,', 'i.TipoRegistro,'),
        (r"getattr\(incidente,\s*'TipoFlujo',", "getattr(incidente, 'TipoRegistro',"),
        
        # Otros ajustes
        (r'incidente\.Titulo', "getattr(incidente, 'Titulo', '')"),
        (r'incidente\.NombreEmpresa', "getattr(incidente, 'NombreEmpresa', '')"),
        (r'incidente\.TipoEmpresa', "getattr(incidente, 'TipoEmpresa', '')"),
        (r'incidente\.Criticidad', "getattr(incidente, 'Criticidad', '')")
    ]
    
    # Aplicar correcciones
    contenido_corregido = contenido
    cambios_realizados = 0
    
    for patron, reemplazo in correcciones:
        contenido_nuevo = re.sub(patron, reemplazo, contenido_corregido)
        if contenido_nuevo != contenido_corregido:
            cambios_realizados += 1
            print(f"✅ Aplicada corrección: {patron[:30]}... -> {reemplazo[:30]}...")
        contenido_corregido = contenido_nuevo
    
    # Guardar el archivo corregido
    if cambios_realizados > 0:
        # Hacer backup primero
        backup_file = archivo + '.backup_anci'
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(contenido)
        print(f"\n📁 Backup guardado en: {backup_file}")
        
        # Guardar archivo corregido
        with open(archivo, 'w', encoding='utf-8') as f:
            f.write(contenido_corregido)
        
        print(f"\n✅ Archivo corregido exitosamente")
        print(f"Total de correcciones aplicadas: {cambios_realizados}")
    else:
        print("\n⚠️ No se encontraron patrones para corregir")
    
    # Mostrar función corregida
    print("\n📝 Verificando función validar_para_anci corregida...")
    
    # Buscar la función en el contenido corregido
    inicio = contenido_corregido.find("def validar_para_anci")
    if inicio != -1:
        # Encontrar las primeras líneas de la función
        fin = contenido_corregido.find("FROM Incidentes i", inicio) + 50
        print("\nPrimeras líneas de la función corregida:")
        print("-" * 50)
        print(contenido_corregido[inicio:fin])
        print("-" * 50)

if __name__ == "__main__":
    main()