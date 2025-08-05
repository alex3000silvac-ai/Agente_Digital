#!/usr/bin/env python3
"""
Script para crear usuario administrador en Supabase
Usa werkzeug para generar el hash correcto de la contraseña
"""

import os
import sys
from werkzeug.security import generate_password_hash
import psycopg2
from psycopg2.extras import RealDictCursor
import secrets

def create_admin_user():
    """Crea el usuario administrador en la base de datos"""
    
    # Obtener URL de Supabase
    db_url = os.getenv('SUPABASE_DB_URL')
    if not db_url:
        print("❌ Error: SUPABASE_DB_URL no está configurada")
        print("Por favor, configura la variable de entorno con tu URL de Supabase")
        return False
    
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        print("✅ Conectado a Supabase")
        
        # 1. Crear inquilino Surtika
        cursor.execute("""
            INSERT INTO Inquilinos (RazonSocial, RUT, EstadoActivo)
            VALUES (%s, %s, %s)
            ON CONFLICT (RUT) DO UPDATE
            SET RazonSocial = EXCLUDED.RazonSocial
            RETURNING InquilinoID
        """, ('Surtika', '76123456-7', True))
        
        inquilino = cursor.fetchone()
        inquilino_id = inquilino['inquilinoid']
        print(f"✅ Inquilino Surtika creado/actualizado (ID: {inquilino_id})")
        
        # 2. Generar salt y hash de contraseña
        salt = secrets.token_hex(32)  # 64 caracteres hex
        password_hash = generate_password_hash('admin123', method='pbkdf2:sha256', salt_length=16)
        
        # 3. Crear usuario administrador
        cursor.execute("""
            INSERT INTO UsuariosCliente (
                NombreUsuario,
                Email,
                PasswordHash,
                Salt,
                NombreCompleto,
                InquilinoID,
                RolID,
                Estado,
                Cargo,
                CambiarPasswordProximoLogin
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (Email) DO UPDATE
            SET 
                PasswordHash = EXCLUDED.PasswordHash,
                Salt = EXCLUDED.Salt,
                NombreCompleto = EXCLUDED.NombreCompleto,
                Estado = EXCLUDED.Estado,
                FechaModificacion = CURRENT_TIMESTAMP
            RETURNING UsuarioClienteID
        """, (
            'admin',
            'admin@surtika.cl',
            password_hash,
            salt,
            'Administrador Surtika',
            inquilino_id,
            1,  # Rol administrador
            'Activo',
            'Administrador del Sistema',
            True  # Cambiar contraseña en primer login
        ))
        
        usuario = cursor.fetchone()
        usuario_id = usuario['usuarioclienteid']
        print(f"✅ Usuario admin creado/actualizado (ID: {usuario_id})")
        
        # 4. Crear empresas de ejemplo
        empresas = [
            {
                'razon_social': 'Empresa Demo OIV',
                'rut': '11111111-1',
                'tipo': 'OIV',
                'email': 'contacto@demo-oiv.cl',
                'ciudad': 'Santiago'
            },
            {
                'razon_social': 'Empresa Demo PSE',
                'rut': '22222222-2',
                'tipo': 'PSE',
                'email': 'contacto@demo-pse.cl',
                'ciudad': 'Valparaíso'
            }
        ]
        
        for empresa in empresas:
            cursor.execute("""
                INSERT INTO Empresas (
                    InquilinoID,
                    RazonSocial,
                    RUT,
                    TipoEmpresa,
                    EmailContacto,
                    Ciudad,
                    EstadoActivo
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (RUT) DO NOTHING
            """, (
                inquilino_id,
                empresa['razon_social'],
                empresa['rut'],
                empresa['tipo'],
                empresa['email'],
                empresa['ciudad'],
                True
            ))
        
        print("✅ Empresas de ejemplo creadas")
        
        # Confirmar cambios
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n" + "="*50)
        print("✅ Usuario administrador creado exitosamente:")
        print(f"   Email: admin@surtika.cl")
        print(f"   Contraseña: admin123")
        print(f"   Inquilino: Surtika (ID: {inquilino_id})")
        print("\n⚠️  IMPORTANTE: Cambiar la contraseña en el primer login")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    # Verificar si se pasó la URL como argumento
    if len(sys.argv) > 1:
        os.environ['SUPABASE_DB_URL'] = sys.argv[1]
    
    create_admin_user()