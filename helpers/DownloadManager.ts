import { 
  dbCreateDownload, 
  dbDeleteAllDownloads, 
  dbReadDownload, 
  dbReadDownloadsByStatus, 
  dbReadPendingDownloads, 
  dbUpdateDownloadProgress, 
  dbUpdateDownloadStatus 
} from "@/lib/database";
import { 
  DownloadRequest, 
  DownloadRecord, 
  DownloadProgress 
} from "@/helpers/types";
import { spFetchChapterImagesUrls } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { EventEmitter } from "eventemitter3";
import { SQLiteDatabase } from "expo-sqlite";
import { downloadImages } from "./storage";



class DownloadManager {

  private static instance: DownloadManager;
  private queue: DownloadRequest[] = [];
  private isDownloading = false;
  private emitter = new EventEmitter();

  static getInstance() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  async init(db: SQLiteDatabase) {
    const records = await dbReadPendingDownloads(db)
    records.forEach(r => this.addToQueue(db, r,false))
  }

  on(event: "progress" | "queueUpdate", listener: (data: any) => void) {
    this.emitter.on(event, listener);
  }

  off(event: "progress" | "queueUpdate", listener: (data: any) => void) {
    this.emitter.off(event, listener);
  }

  async addToQueue(db: SQLiteDatabase, request: DownloadRequest, show_warnings: boolean = true): Promise<boolean> {
    const download: DownloadRecord | null = await dbReadDownload(db, request.chapter_id)
    if (download !== null) {
      if (show_warnings) {
        Toast.show({
          text1: "Download already exists!", 
          text2: `Status: ${download.status}`, 
          type: "error"
        })
      }
      return false
    }
    await dbCreateDownload(db, request.manhwa_id, request.chapter_id, request.chapter_name)
    this.queue.push(request);
    this.emitter.emit("queueUpdate", this.queue);
    this.processQueue(db);
    return true
  }

  private async processQueue(db: SQLiteDatabase) {
    if (this.isDownloading || this.queue.length === 0) return;
    this.isDownloading = true;

    const request = this.queue.shift()!;
    this.emitter.emit("queueUpdate", this.queue)

    try {
      const record = await dbReadDownload(db, request.chapter_id)
      if (record) { await this.downloadChapter(db, record); }
    } finally {
      this.isDownloading = false;
      this.processQueue(db);
    }
  }

  private async downloadChapter(db: SQLiteDatabase, record: DownloadRecord) {    
    const images: string[] = await spFetchChapterImagesUrls(record.chapter_id)
    await dbUpdateDownloadStatus(db, record.chapter_id, 'downloading')
    await downloadImages(images, record.path)
    await dbUpdateDownloadStatus(db, record.chapter_id, 'completed')
  }

  async deleteAllDownloads(db: SQLiteDatabase) {
    await dbDeleteAllDownloads(db)
    this.queue = []
  }

  currentDownload(): DownloadRequest | null {
    return this.queue.length > 0 ? this.queue[0] : null    
  }

  queueSize(): number {
    return this.queue.length
  }

}

export const downloadManager = DownloadManager.getInstance();
