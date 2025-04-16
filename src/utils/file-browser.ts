import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';

// Dosya/klasör öğesi için arayüz
export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
}

/**
 * Belirtilen dizindeki dosya ve klasörleri listeler
 * @param directoryPath Dizin yolu
 * @returns Dosya/klasör listesi
 */
export async function listDirectoryContents(directoryPath: string): Promise<FileItem[]> {
  try {
    const items = fs.readdirSync(directoryPath);
    const result: FileItem[] = [];

    // Her öğe için bilgi topla
    for (const item of items) {
      const itemPath = path.join(directoryPath, item);
      const stats = fs.statSync(itemPath);
      
      result.push({
        name: item,
        path: itemPath,
        isDirectory: stats.isDirectory(),
        size: stats.isDirectory() ? undefined : stats.size,
        modified: stats.mtime
      });
    }

    // Önce klasörler, sonra dosyalar olacak şekilde sırala
    return result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error(`Dizin listelenirken hata: ${error}`);
    return [];
  }
}

/**
 * İnteraktif dosya tarayıcısını başlatır
 * @param startPath Başlangıç dizini
 * @returns Seçilen dosya yolu
 */
export async function browseFolders(startPath: string = process.cwd()): Promise<string | null> {
  let currentPath = startPath;
  let selectedPath: string | null = null;
  let browsing = true;

  while (browsing) {
    const items = await listDirectoryContents(currentPath);
    
    // Üst dizin seçeneği ekle
    const choices = [
      { name: '../ (Üst Dizin)', value: 'PARENT_DIR' },
      { name: 'Bu dizini seç', value: 'SELECT_CURRENT' },
      { name: 'İptal', value: 'CANCEL' },
      new inquirer.Separator('--- Dosyalar ve Klasörler ---'),
      ...items.map(item => ({
        name: `${item.isDirectory ? '📁 ' : '📄 '}${item.name}${item.isDirectory ? '/' : ''}`,
        value: item.path
      }))
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Şu anki dizin: ${currentPath}`,
        choices,
        pageSize: 15
      }
    ]);

    if (action === 'PARENT_DIR') {
      const parentDir = path.dirname(currentPath);
      if (parentDir !== currentPath) { // Kök dizinde olup olmadığını kontrol et
        currentPath = parentDir;
      }
    } else if (action === 'SELECT_CURRENT') {
      selectedPath = currentPath;
      browsing = false;
    } else if (action === 'CANCEL') {
      browsing = false;
    } else {
      const stats = fs.statSync(action);
      if (stats.isDirectory()) {
        currentPath = action;
      } else {
        selectedPath = action;
        browsing = false;
      }
    }
  }

  return selectedPath;
}

/**
 * Dosya seçme diyaloğunu gösterir
 * @param startPath Başlangıç dizini
 * @param message İstem mesajı
 * @returns Seçilen dosya yolu
 */
export async function selectFile(startPath: string = process.cwd(), message: string = 'Bir dosya seçin:'): Promise<string | null> {
  let currentPath = startPath;
  let selectedPath: string | null = null;
  let browsing = true;

  while (browsing) {
    const items = await listDirectoryContents(currentPath);
    
    const choices = [
      { name: '../ (Üst Dizin)', value: 'PARENT_DIR' },
      { name: 'İptal', value: 'CANCEL' },
      new inquirer.Separator('--- Dosyalar ve Klasörler ---'),
      ...items.map(item => ({
        name: `${item.isDirectory ? '📁 ' : '📄 '}${item.name}${item.isDirectory ? '/' : ''}`,
        value: item.path
      }))
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `${message} (Şu anki dizin: ${currentPath})`,
        choices,
        pageSize: 15
      }
    ]);

    if (action === 'PARENT_DIR') {
      const parentDir = path.dirname(currentPath);
      if (parentDir !== currentPath) {
        currentPath = parentDir;
      }
    } else if (action === 'CANCEL') {
      browsing = false;
    } else {
      const stats = fs.statSync(action);
      if (stats.isDirectory()) {
        currentPath = action;
      } else {
        selectedPath = action;
        browsing = false;
      }
    }
  }

  return selectedPath;
}

/**
 * Yeni bir dosya oluşturmak için diyalog gösterir
 * @param startPath Başlangıç dizini
 * @returns Yeni dosya yolu veya iptal durumunda null
 */
export async function createNewFile(startPath: string = process.cwd()): Promise<string | null> {
  // Önce dizini seç
  const directory = await browseFolders(startPath);
  if (!directory) return null;
  
  // Dosya adını sor
  const { fileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Yeni dosya adı:',
      validate: (input: string) => {
        if (!input.trim()) return 'Dosya adı boş olamaz';
        return true;
      }
    }
  ]);
  
  return path.join(directory, fileName);
} 