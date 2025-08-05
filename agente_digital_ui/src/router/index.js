import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Vistas Generales
import LoginView from '../views/LoginView.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

// Vistas de Gestión de Clientes
import VistaInquilinos from '../views/VistaInquilinos.vue';
import VistaEmpresas from '../views/VistaEmpresas.vue';

// Vistas de Módulo de Acompañamiento
import ModuloAcompanamiento from '../components/ModuloAcompanamiento.vue';
import InformeCumplimiento from '../views/InformeCumplimiento.vue';

// Vistas de Módulo de Incidentes
import DeclararIncidenteV3 from '../views/DeclararIncidenteV3.vue';
import TestFormulario from '../views/TestFormulario.vue';
import VistaDetalleIncidente from '../views/VistaDetalleIncidente.vue';
import VistaListaIncidentes from '../views/VistaListaIncidentes.vue';

// Vistas de Gestión Adicionales
import GestionObligaciones from '../views/GestionObligaciones.vue';
import GestionTaxonomia from '../views/GestionTaxonomia.vue';
import GestionSoluciones from '../views/GestionSoluciones.vue';
import VistaConsistencia from '../views/VistaConsistencia.vue';

// Vistas de Administración
import CrearInquilinosEmpresas from '../views/CrearInquilinosEmpresas.vue';
// import AdministracionUsuarios from '../views/AdministracionUsuarios.vue'; // Módulo eliminado
import LogsAuditoria from '../views/LogsAuditoria.vue';

// Sistema de Gestión de Contraseñas y Seguridad
import PasswordManagementModule from '../views/PasswordManagementModule.vue';

// Sistema de Accesos de Clientes
import AccesosClientesModule from '../views/AccesosClientesModule.vue';

const routes = [
  // Rutas base
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true } },

  // Rutas de Supervisión/Gestión de Clientes
  { path: '/gestion/inquilinos', name: 'VistaInquilinos', component: VistaInquilinos, meta: { requiresAuth: true } },
  { path: '/inquilino/:inquilinoId/empresas', name: 'VistaEmpresas', component: VistaEmpresas, props: true, meta: { requiresAuth: true }},
  
  // --- RUTAS DE ACOMPAÑAMIENTO (CORREGIDAS Y COMPLETAS) ---
  { 
    path: '/inquilino/:inquilinoId/empresa/:empresaId/acompanamiento', // <-- RUTA CORREGIDA
    name: 'ModuloAcompanamiento', 
    component: ModuloAcompanamiento, 
    props: true, 
    meta: { requiresAuth: true }
  },
  {
    path: '/inquilino/:inquilinoId/empresa/:empresaId/informe-cumplimiento',
    name: 'InformeCumplimiento',
    component: InformeCumplimiento,
    props: true,
    meta: { requiresAuth: true }
  },

  // --- RUTAS DE INCIDENTES (COMPLETAS) ---
  { 
    path: '/inquilino/:inquilinoId/empresa/:empresaId/incidentes', 
    name: 'VistaListaIncidentes',
    component: VistaListaIncidentes, 
    props: true, 
    meta: { requiresAuth: true }
  },
  
  // Ruta principal para declarar incidentes (Formulario Dinámico V3)
  { 
    path: '/empresa/:empresaId/incidentes/declarar', 
    name: 'DeclararIncidente', 
    component: () => import('../views/DeclararIncidenteV3.vue'), 
    props: true, 
    meta: { requiresAuth: true }
  },
  // Ruta alternativa explícita para el nuevo formulario dinámico
  { 
    path: '/empresa/:empresaId/incidentes/declarar-v3/:incidenteId?', 
    name: 'DeclararIncidenteV3', 
    component: DeclararIncidenteV3, 
    props: true, 
    meta: { requiresAuth: true }
  },
  {
    path: '/incidente-detalle/:incidenteId',
    name: 'VistaDetalleIncidente',
    component: VistaDetalleIncidente,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/informes-anci/:incidenteId',
    name: 'InformesANCI',
    component: () => import('../views/VistaInformesANCI.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/cuenta-regresiva-anci/:inquilinoId?',
    name: 'CuentaRegresivaANCI',
    component: () => import('../views/VistaCuentaRegresiva.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/expediente-semilla/:incidenteId',
    name: 'ExpedienteSemilla',
    component: () => import('../views/VistaExpedienteSemilla.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/cuenta-regresiva-detalle/:incidenteId',
    name: 'CuentaRegresivaDetalle',
    component: () => import('../views/VistaCuentaRegresivaDetalle.vue'),
    props: true,
    meta: { requiresAuth: true }
  },

  // --- RUTAS DE GESTIÓN ADICIONALES ---
  { 
    path: '/gestion/obligaciones', 
    name: 'GestionObligaciones', 
    component: GestionObligaciones, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/gestion/taxonomia', 
    name: 'GestionTaxonomia', 
    component: GestionTaxonomia, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/gestion-soluciones', 
    name: 'GestionSoluciones', 
    component: GestionSoluciones, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/consistencia', 
    name: 'VistaConsistencia', 
    component: VistaConsistencia, 
    meta: { requiresAuth: true } 
  },

  // --- SISTEMA DE GESTIÓN DE CONTRASEÑAS Y SEGURIDAD ---
  { 
    path: '/admin/password-management', 
    name: 'PasswordManagement', 
    component: PasswordManagementModule, 
    meta: { 
      requiresAuth: true,
      requiredRole: 'Superusuario' // Solo superusuarios pueden acceder
    } 
  },

  // --- SISTEMA DE ACCESOS DE CLIENTES ---
  { 
    path: '/admin/accesos-clientes', 
    name: 'AccesosClientes', 
    component: AccesosClientesModule, 
    meta: { 
      requiresAuth: true,
      requiredRole: 'Administrador' // Administradores y superusuarios pueden acceder
    } 
  },

  // --- RUTAS DE ADMINISTRACIÓN ---
  { 
    path: '/gestion/crear-inquilinos-empresas', 
    name: 'CrearInquilinosEmpresas', 
    component: CrearInquilinosEmpresas, 
    meta: { requiresAuth: true } 
  },
  // Ruta eliminada: /gestion/administracion-usuarios-inquilinos-empresas
  { 
    path: '/gestion/logs-auditoria', 
    name: 'LogsAuditoria', 
    component: LogsAuditoria, 
    meta: { requiresAuth: true } 
  },

  // Ruta catch-all para manejar rutas no encontradas
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Guardia de Navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Evitar bucles de redirección
  if (to.path === from.path) {
    return next(false);
  }
  
  // Manejar rutas no válidas que incluyan "login/dashboard"
  if (to.path.includes('/login/dashboard')) {
    return next({ name: 'AdminDashboard' });
  }
  
  // Autenticación requerida
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }
  
  next();
});

export default router;