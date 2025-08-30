import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Dimensions, PermissionsAndroid } from "react-native";
import { ToastMessages } from '@/constants/Messages';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard'
import { Platform } from 'react-native';
import { Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';


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
  return (originalHeight * width) / originalWidth;
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
  return (originalWidth / originalHeight) * height;
}


export function formatTimestamp(timestamp: string): string {      
  const date = new Date(timestamp)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options as any);
}


export function formatTimestampWithHour(timestamp: string): string {
  const date = new Date(timestamp)
  const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options as any);  
}


export async function hasInternetAvailable(): Promise<boolean> {
    const state: NetInfoState = await NetInfo.fetch()
    return state.isConnected === true ? true : false
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


/**
 * Determines optimal number of columns for chapter grid based on screen width
 * 
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


export async function dbGetSupportedAbis(): Promise<string> {
  return (await DeviceInfo.supportedAbis()).slice(0, 1).join(", "); 
}


export async function getDeviceName(): Promise<string> {
  const model = DeviceInfo.getModel()
  const systemName = DeviceInfo.getSystemName()
  const systemVersion = DeviceInfo.getSystemVersion()
  const supportedAbis = await dbGetSupportedAbis()
  const device = `${model}, ${supportedAbis}, ${systemName}[${systemVersion}]`
  return device
}

