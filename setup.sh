#!/bin/bash
# MediCare — script de setup do ambiente
# Equivalente ao `python -m venv venv && pip install -r requirements.txt`
# Em Node.js, node_modules é o ambiente local isolado por projeto.

set -e

echo "🔧 Verificando Node.js..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado. Instale a versão LTS em: https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "⚠️  Node.js v$NODE_VERSION detectado. Recomendado: v18 ou superior."
  echo "   Use nvm: nvm install 18 && nvm use 18"
fi

# SDK 54 usa React 19 + react-native 0.79 — compatível com Node 18+

echo "✅ Node.js $(node -v) detectado"
echo ""
echo "📦 Instalando dependências (node_modules — ambiente isolado do projeto)..."
# --legacy-peer-deps necessário para compatibilidade entre expo-status-bar e react-navigation
npm install --legacy-peer-deps

echo ""
echo "✅ Ambiente configurado com sucesso!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  PRÓXIMO PASSO OBRIGATÓRIO:"
echo "   Configure suas credenciais do Firebase em:"
echo "   src/config/firebase.js"
echo ""
echo "   Siga as instruções no arquivo para obter"
echo "   as credenciais em console.firebase.google.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "▶  Para iniciar o app:"
echo "   npx expo start"
echo ""
echo "📱 Escaneie o QR code com o app Expo Go no celular."
