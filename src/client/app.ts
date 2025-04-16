import * as readline from 'readline';
import { AIClient } from './ai-client.js';
import { CommandHandler } from './commands.js';
import { TerminalUI } from './terminal-ui.js';
import { ChatHistoryManager } from '../utils/chat-history.js';
import { fileURLToPath } from 'url';

/**
 * Ana uygulama sınıfı
 */
export class App {
  private aiClient: AIClient;
  private commandHandler: CommandHandler;
  private chatHistory: ChatHistoryManager;
  private rl: readline.Interface;

  /**
   * Constructor
   */
  constructor() {
    // Readline arayüzü
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Sohbet geçmişi yöneticisi
    this.chatHistory = new ChatHistoryManager();

    // AI istemci
    this.aiClient = new AIClient(this.chatHistory);

    // Komut işleyici
    this.commandHandler = new CommandHandler(this.aiClient, this.chatHistory, this.rl);
  }

  /**
   * Uygulamayı başlat
   */
  async start(): Promise<void> {
    try {
      // Mor başlık göster
      TerminalUI.printHeader();

      // AI sunucusuna bağlan
      await this.aiClient.connect();

      // Yardım bilgilerini göster
      TerminalUI.printHelp();

      // Komut isteme döngüsü
      this.promptLoop();
    } catch (error) {
      TerminalUI.showError(`Uygulama başlatma hatası: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Kullanıcı komutlarını dinleme döngüsü
   */
  private promptLoop(): void {
    // Kullanıcıdan giriş iste
    this.rl.question(`\n${TerminalUI.colors.primary}> ${TerminalUI.colors.reset}`, async (input) => {
      if (input.toLowerCase() === 'exit') {
        TerminalUI.showInfo("MCP CLI'dan çıkılıyor...");
        this.rl.close();
        process.exit(0);
      }

      try {
        // Komutu işle
        await this.commandHandler.handleCommand(input);
      } catch (error) {
        TerminalUI.showError(`Hata: ${error}`);
      }

      // Tekrar kullanıcıdan giriş iste
      this.promptLoop();
    });
  }
}

// ES modüllerinde require.main === module yerine kullanılacak alternatif
// Mevcut dosyanın doğrudan çalıştırılan dosya olup olmadığını kontrol eder
const isMainModule = async () => {
  // import.meta.url mevcut modülün URL'sini içerir
  const modulePath = fileURLToPath(import.meta.url);
  // process.argv[1] doğrudan çalıştırılan dosyanın yolunu içerir
  return process.argv[1] === modulePath;
};

// Uygulamayı başlat
// ESM'de toplevelde await kullanılabilir
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new App();
  app.start().catch((error) => {
    console.error("Uygulama başlatılamadı:", error);
    process.exit(1);
  });
} 