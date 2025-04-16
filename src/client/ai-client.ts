import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { TerminalUI } from "./terminal-ui.js";
import { ChatHistoryManager, ChatMessage } from "../utils/chat-history.js";

// MCP API yanıt tipi tanımı
interface McpResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

/**
 * AI istemci sınıfı
 */
export class AIClient {
  private client: Client;
  private chatHistory: ChatHistoryManager;

  /**
   * Constructor
   * @param chatHistory Sohbet geçmişi yöneticisi
   */
  constructor(chatHistory: ChatHistoryManager) {
    this.chatHistory = chatHistory;
    
    // Lokal MCP sunucusuna bağlanmak için transport
    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"]
    });

    // MCP istemcisi oluştur
    this.client = new Client(
      {
        name: "claude-code-client",
        version: "1.0.0"
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {}
        }
      }
    );
  }

  /**
   * Sunucuya bağlan
   */
  async connect(): Promise<void> {
    try {
      TerminalUI.showInfo("MCP sunucusuna bağlanılıyor...");
      await this.client.connect(this.transport);
      TerminalUI.showSuccess("Bağlantı başarılı! AI araçlarını kullanmaya başlayabilirsiniz.");
    } catch (error) {
      TerminalUI.showError(`Bağlantı hatası: ${error}`);
      throw error;
    }
  }

  /**
   * Claude API'yi kullanarak yanıt oluştur
   * @param prompt Kullanıcı istemi
   * @param useHistory Sohbet geçmişi kullanılsın mı
   * @returns AI yanıtı
   */
  async callClaude(prompt: string, useHistory: boolean = false): Promise<string> {
    try {
      TerminalUI.showThinking("düşünüyor", "Claude");
      
      // Eğer geçmiş kullanılacaksa, mevcut oturumdan mesajları al
      let messages: Array<{role: string, content: string}> = [];
      
      if (useHistory && this.chatHistory.getActiveSessionId()) {
        messages = this.chatHistory.getContextForClaude();
        // Kullanıcı mesajını ekle
        messages.push({
          role: "user",
          content: prompt
        });
      }
      
      // Claude API aracını çağır
      const result = await this.client.callTool({
        name: "prompt",
        arguments: {
          prompt: prompt,
          messages: useHistory ? messages : undefined
        }
      }) as McpResponse;
      
      const responseText = result.content[0].text;
      
      // Geçmişe ekle
      if (useHistory && this.chatHistory.getActiveSessionId()) {
        // Kullanıcı mesajını kaydet
        this.chatHistory.addMessage({
          role: 'user',
          content: prompt
        });
        
        // Asistan yanıtını kaydet
        this.chatHistory.addMessage({
          role: 'assistant',
          content: responseText,
          model: 'Claude'
        });
      }
      
      return responseText;
    } catch (error) {
      throw new Error(`Claude API hatası: ${error}`);
    }
  }

  /**
   * Gemini API'yi kullanarak yanıt oluştur
   * @param prompt Kullanıcı istemi
   * @param useHistory Sohbet geçmişi kullanılsın mı
   * @returns AI yanıtı
   */
  async callGemini(prompt: string, useHistory: boolean = false): Promise<string> {
    try {
      TerminalUI.showThinking("düşünüyor", "Gemini");
      
      // Gemini API aracını çağır (şu an için geçmiş desteği yok)
      const result = await this.client.callTool({
        name: "gemini",
        arguments: {
          prompt: prompt
        }
      }) as McpResponse;
      
      const responseText = result.content[0].text;
      
      // Geçmişe ekle
      if (useHistory && this.chatHistory.getActiveSessionId()) {
        // Kullanıcı mesajını kaydet
        this.chatHistory.addMessage({
          role: 'user',
          content: prompt
        });
        
        // Asistan yanıtını kaydet
        this.chatHistory.addMessage({
          role: 'assistant',
          content: responseText,
          model: 'Gemini'
        });
      }
      
      return responseText;
    } catch (error) {
      throw new Error(`Gemini API hatası: ${error}`);
    }
  }

  /**
   * Bir dosyayı oku
   * @param filePath Dosya yolu
   * @returns Dosya içeriği
   */
  async readFile(filePath: string): Promise<string> {
    try {
      const result = await this.client.callTool({
        name: "readFile",
        arguments: {
          file_path: filePath
        }
      }) as McpResponse;
      
      return result.content[0].text;
    } catch (error) {
      throw new Error(`Dosya okuma hatası: ${error}`);
    }
  }

  /**
   * Bir dizindeki dosyaları listele
   * @param directoryPath Dizin yolu
   * @returns Dizin içeriği
   */
  async listFiles(directoryPath: string): Promise<string> {
    try {
      const result = await this.client.callTool({
        name: "listFiles",
        arguments: {
          path: directoryPath
        }
      }) as McpResponse;
      
      return result.content[0].text;
    } catch (error) {
      throw new Error(`Dizin listeleme hatası: ${error}`);
    }
  }

  /**
   * Terminal komutu çalıştır
   * @param command Komut
   * @returns Komut çıktısı
   */
  async executeCommand(command: string): Promise<string> {
    try {
      const result = await this.client.callTool({
        name: "bash",
        arguments: {
          command: command
        }
      }) as McpResponse;
      
      return result.content[0].text;
    } catch (error) {
      throw new Error(`Komut hatası: ${error}`);
    }
  }

  /**
   * Dosya düzenle veya oluştur
   * @param filePath Dosya yolu
   * @param content İçerik
   * @returns İşlem sonucu
   */
  async editFile(filePath: string, content: string): Promise<string> {
    try {
      const result = await this.client.callTool({
        name: "editFile",
        arguments: {
          file_path: filePath,
          content: content
        }
      }) as McpResponse;
      
      return result.content[0].text;
    } catch (error) {
      throw new Error(`Dosya düzenleme hatası: ${error}`);
    }
  }

  /**
   * İstemci nesnesini doğrudan al
   */
  get transport(): StdioClientTransport {
    return new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"]
    });
  }
}