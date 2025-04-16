import * as path from 'path';
import * as readline from 'readline';
import inquirer from 'inquirer';
import { AIClient } from './ai-client.js';
import { TerminalUI } from './terminal-ui.js';
import { ChatHistoryManager } from '../utils/chat-history.js';
import { browseFolders, selectFile, createNewFile } from '../utils/file-browser.js';

/**
 * Komut işleyici sınıfı
 */
export class CommandHandler {
  private aiClient: AIClient;
  private chatHistory: ChatHistoryManager;
  private rl: readline.Interface;

  /**
   * Constructor
   * @param aiClient AI istemcisi
   * @param chatHistory Sohbet geçmişi yöneticisi
   * @param rl readline arayüzü
   */
  constructor(aiClient: AIClient, chatHistory: ChatHistoryManager, rl: readline.Interface) {
    this.aiClient = aiClient;
    this.chatHistory = chatHistory;
    this.rl = rl;
  }

  /**
   * Komut işleme
   * @param input Kullanıcı girdisi
   */
  async handleCommand(input: string): Promise<void> {
    try {
      const parts = input.split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');

      switch (command) {
        case 'claude':
          await this.handleClaude(args);
          break;
        case 'gemini':
          await this.handleGemini(args);
          break;
        case 'gemini-agent':
          await this.handleGeminiAgent(args);
          break;
        case 'bash':
          await this.handleBash(args);
          break;
        case 'read':
          await this.handleRead(args);
          break;
        case 'list':
          await this.handleList(args);
          break;
        case 'browse':
          await this.handleBrowse();
          break;
        case 'edit':
          await this.handleEdit(parts.slice(1));
          break;
        case 'chat':
          await this.handleChat();
          break;
        case 'sessions':
          await this.handleSessions();
          break;
        case 'help':
          TerminalUI.printHelp();
          break;
        case 'exit':
          TerminalUI.showInfo("MCP CLI'dan çıkılıyor...");
          process.exit(0);
          break;
        default:
          TerminalUI.showError(`Bilinmeyen komut: ${command}. Komut listesi için 'help' yazın.`);
      }
    } catch (error) {
      TerminalUI.showError(`Komut işleme hatası: ${error}`);
    }
  }

  /**
   * Claude komutu işleme
   * @param args Argümanlar
   */
  private async handleClaude(args: string): Promise<void> {
    if (!args) {
      TerminalUI.showError(`Lütfen bir prompt girin. Örnek: ${TerminalUI.colors.primary}claude${TerminalUI.colors.reset} Faktöriyel hesaplayan bir JavaScript fonksiyonu yaz`);
      return;
    }

    try {
      // Claude'u çağır
      const response = await this.aiClient.callClaude(args, false);
      TerminalUI.displayAIResponse(response, 'Claude');

      // Kullanıcıya yanıtı kaydetme seçeneği sun
      await this.askToSaveResponse(response);
    } catch (error) {
      TerminalUI.showError(`Claude hatası: ${error}`);
    }
  }

  /**
   * Gemini komutu işleme
   * @param args Argümanlar
   */
  private async handleGemini(args: string): Promise<void> {
    if (!args) {
      TerminalUI.showError(`Lütfen bir prompt girin. Örnek: ${TerminalUI.colors.primary}gemini${TerminalUI.colors.reset} Python ile bir web scraper nasıl yazılır?`);
      return;
    }

    try {
      // Gemini'yi çağır
      const response = await this.aiClient.callGemini(args, false);
      TerminalUI.displayAIResponse(response, 'Gemini');

      // Kullanıcıya yanıtı kaydetme seçeneği sun
      await this.askToSaveResponse(response);
    } catch (error) {
      TerminalUI.showError(`Gemini hatası: ${error}`);
    }
  }

  /**
   * Gemini Agent komutu işleme
   * @param args Argümanlar
   */
  private async handleGeminiAgent(args: string): Promise<void> {
    if (!args) {
      TerminalUI.showError(`Lütfen bir prompt girin. Örnek: ${TerminalUI.colors.primary}gemini-agent${TerminalUI.colors.reset} Bu dizindeki dosyaları listele ve test.py dosyası oluştur`);
      return;
    }

    try {
      // İlk olarak kullanıcının isteğini anlamak için Gemini'ye soralım
      const result = await this.aiClient.callGemini(
        `Sen bir dosya sistemi asistanısın. Aşağıdaki istediği analiz et ve hangi işlemleri yapmam gerektiğini anlat. Dosya okuma, listeleme veya oluşturma işlemleri olabilir. İşlemleri tam olarak nasıl yapacağımı anlat:\n\n${args}`
      );

      TerminalUI.showInfo("Gemini'nin analizi:");
      console.log(result);

      // Kullanıcıya soralım, önerilen işlemleri yapmak istiyor mu?
      const answer = await TerminalUI.prompt(this.rl, "Bu işlemleri yapmak istiyor musunuz? (e/h): ");
      
      if (answer.toLowerCase() === 'e') {
        // Gemini'nin analizine dayanarak işlemler gerçekleştirilebilir
        // Şimdilik basic işlemler:
        const analysisText = result.toLowerCase();

        // Dizin listeleme işlemi var mı?
        if (analysisText.includes("listeleme") || analysisText.includes("list")) {
          TerminalUI.showInfo("Dizin listeleniyor...");
          const listResult = await this.aiClient.listFiles(process.cwd());
          TerminalUI.showInfo("Dizin içeriği:");
          console.log(listResult);
        }

        // Dosya oluşturma/düzenleme işlemi var mı?
        if (analysisText.includes("oluştur") || analysisText.includes("create") || 
            analysisText.includes("düzenle") || analysisText.includes("edit")) {
          
          // İnteraktif dosya tarayıcısı ile dosya oluşturma
          TerminalUI.showInfo("Dosya oluşturmak için dosya tarayıcısı başlatılıyor...");
          const newFilePath = await createNewFile();
          
          if (newFilePath) {
            const content = await TerminalUI.prompt(this.rl, "Dosya içeriği: ");
            const editResult = await this.aiClient.editFile(newFilePath, content);
            TerminalUI.showSuccess(`Dosya işlemi sonucu: ${editResult}`);
          } else {
            TerminalUI.showInfo("Dosya oluşturma iptal edildi.");
          }
        }

        // Dosya okuma işlemi var mı?
        if (analysisText.includes("oku") || analysisText.includes("read")) {
          TerminalUI.showInfo("Dosya okumak için dosya tarayıcısı başlatılıyor...");
          const filePath = await selectFile(process.cwd(), "Okumak istediğiniz dosyayı seçin:");
          
          if (filePath) {
            const readResult = await this.aiClient.readFile(filePath);
            TerminalUI.showInfo(`Dosya içeriği: ${path.basename(filePath)}`);
            console.log(readResult);
          } else {
            TerminalUI.showInfo("Dosya okuma iptal edildi.");
          }
        }
      }
    } catch (error) {
      TerminalUI.showError(`Gemini Agent hatası: ${error}`);
    }
  }

  /**
   * Bash komutu işleme
   * @param args Argümanlar
   */
  private async handleBash(args: string): Promise<void> {
    if (!args) {
      TerminalUI.showError(`Lütfen bir terminal komutu girin. Örnek: ${TerminalUI.colors.primary}bash${TerminalUI.colors.reset} dir`);
      return;
    }

    try {
      TerminalUI.showInfo("Komut çalıştırılıyor...");
      const result = await this.aiClient.executeCommand(args);
      TerminalUI.showInfo("Komut çıktısı:");
      console.log(result);
    } catch (error) {
      TerminalUI.showError(`Bash hatası: ${error}`);
    }
  }

  /**
   * Dosya okuma komutu işleme
   * @param args Argümanlar
   */
  private async handleRead(args: string): Promise<void> {
    try {
      let filePath = args;
      
      if (!filePath) {
        // Dosya seçme diyaloğunu başlat
        TerminalUI.showInfo("Dosya tarayıcısı başlatılıyor...");
        filePath = await selectFile() || "";
        
        if (!filePath) {
          TerminalUI.showInfo("Dosya seçimi iptal edildi.");
          return;
        }
      }

      TerminalUI.showInfo(`${filePath} dosyası okunuyor...`);
      const result = await this.aiClient.readFile(path.resolve(filePath));
      TerminalUI.showInfo(`Dosya içeriği: ${path.basename(filePath)}`);
      console.log(result);
    } catch (error) {
      TerminalUI.showError(`Dosya okuma hatası: ${error}`);
    }
  }

  /**
   * Dizin listeleme komutu işleme
   * @param args Argümanlar
   */
  private async handleList(args: string): Promise<void> {
    try {
      let directory = args || process.cwd();
      
      if (args === "browse") {
        // İnteraktif dizin tarayıcısını başlat
        TerminalUI.showInfo("Dizin tarayıcısı başlatılıyor...");
        const selectedDir = await browseFolders();
        if (selectedDir) {
          directory = selectedDir;
        } else {
          TerminalUI.showInfo("Dizin seçimi iptal edildi.");
          return;
        }
      }

      TerminalUI.showInfo(`${directory} dizini listeleniyor...`);
      const result = await this.aiClient.listFiles(path.resolve(directory));
      TerminalUI.showInfo(`Dizin içeriği: ${path.basename(directory)}`);
      try {
        // JSON olarak parse et ve daha güzel göster
        const files = JSON.parse(result);
        console.log(JSON.stringify(files, null, 2));
      } catch {
        // Parse edilemezse doğrudan göster
        console.log(result);
      }
    } catch (error) {
      TerminalUI.showError(`Dizin listeleme hatası: ${error}`);
    }
  }

  /**
   * Dosya tarayıcısı komutu işleme
   */
  private async handleBrowse(): Promise<void> {
    try {
      TerminalUI.showInfo("Dosya tarayıcısı başlatılıyor...");
      const selectedPath = await browseFolders();
      
      if (selectedPath) {
        const stats = require('fs').statSync(selectedPath);
        
        if (stats.isDirectory()) {
          // Seçilen bir dizinse, listele
          await this.handleList(selectedPath);
        } else {
          // Seçilen bir dosyaysa, oku
          await this.handleRead(selectedPath);
        }
      } else {
        TerminalUI.showInfo("Dosya tarayıcısı iptal edildi.");
      }
    } catch (error) {
      TerminalUI.showError(`Dosya tarayıcısı hatası: ${error}`);
    }
  }

  /**
   * Dosya düzenleme komutu işleme
   * @param args Argümanlar
   */
  private async handleEdit(args: string[]): Promise<void> {
    try {
      let filePath = args[0];
      let content = args.slice(1).join(' ');
      
      if (!filePath) {
        // Önce dosya oluştur mu, düzenle mi seçilsin
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'Dosya işlemi:',
            choices: [
              { name: 'Yeni dosya oluştur', value: 'create' },
              { name: 'Mevcut dosyayı düzenle', value: 'edit' },
              { name: 'İptal', value: 'cancel' }
            ]
          }
        ]);
        
        if (action === 'cancel') {
          TerminalUI.showInfo("Dosya düzenleme iptal edildi.");
          return;
        } else if (action === 'create') {
          filePath = await createNewFile() || "";
        } else {
          filePath = await selectFile() || "";
        }
        
        if (!filePath) {
          TerminalUI.showInfo("Dosya seçimi iptal edildi.");
          return;
        }
        
        // Eğer mevcut dosyayı düzenliyorsak, içeriğini göster
        if (action === 'edit') {
          const currentContent = await this.aiClient.readFile(filePath);
          TerminalUI.showInfo(`Mevcut dosya içeriği: ${path.basename(filePath)}`);
          console.log(currentContent);
        }
        
        // Yeni içeriği sor
        content = await TerminalUI.prompt(this.rl, "Dosya içeriği: ");
      }

      TerminalUI.showInfo(`${filePath} dosyası düzenleniyor...`);
      const result = await this.aiClient.editFile(path.resolve(filePath), content);
      TerminalUI.showSuccess(result);
    } catch (error) {
      TerminalUI.showError(`Dosya düzenleme hatası: ${error}`);
    }
  }

  /**
   * Sohbet komutu işleme
   */
  private async handleChat(): Promise<void> {
    try {
      // Aktif bir oturum var mı kontrol et
      const activeSessionId = this.chatHistory.getActiveSessionId();
      
      if (!activeSessionId) {
        // Yeni oturum başlat veya mevcut bir oturum seç
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'Sohbet oturumu:',
            choices: [
              { name: 'Yeni sohbet oturumu başlat', value: 'new' },
              { name: 'Mevcut bir oturumu seç', value: 'existing' }
            ]
          }
        ]);
        
        if (action === 'new') {
          const { sessionName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'sessionName',
              message: 'Oturum adı:',
              default: `Sohbet ${new Date().toLocaleString('tr-TR')}`
            }
          ]);
          
          this.chatHistory.createSession(sessionName);
          TerminalUI.showSuccess(`Yeni sohbet oturumu başlatıldı: ${sessionName}`);
        } else {
          const sessions = this.chatHistory.listSessions();
          
          if (sessions.length === 0) {
            TerminalUI.showInfo("Mevcut sohbet oturumu bulunmuyor. Yeni bir oturum başlatılıyor.");
            this.chatHistory.createSession(`Sohbet ${new Date().toLocaleString('tr-TR')}`);
          } else {
            const { sessionId } = await inquirer.prompt([
              {
                type: 'list',
                name: 'sessionId',
                message: 'Oturum seçin:',
                choices: sessions.map(session => ({
                  name: `${session.name} (${new Date(session.createdAt).toLocaleString('tr-TR')}) - ${session.messages.length} mesaj`,
                  value: session.id
                }))
              }
            ]);
            
            this.chatHistory.setActiveSession(sessionId);
            const session = this.chatHistory.getSession(sessionId)!;
            TerminalUI.showSuccess(`Sohbet oturumu açıldı: ${session.name}`);
            
            // Önceki mesajları göster
            if (session.messages.length > 0) {
              TerminalUI.showInfo("Önceki mesajlar:");
              session.messages.slice(-5).forEach(msg => {
                if (msg.role === 'user') {
                  console.log(`\n${TerminalUI.colors.info}👤 Siz:${TerminalUI.colors.reset}`);
                  console.log(msg.content);
                } else if (msg.role === 'assistant') {
                  console.log(`\n${TerminalUI.colors.primary}🤖 ${msg.model || 'AI'}:${TerminalUI.colors.reset}`);
                  console.log(msg.content);
                }
              });
            }
          }
        }
      }
      
      // Model seçimi
      const { model } = await inquirer.prompt([
        {
          type: 'list',
          name: 'model',
          message: 'Hangi AI modelini kullanmak istersiniz?',
          choices: [
            { name: 'Claude', value: 'claude' },
            { name: 'Gemini', value: 'gemini' }
          ]
        }
      ]);
      
      // Sohbet döngüsü
      let chatting = true;
      
      while (chatting) {
        const userInput = await TerminalUI.prompt(this.rl, "Mesajınız (çıkmak için 'exit'): ");
        
        if (userInput.toLowerCase() === 'exit') {
          chatting = false;
          continue;
        }
        
        let response;
        if (model === 'claude') {
          response = await this.aiClient.callClaude(userInput, true);
          TerminalUI.displayAIResponse(response, 'Claude');
        } else {
          response = await this.aiClient.callGemini(userInput, true);
          TerminalUI.displayAIResponse(response, 'Gemini');
        }
      }
    } catch (error) {
      TerminalUI.showError(`Sohbet hatası: ${error}`);
    }
  }

  /**
   * Oturumları listeleme komutu işleme
   */
  private async handleSessions(): Promise<void> {
    try {
      const sessions = this.chatHistory.listSessions();
      
      if (sessions.length === 0) {
        TerminalUI.showInfo("Mevcut sohbet oturumu bulunmuyor.");
        return;
      }
      
      TerminalUI.showInfo("Sohbet oturumları:");
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Sohbet oturumu seçin:',
          choices: [
            ...sessions.map(session => ({
              name: `${session.name} (${new Date(session.createdAt).toLocaleString('tr-TR')}) - ${session.messages.length} mesaj`,
              value: `open_${session.id}`
            })),
            { name: 'Bir oturumu sil', value: 'delete' },
            { name: 'İptal', value: 'cancel' }
          ]
        }
      ]);
      
      if (action === 'cancel') {
        return;
      } else if (action === 'delete') {
        const { sessionId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'sessionId',
            message: 'Silmek istediğiniz oturumu seçin:',
            choices: sessions.map(session => ({
              name: `${session.name} (${new Date(session.createdAt).toLocaleString('tr-TR')})`,
              value: session.id
            }))
          }
        ]);
        
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Bu oturumu silmek istediğinizden emin misiniz?',
            default: false
          }
        ]);
        
        if (confirm) {
          this.chatHistory.deleteSession(sessionId);
          TerminalUI.showSuccess("Oturum silindi.");
        }
      } else if (action.startsWith('open_')) {
        const sessionId = action.substring(5);
        this.chatHistory.setActiveSession(sessionId);
        TerminalUI.showSuccess("Oturum aktif edildi. 'chat' komutu ile sohbete devam edebilirsiniz.");
      }
    } catch (error) {
      TerminalUI.showError(`Oturum yönetimi hatası: ${error}`);
    }
  }

  /**
   * AI yanıtını kaydetme seçeneği sun
   * @param response AI yanıtı
   */
  private async askToSaveResponse(response: string): Promise<void> {
    const answer = await TerminalUI.prompt(this.rl, `Bu yanıtı bir dosyaya kaydetmek ister misiniz? (e/h): `);
    
    if (answer.toLowerCase() === 'e') {
      const filename = await TerminalUI.prompt(this.rl, `Dosya adı: `);
      
      try {
        const currentDir = process.cwd();
        const filePath = path.join(currentDir, filename);
        
        await this.aiClient.editFile(filePath, response);
        TerminalUI.showSuccess(`Yanıt başarıyla ${filename} dosyasına kaydedildi.`);
      } catch (error) {
        TerminalUI.showError(`Dosya kaydetme hatası: ${error}`);
      }
    }
  }
} 