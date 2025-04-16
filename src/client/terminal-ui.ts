import * as readline from 'readline';
import { highlightCodeBlocks } from '../utils/highlight.js';

/**
 * Terminal UI yardımcı fonksiyonları
 */
export class TerminalUI {
  // Renk şeması
  static colors = {
    primary: "\x1b[35m",       // Magenta
    secondary: "\x1b[36m",     // Cyan
    success: "\x1b[32m",       // Green
    error: "\x1b[31m",         // Red
    warning: "\x1b[33m",       // Yellow
    info: "\x1b[34m",          // Blue
    gray: "\x1b[90m",          // Gray
    bold: "\x1b[1m",           // Bold
    reset: "\x1b[0m"           // Reset
  };

  // Mor renkli ASCI art başlık
  static printHeader(): void {
    console.log(`
${TerminalUI.colors.primary}${TerminalUI.colors.bold}
   ____  _____ __  __ ___ _   _ ___   __  __  ____ ____    _____ ____      ___   __
  / ___|  ___|  \\/  |_ _| \\ | |_ _| |  \\/  |/ ___|  _ \\  | ____|  _ \\    / \\ \\ / /
 | |  _| |_  | |\\/| || ||  \\| || |  | |\\/| | |   | |_) | |  _| | |_) |  / _ \\ V / 
 | |_| |  _| | |  | || || |\\  || |  | |  | | |___|  __/  | |___|  _ <  / ___ \\ |  
  \\____|_|   |_|  |_|___|_| \\_|___| |_|  |_|\\____|_|     |_____|_| \\_\\/_/   \\_\\_|  
                                                                                  
${TerminalUI.colors.reset}`);
  }

  // Komut yardımı
  static printHelp(): void {
    console.log(`\n${TerminalUI.colors.primary}${TerminalUI.colors.bold}AI MCP CLI'ya hoş geldiniz!${TerminalUI.colors.reset}`);
    console.log("Kullanılabilir komutlar:");
    console.log(`  ${TerminalUI.colors.primary}claude${TerminalUI.colors.reset} <text> - Claude AI'ye bir prompt gönderin`);
    console.log(`  ${TerminalUI.colors.primary}gemini${TerminalUI.colors.reset} <text> - Gemini AI'ye bir prompt gönderin`);
    console.log(`  ${TerminalUI.colors.primary}gemini-agent${TerminalUI.colors.reset} <text> - Gemini AI'yi bir agent olarak kullanın (dosya işlemleri yapabilir)`);
    console.log(`  ${TerminalUI.colors.primary}bash${TerminalUI.colors.reset} <command> - Terminal komutu çalıştır`);
    console.log(`  ${TerminalUI.colors.primary}read${TerminalUI.colors.reset} <filepath> - Dosya içeriğini oku`);
    console.log(`  ${TerminalUI.colors.primary}list${TerminalUI.colors.reset} <path> - Dizindeki dosyaları listele`);
    console.log(`  ${TerminalUI.colors.primary}browse${TerminalUI.colors.reset} - İnteraktif dosya tarayıcısını başlat`);
    console.log(`  ${TerminalUI.colors.primary}edit${TerminalUI.colors.reset} <filepath> <content> - Dosya oluştur veya düzenle`);
    console.log(`  ${TerminalUI.colors.primary}chat${TerminalUI.colors.reset} - Sohbet geçmişi ile çalışan oturum başlat`);
    console.log(`  ${TerminalUI.colors.primary}sessions${TerminalUI.colors.reset} - Kayıtlı sohbet oturumlarını listele`);
    console.log(`  ${TerminalUI.colors.primary}exit${TerminalUI.colors.reset} - Çıkış yap`);
    console.log(`\nÖrnek: ${TerminalUI.colors.primary}claude${TerminalUI.colors.reset} Faktöriyel hesaplayan bir JavaScript fonksiyonu yaz`);
    console.log(`Örnek: ${TerminalUI.colors.primary}gemini${TerminalUI.colors.reset} Python ile bir web scraper nasıl yazılır?`);
    console.log(`Örnek: ${TerminalUI.colors.primary}chat${TerminalUI.colors.reset} - Devam eden bir sohbet başlat`);
  }

  /**
   * Kullanıcı girdisini bekler
   * @param rl Readline arayüzü
   * @param prompt Görüntülenecek istem
   * @returns Kullanıcı girdisi
   */
  static async prompt(rl: readline.Interface, prompt: string = '> '): Promise<string> {
    return new Promise((resolve) => {
      rl.question(`\n${TerminalUI.colors.primary}${prompt}${TerminalUI.colors.reset}`, (input) => {
        resolve(input);
      });
    });
  }

  /**
   * AI yanıtını biçimlendirilmiş şekilde gösterir
   * @param text Yanıt metni
   * @param model AI modeli
   */
  static displayAIResponse(text: string, model: string = 'AI'): void {
    console.log(`\n${TerminalUI.colors.primary}${model}'nın yanıtı:${TerminalUI.colors.reset}`);
    
    // Kod bloklarını vurgula
    const formattedText = highlightCodeBlocks(text);
    console.log(formattedText);
  }

  /**
   * Yükleme mesajı göster
   * @param message Mesaj
   * @param model Model adı
   */
  static showThinking(message: string = 'düşünüyor', model: string = 'AI'): void {
    console.log(`${TerminalUI.colors.primary}${model} ${message}...${TerminalUI.colors.reset}`);
  }

  /**
   * Hata mesajı göster
   * @param message Hata mesajı
   */
  static showError(message: string): void {
    console.error(`${TerminalUI.colors.error}Hata:${TerminalUI.colors.reset}`, message);
  }

  /**
   * Bilgi mesajı göster
   * @param message Bilgi mesajı
   */
  static showInfo(message: string): void {
    console.log(`${TerminalUI.colors.info}${message}${TerminalUI.colors.reset}`);
  }

  /**
   * Başarı mesajı göster
   * @param message Başarı mesajı
   */
  static showSuccess(message: string): void {
    console.log(`${TerminalUI.colors.success}${message}${TerminalUI.colors.reset}`);
  }

  /**
   * Uyarı mesajı göster
   * @param message Uyarı mesajı
   */
  static showWarning(message: string): void {
    console.log(`${TerminalUI.colors.warning}${message}${TerminalUI.colors.reset}`);
  }
} 