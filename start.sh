#!/bin/bash
echo "😊 Iniciando Happy Notes..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi
echo "🌐 Servidor arrancando en http://localhost:5173"
npm run dev -- --host
