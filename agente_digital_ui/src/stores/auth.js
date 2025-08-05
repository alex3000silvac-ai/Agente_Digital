import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // --- ESTADO (STATE) ---
  // Se inicializan las variables reactivas leyendo desde localStorage.
  const rol = ref(localStorage.getItem('userRol') || null)
  const inquilinoId = ref(localStorage.getItem('userInquilinoId') || null)
  const token = ref(localStorage.getItem('token') || null)

  // --- INICIO DE LA CORRECCIÓN ---
  // Descripción: Este bloque se asegura de que si ya existe un token en localStorage
  // al recargar la página, se configure inmediatamente en los encabezados de Axios.
  // Esto evita errores de "No Autorizado" en las llamadas a la API después de recargar.
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }
  // --- FIN DE LA CORRECCIÓN ---

  // --- GETTERS ---
  // Propiedades computadas que derivan del estado.
  const isAuthenticated = computed(() => true) // Temporalmente siempre autenticado
  const isAdmin = computed(() => rol.value === 'Administrador')

  // --- ACCIONES (ACTIONS) ---
  async function login(credentials) {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const data = response.data;
      
      token.value = data.token;
      rol.value = data.rol;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRol', data.rol);
      
      // Configurar el header de autorización para futuras peticiones de axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Redirección se maneja desde el componente

    } catch (error) {
      console.error("Error de autenticación:", error);
      // Lanzar el error para que la vista pueda manejarlo (ej: mostrar un mensaje)
      throw error;
    }
  }

  function logout() {
    token.value = null;
    rol.value = null;
    inquilinoId.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userRol');
    localStorage.removeItem('userInquilinoId');
    delete axios.defaults.headers.common['Authorization'];
    
    // Usar router dinámico para logout
    const router = useRouter();
    router.push({ name: 'Login' });
  }

  // Se retornan todas las propiedades y métodos para que puedan ser usados en los componentes.
  return { token, rol, inquilinoId, isAuthenticated, isAdmin, login, logout }
})