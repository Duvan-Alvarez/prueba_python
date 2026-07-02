#!/bin/bash
# Script para configurar Railway

echo "🚀 Configuración de Railway para Prueba Técnica"
echo "================================================"
echo ""

# Verificar si railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado"
    echo "Descárgalo desde: https://railway.app/cli"
    exit 1
fi

echo "✓ Railway CLI encontrado"
echo ""

# Login
echo "1. Iniciando sesión en Railway..."
railway login
echo ""

# Crear proyecto
echo "2. Creando proyecto (opcional)..."
read -p "¿Conectar con GitHub? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    railway init
fi
echo ""

# Configurar variables de entorno
echo "3. Configurando variables de entorno..."
echo ""

read -p "ANTHROPIC_API_KEY (sk-ant-...): " ANTHROPIC_API_KEY
read -p "ADMIN_PASSWORD (mínimo 8 caracteres): " ADMIN_PASSWORD
read -p "ADMIN_USER (default: admin): " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}

echo ""
echo "Configurando variables..."

railway variable set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
railway variable set ADMIN_USER="$ADMIN_USER"
railway variable set ADMIN_PASSWORD="$ADMIN_PASSWORD"
railway variable set NODE_ENV="production"
railway variable set DATABASE_PATH="/data/prueba_tecnica.json"
railway variable set TEST_TIME_LIMIT="2700"

echo "✓ Variables configuradas"
echo ""

# Desplegar
read -p "¿Desplegar ahora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Iniciando deploy..."
    railway up
fi

echo ""
echo "✓ Configuración completada"
echo ""
echo "Próximos pasos:"
echo "1. Ve a https://railway.app y abre tu proyecto"
echo "2. Espera a que el build termine (2-5 minutos)"
echo "3. Haz clic en el deployment para ver los logs"
echo "4. Copia la URL de tu app y úsala en FRONTEND_URL"
