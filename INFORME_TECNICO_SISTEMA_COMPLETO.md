# INFORME TÉCNICO COMPLETO DEL SISTEMA AGENTE DIGITAL

## 1. RESUMEN EJECUTIVO

Agente Digital es una plataforma integral de gestión de cumplimiento de ciberseguridad diseñada específicamente para cumplir con la Ley 21.663 de Chile. El sistema permite a las empresas gestionar incidentes de ciberseguridad, cumplir con obligaciones normativas, y generar reportes para la ANCI (Agencia Nacional de Ciberseguridad e Infraestructura).

### Características Principales:
- **Multi-tenant**: Soporta múltiples inquilinos y empresas
- **Modular**: Arquitectura basada en módulos independientes
- **Escalable**: Diseñado para manejar grandes volúmenes de datos
- **Seguro**: Implementa autenticación JWT y validación en múltiples capas
- **Auditable**: Sistema completo de logs y trazabilidad

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Stack Tecnológico

#### Backend:
- **Framework**: Flask (Python)
- **Base de Datos**: SQL Server
- **Autenticación**: JWT (JSON Web Tokens)
- **ORM**: PyODBC (conexiones directas SQL)
- **CORS**: Flask-CORS para manejo de solicitudes cross-origin

#### Frontend:
- **Framework**: Vue.js 3
- **Router**: Vue Router 4
- **Estado**: Pinia (stores)
- **UI**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios

### 2.2 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue.js 3)                   │
├─────────────────────────────────────────────────────────────┤
│  Views         │  Components      │  Stores    │  Services  │
│  - Login       │  - Formularios   │  - Auth    │  - API     │
│  - Dashboard   │  - Modales       │  - Incident│  - HTTP    │
│  - Incidentes  │  - Tablas        │            │            │
└────────────────┴──────────────────┴────────────┴────────────┘
                               │
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND (Flask)                       │
├─────────────────────────────────────────────────────────────┤
│         app/__init__.py (Orquestador Principal)             │
├─────────────────────────────────────────────────────────────┤
│  Módulos Core  │  Módulos Admin   │  Auth      │  Utils    │
│  - Health      │  - Empresas      │  - JWT     │  - DB     │
│  - Errors      │  - Incidentes    │  - Tokens  │  - Files  │
│  - Database    │  - Cumplimiento  │            │           │
└────────────────┴──────────────────┴────────────┴────────────┘
                               │
                               │ PyODBC
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (SQL Server)                │
├─────────────────────────────────────────────────────────────┤
│  Tablas Principales:                                         │
│  - Inquilinos        - Incidentes      - AnciValidaciones   │
│  - Empresas          - Cumplimiento    - AnciNotificaciones │
│  - Usuarios          - Taxonomias      - AuditoriaAccesos   │
└─────────────────────────────────────────────────────────────┘
```

## 3. ORQUESTACIÓN DE LA APLICACIÓN: app/__init__.py

### 3.1 Función Principal: create_app()

El archivo `app/__init__.py` es el corazón del sistema backend. Su función principal `create_app()` orquesta toda la aplicación siguiendo estos pasos:

#### 1. **Configuración Inicial**
```python
app.config.update({
    'SECRET_KEY': os.environ.get('SECRET_KEY', os.urandom(32)),
    'MAX_CONTENT_LENGTH': 100 * 1024 * 1024,  # 100MB
    'JSON_SORT_KEYS': False,
    'ENV': 'production',
    'DEBUG': False
})
```

#### 2. **Configuración CORS**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
        "expose_headers": ["Content-Length", "X-JSON"],
        "supports_credentials": True,
        "max_age": 3600
    }
})
```

#### 3. **Manejo de Preflight CORS**
```python
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        # Respuesta específica para solicitudes OPTIONS
        response = jsonify({'status': 'ok'})
        # Headers CORS configurados
        return response, 200
```

#### 4. **Registro Modular de Componentes**

El sistema utiliza un patrón de registro tolerante a fallos donde cada módulo se intenta cargar independientemente:

```python
# Ejemplo de registro de módulo
try:
    from .modules.admin.empresas import empresas_bp
    app.register_blueprint(empresas_bp)
    modules_registered += 1
    print("✅ Módulo de empresas registrado")
except ImportError as e:
    print(f"⚠️ Módulo de empresas no disponible: {e}")
```

### 3.2 Módulos Registrados (Orden de Carga)

1. **Sistema de Errores** - Manejo centralizado de excepciones
2. **Health Check** - Monitoreo del estado del sistema
3. **Empresas** - Gestión de entidades empresariales
4. **Incidentes** - Core del sistema para gestión de incidentes
5. **Gestión de Incidentes** - Views y endpoints adicionales
6. **Evidencias de Incidentes** - Manejo de archivos adjuntos
7. **Cumplimiento** - Gestión de obligaciones normativas
8. **Cumplimiento Global** - Endpoints consolidados
9. **Evidencias de Cumplimiento** - Archivos de cumplimiento
10. **Inquilinos** - Multi-tenancy
11. **Taxonomías** - Sistema de clasificación
12. **Taxonomías Simple** - Versión simplificada
13. **Acompañamiento** - Planes de acompañamiento
14. **Redirección de Incidentes** - Compatibilidad legacy
15. **Autenticación** - Sistema JWT
16. **Incidentes (Crear/Editar)** - Módulos especializados

## 4. MÓDULOS DEL BACKEND

### 4.1 Módulos Core (`/app/modules/core/`)

#### **health.py**
- **Propósito**: Monitoreo del estado del sistema
- **Endpoints**: 
  - `GET /api/health` - Estado general
  - `GET /api/health/db` - Estado de la base de datos
  - `GET /api/health/modules` - Módulos cargados

#### **database.py**
- **Propósito**: Gestión de conexiones a SQL Server
- **Funciones principales**:
  - `get_db_connection()` - Obtiene conexión a la BD
  - `db_validator` - Valida estructura de tablas

#### **errors.py**
- **Propósito**: Manejo centralizado de errores
- **Decoradores**:
  - `@robust_endpoint` - Wrapper para manejo de excepciones
- **Clases**:
  - `ErrorResponse` - Respuestas de error estandarizadas

### 4.2 Módulos Admin (`/app/modules/admin/`)

#### **empresas.py**
- **Propósito**: Gestión completa de empresas
- **Endpoints principales**:
  - `GET /api/admin/empresas` - Lista empresas
  - `GET /api/admin/empresas/<id>` - Detalle de empresa
  - `POST /api/admin/empresas` - Crear empresa
  - `PUT /api/admin/empresas/<id>` - Actualizar empresa

#### **incidentes.py**
- **Propósito**: Gestión básica de incidentes
- **Endpoints**:
  - `GET /api/admin/empresas/<empresa_id>/incidentes` - Lista incidentes por empresa
  - `GET /api/admin/incidentes/<id>` - Detalle de incidente

#### **incidentes_crear.py**
- **Propósito**: Creación especializada de incidentes
- **Características**:
  - Generación de índice único: `CORRELATIVO_RUT_MODULO_SUBMODULO_DESCRIPCION`
  - Manejo de archivos temporales (semilla original/base)
  - Validación de campos requeridos por sección
  - Sistema jerárquico de evidencias
- **Endpoints**:
  - `POST /api/incidentes/crear` - Crear nuevo incidente
  - `POST /api/incidentes/borrador` - Guardar borrador
  - `POST /api/incidentes/evidencia` - Cargar evidencia

#### **incidentes_editar.py**
- **Propósito**: Edición avanzada de incidentes
- **Características**:
  - Carga por índice único
  - Preservación de evidencias existentes
  - Reversión a estado original
- **Endpoints**:
  - `GET /api/incidentes/editar/obtener` - Cargar para edición
  - `PUT /api/incidentes/editar/actualizar` - Actualizar incidente
  - `DELETE /api/incidentes/editar/eliminar-evidencia` - Eliminar evidencia

#### **cumplimiento.py**
- **Propósito**: Gestión de cumplimiento normativo
- **Endpoints**:
  - `GET /api/admin/empresas/<id>/informe-cumplimiento` - Informe de cumplimiento
  - `GET /api/admin/empresas/<id>/cumplimientos` - Lista cumplimientos

#### **inquilinos.py**
- **Propósito**: Gestión multi-tenant
- **Endpoints**:
  - `GET /api/admin/inquilinos` - Lista inquilinos
  - `POST /api/admin/inquilinos` - Crear inquilino
  - `PUT /api/admin/inquilinos/<id>` - Actualizar inquilino

#### **taxonomias.py**
- **Propósito**: Sistema de clasificación jerárquica
- **Endpoints**:
  - `GET /api/admin/taxonomias/jerarquica` - Estructura jerárquica
  - `GET /api/admin/taxonomias` - Lista plana
- **Filtros**: Por tipo de empresa (OIV/PSE/AMBAS)

#### **acompanamiento.py**
- **Propósito**: Planes de acompañamiento para cumplimiento
- **Endpoints**:
  - `GET /api/admin/empresas/<id>/acompanamiento` - Plan de acompañamiento

## 5. ESTRUCTURA DE LA BASE DE DATOS

### 5.1 Tablas Principales

#### **Inquilinos**
- **Propósito**: Multi-tenancy
- **Campos clave**:
  - `InquilinoID` (PK)
  - `RazonSocial`
  - `RUT`
  - `EstadoActivo`

#### **Empresas**
- **Propósito**: Entidades supervisadas
- **Campos clave**:
  - `EmpresaID` (PK)
  - `InquilinoID` (FK)
  - `TipoEmpresa` (OIV/PSE)
  - `RazonSocial`
  - `RUT`

#### **Incidentes**
- **Propósito**: Core del sistema
- **Campos clave**:
  - `id` (PK)
  - `indice_unico` (Índice único del sistema)
  - `InquilinoID` (FK)
  - `EmpresaID` (FK)
  - `tipo_registro`
  - `titulo_incidente`
  - `fecha_deteccion`
  - `criticidad`

#### **INCIDENTE_TAXONOMIA**
- **Propósito**: Relación N:M entre incidentes y taxonomías
- **Campos**:
  - `IncidenteID` (FK)
  - `TaxonomiaID` (FK)
  - `porque_seleccionada`
  - `observaciones_adicionales`

#### **Taxonomia_incidentes**
- **Propósito**: Clasificación de incidentes
- **Campos**:
  - `id` (PK)
  - `nombre`
  - `descripcion`
  - `tipo_empresa` (OIV/PSE/AMBAS)
  - `categoria`

#### **Cumplimiento**
- **Propósito**: Seguimiento de obligaciones
- **Campos clave**:
  - `CumplimientoID` (PK)
  - `EmpresaID` (FK)
  - `ObligacionID` (FK)
  - `Estado`
  - `FechaActualizacion`

#### **Obligaciones**
- **Propósito**: Catálogo de obligaciones normativas
- **Campos**:
  - `ObligacionID` (PK)
  - `Nombre`
  - `Descripcion`
  - `TipoEmpresa`
  - `Categoria`

### 5.2 Tablas ANCI (Agencia Nacional)

#### **AnciValidaciones**
- Reglas de validación para reportes

#### **AnciNotificaciones**
- Sistema de notificaciones

#### **AnciPlazos**
- Control de plazos legales

#### **AnciAutorizaciones**
- Gestión de autorizaciones

#### **ReportesAnci**
- Reportes generados para ANCI

### 5.3 Tablas de Auditoría

#### **AuditoriaAccesos**
- Log de accesos al sistema

#### **AuditoriaAdminPlataforma**
- Acciones de administradores

#### **HistorialCambios**
- Tracking de modificaciones

## 6. COMPONENTES FRONTEND (Vue.js)

### 6.1 Estructura de Directorios

```
src/
├── components/       # Componentes reutilizables
├── views/           # Vistas/páginas principales
├── stores/          # Estado global (Pinia)
├── services/        # Lógica de negocio y API
├── router/          # Configuración de rutas
├── composables/     # Lógica reutilizable
└── utils/           # Utilidades y helpers
```

### 6.2 Componentes Principales

#### **Gestión de Incidentes**
- **CuadernoAnalista.vue**: Componente principal para gestión de incidentes
  - Maneja el flujo completo de creación/edición
  - Integra múltiples sub-componentes
  - Validación en tiempo real

- **FormularioIncidente[Simple|Compacto|V2].vue**: Variantes del formulario
  - Simple: Campos básicos
  - Compacto: Optimizado para espacio
  - V2: Versión mejorada con más funcionalidades

#### **Sistema de Evidencias**
- **EvidenciaUploader.vue**: 
  - Drag & drop para archivos
  - Validación de tipos y tamaños
  - Preview de archivos

- **ModalEvidencias.vue**:
  - Gestión centralizada de evidencias
  - Descarga y eliminación
  - Metadatos de archivos

#### **Taxonomías**
- **TaxonomiaIncidentesAvanzada.vue**:
  - Selección jerárquica
  - Filtrado por tipo de empresa
  - Búsqueda en tiempo real

- **AcordeonTaxonomia.vue**:
  - Vista expandible/colapsable
  - Navegación por categorías

#### **Dashboard y Reportes**
- **DashboardEmpresa.vue**:
  - Métricas de cumplimiento
  - Gráficos de incidentes
  - KPIs principales

- **ReporteAnciExportable.vue**:
  - Generación de reportes oficiales
  - Formatos PDF/Excel
  - Validación ANCI

### 6.3 Vistas Principales

#### **LoginView.vue**
- Autenticación de usuarios
- Validación de credenciales
- Redirección post-login

#### **AdminDashboard.vue**
- Panel principal de administración
- Acceso a todos los módulos
- Resumen de actividad

#### **VistaListaIncidentes.vue**
- Tabla paginada de incidentes
- Filtros avanzados
- Acciones bulk

#### **DeclararIncidente.vue**
- Wizard de creación
- Validación por pasos
- Guardado automático

#### **InformeCumplimiento.vue**
- Dashboard de cumplimiento
- Progreso por obligación
- Alertas de vencimiento

### 6.4 Stores (Pinia)

#### **auth.js**
```javascript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),
  actions: {
    async login(credentials) { /* ... */ },
    logout() { /* ... */ },
    validateToken() { /* ... */ }
  }
})
```

#### **incidenteStore.js**
- Estado global de incidentes
- Cache de datos
- Sincronización con backend

### 6.5 Services

#### **api.js**
- Cliente HTTP configurado (Axios)
- Interceptores para auth
- Manejo de errores global

## 7. FLUJO DE DATOS

### 7.1 Creación de Incidente

```
Usuario → FormularioIncidente → incidenteStore → api.js → 
→ POST /api/incidentes/crear → incidentes_crear.py →
→ Validación → Generar Índice → Crear Temporal → 
→ Guardar en BD → Respuesta → Store → UI Update
```

### 7.2 Autenticación

```
LoginView → auth.js → POST /api/auth/login → 
→ routes.py → Validar credenciales → Generar JWT →
→ Respuesta con token → Guardar en localStorage →
→ Configurar Axios headers → Redirect a Dashboard
```

### 7.3 Carga de Evidencias

```
EvidenciaUploader → Validar archivo → FormData →
→ POST /api/incidentes/evidencia → Procesar archivo →
→ Generar nombre único → Guardar en /uploads →
→ Registrar en BD → Actualizar UI
```

## 8. SEGURIDAD

### 8.1 Autenticación y Autorización

- **JWT**: Tokens con expiración de 24 horas
- **Decoradores**: `@login_required` para endpoints protegidos
- **Roles**: Sistema de perfiles (Admin, Usuario, Auditor)

### 8.2 Validación de Datos

- **Backend**: Validación en cada endpoint
- **Frontend**: Validación en formularios
- **SQL Injection**: Uso de parámetros preparados

### 8.3 Manejo de Archivos

- **Carpetas separadas**: Por inquilino/empresa
- **Nombres únicos**: UUID + timestamp
- **Validación de tipos**: Whitelist de extensiones

## 9. CARACTERÍSTICAS ESPECIALES

### 9.1 Multi-tenancy
- Aislamiento de datos por inquilino
- Filtros automáticos en consultas
- Carpetas separadas para archivos

### 9.2 Sistema de Índices Únicos
- Formato: `CORRELATIVO_RUT_MODULO_SUBMODULO_DESCRIPCION`
- Inmutable una vez creado
- Referencia principal para todo el ciclo de vida

### 9.3 Archivos Temporales
- **Semilla Original**: Primera versión al crear
- **Semilla Base**: Versión al cerrar y reabrir
- Recuperación ante fallos

### 9.4 Cumplimiento ANCI
- Validaciones específicas por tipo de empresa
- Plazos legales automatizados
- Generación de reportes oficiales

## 10. INTEGRACIONES Y EXTENSIBILIDAD

### 10.1 Puntos de Extensión

- **Nuevos módulos**: Agregar en `/app/modules/`
- **Nuevas vistas**: Agregar en `/src/views/`
- **Nuevas validaciones**: Extender `AnciValidaciones`

### 10.2 APIs Externas

- **ANCI**: Preparado para integración futura
- **Notificaciones**: Sistema de hooks para email/SMS
- **Almacenamiento**: Preparado para S3/Cloud Storage

## 11. MONITOREO Y MANTENIMIENTO

### 11.1 Logs
- **Accesos**: Tabla `AuditoriaAccesos`
- **Cambios**: Tabla `HistorialCambios`
- **Errores**: Sistema centralizado en `errors.py`

### 11.2 Health Checks
- Endpoint `/api/health`
- Verificación de BD
- Estado de módulos

### 11.3 Métricas
- Tiempo de respuesta por endpoint
- Uso de recursos
- Errores por módulo

## 12. CONCLUSIONES

El Sistema Agente Digital es una plataforma robusta y escalable diseñada específicamente para el cumplimiento de la Ley 21.663 de Chile. Su arquitectura modular permite fácil mantenimiento y extensión, mientras que su diseño multi-tenant lo hace ideal para organizaciones que gestionan múltiples empresas.

La separación clara entre frontend y backend, junto con el uso de estándares modernos de desarrollo, asegura que el sistema pueda evolucionar según las necesidades regulatorias y de negocio.

### Fortalezas Principales:
1. **Modularidad**: Cada componente es independiente
2. **Escalabilidad**: Diseñado para crecer
3. **Seguridad**: Múltiples capas de protección
4. **Auditoría**: Trazabilidad completa
5. **Usabilidad**: Interfaz intuitiva y responsive

### Áreas de Mejora Futura:
1. Implementación de caché Redis
2. Integración directa con API ANCI
3. Sistema de notificaciones en tiempo real (WebSockets)
4. Backup automatizado de archivos
5. Dashboard de analytics avanzado