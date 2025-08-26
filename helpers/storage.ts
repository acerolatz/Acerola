import * as FileSystem from 'expo-file-system';
import { DirectoryAlreadyExistsError } from './errors';
import { DownloadProgress } from './types';
import RNFS from 'react-native-fs';


export const baseDir = FileSystem.documentDirectory; 
export const documentsDir = `${baseDir}documents`;


export async function initDocumentsDir() {
  const dirInfo = await FileSystem.getInfoAsync(documentsDir);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
  }
}


export async function createDocumentDir(normalizedName: string, existsOk: boolean = true) {
  const path = `${documentsDir}/${normalizedName}`;

  const dirInfo = await FileSystem.getInfoAsync(path);
  if (dirInfo.exists && !existsOk) {
    throw new DirectoryAlreadyExistsError(`Directory already exists: ${path}`);
  }

  await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  return path;
}


export async function deleteDocumentDir(normalizedName: string) {
  const path = `${documentsDir}/${normalizedName}`;

  const dirInfo = await FileSystem.getInfoAsync(path);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}


export const downloadImages = async (
  urls: string[],
  basePath: string,  
  maxParallel: number = 8,
  onProgress?: (progress: DownloadProgress) => void
): Promise<string[]> => {
  
  let completed = 0;
  const total = urls.length;
  const downloadedPaths: string[] = new Array(total);

  const downloadImage = async (url: string, index: number) => {
    const fileExt = url.split('.').pop()?.split('?')[0] || 'jpg';
    const filePath = `${basePath}/image_${index + 1}.${fileExt}`;

    await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      progress: (res) => {
        if (onProgress) {
          const percentage = Math.floor(
            ((completed + res.bytesWritten / res.contentLength) / total) * 100
          );
          onProgress({
            current: completed + 1,
            total,
            percentage,
          });
        }
      },
      progressDivider: 5,
    }).promise;

    downloadedPaths[index] = filePath;
    completed++;
    if (onProgress) {
      onProgress({
        current: completed,
        total,
        percentage: Math.floor((completed / total) * 100),
      });
    }
  };

  // Download pool
  const pool: Promise<void>[] = [];
  for (let i = 0; i < urls.length; i++) {
    const promise = downloadImage(urls[i], i);
    pool.push(promise);    
    if (pool.length >= maxParallel) {
      await Promise.race(pool);
      for (let j = pool.length - 1; j >= 0; j--) {
        if ((pool[j] as any).resolved) pool.splice(j, 1);
      }
    }
  }

  await Promise.all(pool);  
  return downloadedPaths.sort();
};