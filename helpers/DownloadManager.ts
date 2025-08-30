import { DownloadRequest, DownloadRecord, DownloadProgress } from "@/helpers/types";
import { databaseManager } from "@/lib/downloadDatabase";
import { EventEmitter } from "eventemitter3";
import { downloadImages } from "./storage";



class DownloadManager {
  private static instance: DownloadManager;
  private queue: DownloadRequest[] = [];
  private isDownloading = false;
  private emitter = new EventEmitter();
  private db = databaseManager

  static getInstance() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  on(event: "progress" | "queueUpdate", listener: (data: any) => void) {
    this.emitter.on(event, listener);
  }

  off(event: "progress" | "queueUpdate", listener: (data: any) => void) {
    this.emitter.off(event, listener);
  }

  async addToQueue(request: DownloadRequest): Promise<boolean> {
    const exists = await this.db.downloadExists(request.chapter.manhwa_id, request.chapter.chapter_id)
    if (exists) { return false }
    this.queue.push(request);
    this.emitter.emit("queueUpdate", this.queue);
    this.processQueue();
    return true
  }

  private async processQueue() {
    if (this.isDownloading || this.queue.length === 0) return;
    this.isDownloading = true;

    const request = this.queue.shift()!;
    this.emitter.emit("queueUpdate", this.queue);

    try {
      await this.downloadChapter(request);
    } finally {
      this.isDownloading = false;
      this.processQueue();
    }
  }

  private async downloadChapter(request: DownloadRequest) {
    const record: DownloadRecord = await this.db.createDownload(request.chapter)
    this.db.updateDownloadStatus(record.manhwa_id, record.chapter_id, 'downloading')

    await downloadImages(
      request.images, 
      record.path,
      async (process: DownloadProgress) => {
        await this.db.updateDownloadProgress(record.manhwa_id, record.chapter_id, process.percentage)
      }
    )

    this.db.updateDownloadStatus(record.manhwa_id, record.chapter_id, 'completed')
  }  

}

export const downloadManager = DownloadManager.getInstance();
