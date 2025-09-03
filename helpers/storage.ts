import { AppConstants } from '@/constants/AppConstants';
import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';
import { DownloadProgress } from './types';


export function normalizeDocumentName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}


export async function initManhwasDir() {
  const dirInfo = await FileSystem.getInfoAsync(AppConstants.APP.MANHWAS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AppConstants.APP.MANHWAS_DIR, { intermediates: true });
  }
}


export async function createDocumentDir(path: string) {
  const dirInfo = await FileSystem.getInfoAsync(path);
  if (dirInfo.exists) { return }
  await FileSystem.makeDirectoryAsync(path, { intermediates: true });
}


export async function deleteDocumentDir(path: string) {
  const dirInfo = await FileSystem.getInfoAsync(path);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}


export async function createChapterDir(chapter_id: number): Promise<string> {
  const path = `${AppConstants.APP.MANHWAS_DIR}/${chapter_id}`
  await createDocumentDir(path)
  return path
}


export async function clearFolder(folderUri: string): Promise<void> {
  try {
    const items = await FileSystem.readDirectoryAsync(folderUri);    
    for (const item of items) {
      const itemUri = folderUri + item;
      const info = await FileSystem.getInfoAsync(itemUri);
      if (info.isDirectory) {        
        await FileSystem.deleteAsync(itemUri, { idempotent: true });
        await FileSystem.makeDirectoryAsync(itemUri, { intermediates: true });
      } else {
        await FileSystem.deleteAsync(itemUri, { idempotent: true });
      }
    }
  } catch (error) {
    console.error("Error clearing folder:", error);
    throw error;
  }
}


export const downloadImages = async (
  urls: string[], 
  path: string,
  onProgress?: (progress: DownloadProgress) => boolean
): Promise<void> => {
  
  await clearFolder(path)
  let completed = 0;
  let shouldStop = false
  const total = urls.length;
  const downloadedPaths: string[] = new Array(total);

  const downloadImage = async (url: string, index: number) => {
    const fileExt = url.split('.').pop()?.split('?')[0] || 'jpg';
    const filePath = `${path}/image_${index + 1}.${fileExt}`;
    await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      progress: async (res) => {
        if (onProgress) {
          const percentage = Math.floor(
            ((completed + res.bytesWritten / res.contentLength) / total) * 100
          );
          shouldStop = onProgress({
            current: completed + 1,
            total,
            percentage,
          });
        }
      },
      progressDivider: 10,
    }).promise;
    downloadedPaths[index] = filePath;
    completed++;
    if (onProgress) {
      shouldStop = onProgress({
        current: completed,
        total,
        percentage: Math.floor((completed / total) * 100),
      });
    }
  };

  const pool: Promise<void>[] = [];
  for (let i = 0; i < urls.length; i++) {
    if (shouldStop) { return }
    const promise = downloadImage(urls[i], i);
    pool.push(promise);
    if (pool.length >= 8) {
      await Promise.race(pool);
      for (let j = pool.length - 1; j >= 0; j--) {
        if ((pool[j] as any).resolved) pool.splice(j, 1);
        if (shouldStop) { return }
      }
    }
  }

  await Promise.all(pool);
};