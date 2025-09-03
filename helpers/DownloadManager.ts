import { 
  dbCreateDownload, 
  dbDeleteAllDownloads, 
  dbReadDownload, 
  dbReadPendingDownloads, 
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
  private currentDownloadProgress: DownloadProgress = { current: 0, total: 0, percentage: 0 };
  private emitter = new EventEmitter();

  static getInstance() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  private resetDownloadProgress() {
    this.currentDownloadProgress.current = 0;
    this.currentDownloadProgress.percentage = 0;
    this.currentDownloadProgress.total = 0;
  }

  async init(db: SQLiteDatabase) {
    const records: DownloadRequest[] = await dbReadPendingDownloads(db);
    await asyncPool(
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
    show_warnings: boolean = true,
    exists_ok: boolean = false
  ): Promise<boolean> {
    const download: DownloadRecord | null = await dbReadDownload(db, request.chapter_id);
    if (download !== null && !exists_ok) {
      if (show_warnings) {
        Toast.show({
          text1: "Download already exists!",
          text2: `Status: ${download.status}`,
          type: "error"
        });
      }
      return false;
    }
    await dbCreateDownload(db, request.manhwa_id, request.chapter_id, request.chapter_name);
    this.queue.push(request);
    this.emitter.emit("queueUpdate", this.queue);
    this.processQueue(db);
    return true;
  }

  private async processQueue(db: SQLiteDatabase) {
    if (this.isDownloading || this.queue.length === 0 || this.isPaused) return;

    this.isDownloading = true;
    const request = this.queue.shift()!;
    this.emitter.emit("queueUpdate", this.queue);

    try {
      const record = await dbReadDownload(db, request.chapter_id);
      if (record && !this.isCancelled) {
        await this.downloadChapter(db, record);
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
    this.resetDownloadProgress();

    await downloadImages(
      images,
      record.path,
      (progress: DownloadProgress): boolean => {
        if (this.isPaused || this.isCancelled) return true;
        this.currentDownloadProgress.current = progress.current;
        this.currentDownloadProgress.percentage = progress.percentage;
        this.currentDownloadProgress.total = progress.total;
        return false
      }      
    );

    if (this.isCancelled) {
      await dbUpdateDownloadStatus(db, record.chapter_id, "cancelled");
    } else {
      await dbUpdateDownloadStatus(db, record.chapter_id, "completed");
    }
    this.resetDownloadProgress();
  }

  /** Pausar todos os downloads */
  pauseDownloads() {
    this.isPaused = true;
    this.emitter.emit("queueUpdate", this.queue);
  }

  /** Retomar downloads */
  resumeDownloads(db: SQLiteDatabase) {
    this.isPaused = false;
    this.processQueue(db);
  }

  /** Cancelar todos os downloads */
  async cancelAllDownloads(db: SQLiteDatabase) {
    this.isCancelled = true;
    this.isPaused = false;
    this.queue = [];
    this.resetDownloadProgress();
    await dbDeleteAllDownloads(db);
    this.emitter.emit("queueUpdate", this.queue);
    this.isCancelled = false;
  }

  getCurrentDownloadProgressPercentage(): number {
    return this.currentDownloadProgress.percentage;
  }

  currentDownload(): DownloadRequest | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  queueSize(): number {
    return this.queue.length;
  }
}

export const downloadManager = DownloadManager.getInstance();
