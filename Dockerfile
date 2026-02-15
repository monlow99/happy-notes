# Usamos una imagen ligera de Node.js
FROM node:20-slim

# Directorio de trabajo
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación frontend
RUN npm run build

# Exponemos los puertos: 
# 8080 para el Frontend (Vite Preview)
# 3001 para el Backend (API)
EXPOSE 8080
EXPOSE 3001

# Ejecutamos ambos servicios
# Usamos 'preview' para servir la versión optimizada de producción en el puerto 8080
CMD ["sh", "-c", "npm run server & npm run preview -- --port 8080 --host"]
