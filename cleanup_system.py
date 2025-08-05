#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Automático de Limpieza del Sistema
Previene corrupción futura y mantiene el código limpio
"""

import os
import sys
import shutil
import glob
from pathlib import Path
from datetime import datetime

class SystemCleaner:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.backup_dir = self.base_path / "backups"
        self.log_file = self.base_path / "cleanup_log.txt"
        self.stats = {
            "files_removed": 0,
            "dirs_removed": 0,
            "bytes_saved": 0,
            "errors": []
        }
    
    def log(self, message):
        """Registrar mensaje en log y consola"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)
        
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry + "\n")
        except:
            pass  # Si no puede escribir el log, continúa
    
    def safe_remove(self, path):
        """Eliminar archivo/directorio de forma segura"""
        try:
            path = Path(path)
            if not path.exists():
                return False
            
            size = 0
            if path.is_file():
                size = path.stat().st_size
                path.unlink()
                self.stats["files_removed"] += 1
            elif path.is_dir():
                # Calcular tamaño del directorio
                for root, dirs, files in os.walk(path):
                    for file in files:
                        try:
                            size += Path(root, file).stat().st_size
                        except:
                            pass
                shutil.rmtree(path)
                self.stats["dirs_removed"] += 1
            
            self.stats["bytes_saved"] += size
            return True
            
        except Exception as e:
            self.stats["errors"].append(f"Error eliminando {path}: {e}")
            return False
    
    def clean_documentation_files(self):
        """Eliminar archivos de documentación innecesarios"""
        self.log("🧹 Limpiando archivos de documentación...")
        
        patterns = [
            "*.md", "*.txt", "*.docx", "*.xlsx", "*.csv",
            "*RESUMEN*", "*DIAGNOSTICO*", "*ANALISIS*",
            "*INSTRUCCIONES*", "*CORRECCION*", "*TEST*"
        ]
        
        for pattern in patterns:
            for file_path in self.base_path.glob(pattern):
                if file_path.name not in ["README.md", "SISTEMA_VALIDACION.md"]:
                    if self.safe_remove(file_path):
                        self.log(f"  ✅ Eliminado: {file_path.name}")
    
    def clean_test_files(self):
        """Eliminar archivos de prueba y desarrollo"""
        self.log("🧪 Limpiando archivos de prueba...")
        
        patterns = [
            "test_*.py", "debug_*.py", "check_*.py", "fix_*.py",
            "verificar_*.py", "ejecutar_*.py", "prueba_*.py"
        ]
        
        for pattern in patterns:
            for file_path in self.base_path.rglob(pattern):
                if self.safe_remove(file_path):
                    self.log(f"  ✅ Eliminado: {file_path.relative_to(self.base_path)}")
    
    def clean_sql_files(self):
        """Eliminar archivos SQL obsoletos"""
        self.log("🗄️ Limpiando archivos SQL...")
        
        sql_dir = self.base_path / "agente_digital_api"
        if sql_dir.exists():
            for sql_file in sql_dir.glob("*.sql"):
                if self.safe_remove(sql_file):
                    self.log(f"  ✅ Eliminado: {sql_file.name}")
    
    def clean_log_files(self):
        """Eliminar archivos de log antiguos"""
        self.log("📋 Limpiando archivos de log...")
        
        patterns = ["*.log", "*.db", "error_log.txt"]
        
        for pattern in patterns:
            for file_path in self.base_path.rglob(pattern):
                # Preservar logs de error actuales en app/
                if "app/error_log.txt" not in str(file_path):
                    if self.safe_remove(file_path):
                        self.log(f"  ✅ Eliminado: {file_path.relative_to(self.base_path)}")
    
    def clean_backup_files(self):
        """Eliminar archivos de respaldo innecesarios"""
        self.log("💾 Limpiando archivos de respaldo...")
        
        patterns = ["*.backup", "*_old.py", "*_corrupted.py", "*_secure.py"]
        
        for pattern in patterns:
            for file_path in self.base_path.rglob(pattern):
                if self.safe_remove(file_path):
                    self.log(f"  ✅ Eliminado: {file_path.relative_to(self.base_path)}")
    
    def clean_temp_directories(self):
        """Eliminar directorios temporales"""
        self.log("📁 Limpiando directorios temporales...")
        
        temp_dirs = [
            "test_outputs", "capturas_prueba_usuario", "__pycache__",
            ".pytest_cache", "uploads"
        ]
        
        for dir_name in temp_dirs:
            for dir_path in self.base_path.rglob(dir_name):
                if dir_path.is_dir():
                    if self.safe_remove(dir_path):
                        self.log(f"  ✅ Eliminado directorio: {dir_path.relative_to(self.base_path)}")
    
    def validate_critical_files(self):
        """Validar que archivos críticos existen y están bien"""
        self.log("🔍 Validando archivos críticos...")
        
        critical_files = [
            "run_optimized.py",
            "agente_digital_api/app/admin_views.py",
            "agente_digital_api/app/db_validator.py",
            "agente_digital_api/app/error_handlers.py"
        ]
        
        all_good = True
        for file_path in critical_files:
            full_path = self.base_path / file_path
            if not full_path.exists():
                self.log(f"  ❌ CRÍTICO: Falta {file_path}")
                all_good = False
            else:
                # Verificar sintaxis Python
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        compile(f.read(), str(full_path), 'exec')
                    self.log(f"  ✅ {file_path}")
                except SyntaxError as e:
                    self.log(f"  ❌ Error sintaxis en {file_path}: {e}")
                    all_good = False
        
        return all_good
    
    def run_full_cleanup(self):
        """Ejecutar limpieza completa del sistema"""
        self.log("🚀 INICIANDO LIMPIEZA AUTOMÁTICA DEL SISTEMA")
        self.log("=" * 50)
        
        start_time = datetime.now()
        
        # Crear directorio de respaldo si no existe
        self.backup_dir.mkdir(exist_ok=True)
        
        # Ejecutar todas las limpiezas
        cleanup_functions = [
            self.clean_documentation_files,
            self.clean_test_files,
            self.clean_sql_files,
            self.clean_log_files,
            self.clean_backup_files,
            self.clean_temp_directories
        ]
        
        for cleanup_func in cleanup_functions:
            try:
                cleanup_func()
            except Exception as e:
                self.log(f"❌ Error en {cleanup_func.__name__}: {e}")
                self.stats["errors"].append(f"{cleanup_func.__name__}: {e}")
        
        # Validar archivos críticos
        system_ok = self.validate_critical_files()
        
        # Mostrar estadísticas finales
        end_time = datetime.now()
        duration = end_time - start_time
        
        self.log("\n📊 RESUMEN DE LIMPIEZA:")
        self.log(f"⏱️ Tiempo: {duration.total_seconds():.2f} segundos")
        self.log(f"🗑️ Archivos eliminados: {self.stats['files_removed']}")
        self.log(f"📁 Directorios eliminados: {self.stats['dirs_removed']}")
        self.log(f"💾 Espacio liberado: {self.stats['bytes_saved'] / 1024 / 1024:.2f} MB")
        self.log(f"❌ Errores: {len(self.stats['errors'])}")
        
        if self.stats["errors"]:
            self.log("\n⚠️ ERRORES ENCONTRADOS:")
            for error in self.stats["errors"]:
                self.log(f"  - {error}")
        
        if system_ok:
            self.log("\n✅ SISTEMA LIMPIO Y OPERATIVO")
            return True
        else:
            self.log("\n❌ ARCHIVOS CRÍTICOS DAÑADOS - REVISAR MANUALMENTE")
            return False

def main():
    """Función principal"""
    if len(sys.argv) > 1:
        base_path = sys.argv[1]
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    
    print(f"🎯 Limpiando sistema en: {base_path}")
    
    cleaner = SystemCleaner(base_path)
    success = cleaner.run_full_cleanup()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()