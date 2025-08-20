import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Dimensions, PermissionsAndroid } from "react-native";
import { ToastMessages } from '@/constants/Messages';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard'
import { DownloadProgress } from './types';
import { Platform } from 'react-native';
import { Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';


/**
 * Pauses execution for the specified number of milliseconds.
 *
 * Useful for delaying operations, throttling requests, or waiting
 * between asynchronous steps without blocking the event loop.
 *
 * @param ms - Number of milliseconds to wait. Must be a non-negative integer.
 * @returns A Promise that resolves after the delay with no value.
 *
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const {
    width: deviceWidth, 
    height: deviceHeight
} = Dimensions.get('window');


/**
 * Calculates a percentage-based width relative to the device's initial window width.
 * 
 * Note: Uses initial device dimensions captured at module load time. Does not respond 
 * to screen rotation or dimension changes during runtime.
 * 
 * @param percentage - The percentage of the device width to calculate (0-100)
 * @returns Calculated pixel value representing the percentage of device width
 */
export function wp(percentage: number) {
    const width = deviceWidth;
    return (percentage * width) / 100;
}


/**
 * Calculates a percentage-based height relative to the device's initial window height.
 * 
 * Note: Uses initial device dimensions captured at module load time. Does not respond 
 * to screen rotation or dimension changes during runtime.
 * 
 * @param percentage - The percentage of the device height to calculate (0-100)
 * @returns Calculated pixel value representing the percentage of device height
 */
export function hp(percentage: number) {
    const height = deviceHeight;
    return (percentage * height) / 100;
}


/**
 * Calculates grid item dimensions while maintaining aspect ratio.
 * 
 * Computes display dimensions for grid items based on:
 *   - Current screen width (using initial device dimensions)
 *   - Specified layout configuration
 *   - Original aspect ratio of the item
 * 
 * @param horizontalPadding - Total horizontal padding (left + right) in pixels
 * @param gap - Horizontal gap between columns in pixels
 * @param columns - Number of columns in the grid
 * @param originalWidth - Original width of the item (for aspect ratio calculation)
 * @param originalHeight - Original height of the item (for aspect ratio calculation)
 * 
 * @returns Object containing calculated display width and height
 */
export function getItemGridDimensions(
    horizontalPadding: number,
    gap: number,
    columns: number,
    originalWidth: number,
    originalHeight: number
): {width: number, height: number} {
  const width = (wp(100) - (horizontalPadding * 2) - ((columns * gap) - gap)) / columns
  const height = width * (originalHeight / originalWidth)
  return { width, height }
}


/**
 * Calculates proportional height while maintaining aspect ratio.
 * 
 * @param originalWidth - Original reference width of the item
 * @param originalHeight - Original reference height of the item
 * @param width - Target width for which to calculate proportional height
 * @returns Height value maintaining original aspect ratio
 */
export function getRelativeHeight(originalWidth: number, originalHeight: number, width: number): number {
  return width * (originalHeight / originalWidth)
}


/**
 * Calculates proportional width while maintaining aspect ratio.
 * 
 * @param originalWidth - Original reference width of the item
 * @param originalHeight - Original reference height of the item
 * @param height - Target height for which to calculate proportional width
 * @returns Width value maintaining original aspect ratio
 */
export function getRelativeWidth(originalWidth: number, originalHeight: number, height: number): number {
  return height * (originalWidth / originalHeight)
}


/**
 * Formats a timestamp into a human-readable date string.
 * 
 * @param timestamp - ISO date string to format
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export function formatTimestamp(timestamp: string): string {      
  const date = new Date(timestamp)
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options as any);
}


/**
 * Calculates elapsed time in seconds since a given datetime.
 * 
 * @param dateTimeString - ISO datetime string as starting point
 * @returns Integer representing seconds elapsed since the input datetime
 */
export function secondsSince(dateTimeString: string): number {
    const inputDate = new Date(dateTimeString);
    const now = new Date()
    const diff = now.getTime() - inputDate.getTime()
    return Math.floor(diff / 1000)
}


/**
 * Checks internet connectivity status.
 * 
 * @returns Promise that resolves to true if internet connection is available, false otherwise
 */
export async function hasInternetAvailable(): Promise<boolean> {
    const state: NetInfoState = await NetInfo.fetch()
    return state.isConnected === true ? true : false
}


/**
 * Clears all files from the application's cache directory.
 * 
 * Note: Does not clear in-memory caches, only persistent storage files
 */
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


/**
 * Recursively calculates the total size of a directory in bytes.
 * 
 * Traverses all files and subdirectories at the given path, summing file sizes.
 * Handles errors by logging and returning 0.
 * 
 * @param path - Filesystem path of the directory to measure
 * @returns Promise resolving to total byte count of directory contents
 */
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


/**
 * Formats bytes into human-readable file size string
 * 
 * @param bytes - Size value in bytes
 * @param decimals - Number of decimal places to include (default: 2)
 * @returns Formatted size string with appropriate unit (Bytes, KB, MB, etc.)
 */
export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


/**
 * Calculates total size of cache directory in bytes
 * 
 * @returns Promise resolving to cache size in bytes
 */
export async function getCacheSizeBytes(): Promise<number> {
  const s = await getDirectorySizeBytes(RNFS.CachesDirectoryPath)
  return s
}


/**
 * Calculates total size of cache directory in kilobytes
 * 
 * @returns Promise resolving to cache size in kilobytes (integer)
 */
export async function getCacheSizeKB(): Promise<number> {
  const s = await getDirectorySizeBytes(RNFS.CachesDirectoryPath)
  return Math.floor(s / 1024)
}


/**
 * Formats large numbers with K/M/B suffixes
 * 
 * @param num - Number to format
 * @returns Formatted string with appropriate suffix
 * 
 * @example
 * 1500 => "1.5K"
 * 2500000 => "2.5M"
 * 1000000000 => "1B"
 */
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


/**
 * Checks if a string contains only digit characters
 * 
 * @param str - String to validate
 * @returns True if string consists exclusively of digits (0-9), false otherwise
 */
export function hasOnlyDigits(str: string): boolean {
  const regex = /^\d+$/;
  return regex.test(str);
}


/**
 * Attempts to open a URL in the device's default browser
 * 
 * Shows error toast if unable to open the URL
 * 
 * @param url - The URL to open
 */
export async function openUrl(url: string) {
  try {
      await Linking.openURL(url)
  } catch (error) {
    Toast.show(ToastMessages.EN.UNABLE_TO_OPEN_BROWSER)
  }
};


/**
 * Copies text to device clipboard and shows confirmation toast
 * 
 * @param value - The string value to copy to clipboard
 */
export async function copyToClipboard(value: string) {
  await Clipboard.setStringAsync(value);
  Toast.show(ToastMessages.EN.COPIED_TO_CLIPBOARD)
}


/**
 * Determines optimal number of columns for chapter grid based on screen width
 * 
 * Uses 92% of screen width (via wp(92)) to calculate:
 *   - 9 columns for widths >=440
 *   - 8 columns for widths >=400
 *   - 7 columns for widths >=360
 *   - 6 columns for smaller widths
 * 
 * @returns Number of columns to display in chapter grid
 */
export function getChapterGridNumColumns(): number {
  const w = wp(92)  
  if (w >= 440) { return 9 }
  if (w >= 400) { return 8 }
  if (w >= 360) { return 7 }
  return 6
}


/**
 * Decodes base64 string into ArrayBuffer
 * 
 * @param base64 - Base64 encoded data
 * @returns Decoded binary data as ArrayBuffer
 */
export const decode = (base64: any): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};


/**
 * Requests storage permissions on Android devices
 * 
 * On Android: Prompts user for READ_EXTERNAL_STORAGE permission
 * On iOS: Immediately returns true (permissions not required)
 * 
 * @returns Promise resolving to:
 *   - true if permission granted or on non-Android
 *   - false if permission denied or error occurred
 */
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


/**
 * Calculates a past date relative to today
 * 
 * @param delta - Number of days to subtract from current date (default: 1)
 * @returns Date object representing the calculated past date
 */
export function getPastDate(delta: number = 1): Date {
  const d = new Date();
  d.setDate(d.getDate() - delta);
  return d;
}


/**
 * Prepares a directory for file operations by ensuring a clean state
 * 
 * This helper function:
 *  1. Checks if the target folder exists
 *  2. Deletes the folder and all contents if it exists
 *  3. Creates a new empty directory at the specified path
 *  4. Sets iOS-specific flag to exclude from iCloud backups
 * 
 * @param folderPath - Full filesystem path of the directory to prepare
 * 
 * @note 
 *   - Uses synchronous filesystem operations
 *   - Implements data protection by excluding from backups on iOS
 *   - Ensures clean state for subsequent file operations
 */
const prepareFolder = async (folderPath: string) => {
  const exists = await RNFS.exists(folderPath);
  if (exists) {
    await RNFS.unlink(folderPath);
  }
  await RNFS.mkdir(folderPath, { NSURLIsExcludedFromBackupKey: true });
};


/**
 * Downloads all images for a manhwa chapter with parallel execution control
 * 
 * This function:
 *  1. Prepares a clean cache folder for the chapter
 *  2. Downloads images concurrently with configurable parallelism
 *  3. Provides progress updates through callback
 *  4. Ensures proper file naming and sorting
 * 
 * @param urls - Array of image URLs to download
 * @param chapter_id - Unique chapter identifier for folder naming
 * @param maxParallel - Maximum concurrent downloads (default: 8)
 * @param onProgress - Optional progress callback providing download metrics
 * 
 * @returns Promise resolving to sorted array of local file paths for downloaded images
 * 
 * @note
 *   - Automatically determines file extensions from URLs
 *   - Progress reporting includes both per-file and overall completion
 */
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



export async function dbGetSupportedAbis(): Promise<string> {
  return (await DeviceInfo.supportedAbis()).join(", "); 
}


export async function getDeviceName(): Promise<string> {
  const model = DeviceInfo.getModel()
  const systemName = DeviceInfo.getSystemName()
  const systemVersion = DeviceInfo.getSystemVersion()
  const supportedAbis = await dbGetSupportedAbis()
  const device = `${model}, ${supportedAbis}, ${systemName}[${systemVersion}]`
  return device
}