-- Script para insertar usuario administrador
-- Ejecutar después de crear las tablas

-- Primero, insertar el inquilino Surtika si no existe
INSERT INTO Inquilinos (RazonSocial, RUT, EstadoActivo)
VALUES ('Surtika', '76123456-7', true)
ON CONFLICT (RUT) DO NOTHING;

-- Obtener el ID del inquilino
DO $$
DECLARE
    v_inquilino_id INTEGER;
    v_salt VARCHAR(64);
    v_password_hash VARCHAR(255);
BEGIN
    -- Obtener ID del inquilino
    SELECT InquilinoID INTO v_inquilino_id 
    FROM Inquilinos 
    WHERE RUT = '76123456-7';
    
    -- Generar salt (en producción, usar una función más segura)
    v_salt := encode(gen_random_bytes(32), 'hex');
    
    -- Generar hash del password
    -- NOTA: Este es un hash SHA256 simple. En producción, usar bcrypt o argon2
    -- El backend deberá generar el hash correcto con la librería werkzeug
    v_password_hash := encode(
        sha256(convert_to('admin123' || v_salt, 'UTF8')), 
        'hex'
    );
    
    -- Insertar usuario administrador
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
        'admin',
        'admin@surtika.cl',
        v_password_hash,
        v_salt,
        'Administrador Surtika',
        v_inquilino_id,
        1, -- Rol administrador
        'Activo',
        'Administrador del Sistema',
        true -- Forzar cambio de contraseña en primer login
    )
    ON CONFLICT (Email) DO UPDATE
    SET 
        NombreCompleto = EXCLUDED.NombreCompleto,
        Estado = EXCLUDED.Estado,
        FechaModificacion = CURRENT_TIMESTAMP;
        
    RAISE NOTICE 'Usuario admin@surtika.cl creado/actualizado exitosamente';
    
END $$;

-- Crear algunas empresas de ejemplo para el inquilino
INSERT INTO Empresas (
    InquilinoID,
    RazonSocial,
    RUT,
    TipoEmpresa,
    EmailContacto,
    Ciudad,
    EstadoActivo
) 
SELECT 
    InquilinoID,
    'Empresa Demo OIV',
    '11111111-1',
    'OIV',
    'contacto@demo-oiv.cl',
    'Santiago',
    true
FROM Inquilinos WHERE RUT = '76123456-7'
ON CONFLICT DO NOTHING;

INSERT INTO Empresas (
    InquilinoID,
    RazonSocial,
    RUT,
    TipoEmpresa,
    EmailContacto,
    Ciudad,
    EstadoActivo
) 
SELECT 
    InquilinoID,
    'Empresa Demo PSE',
    '22222222-2',
    'PSE',
    'contacto@demo-pse.cl',
    'Valparaíso',
    true
FROM Inquilinos WHERE RUT = '76123456-7'
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Usuario administrador creado exitosamente:';
    RAISE NOTICE 'Email: admin@surtika.cl';
    RAISE NOTICE 'Contraseña: admin123';
    RAISE NOTICE 'IMPORTANTE: Cambiar la contraseña en el primer login';
    RAISE NOTICE '===========================================';
END $$;