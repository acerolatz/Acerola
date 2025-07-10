import { AppConstants } from '@/constants/AppConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Dimensions } from "react-native";


export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

export function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
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

export function formatTimestamp(timestamp: string): string {    
    const date = new Date(timestamp);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };    
    return date.toLocaleDateString('en-US', options as any);
}

export async function fetchJson(url: string): Promise<any> {
    return await fetch(url)
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error('Fetch error');
        }
        return resposta.json();
      })
      .catch((error) => {
        console.log("error fetchJson", error)
      });
}

export function getRelativeHeight(width: number, originalWidth: number, originalHeight: number): number {
    return width * (originalHeight / originalWidth)
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

export function secondsToMinutesAndSecondsStr(seconds: number): string {    
    const m = Math.floor(seconds / 60);
    const s = m % 60;    
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${mm}:${ss}`;
}

export function convertStringListToSet(input: string): Set<number> {
    const parts = input.split(',').map(s => s.trim());
    const numbers = parts
        .map(s => parseInt(s, 10))
        .filter(n => !Number.isNaN(n));
    return new Set(numbers);
}

export function choice<T>(arr: T[]): T | undefined {
    if (!Array.isArray(arr) || arr.length === 0) {
        return undefined;
    }
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

export function isColorDark(hex: string): boolean {
  const cleanHex = hex.replace(/^#/, '');
  
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(ch => ch + ch).join('')
    : cleanHex;
  
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);

  return luminance < AppConstants.DARK_COLOR_THRESHOLD;
}

export async function saveJson(key: string, obj: any) {
  try {
    const jsonStr = JSON.stringify(obj, null, 2);
    await AsyncStorage.setItem(key, jsonStr);
  } catch (error) {
    console.error('error saveJson:', error);
    throw error;
  }
}

export async function readJson(key: string): Promise<any | null> {
  try {
    const jsonStr = await AsyncStorage.getItem(key);
    return jsonStr != null ? JSON.parse(jsonStr) : null;
  } catch (error) {
    console.error('error readJson:', error);
    return null
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}