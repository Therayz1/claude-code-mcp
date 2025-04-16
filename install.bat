@echo off
echo Claude Code MCP CLI kurulumu baslatiliyor...

REM Node.js'in kurulu olduğunu kontrol et
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js kurulu degil! Lutfen once Node.js'i kurun.
    echo https://nodejs.org/en/download/ adresinden indirebilirsiniz.
    pause
    exit /b 1
)

REM Node sürümünü kontrol et (basit kontrol)
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_MAJOR=%%a
)
set NODE_MAJOR=%NODE_MAJOR:~1%

if %NODE_MAJOR% LSS 16 (
    echo Node.js surumu 16.x veya daha yeni olmalidir!
    echo Mevcut surum: %NODE_MAJOR%
    echo Lutfen Node.js'i guncelleyin.
    pause
    exit /b 1
)

REM npm kurulumunu kontrol et
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm kurulu degil! Lutfen once npm'i kurun.
    pause
    exit /b 1
)

REM Bağımlılıkları yükle
echo Gerekli paketler yukleniyor...
call npm install

REM Projeyi derle
echo Proje derleniyor...
call npm run build

REM .env dosyası oluştur (eğer yoksa)
if not exist .env (
    echo # Claude API anahtarinizi buraya ekleyin > .env
    echo CLAUDE_API_KEY=your_api_key_here >> .env
    echo .env dosyasi olusturuldu. Claude kullanmak icin API anahtarinizi ekleyin.
)

echo Claude Code MCP CLI kurulumu tamamlandi!
echo Baslatmak icin: npm run start
pause 