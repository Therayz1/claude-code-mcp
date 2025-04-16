# Claude - Gemini Code MCP CLI


https://github.com/Therayz1/claude-code-mcp/issues/1#issue-3000610087

## 📝 Açıklama

Claude Code MCP CLI, gelişmiş AI asistan özellikleri içeren Model Context Protocol (MCP) tabanlı bir komut satırı aracıdır. Bu araç, Claude ve Gemini AI modellerini kullanarak yazılım geliştirme ve çeşitli metin tabanlı görevlerde size yardımcı olur.

### ✨ Özellikler

- **İki Farklı AI Modeli Desteği**: Claude ve Gemini AI modelleri ile çalışabilme
- **Sohbet Geçmişi**: Oturumlar halinde devam eden AI konuşmaları yapabilme
- **Syntax Highlighting**: Kod cevapları için renklendirme
- **İnteraktif Dosya Tarayıcısı**: Kolay dosya ve dizin yönetimi
- **Komut Satırı Araçları**: Dosya işlemleri, terminal komutları vb.

## 🚀 Kurulum

### Ön Koşullar

- Node.js 16.x veya daha yeni sürümü
- npm (Node.js ile gelir)

### Otomatik Kurulum

#### Linux / macOS
```bash
# Depoyu klonlayın
git clone https://github.com/Therayz1/claude-code-mcp.git
cd claude-code-mcp

# Kurulum betiğini çalıştırın
chmod +x install.sh
./install.sh
```

#### Windows
```bash
# Depoyu klonlayın
git clone https://github.com/Therayz1/claude-code-mcp.git
cd claude-code-mcp

# Kurulum betiğini çalıştırın
install.bat
```

### Manuel Kurulum Adımları

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/Therayz1/claude-code-mcp.git
   cd claude-code-mcp
   ```

2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```

3. Projeyi derleyin:
   ```bash
   npm run build
   ```

4. (Opsiyonel) Claude AI kullanmak için API anahtarı ekleyin:
   - Claude API anahtarınızı `.env` dosyasına aşağıdaki gibi ekleyin:
     ```
     CLAUDE_API_KEY=your_api_key_here
     ```

## 💻 Kullanım

Uygulamayı başlatmak için:

```bash
npm run start
```

### Her Yerden Çalıştırma

#### Global NPM Paketi Olarak Kurma (Tüm platformlar)
```bash
# Depoyu klonlayın
git clone https://github.com/Therayz1/claude-code-mcp.git
cd claude-code-mcp

# Bağımlılıkları yükleyin ve derleyin
npm install
npm run build

# Global olarak yükleyin
npm install -g .

# Artık her yerden çalıştırabilirsiniz:
claude-mcp
```

#### Windows Batch Dosyası ile Erişim
```bash
# Depoyu klonlayın
git clone https://github.com/Therayz1/claude-code-mcp.git

# Bir batch dosyası oluşturun (claude-mcp.bat):
echo @echo off > claude-mcp.bat
echo node "%~dp0\claude-code-mcp\claude-client.js" %%* >> claude-mcp.bat

# Batch dosyasını PATH'e ekleyin veya Windows dosya sisteminde erişilebilir bir yere koyun
# Artık her yerden çalıştırabilirsiniz:
claude-mcp
```

#### Linux/macOS Sembolik Bağlantı ile Erişim
```bash
# Depoyu klonlayın
git clone https://github.com/Therayz1/claude-code-mcp.git
cd claude-code-mcp

# Bağımlılıkları yükleyin ve derleyin
npm install
npm run build

# Sembolik bağlantı oluşturun
sudo ln -s "$(pwd)/claude-client.js" /usr/local/bin/claude-mcp
chmod +x "$(pwd)/claude-client.js"

# Artık her yerden çalıştırabilirsiniz:
claude-mcp
```

### Kullanılabilir Komutlar

- **claude** <text> - Claude AI'ye bir prompt gönderin
- **gemini** <text> - Gemini AI'ye bir prompt gönderin
- **gemini-agent** <text> - Gemini AI'yi bir agent olarak kullanın
- **bash** <command> - Terminal komutu çalıştırın
- **read** <filepath> - Dosya içeriğini okuyun
- **list** <path> - Dizindeki dosyaları listeleyin
- **browse** - İnteraktif dosya tarayıcısını başlatın
- **edit** <filepath> <content> - Dosya oluşturun veya düzenleyin
- **chat** - Sohbet geçmişi ile çalışan bir oturum başlatın
- **sessions** - Kayıtlı sohbet oturumlarını listeleyin
- **exit** - Uygulamadan çıkın

### Örnekler

```bash
# Claude'a bir istek gönderin
claude Faktöriyel hesaplayan bir JavaScript fonksiyonu yaz

# Gemini'ye bir istek gönderin
gemini Python ile bir web scraper nasıl yazılır?

# Sohbet modunda konuşmaya başlayın
chat
```

## 📖 Yeni Özellikler

### 1. Sohbet Geçmişi
Artık AI modellerle yaptığınız konuşmaları oturumlar halinde kaydedebilir ve istediğiniz zaman devam edebilirsiniz. `chat` komutunu kullanarak bir sohbet başlatın ve `sessions` komutu ile önceki sohbetlerinizi görüntüleyin.

### 2. Syntax Highlighting
AI modellerinden gelen kod yanıtları artık programlama diline özgü olarak renklendirilir, bu da kodu okumanızı ve anlamanızı kolaylaştırır.

### 3. İnteraktif Dosya Tarayıcısı
`browse` komutu ile dosya sisteminizde grafiksel olarak gezinebilir, dosya ve klasörleri seçebilirsiniz.

## 🛠️ Geliştirme

Geliştirme modunda çalıştırmak için:

```bash
npm run dev
```

## 📄 Lisans

Bu proje ISC lisansı altında lisanslanmıştır.

## 👥 Katkıda Bulunanlar

- [Therayz1](https://github.com/Therayz1) - Yapılan geliştirmelerin sahibi
