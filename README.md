# 🌿 Happy Notes - UI UX Pro Max Edition

¡Bienvenido a **Happy Notes**! Una experiencia de productividad inmersiva, elegante y segura, diseñada para capturar tus ideas con un estilo de alta gama y tecnología de vanguardia.

![Login Screen](public/login.png)

## 🌟 Características Pro-Max

### 🧠 Inteligencia Artificial de Voz (Local & Privada)
- **🎤 Dictado Whisper Base**: Integración de OpenAI Whisper (Base) ejecutándose localmente en tu navegador. Transcribe tus ideas con precisión quirúrgica sin que el audio salga de tu ordenador.
- **⚡ Precarga Inteligente**: El cerebro de voz se precarga al iniciar la app, garantizando disponibilidad instantánea cuando la inspiración llega.
- **🎵 Compresión MP3 Hi-Fi**: Codificación automática en segundo plano a **128kbps**. Calidad profesional con un ahorro de espacio del 90%.

### 📑 Gestión de Documentos Inteligente
- **📊 Editor de Excel Directo**: Importa archivos .xlsx y edita sus celdas directamente desde el editor de notas. Añade filas y guarda los cambios como datos estructurados.
- **🖍️ Anotador de PDF**: Añade encabezados y notas personalizadas a tus archivos PDF adjuntos. La app "quema" la anotación en el documento para una persistencia total.
- **🔄 Importación Universal**: Soporte nativo para importar contenido desde Word (.docx) y Excel (.xlsx) transformándolos en notas editables.

### 🛡️ Seguridad y Robustez
- **🔐 Sincronización Blindada**: Nuevo protocolo de sincronización con "Bloqueo de Escritura" que evita la pérdida de datos durante ediciones activas.
- **📂 Almacenamiento Físico Aislado**: El servidor crea automáticamente carpetas privadas en `storage/[user_id]` para cada perfil, garantizando un orden absoluto de tus archivos adjuntos.
- **📌 Pins & Categorías**: Organización multinivel con notas fijadas prioritarias y filtrado dinámico por categorías (Trabajo, Personal, Ideas, etc.).

### ✨ Experiencia de Usuario (UX) Premium
- **🎨 Modal "Captura tu Chispa"**: Un editor refinado y compacto diseñado para la concentración, con estética de cristal y micro-animaciones.
- **🌓 Temas Dinámicos**: Cambia entre múltiples temas (Slate Emerald, Midnight Pro, Sunset Amber, Neon Cyber, Lavender Mist) con escalado de interfaz personalizado.
- **📊 Reportes Maestros**: Genera automáticamente reportes de todas tus notas en Excel o PDF con un solo clic.

## 📸 Galería de la Aplicación

### 🔐 Gestión de Acceso Simple
*Acceso por grid de perfiles o mediante ID de usuario simplificado con cifrado local.*

### 🚀 Mis Notas (Workspace)
*Tu centro de creación con filtrado por categorías y notas fijadas prioritarias.*

### 📅 Calendario Soberano
*Planifica tu tiempo con una vista de calendario integrada y Physics de cristal.*

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

4. **Acceso**: 
   - **Protocolo**: HTTPS (requerido para el uso del Micrófono e IA).
   - **Local**: [https://localhost:8080/](https://localhost:8080/)

### Opción 2: Instalación con Docker 🐳

1. **Clonar e iniciar con Docker Compose**:
   ```bash
   git clone https://github.com/monlow99/happy-notes.git
   cd happy-notes
   docker-compose up -d
   ```

2. **Persistencia**: 
   El contenedor crea volúmenes para `happy-notes.db` y la carpeta `storage/`, asegurando que tus notas, perfiles y archivos de audio no se pierdan.

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Vite + Vanilla CSS Pro-Max.
- **IA**: @huggingface/transformers (Whisper Base WASM).
- **Audio**: lamejs (MP3 Encoder 128kbps).
- **Documentos**: xlsx, docx, mammoth, pdf-lib.
- **Backend**: Node.js + Express.
- **Base de Datos**: SQLite 3.
- **Iconografía**: Lucide React.

---
*Diseñado con ❤️ para elevar el estándar de tus notas diarias y proteger tu privacidad.*
