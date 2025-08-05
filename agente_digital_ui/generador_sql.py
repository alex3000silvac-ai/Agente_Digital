# generador_sql.py (Versión 4 - Con corrección de CSV y reporte)
import csv
import os
import re
import glob

def sanitizar_para_sql(texto):
    """Limpia y formatea un valor para que sea seguro en una sentencia SQL."""
    if texto is None or texto.strip() == '':
        return 'NULL'
    texto_limpio = texto.replace("'", "''")
    texto_limpio = re.sub(r'[\n\r\t]', ' ', texto_limpio)
    return f"'{texto_limpio.strip()}'"

def validar_y_corregir_csv(ruta_csv_original):
    """
    Lee un CSV, corrige filas con un número incorrecto de columnas y guarda un nuevo archivo corregido.
    Devuelve la ruta al nuevo archivo y un reporte de las correcciones.
    """
    print(f"--- 🔍 Fase de Validación para: {os.path.basename(ruta_csv_original)} ---")
    ruta_csv_corregido = ruta_csv_original.replace('.csv', '_corregido.csv')
    reporte_correcciones = []
    datos_corregidos = []
    
    # Intentar leer con diferentes codificaciones
    for encoding in ['utf-8-sig', 'cp1252', 'latin-1']:
        try:
            with open(ruta_csv_original, mode='r', newline='', encoding=encoding) as infile:
                reader = csv.reader(infile, delimiter=';')
                
                # Leer encabezado y determinar número de columnas esperado
                try:
                    encabezado = next(reader)
                    num_columnas_esperado = len(encabezado)
                    datos_corregidos.append(encabezado)
                except StopIteration:
                    print("   -> ❌ ERROR: El archivo CSV está vacío.")
                    return None, []

                # Leer y corregir el resto de las filas
                for i, fila in enumerate(reader, start=2):
                    num_columnas_actual = len(fila)
                    
                    if num_columnas_actual < num_columnas_esperado:
                        # Rellenar columnas faltantes con campos vacíos
                        diferencia = num_columnas_esperado - num_columnas_actual
                        fila_corregida = fila + [''] * diferencia
                        reporte_correcciones.append(f"   -> Fila {i}: Se agregaron {diferencia} columnas vacías.")
                    elif num_columnas_actual > num_columnas_esperado:
                        # Truncar columnas sobrantes
                        diferencia = num_columnas_actual - num_columnas_esperado
                        fila_corregida = fila[:num_columnas_esperado]
                        reporte_correcciones.append(f"   -> Fila {i}: Se truncaron {diferencia} columnas sobrantes.")
                    else:
                        fila_corregida = fila
                    
                    datos_corregidos.append(fila_corregida)
            
            # Si la lectura fue exitosa, rompemos el bucle de codificaciones
            print(f"   -> Archivo leído con codificación: {encoding}")
            break
        except UnicodeDecodeError:
            continue
    else: # Si ninguna codificación funcionó
        print(f"   -> ❌ ERROR: No se pudo decodificar el archivo.")
        return None, []

    # Escribir el nuevo archivo CSV corregido
    with open(ruta_csv_corregido, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile, delimiter=';')
        writer.writerows(datos_corregidos)

    # Imprimir reporte de correcciones
    if reporte_correcciones:
        print("\n   --- Reporte de Correcciones ---")
        for linea in reporte_correcciones:
            print(linea)
    else:
        print("   -> ✅ El archivo no necesitó correcciones de estructura.")
    
    print(f"   -> ✨ Archivo corregido guardado en: {os.path.basename(ruta_csv_corregido)}\n")
    
    return ruta_csv_corregido, reporte_correcciones


def generar_script_inserts(ruta_csv, ruta_sql):
    """Genera un script de inserción SQL a partir de un archivo CSV ya validado."""
    nombre_tabla = os.path.splitext(os.path.basename(ruta_csv).replace('_corregido', ''))[0]
    print(f"--- 🚀 Fase de Generación SQL para: [{nombre_tabla}] ---")
    
    try:
        with open(ruta_csv, mode='r', encoding='utf-8') as infile, \
             open(ruta_sql, mode='w', encoding='utf-8') as outfile:
            
            reader = csv.reader(infile, delimiter=';')
            encabezado = next(reader)
            
            outfile.write(f"-- Script de carga para la tabla: {nombre_tabla}\n")
            outfile.write(f"DELETE FROM dbo.{nombre_tabla};\n")
            outfile.write("GO\n\n")

            sentencias_generadas = 0
            for fila in reader:
                if not any(campo.strip() for campo in fila):
                    continue # Omitir filas completamente vacías
                
                valores_sanitizados = [sanitizar_para_sql(valor) for valor in fila]
                columnas_str = ', '.join([f'[{col}]' for col in encabezado])
                valores_str = ', '.join(valores_sanitizados)
                
                sentencia_sql = f"INSERT INTO dbo.{nombre_tabla} ({columnas_str}) VALUES ({valores_str});\n"
                outfile.write(sentencia_sql)
                sentencias_generadas += 1
        
        print(f"   -> Total de sentencias INSERT generadas: {sentencias_generadas}")
        print(f"   -> ✅ Script SQL generado exitosamente en: {os.path.basename(ruta_sql)}")

    except Exception as e:
        print(f"\n   -> ❌ Ocurrió un error inesperado durante la generación del SQL: {e}")


# --- FUNCIÓN PRINCIPAL ---
if __name__ == '__main__':
    ruta_base = r'C:\Pasc\Proyecto_Derecho_Digital\Desarrollos\Tablas_Maestras'
    patron_busqueda = os.path.join(ruta_base, '*.csv')
    
    # Excluimos los archivos que ya han sido corregidos
    lista_csv = [f for f in glob.glob(patron_busqueda) if '_corregido.csv' not in f]

    if not lista_csv:
        print(f"No se encontraron archivos .csv para procesar en: {ruta_base}")
    else:
        print(f"Se encontraron {len(lista_csv)} archivos CSV para procesar.\n")

    for ruta_csv_original in lista_csv:
        # 1. Validar y corregir el CSV
        ruta_csv_corregido, _ = validar_y_corregir_csv(ruta_csv_original)
        
        # 2. Si el CSV se corrigió exitosamente, generar el SQL
        if ruta_csv_corregido:
            nombre_base_archivo = os.path.splitext(os.path.basename(ruta_csv_original))[0]
            ruta_sql = os.path.join(ruta_base, f'CARGA_{nombre_base_archivo}.sql')
            generar_script_inserts(ruta_csv_corregido, ruta_sql)
        
        print("\n" + "="*60 + "\n")

    print("Proceso de generación de scripts finalizado.")