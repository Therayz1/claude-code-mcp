import * as fs from 'fs';
import * as path from 'path';

// Sohbet geçmişi arayüzü
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
}

// Sohbet oturumu arayüzü
export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// Geçmiş oturumların tutulduğu klasör
const HISTORY_DIR = path.join(process.cwd(), '.chat_history');

/**
 * Sohbet geçmişi yöneticisi
 */
export class ChatHistoryManager {
  private sessions: Map<string, ChatSession> = new Map();
  private activeSessionId: string | null = null;

  constructor() {
    // Geçmiş dizininin varlığını kontrol et, yoksa oluştur
    if (!fs.existsSync(HISTORY_DIR)) {
      fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }
    this.loadSessions();
  }

  /**
   * Tüm sohbet oturumlarını yükle
   */
  private loadSessions(): void {
    try {
      const files = fs.readdirSync(HISTORY_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(HISTORY_DIR, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const session = JSON.parse(data) as ChatSession;
          this.sessions.set(session.id, session);
        }
      }
    } catch (error) {
      console.error('Sohbet geçmişi yüklenirken hata:', error);
    }
  }

  /**
   * Oturumu dosyaya kaydet
   * @param sessionId Oturum ID'si
   */
  private saveSession(sessionId: string): void {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        const filePath = path.join(HISTORY_DIR, `${sessionId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8');
      }
    } catch (error) {
      console.error('Sohbet oturumu kaydedilirken hata:', error);
    }
  }

  /**
   * Yeni bir sohbet oturumu oluştur
   * @param name Oturum adı
   * @returns Oturum ID'si
   */
  createSession(name: string): string {
    const id = `session_${Date.now()}`;
    const session: ChatSession = {
      id,
      name,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.sessions.set(id, session);
    this.activeSessionId = id;
    this.saveSession(id);
    return id;
  }

  /**
   * Aktif oturumu değiştir
   * @param sessionId Oturum ID'si
   * @returns Başarılı olup olmadığı
   */
  setActiveSession(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.activeSessionId = sessionId;
      return true;
    }
    return false;
  }

  /**
   * Aktif oturum ID'sini al
   * @returns Aktif oturum ID'si
   */
  getActiveSessionId(): string | null {
    return this.activeSessionId;
  }

  /**
   * Tüm oturumları listele
   * @returns Oturum listesi
   */
  listSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Belirli bir oturumu al
   * @param sessionId Oturum ID'si
   * @returns Sohbet oturumu
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Aktif oturuma mesaj ekle
   * @param message Eklenecek mesaj
   * @returns Mesajın eklenip eklenmediği
   */
  addMessage(message: Omit<ChatMessage, 'timestamp'>): boolean {
    if (!this.activeSessionId) return false;
    
    const session = this.sessions.get(this.activeSessionId);
    if (session) {
      const newMessage: ChatMessage = {
        ...message,
        timestamp: Date.now()
      };
      session.messages.push(newMessage);
      session.updatedAt = Date.now();
      this.saveSession(this.activeSessionId);
      return true;
    }
    return false;
  }

  /**
   * Aktif oturumdaki son mesajları al
   * @param count Mesaj sayısı (varsayılan: 10)
   * @returns Mesaj listesi
   */
  getRecentMessages(count: number = 10): ChatMessage[] {
    if (!this.activeSessionId) return [];
    
    const session = this.sessions.get(this.activeSessionId);
    if (session) {
      return session.messages.slice(-count);
    }
    return [];
  }

  /**
   * Oturumu sil
   * @param sessionId Oturum ID'si
   * @returns Silme işleminin başarılı olup olmadığı
   */
  deleteSession(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      try {
        const filePath = path.join(HISTORY_DIR, `${sessionId}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (this.activeSessionId === sessionId) {
          this.activeSessionId = null;
        }
        return true;
      } catch (error) {
        console.error('Sohbet oturumu silinirken hata:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Aktif oturumdaki bağlamı Claude API formatında al
   * @param count Son mesaj sayısı
   * @returns Claude API formatında mesajlar
   */
  getContextForClaude(count: number = 10): Array<{ role: string, content: string }> {
    const messages = this.getRecentMessages(count);
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
} 