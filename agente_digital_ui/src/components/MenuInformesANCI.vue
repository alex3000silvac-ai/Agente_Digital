<template>
  <div class="menu-informes-anci">
    <div class="container">
      <h1 class="titulo-principal">
        <i class="fas fa-file-word me-3"></i>
        Centro de Informes ANCI
      </h1>
      
      <div class="descripcion-principal">
        <p>
          Sistema de generación de informes oficiales ANCI basado en plantillas Word.
          Los informes se generan automáticamente con los datos del incidente.
        </p>
      </div>

      <!-- Opciones principales -->
      <div class="row mt-5">
        <!-- Generar Nuevo Informe -->
        <div class="col-md-6 mb-4">
          <div class="card opcion-card">
            <div class="card-body text-center">
              <div class="icono-grande mb-3">
                <i class="fas fa-file-export"></i>
              </div>
              <h3>Generar Nuevo Informe</h3>
              <p class="text-muted">
                Selecciona un incidente y genera un informe ANCI completo
              </p>
              
              <div class="mt-4">
                <label class="form-label">Seleccionar Incidente:</label>
                <div class="input-group">
                  <input 
                    v-model="incidenteIdSeleccionado" 
                    type="number" 
                    class="form-control" 
                    placeholder="ID del incidente"
                    @keyup.enter="irAGenerarInforme">
                  <button 
                    class="btn btn-primary"
                    @click="irAGenerarInforme"
                    :disabled="!incidenteIdSeleccionado">
                    <i class="fas fa-arrow-right"></i>
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ver Plantillas -->
        <div class="col-md-6 mb-4">
          <div class="card opcion-card">
            <div class="card-body text-center">
              <div class="icono-grande mb-3">
                <i class="fas fa-folder-open"></i>
              </div>
              <h3>Gestionar Plantillas</h3>
              <p class="text-muted">
                Visualiza y configura las plantillas ANCI disponibles
              </p>
              
              <button 
                class="btn btn-secondary mt-4"
                @click="verPlantillas">
                <i class="fas fa-cog me-2"></i>
                Ver Plantillas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Informes Recientes -->
      <div class="seccion-recientes mt-5">
        <h2>
          <i class="fas fa-history me-2"></i>
          Informes Recientes
        </h2>
        
        <div v-if="cargandoRecientes" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div v-else-if="informesRecientes.length === 0" class="alert alert-info">
          No hay informes recientes generados.
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Incidente</th>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="informe in informesRecientes" :key="informe.id">
                <td>#{{ informe.incidente_id }}</td>
                <td>
                  <i class="fas fa-file-word text-primary me-2"></i>
                  {{ informe.nombre }}
                </td>
                <td>
                  <span class="badge" :class="getBadgeClass(informe.tipo)">
                    {{ informe.tipo }}
                  </span>
                </td>
                <td>{{ formatearFecha(informe.fecha) }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-primary"
                    @click="descargarInforme(informe)">
                    <i class="fas fa-download"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Componente de gestión -->
      <div v-if="mostrarGestor" class="mt-5">
        <GestorInformesANCI :incidenteId="incidenteIdGestor" />
      </div>
    </div>
  </div>
</template>

<script>
import GestorInformesANCI from './GestorInformesANCI.vue'
import axios from 'axios'

export default {
  name: 'MenuInformesANCI',
  components: {
    GestorInformesANCI
  },
  data() {
    return {
      incidenteIdSeleccionado: null,
      incidenteIdGestor: null,
      mostrarGestor: false,
      informesRecientes: [],
      cargandoRecientes: false
    }
  },
  mounted() {
    this.cargarInformesRecientes()
  },
  methods: {
    irAGenerarInforme() {
      if (this.incidenteIdSeleccionado) {
        this.incidenteIdGestor = parseInt(this.incidenteIdSeleccionado)
        this.mostrarGestor = true
        
        // Scroll suave hacia el gestor
        this.$nextTick(() => {
          const elemento = document.querySelector('.gestor-informes-anci')
          if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    },
    
    verPlantillas() {
      this.incidenteIdGestor = null
      this.mostrarGestor = true
    },
    
    async cargarInformesRecientes() {
      // Simulación - En producción, crear un endpoint para obtener informes recientes
      this.cargandoRecientes = true
      try {
        // Por ahora mostraremos datos de ejemplo
        this.informesRecientes = [
          {
            id: 1,
            incidente_id: 17,
            nombre: 'Informe_ANCI_17_completo_20240717_143022.docx',
            tipo: 'COMPLETO',
            fecha: new Date()
          }
        ]
      } catch (error) {
        console.error('Error cargando informes recientes:', error)
      } finally {
        this.cargandoRecientes = false
      }
    },
    
    descargarInforme(informe) {
      const url = `/api/informes-anci/descargar/${informe.incidente_id}/${informe.nombre}`
      window.open(url, '_blank')
    },
    
    formatearFecha(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getBadgeClass(tipo) {
      return {
        'bg-primary': tipo === 'COMPLETO',
        'bg-warning text-dark': tipo === 'PRELIMINAR',
        'bg-success': tipo === 'FINAL'
      }
    }
  }
}
</script>

<style scoped>
.menu-informes-anci {
  padding: 30px 0;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.titulo-principal {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.descripcion-principal {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px;
  color: #6c757d;
}

.opcion-card {
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.opcion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-color: #007bff;
}

.icono-grande {
  font-size: 4rem;
  color: #007bff;
}

.seccion-recientes {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.seccion-recientes h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.container {
  max-width: 1200px;
}
</style>