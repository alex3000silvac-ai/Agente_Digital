# Informe del Sistema AgenteDigital_Flask

## Resumen Ejecutivo

**AgenteDigital_Flask** es una plataforma integral de gestión de ciberseguridad y cumplimiento normativo diseñada específicamente para empresas que deben cumplir con las regulaciones de la Agencia Nacional de Ciberseguridad (ANCI). El sistema proporciona herramientas completas para el registro, seguimiento y reporte de incidentes de seguridad, así como el control de cumplimiento de obligaciones regulatorias.

---

## 1. Arquitectura General del Sistema

### 1.1 Estructura Tecnológica
- **Backend**: API REST desarrollada en Flask (Python 3.12)
- **Frontend**: Aplicación web moderna en Vue.js 3 con Tailwind CSS
- **Base de Datos**: SQL Server 2019+ (192.168.100.125)
- **Arquitectura**: Monorepo con separación clara frontend/backend

### 1.2 Componentes Principales
```
AgenteDigital_Flask/
├── agente_digital_api/          # Backend Flask API
│   ├── app/modules/            # Módulos funcionales
│   ├── config.py              # Configuración del sistema
│   └── run.py                 # Punto de entrada
├── agente_digital_ui/          # Frontend Vue.js
│   ├── src/views/             # Vistas principales
│   ├── src/components/        # Componentes reutilizables
│   └── src/stores/            # Gestión de estado (Pinia)
└── documentacion/             # Documentación técnica
```

---

## 2. Propósito y Funcionalidad Principal

### 2.1 Objetivo Principal
Proporcionar una plataforma integral para:
- **Gestión de incidentes de ciberseguridad** según normativas ANCI
- **Control de cumplimiento** de obligaciones regulatorias
- **Generación automática de informes** oficiales para autoridades
- **Acompañamiento especializado** a empresas en temas de seguridad

### 2.2 Casos de Uso Principales
1. **Registro de incidentes**: Formularios dinámicos adaptados según el tipo de incidente
2. **Seguimiento de cumplimiento**: Control de plazos y obligaciones regulatorias
3. **Generación de reportes ANCI**: Informes oficiales para la autoridad
4. **Servicios de consultoría**: Acompañamiento especializado a empresas

---

## 3. Módulos Principales del Backend

### 3.1 Módulos Core
| Módulo | Archivo | Función |
|--------|---------|---------|
| **Sistema de Errores** | `error_handler.py` | Manejo centralizado de errores |
| **Salud del Sistema** | `health_check.py` | Monitoreo de disponibilidad |
| **Base de Datos** | `database.py` | Conectividad con SQL Server |

### 3.2 Módulos de Administración
| Módulo | Archivo | Función |
|--------|---------|---------|
| **Empresas** | `empresas.py` | Gestión de empresas clientes |
| **Inquilinos** | `inquilinos.py` | Gestión multi-tenant |
| **Incidentes** | `incidentes.py` | CRUD de incidentes |
| **Cumplimiento** | `cumplimiento.py` | Control de obligaciones regulatorias |
| **Taxonomías** | `taxonomias.py` | Clasificación de incidentes |
| **Acompañamiento** | `acompanamiento.py` | Servicios de consultoría |

### 3.3 Módulos de Incidentes Avanzados
| Módulo | Archivo | Función |
|--------|---------|---------|
| **Generador ANCI** | `generador_informes_anci.py` | Informes oficiales |
| **Gestor de Evidencias** | `gestor_evidencias.py` | Manejo de archivos |
| **Sistema Dinámico** | `sistema_dinamico.py` | Formularios adaptativos |
| **Validador** | `validador.py` | Validación de datos |
| **Carga Completa** | `carga_completa.py` | Importación masiva |

### 3.4 Módulos de Informes
| Módulo | Archivo | Función |
|--------|---------|---------|
| **Informes ANCI** | `informes_anci.py` | Generación de reportes oficiales |
| **Informes Completos** | `informes_anci_completo.py` | Informes con todos los campos |
| **Endpoints ANCI** | `informes_anci_endpoints.py` | API para informes |

---

## 4. Módulos del Frontend

### 4.1 Vistas Principales
| Vista | Archivo | Función |
|-------|---------|---------|
| **Panel Principal** | `AdminDashboard.vue` | Dashboard administrativo |
| **Declarar Incidente** | `DeclararIncidenteV3.vue` | Formulario dinámico de incidentes |
| **Acompañamiento** | `ModuloAcompanamiento.vue` | Gestión de servicios |
| **Cumplimiento** | `InformeCumplimiento.vue` | Reportes de cumplimiento |
| **Informes ANCI** | `VistaInformesANCI.vue` | Generación de informes oficiales |

### 4.2 Componentes Clave
| Componente | Archivo | Función |
|------------|---------|---------|
| **Formulario Dinámico** | `FormularioDinamicoANCI.vue` | Formularios adaptativos |
| **Taxonomía** | `TaxonomiaIncidentesEspectacular.vue` | Clasificación avanzada |
| **Gestor ANCI** | `GestorInformesANCI.vue` | Generación de reportes |
| **Evidencias** | `EvidenciaUploader.vue` | Carga de archivos |

---

## 5. Base de Datos y Estructura

### 5.1 Configuración
- **Servidor**: 192.168.100.125
- **Base de datos**: AgenteDigitalDB
- **Usuario**: app_usuario
- **Autenticación**: SQL Server Authentication

### 5.2 Tablas Principales
| Tabla | Función |
|-------|---------|
| **Inquilinos** | Organizaciones principales |
| **Empresas** | Entidades bajo cada inquilino |
| **Incidentes** | Eventos de seguridad registrados |
| **ReportesANCI** | Informes oficiales generados |
| **Cumplimiento** | Seguimiento de obligaciones |
| **Taxonomia_incidentes** | Clasificaciones estándar |
| **INCIDENTES_ARCHIVOS** | Evidencias y documentos |

---

## 6. Funcionalidades Específicas

### 6.1 Gestión de Incidentes
- **Registro completo**: Formularios dinámicos que se adaptan según el tipo
- **Clasificación automática**: Taxonomías según estándares ANCI
- **Gestión de evidencias**: Carga segura de archivos
- **Seguimiento de estado**: Flujo completo desde detección hasta cierre

### 6.2 Cumplimiento Normativo
- **Control de plazos**: Alertas automáticas de vencimientos
- **Seguimiento de obligaciones**: Dashboard de estado de cumplimiento
- **Auditoría**: Historial completo de cambios
- **Reportes**: Informes periódicos de cumplimiento

### 6.3 Informes ANCI
- **Generación automática**: Informes completos con todos los campos
- **Sección 1 protegida**: Datos del reportante no editables
- **Formato oficial**: Documentos Word descargables
- **Validación**: Verificación de campos obligatorios

### 6.4 Servicios de Acompañamiento
- **Gestión de proyectos**: Seguimiento de servicios de consultoría
- **Reportes de progreso**: Informes de estado de proyectos
- **Facturación**: Control de servicios prestados

---

## 7. Tecnologías y Dependencias

### 7.1 Backend (Flask)
```python
# Principales dependencias
flask==2.3.3
pyodbc==4.0.39
flask-cors==4.0.0
python-dotenv==1.0.0
flask-jwt-extended==4.5.3
python-docx==0.8.11
```

### 7.2 Frontend (Vue.js)
```json
{
  "vue": "^3.3.8",
  "vue-router": "^4.2.5",
  "pinia": "^2.1.7",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.5",
  "primevue": "^3.42.0"
}
```

---

## 8. Seguridad y Características Técnicas

### 8.1 Seguridad
- **Autenticación JWT**: Tokens seguros para API
- **Validación de archivos**: Control de tipos y tamaños
- **Sanitización de datos**: Prevención de SQL injection
- **Auditoría completa**: Registro de todas las acciones

### 8.2 Escalabilidad
- **Arquitectura modular**: Fácil extensión de funcionalidades
- **Multi-tenant**: Soporte para múltiples organizaciones
- **Carga asíncrona**: Módulos cargados bajo demanda
- **API REST**: Separación clara frontend/backend

---

## 9. Configuración y Despliegue

### 9.1 Variables de Entorno
```bash
# Backend
DATABASE_SERVER=192.168.100.125
DATABASE_NAME=AgenteDigitalDB
DATABASE_USER=app_usuario
DATABASE_PASSWORD=ClaveSegura123!

# Frontend
VITE_API_BASE_URL=http://localhost:5000
```

### 9.2 Puertos de Desarrollo
- **Backend**: Puerto 5000
- **Frontend**: Puerto 5173
- **Base de datos**: Puerto 1433

---

## 10. Casos de Uso Detallados

### 10.1 Flujo de Registro de Incidente
1. **Detección**: Usuario identifica un incidente de seguridad
2. **Clasificación**: Sistema sugiere taxonomía según descripción
3. **Registro**: Formulario dinámico se adapta al tipo de incidente
4. **Evidencias**: Carga segura de archivos y documentos
5. **Validación**: Sistema valida campos obligatorios
6. **Generación**: Creación automática de informe ANCI

### 10.2 Flujo de Cumplimiento
1. **Configuración**: Definición de obligaciones regulatorias
2. **Seguimiento**: Monitoreo automático de plazos
3. **Alertas**: Notificaciones de vencimientos próximos
4. **Reportes**: Generación de informes de cumplimiento
5. **Auditoría**: Registro de todas las acciones

---

## 11. Ventajas Competitivas

### 11.1 Características Únicas
- **Formularios dinámicos**: Se adaptan según el tipo de incidente
- **Integración ANCI**: Cumplimiento automático de normativas
- **Sección protegida**: Datos del reportante no editables
- **Multi-tenant**: Soporte para múltiples organizaciones
- **Acompañamiento**: Servicios de consultoría integrados

### 11.2 Beneficios para el Usuario
- **Evita doble digitación**: Informes completos automáticos
- **Cumplimiento garantizado**: Validación según normativas
- **Interfaz moderna**: Experiencia de usuario optimizada
- **Integración completa**: Gestión integral de ciberseguridad

---

## 12. Conclusiones

**AgenteDigital_Flask** representa una solución integral y moderna para la gestión de ciberseguridad y cumplimiento normativo. Su arquitectura modular, tecnologías actuales y enfoque específico en regulaciones ANCI lo convierten en una herramienta indispensable para empresas que requieren cumplir con estrictas normativas de seguridad.

La plataforma destaca por su capacidad de adaptación mediante formularios dinámicos, la generación automática de informes oficiales y su enfoque integral que combina gestión de incidentes, cumplimiento normativo y servicios de acompañamiento en una sola solución.

---

**Documento generado**: `r/fecha_actual`  
**Versión del sistema**: 1.0  
**Última actualización**: 18 de julio de 2025