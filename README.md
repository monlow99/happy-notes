# 🌿 Happy Notes - UI UX Pro Max Edition

¡Bienvenido a **Happy Notes**! Una experiencia de productividad inmersiva, elegante y segura, diseñada para capturar tus ideas con un estilo de alta gama.

![Login Screen](public/login.png)

## 🌟 Características Pro-Max

- **🏷️ Categorías y Etiquetas**: Organiza tus notas en secciones (General, Trabajo, Personal, Ideas) para un acceso rápido y ordenado.
- **📌 Notas Fijadas (Pins)**: Mantén tus pensamientos más importantes siempre arriba con la función de fijado prioritario.
- **🌓 Modo Dual (Claro/Oscuro)**: Cambia instantáneamente entre el elegante tema *Slate Emerald* (oscuro) y el limpio *Snow Emerald* (claro).
- **📥 Exportación Avanzada**: Guarda tus notas individualmente en **TXT**, genera reportes completos en **Excel (.xlsx)** con toda la data formateada, o imprime un reporte maestro en **PDF** con un diseño profesional.
- **💾 Copias de Seguridad**: Exporta toda tu información en **JSON** para una portabilidad total.
- **🔐 Acceso Simplificado**: Inicia sesión con un **Nombre de Usuario** fácil de recordar (¡sin números largos!) y tu PIN.
- **🌐 Sincronización Multi-Dispositivo**: Base de datos centralizada en **SQLite**. Accede a tus notas desde cualquier dispositivo de tu red local.
- **🚀 Arquitectura Full-Stack**: Integridad de datos gestionada por un servidor Node.js/Express de alto rendimiento.

## 📸 Galería de la Aplicación

### 🔐 Gestión de Acceso Simple
*Acceso por grid de perfiles o mediante ID de usuario simplificado.*

### 🚀 Mis Notas (Workspace)
*Tu centro de creación con filtrado por categorías y notas fijadas prioritarias.*

### 📅 Calendario Soberano
*Planifica tu tiempo con una vista de calendario integrada y Physics de cristal.*

### 🌓 Personalización
*Intercambio dinámico de temas para adaptarse a tu entorno de trabajo.*

## 🚀 Instalación y Uso

### Opción 1: Instalación Estándar (Node.js)

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/monlow99/happy-notes.git
   cd happy-notes
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar la Aplicación Completa**:
   ```bash
   ./start.sh
   ```
   Este script inicia automáticamente tanto el servidor de base de datos como el frontend.

   **Alternativamente**, puedes ejecutarlos por separado:
   - Terminal 1 (Base de Datos): `npm run server`
   - Terminal 2 (Frontend): `npm run dev`
   
   *Nota: La aplicación detectará automáticamente tu ubicación para el clima en tiempo real.*

4. **Acceso**: 
   - **Local**: [http://localhost:8080/](http://localhost:8080/)
   - **Desde otros dispositivos**: `http://[IP-DE-TU-PC]:8080/`

### Opción 2: Instalación con Docker 🐳

Si prefieres desplegar Happy Notes en un servidor usando Docker, puedes hacerlo de forma rápida:

1. **Clonar e iniciar con Docker Compose**:
   ```bash
   git clone https://github.com/monlow99/happy-notes.git
   cd happy-notes
   docker-compose up -d
   ```

2. **Persistencia**: 
   El contenedor crea un volumen para el archivo `happy-notes.db`, asegurando que tus notas y perfiles no se pierdan al reiniciar el contenedor.

3. **Acceso**:
   La aplicación estará disponible en el puerto **8080**.

## 🛠️ Stack Tecnológico

- **React 18/19** - El corazón de la reactividad.
- **Vite** - Bundler ultra-rápido.
- **SQLite 3** - Persistencia de datos robusta y ligera.
- **Lucide React** - Iconografía profesional y consistente.
- **Vanilla CSS** - Diseño puro con variables y efectos Pro-Max altamente responsivos.
- **Open-Meteo & OpenStreetMap** - Datos ambientales en tiempo real.

---
*Diseñado con ❤️ para elevar el estándar de tus notas diarias.*
