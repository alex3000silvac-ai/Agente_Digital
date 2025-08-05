-- Script de migración para Supabase
-- Agente Digital - Sistema de Gestión de Cumplimiento

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Inquilinos
CREATE TABLE IF NOT EXISTS Inquilinos (
    InquilinoID SERIAL PRIMARY KEY,
    RazonSocial VARCHAR(510) NOT NULL,
    RUT VARCHAR(40) UNIQUE,
    EstadoActivo BOOLEAN DEFAULT true,
    FechaCreacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Empresas
CREATE TABLE IF NOT EXISTS Empresas (
    EmpresaID SERIAL PRIMARY KEY,
    InquilinoID INTEGER REFERENCES Inquilinos(InquilinoID) ON DELETE CASCADE,
    RazonSocial VARCHAR(510) NOT NULL,
    RUT VARCHAR(40),
    TipoEmpresa VARCHAR(100) DEFAULT 'PSE',
    NombreFantasia VARCHAR(1020),
    GiroDelNegocio VARCHAR(1020),
    Direccion VARCHAR(1020),
    Ciudad VARCHAR(200),
    RepresentanteLegal VARCHAR(500),
    EmailContacto VARCHAR(255),
    Telefono VARCHAR(100),
    SectorEsencial VARCHAR(50),
    NumeroEmpleados INTEGER,
    FechaCreacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FechaActualizacion TIMESTAMP WITH TIME ZONE,
    EstadoActivo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS UsuariosCliente (
    UsuarioClienteID SERIAL PRIMARY KEY,
    NombreUsuario VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Salt VARCHAR(64) NOT NULL,
    NombreCompleto VARCHAR(255) NOT NULL,
    InquilinoID INTEGER REFERENCES Inquilinos(InquilinoID) ON DELETE CASCADE,
    EmpresaID INTEGER REFERENCES Empresas(EmpresaID) ON DELETE SET NULL,
    RolID INTEGER DEFAULT 1,
    Telefono VARCHAR(40),
    Cargo VARCHAR(200),
    Estado VARCHAR(40) DEFAULT 'Activo',
    IntentosLoginFallidos INTEGER DEFAULT 0,
    CuentaBloqueada BOOLEAN DEFAULT false,
    FechaBloqueo TIMESTAMP WITH TIME ZONE,
    CambiarPasswordProximoLogin BOOLEAN DEFAULT false,
    FechaVencimientoPassword TIMESTAMP WITH TIME ZONE,
    FechaCreacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FechaModificacion TIMESTAMP WITH TIME ZONE,
    UltimoAcceso TIMESTAMP WITH TIME ZONE,
    UsuarioCreador INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Incidentes
CREATE TABLE IF NOT EXISTS Incidentes (
    IncidenteID SERIAL PRIMARY KEY,
    EmpresaID INTEGER REFERENCES Empresas(EmpresaID) ON DELETE CASCADE,
    Titulo TEXT,
    IDVisible VARCHAR(50) UNIQUE,
    FechaCreacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FechaDeteccion TIMESTAMP WITH TIME ZONE,
    FechaCierre TIMESTAMP WITH TIME ZONE,
    FechaOcurrencia TIMESTAMP WITH TIME ZONE,
    CreadoPor VARCHAR(100),
    ResponsableCliente VARCHAR(255),
    EstadoActual VARCHAR(50) DEFAULT 'Abierto',
    Criticidad VARCHAR(50),
    TipoFlujo VARCHAR(50),
    DescripcionInicial TEXT,
    SistemasAfectados TEXT,
    OrigenIncidente TEXT,
    AccionesInmediatas TEXT,
    AlcanceGeografico VARCHAR(100),
    ServiciosInterrumpidos TEXT,
    AnciImpactoPreliminar TEXT,
    AnciTipoAmenaza VARCHAR(500),
    CausaRaiz TEXT,
    LeccionesAprendidas TEXT,
    PlanMejora TEXT,
    FechaActualizacion TIMESTAMP WITH TIME ZONE,
    FechaModificacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    TipoExigencia VARCHAR(510),
    ContactoTecnicoComercial VARCHAR(1020),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Cumplimiento
CREATE TABLE IF NOT EXISTS CumplimientoEmpresa (
    CumplimientoID SERIAL PRIMARY KEY,
    EmpresaID INTEGER REFERENCES Empresas(EmpresaID) ON DELETE CASCADE,
    ObligacionID VARCHAR(100) REFERENCES OBLIGACIONES(ObligacionID),
    RecomendacionID INTEGER,
    Estado VARCHAR(200) DEFAULT 'Pendiente',
    PorcentajeAvance INTEGER DEFAULT 0 CHECK (PorcentajeAvance >= 0 AND PorcentajeAvance <= 100),
    Responsable VARCHAR(510),
    FechaTermino TIMESTAMP WITH TIME ZONE,
    ObservacionesCiberseguridad TEXT,
    ObservacionesLegales TEXT,
    FechaCreacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FechaModificacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Evidencias de Cumplimiento
CREATE TABLE IF NOT EXISTS EvidenciasCumplimiento (
    EvidenciaID SERIAL PRIMARY KEY,
    CumplimientoID INTEGER REFERENCES CumplimientoEmpresa(CumplimientoID) ON DELETE CASCADE,
    NombreArchivoOriginal VARCHAR(255) NOT NULL,
    NombreArchivoAlmacenado VARCHAR(255) NOT NULL,
    RutaArchivo TEXT NOT NULL,
    TipoArchivo VARCHAR(100),
    TamanoArchivoKB INTEGER,
    Version INTEGER DEFAULT 1,
    FechaSubida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UsuarioQueSubio VARCHAR(255),
    InquilinoID INTEGER REFERENCES Inquilinos(InquilinoID),
    EmpresaID INTEGER REFERENCES Empresas(EmpresaID),
    Descripcion VARCHAR(500),
    FechaVigencia DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Taxonomía de Incidentes
CREATE TABLE IF NOT EXISTS Taxonomia_incidentes (
    Id_Incidente VARCHAR(50) PRIMARY KEY,
    Area VARCHAR(255),
    Efecto VARCHAR(255),
    Subcategoria_del_Incidente VARCHAR(255),
    Categoria_del_Incidente VARCHAR(255),
    AplicaTipoEmpresa VARCHAR(10),
    Descripcion VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Incidente-Taxonomía
CREATE TABLE IF NOT EXISTS INCIDENTE_TAXONOMIA (
    ID SERIAL PRIMARY KEY,
    IncidenteID INTEGER REFERENCES Incidentes(IncidenteID) ON DELETE CASCADE,
    Id_Taxonomia VARCHAR(100) REFERENCES Taxonomia_incidentes(Id_Incidente),
    Comentarios TEXT,
    FechaAsignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CreadoPor VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Logs de Auditoría
CREATE TABLE IF NOT EXISTS LogsAuditoria (
    LogID SERIAL PRIMARY KEY,
    Fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UsuarioID INTEGER,
    IPAddress VARCHAR(45),
    Accion VARCHAR(50) NOT NULL,
    Tabla VARCHAR(50) NOT NULL,
    RegistroID INTEGER,
    DatosAnteriores TEXT,
    DatosNuevos TEXT,
    Detalles VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Sesiones Activas
CREATE TABLE IF NOT EXISTS SesionesActivas (
    SesionID SERIAL PRIMARY KEY,
    TokenJWT VARCHAR(500) NOT NULL,
    UsuarioID INTEGER NOT NULL,
    TipoUsuario VARCHAR(20) NOT NULL,
    IPAddress VARCHAR(45),
    UserAgent VARCHAR(500),
    FechaInicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FechaUltimaActividad TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FechaExpiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    Estado VARCHAR(20) DEFAULT 'ACTIVA',
    MotivoFinalizacion VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_empresas_inquilino ON Empresas(InquilinoID);
CREATE INDEX idx_incidentes_empresa ON Incidentes(EmpresaID);
CREATE INDEX idx_incidentes_estado ON Incidentes(EstadoActual);
CREATE INDEX idx_incidentes_fecha ON Incidentes(FechaCreacion DESC);
CREATE INDEX idx_cumplimiento_empresa ON CumplimientoEmpresa(EmpresaID);
CREATE INDEX idx_cumplimiento_estado ON CumplimientoEmpresa(Estado);
CREATE INDEX idx_usuarios_inquilino ON UsuariosCliente(InquilinoID);
CREATE INDEX idx_usuarios_email ON UsuariosCliente(Email);
CREATE INDEX idx_sesiones_token ON SesionesActivas(TokenJWT);
CREATE INDEX idx_sesiones_usuario ON SesionesActivas(UsuarioID);
CREATE INDEX idx_logs_fecha ON LogsAuditoria(Fecha DESC);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_inquilinos_updated_at BEFORE UPDATE ON Inquilinos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON Empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON UsuariosCliente FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidentes_updated_at BEFORE UPDATE ON Incidentes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_obligaciones_updated_at BEFORE UPDATE ON OBLIGACIONES FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cumplimiento_updated_at BEFORE UPDATE ON CumplimientoEmpresa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evidencias_updated_at BEFORE UPDATE ON EvidenciasCumplimiento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taxonomia_updated_at BEFORE UPDATE ON Taxonomia_incidentes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sesiones_updated_at BEFORE UPDATE ON SesionesActivas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales de prueba
INSERT INTO Inquilinos (RazonSocial, RUT, EstadoActivo)
VALUES ('Demo Company', '12345678-9', true)
ON CONFLICT (RUT) DO NOTHING;

-- Comentario: Para habilitar RLS (Row Level Security), ejecutar después:
-- ALTER TABLE Inquilinos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE Empresas ENABLE ROW LEVEL SECURITY;
-- etc...