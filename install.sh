#!/bin/bash

# Claude Code MCP CLI kurulum betiği
echo "Claude Code MCP CLI kurulumu başlatılıyor..."

# Node.js'in kurulu olduğunu kontrol et
if ! command -v node &> /dev/null; then
    echo "Node.js kurulu değil! Lütfen önce Node.js'i kurun."
    echo "https://nodejs.org/en/download/ adresinden indirebilirsiniz."
    exit 1
fi

# Node sürümünü kontrol et
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ $NODE_MAJOR -lt 16 ]; then
    echo "Node.js sürümü 16.x veya daha yeni olmalıdır!"
    echo "Mevcut sürüm: $NODE_VERSION"
    echo "Lütfen Node.js'i güncelleyin."
    exit 1
fi

# npm kurulumunu kontrol et
if ! command -v npm &> /dev/null; then
    echo "npm kurulu değil! Lütfen önce npm'i kurun."
    exit 1
fi

# Bağımlılıkları yükle
echo "Gerekli paketler yükleniyor..."
npm install

# Projeyi derle
echo "Proje derleniyor..."
npm run build

# .env dosyası oluştur (eğer yoksa)
if [ ! -f .env ]; then
    echo "# Claude API anahtarınızı buraya ekleyin" > .env
    echo "CLAUDE_API_KEY=your_api_key_here" >> .env
    echo ".env dosyası oluşturuldu. Claude kullanmak için API anahtarınızı ekleyin."
fi

echo "Claude Code MCP CLI kurulumu tamamlandı!"
echo "Başlatmak için: npm run start"

node "C:\Users\erayc\OneDrive\Masaüstü\test\claude-code-mcp\claude-client.js" 