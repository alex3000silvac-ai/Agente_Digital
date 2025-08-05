<template>
  <div class="page-container">
    <h1 class="page-header">Gestión de Acompañamiento</h1>
    <p class="page-subheader">Supervise el estado de cumplimiento de las obligaciones para cada empresa.</p>

    <div class="toolbar">
      <div class="selector-container">
        <label for="empresa-selector" class="selector-label">Supervisando a:</label>
        <select autocomplete="off" id="empresa-selector" class="form-input select-input">
          <option value="1">Empresa de Telecomunicaciones Global S.A.</option>
          <option value="2">Banco Nacional de Finanzas</option>
        </select>
      </div>
      <button class="btn-primary">Generar Reporte PDF</button>
    </div>

    <div class="card-dark">
      <table class="data-table-dark">
        <thead>
          <tr>
            <th>Artículo</th>
            <th>Descripción de la Obligación</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Art. 9</td>
            <td>Implementar un Sistema de Gestión de Seguridad de la Información (SGSI) continuo.</td>
            <td class="text-center">
              <span class="badge status-cumplido">Cumplido</span>
            </td>
            <td class="text-center action-cell">
              <button title="Ver Evidencia">📄</button>
              <button title="Ver Comentarios">💬</button>
            </td>
          </tr>
          <tr>
            <td>Art. 11</td>
            <td>Establecer un procedimiento operativo para reportar incidentes de efecto significativo al CSIRT Nacional.</td>
            <td class="text-center">
              <span class="badge status-pendiente">Pendiente</span>
            </td>
            <td class="text-center action-cell">
              <button title="Ver Evidencia">📄</button>
              <button title="Ver Comentarios">💬</button>
            </td>
          </tr>
          <tr>
            <td>Art. 22</td>
            <td>Ejecutar un programa anual de ejercicios y simulacros, incluyendo pruebas de penetración.</td>
            <td class="text-center">
              <span class="badge status-vencido">Vencido</span>
            </td>
            <td class="text-center action-cell">
              <button title="Ver Evidencia">📄</button>
              <button title="Ver Comentarios">💬</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// Por ahora, este componente es solo visual. La lógica la añadiremos después.
</script>