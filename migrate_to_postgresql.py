#!/usr/bin/env python3
# Script para migrar esquema de SQL Server a PostgreSQL

import os
from sqlalchemy import create_engine, MetaData, text

# Esquema simplificado para PostgreSQL
POSTGRESQL_SCHEMA = """
-- Tabla de Inquilinos
CREATE TABLE IF NOT EXISTS Inquilinos (
    InquilinoID SERIAL PRIMARY KEY,
    RazonSocial VARCHAR(510) NOT NULL,
    RUT VARCHAR(40),
    EstadoActivo BOOLEAN DEFAULT true,
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Empresas
CREATE TABLE IF NOT EXISTS Empresas (
    EmpresaID SERIAL PRIMARY KEY,
    InquilinoID INTEGER REFERENCES Inquilinos(InquilinoID),
    RazonSocial VARCHAR(510) NOT NULL,
    RUT VARCHAR(40),
    TipoEmpresa VARCHAR(100),
    NombreFantasia VARCHAR(1020),
    GiroDelNegocio VARCHAR(1020),
    Direccion VARCHAR(1020),
    Ciudad VARCHAR(200),
    RepresentanteLegal VARCHAR(500),
    EmailContacto VARCHAR(255),
    Telefono VARCHAR(100),
    SectorEsencial VARCHAR(50),
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaActualizacion TIMESTAMP,
    EstadoActivo BOOLEAN DEFAULT true
);

-- Tabla de Incidentes
CREATE TABLE IF NOT EXISTS Incidentes (
    IncidenteID SERIAL PRIMARY KEY,
    EmpresaID INTEGER REFERENCES Empresas(EmpresaID),
    Titulo TEXT,
    IDVisible VARCHAR(50),
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaDeteccion TIMESTAMP,
    FechaCierre TIMESTAMP,
    CreadoPor VARCHAR(100),
    ResponsableCliente VARCHAR(255),
    EstadoActual VARCHAR(50),
    Criticidad VARCHAR(50),
    TipoFlujo VARCHAR(50),
    DescripcionInicial TEXT,
    SistemasAfectados TEXT,
    OrigenIncidente TEXT,
    AccionesInmediatas TEXT,
    FechaActualizacion TIMESTAMP,
    FechaModificacion TIMESTAMP
);

-- Tabla de Obligaciones
CREATE TABLE IF NOT EXISTS OBLIGACIONES (
    ObligacionID VARCHAR(100) PRIMARY KEY,
    ArticuloNorma VARCHAR(510),
    VerboRector VARCHAR(510),
    Descripcion TEXT,
    AplicaPara VARCHAR(100),
    Origen VARCHAR(510),
    MedioDeVerificacionSugerido TEXT,
    Frecuencia VARCHAR(200),
    TipoExigencia VARCHAR(510)
);

-- Tabla de Cumplimiento
CREATE TABLE IF NOT EXISTS CumplimientoEmpresa (
    CumplimientoID SERIAL PRIMARY KEY,
    EmpresaID INTEGER REFERENCES Empresas(EmpresaID),
    ObligacionID VARCHAR(100) REFERENCES OBLIGACIONES(ObligacionID),
    Estado VARCHAR(200),
    PorcentajeAvance INTEGER DEFAULT 0,
    Responsable VARCHAR(510),
    FechaTermino TIMESTAMP,
    ObservacionesCiberseguridad TEXT,
    ObservacionesLegales TEXT,
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaModificacion TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS UsuariosCliente (
    UsuarioClienteID SERIAL PRIMARY KEY,
    NombreUsuario VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Salt VARCHAR(64) NOT NULL,
    NombreCompleto VARCHAR(255) NOT NULL,
    InquilinoID INTEGER REFERENCES Inquilinos(InquilinoID),
    EmpresaID INTEGER REFERENCES Empresas(EmpresaID),
    RolID INTEGER DEFAULT 1,
    Estado VARCHAR(40) DEFAULT 'Activo',
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UltimoAcceso TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_empresas_inquilino ON Empresas(InquilinoID);
CREATE INDEX idx_incidentes_empresa ON Incidentes(EmpresaID);
CREATE INDEX idx_cumplimiento_empresa ON CumplimientoEmpresa(EmpresaID);
CREATE INDEX idx_usuarios_inquilino ON UsuariosCliente(InquilinoID);
"""

def migrate_database():
    """Ejecuta la migración de base de datos"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL no configurada")
        return False
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("✅ Conectado a PostgreSQL")
            
            # Ejecutar el esquema
            for statement in POSTGRESQL_SCHEMA.split(';'):
                if statement.strip():
                    conn.execute(text(statement))
                    conn.commit()
            
            print("✅ Tablas creadas exitosamente")
            
            # Insertar datos de prueba
            conn.execute(text("""
                INSERT INTO Inquilinos (RazonSocial, RUT, EstadoActivo)
                VALUES ('Demo Company', '12345678-9', true)
                ON CONFLICT DO NOTHING
            """))
            conn.commit()
            
            print("✅ Datos de prueba insertados")
            
        return True
        
    except Exception as e:
        print(f"❌ Error en migración: {e}")
        return False

if __name__ == "__main__":
    migrate_database()