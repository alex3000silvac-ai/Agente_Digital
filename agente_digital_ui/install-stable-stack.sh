#!/bin/bash

echo "🛡️ Instalando Stack Ultra-Estable para Agente Digital UI"
echo "========================================================"

# Limpiar instalación anterior
echo "🧹 Limpiando instalación anterior..."
rm -rf node_modules package-lock.json

# Instalar dependencias principales con versiones estables
echo "📦 Instalando dependencias principales..."
npm install vue@3.3.8 vue-router@4.2.5 pinia@2.1.7 \
  primevue@3.46.0 primeicons@6.0.1 \
  @vueuse/motion@2.0.0 animate.css@4.1.1 \
  chart.js@4.4.0 vue-chartjs@5.2.0 \
  @heroicons/vue@2.0.18 lucide-vue-next@0.292.0 \
  apexcharts@3.44.0 vue3-apexcharts@1.4.4 \
  @headlessui/vue@1.7.16 \
  @sentry/vue@7.78.0 web-vitals@3.5.0 \
  axios@1.7.2 html2canvas@1.4.1 jspdf@3.0.1

# Instalar dependencias de desarrollo
echo "🔧 Instalando dependencias de desarrollo..."
npm install --save-dev @vitejs/plugin-vue@4.4.0 \
  vite@4.5.0 rollup@3.29.4 esbuild@0.19.5 \
  eslint@8.57.0 prettier@3.2.5 \
  @vue/eslint-config-typescript@13.0.0 \
  vitest@1.3.0 @vue/test-utils@2.4.4 \
  husky@9.0.11 lint-staged@15.2.2 \
  vite-plugin-compression@0.5.1 \
  rollup-plugin-gzip@3.1.0 \
  vite-plugin-imagemin@0.6.1 \
  imagemin-webp@8.0.0 \
  rollup-plugin-visualizer@5.12.0 \
  autoprefixer@10.4.19 \
  postcss@8.4.38 \
  tailwindcss@3.4.3 \
  concurrently@8.2.2

# Configurar Husky para pre-commit hooks
echo "🪝 Configurando Husky..."
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# Crear archivo de configuración para lint-staged
echo "📝 Creando configuración de lint-staged..."
cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,ts,vue}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss,json,md}": [
    "prettier --write"
  ]
}
EOF

echo "✅ Instalación completada!"
echo ""
echo "🚀 Próximos pasos:"
echo "1. npm run health-check - Verificar salud de las dependencias"
echo "2. npm run dev - Iniciar en modo desarrollo"
echo "3. npm run build - Construir para producción"
echo ""
echo "💡 Comandos útiles:"
echo "- npm run backup - Hacer backup automático"
echo "- npm run restore - Restaurar backup anterior"
echo "- npm run fix-deps - Reparar dependencias si hay problemas"