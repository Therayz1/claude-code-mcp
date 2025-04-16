import hljs from 'highlight.js';

/**
 * Kod bloğuna syntax highlighting uygular
 * @param code Kaynak kod
 * @param language Programlama dili (opsiyonel)
 * @returns Renklendirilmiş kod bloğu
 */
export function highlightCode(code: string, language?: string): string {
  try {
    if (language) {
      return hljs.highlight(code, { language }).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  } catch (error) {
    // Hata durumunda orijinal kodu döndür
    return code;
  }
}

/**
 * Kod bloğu içindeki dil belirtecini tespit eder
 * @param text Metin
 * @returns Dil belirteci veya undefined
 */
export function detectLanguage(text: string): string | undefined {
  // Markdown kod bloğu formatında dil tespiti
  const match = text.match(/```([a-zA-Z0-9_+#]+)[\s\n]/);
  if (match && match[1]) {
    return match[1];
  }
  return undefined;
}

/**
 * Metindeki kod bloklarını vurgular
 * @param text Metin
 * @returns Kod bloklarını vurgulanmış metin
 */
export function highlightCodeBlocks(text: string): string {
  // Markdown kod bloklarını bul
  return text.replace(/```([a-zA-Z0-9_+#]*)[\s\n]([\s\S]*?)```/g, (match, language, code) => {
    const highlightedCode = language ? highlightCode(code, language) : code;
    return `\`\`\`${language}\n${highlightedCode}\`\`\``;
  });
} 