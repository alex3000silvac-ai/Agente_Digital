<template>
  <div class="seccion-dinamica">
    <div v-for="campo in campos" :key="campo.nombre" class="mb-3">
      <!-- Campo de texto -->
      <div v-if="campo.tipo === 'text'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <input
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          type="text"
          class="form-control"
          :placeholder="campo.placeholder"
          :required="campo.requerido"
          :readonly="campo.soloLectura"
          :disabled="!cumpleCondicional(campo)"
        />
      </div>

      <!-- Campo checkbox -->
      <div v-else-if="campo.tipo === 'checkbox'" class="form-check">
        <input
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          type="checkbox"
          class="form-check-input"
          :disabled="!cumpleCondicional(campo)"
        />
        <label :for="campo.nombre" class="form-check-label">
          {{ campo.etiqueta }}
        </label>
      </div>

      <!-- Campo select -->
      <div v-else-if="campo.tipo === 'select'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <select
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          class="form-select"
          :required="campo.requerido && cumpleCondicional(campo)"
          :disabled="!cumpleCondicional(campo)"
        >
          <option value="">Seleccione...</option>
          <option v-for="opcion in campo.opciones" :key="opcion" :value="opcion">
            {{ opcion }}
          </option>
        </select>
      </div>

      <!-- Campo textarea -->
      <div v-else-if="campo.tipo === 'textarea'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <textarea
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          class="form-control"
          :rows="campo.filas || 3"
          :placeholder="campo.placeholder"
          :required="campo.requerido && cumpleCondicional(campo)"
          :disabled="!cumpleCondicional(campo)"
        ></textarea>
      </div>

      <!-- Campo datetime-local -->
      <div v-else-if="campo.tipo === 'datetime-local'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <input
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          type="datetime-local"
          class="form-control"
          :required="campo.requerido"
          :readonly="campo.soloLectura"
          :disabled="!cumpleCondicional(campo)"
        />
      </div>

      <!-- Campo radio -->
      <div v-else-if="campo.tipo === 'radio'" class="form-group">
        <label class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <div v-for="opcion in campo.opciones" :key="opcion" class="form-check">
          <input
            :id="`${campo.nombre}_${opcion}`"
            v-model="valores[campo.nombre]"
            type="radio"
            class="form-check-input"
            :value="opcion"
            :disabled="!cumpleCondicional(campo)"
          />
          <label :for="`${campo.nombre}_${opcion}`" class="form-check-label">
            {{ opcion }}
          </label>
        </div>
      </div>
    </div>

    <!-- Información adicional (para CSIRT) -->
    <div v-if="informacionContacto" class="alert alert-info mt-4">
      <h6 class="alert-heading">
        <i class="fas fa-info-circle"></i> {{ informacionContacto.titulo }}
      </h6>
      <div class="small">
        <p class="mb-1"><strong>Teléfono:</strong> {{ informacionContacto.telefono }}</p>
        <p class="mb-1"><strong>Email:</strong> {{ informacionContacto.email }}</p>
        <p class="mb-1"><strong>Web:</strong> {{ informacionContacto.web }}</p>
        <p class="mb-0"><strong>Horario:</strong> {{ informacionContacto.horario }}</p>
      </div>
    </div>

    <!-- Validaciones específicas -->
    <div v-if="validaciones && valores.solicitarAyudaCSIRT" class="alert alert-warning mt-3">
      <small>
        <strong>Tiempo de respuesta esperado:</strong>
        <ul class="mb-0">
          <li v-for="(tiempo, nivel) in validaciones.tiempoRespuestaEsperado" :key="nivel">
            {{ nivel }}: {{ tiempo }}
          </li>
        </ul>
      </small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeccionDinamica',
  props: {
    configuracion: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      valores: {}
    };
  },
  computed: {
    campos() {
      try {
        const config = JSON.parse(this.configuracion.CamposJSON || '{}');
        return config.campos || [];
      } catch (e) {
        console.error('Error parseando campos:', e);
        return [];
      }
    },
    informacionContacto() {
      try {
        const config = JSON.parse(this.configuracion.CamposJSON || '{}');
        return config.informacionContacto || null;
      } catch (e) {
        return null;
      }
    },
    validaciones() {
      try {
        const config = JSON.parse(this.configuracion.CamposJSON || '{}');
        return config.validaciones || null;
      } catch (e) {
        return null;
      }
    }
  },
  watch: {
    valores: {
      handler(newVal) {
        this.$emit('update:modelValue', newVal);
      },
      deep: true
    },
    modelValue: {
      handler(newVal) {
        this.valores = { ...newVal };
      },
      immediate: true
    }
  },
  mounted() {
    // Inicializar valores por defecto
    this.campos.forEach(campo => {
      if (campo.valorDefecto !== undefined && this.valores[campo.nombre] === undefined) {
        this.$set(this.valores, campo.nombre, campo.valorDefecto);
      }
    });

    // Para campos de fecha/hora automáticos
    this.campos.forEach(campo => {
      if (campo.nombre === 'fechaSolicitudCSIRT' && campo.soloLectura) {
        this.$watch(
          () => this.valores.solicitarAyudaCSIRT,
          (newVal) => {
            if (newVal && !this.valores.fechaSolicitudCSIRT) {
              const now = new Date();
              const formatted = now.toISOString().slice(0, 16);
              this.$set(this.valores, 'fechaSolicitudCSIRT', formatted);
            }
          }
        );
      }
    });
  },
  methods: {
    cumpleCondicional(campo) {
      if (!campo.condicional) return true;
      
      // Evaluar condicional simple (un solo campo)
      if (typeof campo.condicional === 'string') {
        return !!this.valores[campo.condicional];
      }
      
      // Para condicionales más complejos en el futuro
      return true;
    },
    
    validarSeccion() {
      let esValida = true;
      const errores = [];
      
      this.campos.forEach(campo => {
        if (campo.requerido && this.cumpleCondicional(campo)) {
          const valor = this.valores[campo.nombre];
          if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
            esValida = false;
            errores.push(`${campo.etiqueta} es requerido`);
          }
        }
      });
      
      return { esValida, errores };
    },
    
    obtenerPorcentajeCompletado() {
      const camposRelevantes = this.campos.filter(campo => 
        campo.tipo !== 'hidden' && this.cumpleCondicional(campo)
      );
      
      if (camposRelevantes.length === 0) return 0;
      
      const camposCompletos = camposRelevantes.filter(campo => {
        const valor = this.valores[campo.nombre];
        return valor !== undefined && valor !== '' && valor !== false;
      });
      
      return Math.round((camposCompletos.length / camposRelevantes.length) * 100);
    }
  }
};
</script>

<style scoped>
.seccion-dinamica {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
}

.form-control:disabled,
.form-select:disabled {
  background-color: #f8f9fa;
  opacity: 0.65;
}

.form-check-input:disabled + .form-check-label {
  opacity: 0.65;
}

.alert-info {
  border-left: 4px solid #0dcaf0;
}

.alert-warning {
  border-left: 4px solid #ffc107;
}

/* Estilos para campos requeridos */
.form-control:required:valid,
.form-select:required:valid {
  border-color: #198754;
}

.form-control:required:invalid:not(:placeholder-shown),
.form-select:required:invalid:not([value=""]) {
  border-color: #dc3545;
}

/* Animación para campos condicionales */
.form-group {
  transition: opacity 0.3s ease;
}

.form-group:has(:disabled) {
  opacity: 0.7;
}
</style>