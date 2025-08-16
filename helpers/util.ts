import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Dimensions, PermissionsAndroid } from "react-native";
import RNFS from 'react-native-fs';
import * as Clipboard from 'expo-clipboard'
import { Linking } from 'react-native';
import { ToastMessages } from '@/constants/Messages';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';
import { DownloadProgress } from './types';
import { AppConstants } from '@/constants/AppConstants';


const {
    width: deviceWidth, 
    height: deviceHeight
} = Dimensions.get('window');


export function wp(percentage: number) {
    const width = deviceWidth;
    return (percentage * width) / 100;
}


export function hp(percentage: number) {
    const height = deviceHeight;
    return (percentage * height) / 100;
}


export function getItemGridDimensions(
    horizontalPadding: number,
    gap: number,
    columns: number,
    originalWidth: number,
    originalHeight: number
): {width: number, height: number} {
    const width = (wp(100) - (horizontalPadding * 2) - ((columns * gap) - gap)) / columns
    const height = width * (originalHeight / originalWidth)
    return {width, height}
}


export function getRelativeHeight(originalWidth: number, originalHeight: number, width: number): number {
  return width * (originalHeight / originalWidth)
}

export function getRelativeWidth(originalWidth: number, originalHeight: number, height: number): number {
  return height * (originalWidth / originalHeight)
}


export function formatTimestamp(timestamp: string): string {    
    const date = new Date(timestamp);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };    
    return date.toLocaleDateString('en-US', options as any);
}


export function secondsSince(dateTimeString: string): number {
    const inputDate = new Date(dateTimeString);
    const now = new Date()
    const diff = now.getTime() - inputDate.getTime()
    return Math.floor(diff / 1000)
}


export async function hasInternetAvailable(): Promise<boolean> {
    const state: NetInfoState = await NetInfo.fetch()
    return state.isConnected ? true : false
}


export function shuffle<T>(array: T[]) {
  let currentIndex = array.length;
  
  while (currentIndex != 0) {    
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  
}


export async function clearCache() {
    try {
        const cacheDir = RNFS.CachesDirectoryPath;
        const items = await RNFS.readDir(cacheDir);

        if (items.length > 0) {
            const deletePromises = items.map(item => RNFS.unlink(item.path));
            await Promise.all(deletePromises);
        }
        console.log("Cache content cleared successfully!");
    } catch (error) {
        console.error("Error clearing cache content:", error);
    }
}


export async function getDirectorySizeBytes(path: string): Promise<number> {
  let totalSize = 0;
  try {
    const items = await RNFS.readDir(path);
    
    const sizePromises = items.map(async (item: any) => {
      if (item.isFile()) {
        return parseInt(item.size, 10);
      }
      if (item.isDirectory()) {
        return await getDirectorySizeBytes(item.path);
      }
      return 0;
    });
    
    const sizes = await Promise.all(sizePromises);
    
    totalSize = sizes.reduce((acc, size) => acc + size, 0);

  } catch (error) {
    console.error(`Erro ao ler o diretório ${path}:`, error);
  }

  return totalSize;
};


export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export async function getCacheSizeBytes(): Promise<number> {
    const s = await getDirectorySizeBytes(RNFS.CachesDirectoryPath)
    return s
}

export async function getCacheSizeKB(): Promise<number> {
    const s = await getDirectorySizeBytes(RNFS.CachesDirectoryPath)
    return Math.floor(s / 1024)
}

export function formatNumberWithSuffix(num: number): string {  
  if (!num) { return '0'; }
  
  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);

  if (absNum < 1000) {
    return sign + absNum;
  }

  const suffixes = ['K', 'M', 'B'];

  const tier = Math.floor(Math.log10(absNum) / 3) - 1;
  
  const suffix = suffixes[Math.min(tier, suffixes.length - 1)];
    
  const value = (absNum / Math.pow(1000, tier + 1));
  
  const formattedValue = value.toFixed(1).replace(/\.0$/, '');

  return `${sign}${formattedValue}${suffix}`;
}


export function hasOnlyDigits(str: string): boolean {
  const regex = /^\d+$/;
  return regex.test(str);
}

export async function openUrl(url: string) {
  try {
      await Linking.openURL(url)
  } catch (error) {
    Toast.show(ToastMessages.EN.UNABLE_TO_OPEN_BROWSER)
  }
};


export async function copyToClipboard(value: string) {
  await Clipboard.setStringAsync(value);
  Toast.show(ToastMessages.EN.COPIED_TO_CLIPBOARD)
}


export function getChapterGridNumColumns(): number {
  const w = wp(92)  
  if (w >= 440) { return 9 }
  if (w >= 400) { return 8 }
  if (w >= 360) { return 7 }
  return 6
}

export const decode = (base64: any): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};


export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {        
    const storageGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "Acerola needs access to your photos",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return storageGranted === PermissionsAndroid.RESULTS.GRANTED
  } catch (err) {
    console.warn(err);
    return false;
  }
};


export function getYesterday(delta: number = 1): Date {
  const d = new Date();
  d.setDate(d.getDate() - delta);
  return d;
}


const prepareFolder = async (folderPath: string) => {
  const exists = await RNFS.exists(folderPath);
  if (exists) {
    await RNFS.unlink(folderPath);
  }
  await RNFS.mkdir(folderPath, { NSURLIsExcludedFromBackupKey: true });
};


export const downloadManhwaChapter = async (
  urls: string[],
  chapter_id: number,
  maxParallel: number = 8,
  onProgress?: (progress: DownloadProgress) => void
): Promise<string[]> => {

  const basePath = `${RNFS.CachesDirectoryPath}/${chapter_id}`;
  await prepareFolder(basePath);

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


export function normalizeRandomManhwaCardHeight(width: number, height: number): {
  normalizedWidth: number, 
  normalizedHeight: number
} {
  const normalizedHeight = height > AppConstants.COMMON.RANDOM_MANHWAS.MAX_HEIGHT ? 
  AppConstants.COMMON.RANDOM_MANHWAS.MAX_HEIGHT : height

  let normalizedWidth = (normalizedHeight * width) / height

  normalizedWidth = normalizedWidth > AppConstants.COMMON.RANDOM_MANHWAS.MAX_WIDTH ? 
  AppConstants.COMMON.RANDOM_MANHWAS.MAX_WIDTH : normalizedWidth
  
  return { normalizedWidth, normalizedHeight}
}