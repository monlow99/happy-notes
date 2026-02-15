#!/bin/bash

# 🌿 Happy Notes - Launcher Script
# Este script inicia automáticamente el servidor de base de datos y el frontend

echo "🚀 Iniciando Happy Notes..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz de happy-notes"
    exit 1
fi

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $SERVER_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar servidor de base de datos en segundo plano
echo -e "${BLUE}📊 Iniciando servidor de base de datos...${NC}"
npm run server &
SERVER_PID=$!
sleep 2

# Iniciar frontend en segundo plano
echo -e "${GREEN}🎨 Iniciando interfaz frontend...${NC}"
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "✅ Happy Notes está ejecutándose:"
echo "   📊 Servidor DB: http://localhost:3001"
echo "   🎨 Frontend:    https://localhost:5174"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"
echo ""

# Mantener el script corriendo
wait
