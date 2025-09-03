import { 
  dbCreateDownload,  
  dbDeleteNotCompletedDownloads,
  dbReadDownload,
  dbReadNotCompletedDownloads,
  dbUpdateDownloadStatus 
} from "@/lib/database";
import { 
  DownloadRequest, 
  DownloadRecord,  
  DownloadProgress
} from "./types";
import { spFetchChapterImagesUrls } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { EventEmitter } from "eventemitter3";
import { SQLiteDatabase } from "expo-sqlite";
import { downloadImages } from "./storage";
import { asyncPool } from "./util";


class DownloadManager {

  private static instance: DownloadManager;
  private queue: DownloadRequest[] = [];
  private isDownloading = false;
  private isPaused = false;
  private isCancelled = false;
  private currentDownloadProgress: number = 0;
  private emitter = new EventEmitter();

  static getInstance() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  private resetDownloadProgress() {
    this.currentDownloadProgress = 0;
  }

  async init(db: SQLiteDatabase) {
    const records: DownloadRequest[] = await dbReadNotCompletedDownloads(db);
    await asyncPool<DownloadRequest, void>(
      8, 
      records, 
      async (record) => await this.addToQueue(db, record, false, true)
    );
  }

  on(event: "progress" | "queueUpdate", listener: (data: any) => void) {
    this.emitter.on(event, listener);
  }

  off(event: "progress" | "queueUpdate", listener: (data: any) => void) {
    this.emitter.off(event, listener);
  }

  async addToQueue(
    db: SQLiteDatabase, 
    request: DownloadRequest,
    show_toast_message: boolean = true,
    exists_ok: boolean = false
  ) {
    const download: DownloadRecord | null = await dbReadDownload(db, request.chapter_id);
    if (download !== null && !exists_ok) {
      if (!show_toast_message) { return }
      Toast.show({
        text1: "Download already exists!",
        text2: `Status: ${download.status}`,
        type: "error"
      })
      return
    }
    await dbCreateDownload(db, request.manhwa_id, request.chapter_id, request.chapter_name);
    this.queue.push(request);
    this.emitter.emit("queueUpdate", this.queue);
    this.processQueue(db);
    if (show_toast_message) {
      Toast.show({text1: "Added to queue!", type: "success"});
    }
  }

  private async processQueue(db: SQLiteDatabase) {
    if (this.isDownloading || this.queue.length === 0 || this.isPaused) return;

    this.isDownloading = true;
    const request = this.queue.shift()!;    

    try {
      const record = await dbReadDownload(db, request.chapter_id);
      if (record && !this.isCancelled) {
        await this.downloadChapter(db, record);
        this.emitter.emit("progress", this.queue);
      }
    } finally {
      this.isDownloading = false;
      if (!this.isCancelled && !this.isPaused) {
        this.processQueue(db);
      }
    }
  }

  private async downloadChapter(db: SQLiteDatabase, record: DownloadRecord) {
    const images: string[] = await spFetchChapterImagesUrls(record.chapter_id);
    await dbUpdateDownloadStatus(db, record.chapter_id, "downloading");
    
    this.emitter.emit("progress", this.queue);
    this.resetDownloadProgress();

    await downloadImages(
      images,
      record.path,
      (progress: DownloadProgress): boolean => {
        if (this.isPaused || this.isCancelled) return true;
        this.currentDownloadProgress = progress.percentage;
        return false
      }      
    );
    
    await dbUpdateDownloadStatus(
      db, 
      record.chapter_id, 
      this.isCancelled ? "cancelled" : "completed"
    );

    this.resetDownloadProgress();
  }
  
  pauseDownloads() {
    this.isPaused = true;
    this.emitter.emit("queueUpdate", this.queue);
  }

  async resumeDownloads(db: SQLiteDatabase) {
    this.isPaused = false;
    const requests: DownloadRequest[] = await dbReadNotCompletedDownloads(db)
    await asyncPool<DownloadRequest, void>(
      8, 
      requests, 
      async (request: DownloadRequest) => { await this.addToQueue(db, request, false, true) }
    )
  }
  
  async cancelAllDownloads(db: SQLiteDatabase) {
    this.isCancelled = true;
    this.isPaused = false;
    this.queue = [];
    this.resetDownloadProgress();
    await dbDeleteNotCompletedDownloads(db);
    this.isCancelled = false;
    this.emitter.emit("queueUpdate", this.queue);
  }

  getCurrentDownloadProgressPercentage(): number {
    return this.currentDownloadProgress;
  }

  currentDownload(): DownloadRequest | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  queueSize(): number {
    return this.queue.length;
  }

  iPaused() {
    return this.isPaused
  }

}

export const downloadManager = DownloadManager.getInstance();
