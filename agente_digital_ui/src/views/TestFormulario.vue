<template>
  <div class="test-formulario">
    <h1 style="color: red; font-size: 48px; text-align: center; margin-top: 50px;">
      NUEVO FORMULARIO DINÁMICO V3 - PRUEBA
    </h1>
    <p style="color: white; text-align: center; font-size: 24px;">
      Si ves este mensaje, el router está funcionando correctamente.
    </p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('🚨🚨🚨 COMPONENTE DE PRUEBA MONTADO 🚨🚨🚨')
})
</script>