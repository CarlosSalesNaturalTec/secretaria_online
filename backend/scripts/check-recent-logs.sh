#!/bin/bash

# Script para verificar logs recentes relacionados a contratos
# Uso: bash scripts/check-recent-logs.sh

echo "=== Verificando Logs Recentes de Contratos ==="
echo ""

# Verificar se diretório de logs existe
if [ ! -d "logs" ]; then
    echo "❌ Diretório logs/ não encontrado"
    exit 1
fi

echo "📋 Logs de Erro (error.log):"
echo "================================"
if [ -f "logs/error.log" ]; then
    echo "Últimas 30 linhas com 'contract' ou 'Contract':"
    grep -i "contract" logs/error.log | tail -n 30
    echo ""
else
    echo "⚠️  Arquivo error.log não encontrado"
fi

echo ""
echo "📋 Logs Combinados (combined.log):"
echo "================================"
if [ -f "logs/combined.log" ]; then
    echo "Últimas 30 linhas com 'contract' ou 'Contract':"
    grep -i "contract" logs/combined.log | tail -n 30
    echo ""
else
    echo "⚠️  Arquivo combined.log não encontrado"
fi

echo ""
echo "📋 Logs do PM2:"
echo "================================"
echo "Últimas 50 linhas:"
pm2 logs secretaria-online --lines 50 --nostream 2>/dev/null || echo "⚠️  PM2 não está rodando ou aplicação não encontrada"

echo ""
echo "=== Fim da Verificação de Logs ==="
