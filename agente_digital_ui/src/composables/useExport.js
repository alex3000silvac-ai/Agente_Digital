// Composable para manejo de exportaciones
import { useToast } from './useToast.js'

export const useExport = () => {
  const { success, error, info } = useToast()

  // Función genérica para descargar archivos
  const downloadFile = async (url, filename, format = 'txt') => {
    try {
      info(`Preparando descarga de ${format.toUpperCase()}...`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': getAcceptHeader(format)
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al exportar')
      }

      // Crear blob y descargar
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      success(`Archivo ${format.toUpperCase()} descargado correctamente`)
      
    } catch (err) {
      error(`Error al exportar: ${err.message}`)
      throw err
    }
  }

  // Obtener header Accept según formato
  const getAcceptHeader = (format) => {
    const headers = {
      'txt': 'text/plain',
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    return headers[format] || 'text/plain'
  }

  // Exportar reporte ANCI
  const exportarReporteAnci = async (reporteId, formato = 'txt') => {
    const filename = `reporte_anci_${reporteId}.${formato}`
    const url = `http://localhost:5000/api/admin/reportes-anci/${reporteId}/exportar/${formato}`
    
    await downloadFile(url, filename, formato)
  }

  // Exportar expediente semilla
  const exportarIncidente = async (incidenteId, formato = 'txt') => {
    const filename = `expediente_${incidenteId}.${formato}`
    const url = `http://localhost:5000/api/admin/incidentes/${incidenteId}/exportar/${formato}`
    
    await downloadFile(url, filename, formato)
  }

  // Función para mostrar opciones de formato
  const mostrarOpcionesExportacion = (onFormatSelected) => {
    const formatos = [
      { value: 'txt', label: 'Texto Plano (.txt)', icon: 'ph-file-text' },
      { value: 'pdf', label: 'PDF (.pdf)', icon: 'ph-file-pdf' },
      { value: 'docx', label: 'Word (.docx)', icon: 'ph-file-doc' }
    ]

    // Por ahora, simplemente usar el primer formato disponible
    // TODO: Implementar modal de selección de formato
    if (onFormatSelected) {
      onFormatSelected('txt')
    }
    
    return formatos
  }

  // Validar si el formato es soportado
  const isFormatoSoportado = (formato) => {
    return ['txt', 'pdf', 'docx'].includes(formato.toLowerCase())
  }

  // Obtener extensión de archivo según formato
  const getExtension = (formato) => {
    const extensions = {
      'txt': 'txt',
      'pdf': 'pdf', 
      'docx': 'docx'
    }
    return extensions[formato] || 'txt'
  }

  // Obtener icono según formato
  const getFormatIcon = (formato) => {
    const icons = {
      'txt': 'ph-file-text',
      'pdf': 'ph-file-pdf',
      'docx': 'ph-file-doc'
    }
    return icons[formato] || 'ph-file'
  }

  // Obtener descripción del formato
  const getFormatDescription = (formato) => {
    const descriptions = {
      'txt': 'Archivo de texto plano fácil de copiar y pegar',
      'pdf': 'Documento PDF para presentación profesional',
      'docx': 'Documento Word editable para personalización'
    }
    return descriptions[formato] || 'Formato de archivo'
  }

  return {
    downloadFile,
    exportarReporteAnci,
    exportarIncidente,
    mostrarOpcionesExportacion,
    isFormatoSoportado,
    getExtension,
    getFormatIcon,
    getFormatDescription
  }
}