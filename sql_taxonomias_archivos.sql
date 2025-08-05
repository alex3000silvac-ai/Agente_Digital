-- =====================================================
-- TABLAS PARA GESTIÓN DE TAXONOMÍAS Y ARCHIVOS
-- Sistema de Gestión de Incidentes Ley 21.663
-- =====================================================

-- Tabla para almacenar archivos de evidencias por taxonomía
CREATE TABLE IF NOT EXISTS archivos_evidencias_taxonomias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    archivo_id VARCHAR(100) UNIQUE NOT NULL,
    taxonomia_id VARCHAR(50) NOT NULL,
    incidente_id VARCHAR(100) NOT NULL,
    empresa_id INT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_guardado VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    tamaño_bytes BIGINT NOT NULL,
    hash_md5 VARCHAR(32) NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    tipo_mime VARCHAR(100),
    comentario TEXT,
    fecha_carga DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    usuario_carga VARCHAR(100),
    estado ENUM('activo', 'eliminado', 'backup') DEFAULT 'activo',
    INDEX idx_taxonomia (taxonomia_id),
    INDEX idx_incidente (incidente_id),
    INDEX idx_empresa (empresa_id),
    INDEX idx_estado (estado),
    INDEX idx_hash (hash_sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para registrar selección de taxonomías por incidente
CREATE TABLE IF NOT EXISTS incidentes_taxonomias_seleccionadas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incidente_id VARCHAR(100) NOT NULL,
    taxonomia_id VARCHAR(50) NOT NULL,
    empresa_id INT NOT NULL,
    justificacion_seleccion TEXT NOT NULL COMMENT '¿Por qué fue seleccionada esta taxonomía?',
    descripcion_problema TEXT COMMENT 'Descripción acabada del problema',
    orden_seleccion INT DEFAULT 0,
    fecha_seleccion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    usuario_seleccion VARCHAR(100),
    estado ENUM('activa', 'eliminada') DEFAULT 'activa',
    UNIQUE KEY uk_incidente_taxonomia (incidente_id, taxonomia_id),
    INDEX idx_incidente (incidente_id),
    INDEX idx_taxonomia (taxonomia_id),
    INDEX idx_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de auditoría para cambios en archivos
CREATE TABLE IF NOT EXISTS auditoria_archivos_taxonomias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    archivo_id VARCHAR(100) NOT NULL,
    accion ENUM('subida', 'eliminacion', 'modificacion_comentario', 'descarga') NOT NULL,
    detalles JSON,
    ip_origen VARCHAR(45),
    usuario VARCHAR(100),
    fecha_accion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_archivo (archivo_id),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para obtener resumen de archivos por taxonomía
CREATE OR REPLACE VIEW v_resumen_archivos_taxonomias AS
SELECT 
    t.incidente_id,
    t.taxonomia_id,
    ti.Categoria_del_Incidente as nombre_taxonomia,
    COUNT(a.id) as total_archivos,
    SUM(a.tamaño_bytes) as tamaño_total_bytes,
    MAX(a.fecha_carga) as ultima_carga
FROM incidentes_taxonomias_seleccionadas t
LEFT JOIN archivos_evidencias_taxonomias a 
    ON t.incidente_id = a.incidente_id 
    AND t.taxonomia_id = a.taxonomia_id
    AND a.estado = 'activo'
LEFT JOIN Taxonomia_incidentes ti 
    ON t.taxonomia_id = ti.Id_Incidente
WHERE t.estado = 'activa'
GROUP BY t.incidente_id, t.taxonomia_id;

-- Procedimiento para limpiar archivos huérfanos
DELIMITER //
CREATE PROCEDURE sp_limpiar_archivos_huerfanos()
BEGIN
    -- Marcar como huérfanos los archivos que no tienen taxonomía seleccionada activa
    UPDATE archivos_evidencias_taxonomias a
    SET a.estado = 'eliminado'
    WHERE a.estado = 'activo'
    AND NOT EXISTS (
        SELECT 1 
        FROM incidentes_taxonomias_seleccionadas t
        WHERE t.incidente_id = a.incidente_id
        AND t.taxonomia_id = a.taxonomia_id
        AND t.estado = 'activa'
    );
    
    -- Retornar cantidad de archivos marcados
    SELECT ROW_COUNT() as archivos_marcados;
END//
DELIMITER ;

-- Procedimiento para obtener estadísticas de archivos por empresa
DELIMITER //
CREATE PROCEDURE sp_estadisticas_archivos_empresa(IN p_empresa_id INT)
BEGIN
    SELECT 
        COUNT(DISTINCT a.incidente_id) as total_incidentes,
        COUNT(DISTINCT a.taxonomia_id) as total_taxonomias,
        COUNT(a.id) as total_archivos,
        SUM(a.tamaño_bytes) / (1024*1024) as tamaño_total_mb,
        COUNT(DISTINCT DATE(a.fecha_carga)) as dias_con_cargas
    FROM archivos_evidencias_taxonomias a
    WHERE a.empresa_id = p_empresa_id
    AND a.estado = 'activo';
END//
DELIMITER ;

-- Índices adicionales para optimización
ALTER TABLE archivos_evidencias_taxonomias 
ADD INDEX idx_fecha_carga (fecha_carga),
ADD INDEX idx_nombre_original (nombre_original);

-- Triggers para auditoría
DELIMITER //
CREATE TRIGGER tr_auditoria_archivo_insert
AFTER INSERT ON archivos_evidencias_taxonomias
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_archivos_taxonomias 
    (archivo_id, accion, detalles, usuario)
    VALUES 
    (NEW.archivo_id, 'subida', 
     JSON_OBJECT('nombre', NEW.nombre_original, 'tamaño', NEW.tamaño_bytes),
     NEW.usuario_carga);
END//

CREATE TRIGGER tr_auditoria_archivo_update
AFTER UPDATE ON archivos_evidencias_taxonomias
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado AND NEW.estado = 'eliminado' THEN
        INSERT INTO auditoria_archivos_taxonomias 
        (archivo_id, accion, detalles)
        VALUES 
        (NEW.archivo_id, 'eliminacion', 
         JSON_OBJECT('nombre', NEW.nombre_original));
    ELSEIF OLD.comentario != NEW.comentario THEN
        INSERT INTO auditoria_archivos_taxonomias 
        (archivo_id, accion, detalles)
        VALUES 
        (NEW.archivo_id, 'modificacion_comentario', 
         JSON_OBJECT('comentario_anterior', OLD.comentario, 
                     'comentario_nuevo', NEW.comentario));
    END IF;
END//
DELIMITER ;

-- Datos de ejemplo para pruebas
INSERT INTO incidentes_taxonomias_seleccionadas 
(incidente_id, taxonomia_id, empresa_id, justificacion_seleccion, descripcion_problema)
VALUES 
('INC_2025_001', 'INC_CONF_EXDA_FDP', 1, 
 'Se detectó filtración de datos personales de clientes', 
 'Exposición de base de datos con información sensible de 1000 clientes'),
('INC_2025_001', 'INC_USO_UNRI_AFBE', 1, 
 'El atacante utilizó fuerza bruta para obtener acceso', 
 'Múltiples intentos de login detectados desde IP sospechosa');

-- Permisos recomendados
-- GRANT SELECT, INSERT, UPDATE ON archivos_evidencias_taxonomias TO 'app_user'@'localhost';
-- GRANT SELECT ON v_resumen_archivos_taxonomias TO 'app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE sp_limpiar_archivos_huerfanos TO 'admin_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE sp_estadisticas_archivos_empresa TO 'app_user'@'localhost';