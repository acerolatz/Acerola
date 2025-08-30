import { createChapterDir, deleteDocumentDir } from "@/helpers/storage";
import * as SQLite from "expo-sqlite";
import { DownloadRecord, Chapter } from "@/helpers/types";


class DatabaseManager {
  private db: SQLite.SQLiteDatabase;
  
  constructor() {
    this.db = SQLite.openDatabaseSync("downloads.db");
    this.initDownloadsTable();
  }

  private async initDownloadsTable(): Promise<void> {
    try {
      console.log("[DOWNLOAD DATABASE START]");
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA foreign_keys = ON;
        PRAGMA temp_store = MEMORY;
        PRAGMA cache_size = -1024;
        PRAGMA mmap_size = 268435456;
        PRAGMA optimize;

        CREATE TABLE IF NOT EXISTS downloads (
          manhwa_id INTEGER NOT NULL,
          chapter_id INTEGER NOT NULL,
          chapter_name TEXT NOT NULL,
          path TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'completed', 'failed', 'cancelled')),
          progress INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          CONSTRAINT downloads_pkey PRIMARY KEY (manhwa_id, chapter_id)
        );

        CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
        CREATE INDEX IF NOT EXISTS idx_downloads_manhwa_id ON downloads(manhwa_id);
        CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at);
        CREATE INDEX IF NOT EXISTS idx_downloads_manhwa_chapter ON downloads(manhwa_id, chapter_id);
      `);
      console.log("[DOWNLOAD DATABASE END]");
    } catch (error) {
      console.error("[ERROR INITIALIZING DATABASE]", error);
      throw error;
    }
  }

  async downloadExists(manhwa_id: number, chapter_id: number): Promise<boolean> {
    const r = await this.db.getFirstAsync<{status: string}>(
      'SELECT manhwa_id FROM downloads WHERE manhwa_id = ? AND chapter_id = ?;',
      [manhwa_id, chapter_id]
    ).catch(error => {console.log("error downloadExists", error); return null})
    return r !== null
  }
  
  async createDownload(chapter: Chapter): Promise<DownloadRecord> {
    const path = await createChapterDir(chapter.manhwa_id, chapter.chapter_id)
    const record: DownloadRecord = {
      manhwa_id: chapter.manhwa_id,
      chapter_id: chapter.chapter_id,
      chapter_name: chapter.chapter_name,
      path,
      status: 'pending',
      created_at: Date.now()
    }
    try {
      await this.db.runAsync(
        `INSERT INTO 
            downloads (manhwa_id, chapter_id, chapter_name, path, status, created_at) 
         VALUES 
            (?, ?, ?, ?, ?, ?)
         `,
        [
          chapter.manhwa_id,
          chapter.chapter_id,
          chapter.chapter_name,
          path,
          'pending',
          record.created_at
        ]
      );
      console.log(`Download created for manhwa ${record.manhwa_id}, chapter ${record.chapter_id}`);
    } catch (error) {
      console.error("Error creating download:", error);
      record.status = 'failed'
    }
    return record
  }
  
  async getAllDownloads(): Promise<DownloadRecord[]> {
    try {
      const result = await this.db.getAllAsync<DownloadRecord>(
        "SELECT * FROM downloads ORDER BY created_at DESC"
      );
      return result;
    } catch (error) {
      console.error("Error fetching downloads:", error);
      throw error;
    }
  }
  
  async getDownloadById(manhwa_id: number, chapter_id: number): Promise<DownloadRecord | null> {
    try {
      const result = await this.db.getFirstAsync<DownloadRecord>(
        "SELECT * FROM downloads WHERE manhwa_id = ? AND chapter_id = ?",
        [manhwa_id, chapter_id]
      );
      return result || null;
    } catch (error) {
      console.error("Error fetching download:", error);
      throw error;
    }
  }

  async getDownloadByChapterId(chapter_id: number): Promise<DownloadRecord | null> {
    try {
      const result = await this.db.getFirstAsync<DownloadRecord>(
        "SELECT * FROM downloads WHERE chapter_id = ?",
        [chapter_id]
      );
      return result || null;
    } catch (error) {
      console.error("Error fetching download:", error);
      throw error;
    }
  }

  async getDownloadByManhwaId(manhwa_id: number): Promise<DownloadRecord | null> {
    try {
      const result = await this.db.getFirstAsync<DownloadRecord>(
        "SELECT * FROM downloads WHERE manhwa_id = ?",
        [manhwa_id]
      );
      return result || null;
    } catch (error) {
      console.error("Error fetching download:", error);
      throw error;
    }
  }

  async updateDownloadProgress(manhwa_id: number, chapter_id: number, progress: number) {
    try {
      await this.db.runAsync(
        "UPDATE downloads SET progress = ? WHERE manhwa_id = ? AND chapter_id = ?",
        [Math.floor(progress), manhwa_id, chapter_id]
      );
    } catch (error) {
      console.error("[ERROR UPDATING DOWNLOAD PROGRESS]", manhwa_id, chapter_id, error);
      throw error;
    }  
  }
  
  async updateDownloadStatus(manhwa_id: number, chapter_id: number, status: DownloadRecord['status']): Promise<void> {
    try {
      await this.db.runAsync(
        "UPDATE downloads SET status = ? WHERE manhwa_id = ? AND chapter_id = ?",
        [status, manhwa_id, chapter_id]
      );
    } catch (error) {
      console.error("[ERROR UPDATING DOWNLOAD STATUS]", manhwa_id, chapter_id, error);
      throw error;
    }
  }
  
  async deleteDownload(manhwa_id: number, chapter_id: number): Promise<void> {
    try {
      const d: DownloadRecord | null = await this.getDownloadById(manhwa_id, chapter_id)
      if (d) {
        await deleteDocumentDir(d.path)
        await this.db.runAsync(
          "DELETE FROM downloads WHERE manhwa_id = ? AND chapter_id = ?",
          [manhwa_id, chapter_id]
        );
        console.log(`[DOWNLOAD DELETED FOR MANHWA ${manhwa_id} CHAPTER ${chapter_id}]`);
      }
    } catch (error) {
      console.error("[ERROR DELETING DOWNLOAD]", manhwa_id, chapter_id, error);
    }
  }
  
  async printAllDownloads(): Promise<void> {
    try {
      const downloads = await this.getAllDownloads();
      console.log("\n=== ALL DOWNLOADS ===");
      downloads.forEach(download => {
        console.log(
          `Manhwa: ${download.manhwa_id}, ` +
          `Chapter: ${download.chapter_id} (${download.chapter_name}), ` +
          `Status: ${download.status}, ` +
          `Path: ${download.path}, ` +
          `Created: ${new Date(download.created_at).toLocaleString()}`
        );
      });
      console.log(`Total: ${downloads.length} downloads\n`);
    } catch (error) {
      console.error("Error printing downloads:", error);
    }
  }
  
  async printDownloadsByStatus(status: DownloadRecord['status']): Promise<void> {
    try {
      const result = await this.db.getAllAsync<DownloadRecord>(
        "SELECT * FROM downloads WHERE status = ? ORDER BY created_at DESC",
        [status]
      );
      
      console.log(`\n=== DOWNLOADS WITH STATUS: ${status.toUpperCase()} ===`);
      result.forEach(download => {
        console.log(
          `Manhwa: ${download.manhwa_id}, ` +
          `Chapter: ${download.chapter_id} (${download.chapter_name}), ` +
          `Path: ${download.path}, ` +
          `Created: ${new Date(download.created_at).toLocaleString()}`
        );
      });
      console.log(`Total: ${result.length} downloads\n`);
    } catch (error) {
      console.error("Error printing downloads by status:", error);
    }
  }
  
  async closeConnection(): Promise<void> {
    await this.db.closeAsync();
    console.log("[DOWNLOAD DATABASE CONNCETION CLOSED]");
  }
}


export const databaseManager = new DatabaseManager();