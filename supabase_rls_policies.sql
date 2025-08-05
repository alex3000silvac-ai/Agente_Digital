-- Políticas de Row Level Security (RLS) para Supabase
-- Ejecutar después de crear las tablas

-- Habilitar RLS en todas las tablas principales
ALTER TABLE Inquilinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE UsuariosCliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE Incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE CumplimientoEmpresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE EvidenciasCumplimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE LogsAuditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE SesionesActivas ENABLE ROW LEVEL SECURITY;

-- Crear función para obtener el inquilino del usuario actual
CREATE OR REPLACE FUNCTION get_user_inquilino_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_inquilino_id', true)::INTEGER,
        (SELECT InquilinoID FROM UsuariosCliente WHERE UsuarioClienteID = current_setting('app.current_user_id', true)::INTEGER)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para Inquilinos
-- Los usuarios solo pueden ver su propio inquilino
CREATE POLICY "Usuarios pueden ver su inquilino" ON Inquilinos
    FOR SELECT
    USING (InquilinoID = get_user_inquilino_id());

-- Políticas para Empresas
-- Los usuarios solo pueden ver empresas de su inquilino
CREATE POLICY "Usuarios pueden ver empresas de su inquilino" ON Empresas
    FOR SELECT
    USING (InquilinoID = get_user_inquilino_id());

CREATE POLICY "Usuarios pueden crear empresas en su inquilino" ON Empresas
    FOR INSERT
    WITH CHECK (InquilinoID = get_user_inquilino_id());

CREATE POLICY "Usuarios pueden actualizar empresas de su inquilino" ON Empresas
    FOR UPDATE
    USING (InquilinoID = get_user_inquilino_id());

-- Políticas para Usuarios
-- Los usuarios solo pueden ver usuarios de su inquilino
CREATE POLICY "Usuarios pueden ver usuarios de su inquilino" ON UsuariosCliente
    FOR SELECT
    USING (InquilinoID = get_user_inquilino_id());

-- Los usuarios pueden ver y actualizar su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" ON UsuariosCliente
    FOR SELECT
    USING (UsuarioClienteID = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON UsuariosCliente
    FOR UPDATE
    USING (UsuarioClienteID = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas para Incidentes
-- Los usuarios pueden ver incidentes de empresas de su inquilino
CREATE POLICY "Usuarios pueden ver incidentes de su inquilino" ON Incidentes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM Empresas 
            WHERE Empresas.EmpresaID = Incidentes.EmpresaID 
            AND Empresas.InquilinoID = get_user_inquilino_id()
        )
    );

CREATE POLICY "Usuarios pueden crear incidentes en empresas de su inquilino" ON Incidentes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM Empresas 
            WHERE Empresas.EmpresaID = Incidentes.EmpresaID 
            AND Empresas.InquilinoID = get_user_inquilino_id()
        )
    );

CREATE POLICY "Usuarios pueden actualizar incidentes de su inquilino" ON Incidentes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM Empresas 
            WHERE Empresas.EmpresaID = Incidentes.EmpresaID 
            AND Empresas.InquilinoID = get_user_inquilino_id()
        )
    );

-- Políticas para Cumplimiento
CREATE POLICY "Usuarios pueden ver cumplimiento de su inquilino" ON CumplimientoEmpresa
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM Empresas 
            WHERE Empresas.EmpresaID = CumplimientoEmpresa.EmpresaID 
            AND Empresas.InquilinoID = get_user_inquilino_id()
        )
    );

CREATE POLICY "Usuarios pueden gestionar cumplimiento de su inquilino" ON CumplimientoEmpresa
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM Empresas 
            WHERE Empresas.EmpresaID = CumplimientoEmpresa.EmpresaID 
            AND Empresas.InquilinoID = get_user_inquilino_id()
        )
    );

-- Políticas para Evidencias
CREATE POLICY "Usuarios pueden ver evidencias de su inquilino" ON EvidenciasCumplimiento
    FOR SELECT
    USING (InquilinoID = get_user_inquilino_id());

CREATE POLICY "Usuarios pueden gestionar evidencias de su inquilino" ON EvidenciasCumplimiento
    FOR ALL
    USING (InquilinoID = get_user_inquilino_id());

-- Políticas para Logs de Auditoría
-- Solo lectura para usuarios de su inquilino
CREATE POLICY "Usuarios pueden ver logs de su actividad" ON LogsAuditoria
    FOR SELECT
    USING (UsuarioID = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas para Sesiones
-- Los usuarios solo pueden ver sus propias sesiones
CREATE POLICY "Usuarios pueden ver sus propias sesiones" ON SesionesActivas
    FOR SELECT
    USING (UsuarioID = current_setting('app.current_user_id', true)::INTEGER);

-- Política especial para service role (bypass RLS)
-- Esto permite que el backend con service_key tenga acceso completo
CREATE POLICY "Service role bypass" ON Inquilinos FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON Empresas FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON UsuariosCliente FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON Incidentes FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON CumplimientoEmpresa FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON EvidenciasCumplimiento FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON LogsAuditoria FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON SesionesActivas FOR ALL TO service_role USING (true);

-- Nota: Para usar estas políticas, el backend debe establecer las variables de sesión:
-- SET LOCAL app.current_user_id = 'ID_DEL_USUARIO';
-- SET LOCAL app.current_inquilino_id = 'ID_DEL_INQUILINO';