import AsyncStorage from "@react-native-async-storage/async-storage";
import { DownloadItem, DownloadStatus, Listener } from './types';
import RNFS from 'react-native-fs';


class DownloadManager {
  private queue: DownloadItem[];
  private currentDownload: DownloadItem | null;
  private isDownloading: boolean;
  private listeners: Set<Listener>;
  private readonly STORAGE_KEY: string = '@download_queue';
  private totalDownloaded: number = 0;

  constructor() {
    this.queue = [];
    this.currentDownload = null;
    this.isDownloading = false;
    this.listeners = new Set();
    this.loadQueue();
  }

  // Adiciona um listener para atualizações de status
  addListener(listener: Listener): void {
    this.listeners.add(listener);
    this.notifyListeners();
  }

  // Remove um listener
  removeListener(listener: Listener): void {
    this.listeners.delete(listener);
  }

  // Notifica todos os listeners sobre mudanças de status
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  // Carrega a fila de downloads do armazenamento persistente
  private async loadQueue(): Promise<void> {
    try {
      const savedQueue = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedQueue) {
        const parsedQueue = JSON.parse(savedQueue);
        this.queue = parsedQueue.queue || [];
        this.totalDownloaded = parsedQueue.totalDownloaded || 0;
        this.notifyListeners();
        this.startDownload();
      }
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
    }
  }

  // Salva a fila de downloads no armazenamento persistente
  private async saveQueue(): Promise<void> {
    try {
      const dataToSave = {
        queue: this.queue,
        totalDownloaded: this.totalDownloaded
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erro ao salvar fila:', error);
    }
  }

  // Adiciona um capítulo à fila de downloads
  async addChapter(
    manhwaId: string,
    manhwaTitle: string,
    chapterId: string,
    chapterTitle: string,
    images: string[]
  ): Promise<void> {
    const newDownload: DownloadItem = {
      id: `${manhwaId}_${chapterId}`,
      manhwaId,
      manhwaTitle,
      chapterId,
      chapterTitle,
      images,
      progress: 0,
      status: 'pending',
      createdAt: Date.now()
    };

    // Verifica se já existe na fila
    if (this.queue.some(item => item.id === newDownload.id)) {
      throw new Error('Este capítulo já está na fila de downloads');
    }

    this.queue.push(newDownload);
    this.notifyListeners();
    await this.saveQueue();
    this.startDownload();
  }

  // Inicia o processo de download
  private async startDownload(): Promise<void> {
    if (this.isDownloading || this.queue.length === 0) return;

    this.isDownloading = true;
    this.notifyListeners();

    while (this.queue.length > 0 && this.isDownloading) {
      this.currentDownload = this.queue[0];
      this.currentDownload.status = 'downloading';
      this.notifyListeners();

      try {
        await this.downloadImages(this.currentDownload);
        this.currentDownload.status = 'completed';
        this.currentDownload.progress = 100;
        this.totalDownloaded += 1;
        
        // Remove o download concluído da fila
        this.queue.shift();
        await this.saveQueue();
      } catch (error: any) {
        this.currentDownload.status = 'error';
        this.currentDownload.errorMessage = error.message;
        console.error('Erro no download:', error);
        break;
      }
    }

    this.isDownloading = false;
    this.currentDownload = null;
    this.notifyListeners();
  }

  // Faz o download das imagens de um capítulo
  private async downloadImages(chapter: DownloadItem): Promise<void> {
    const downloadPath = `${RNFS.DocumentDirectoryPath}/manhwas/${chapter.manhwaId}/${chapter.chapterId}`;
    
    // Cria o diretório se não existir
    try {
      await RNFS.mkdir(downloadPath, { NSURLIsExcludedFromBackupKey: true });
    } catch (error) {
      // Ignora erro se o diretório já existir
    }

    const totalImages = chapter.images.length;
    let downloadedImages = 0;

    for (let i = 0; i < totalImages; i++) {
      if (!this.isDownloading) break; // Para se o download foi pausado

      try {
        const imageUrl = chapter.images[i];
        const filename = `page_${i + 1}.jpg`;
        const path = `${downloadPath}/${filename}`;

        const downloadResult = await RNFS.downloadFile({
          fromUrl: imageUrl,
          toFile: path,
          background: true,
          progress: (res) => {
            // Calcula o progresso geral considerando todas as imagens
            const imageProgress = res.bytesWritten / res.contentLength;
            const overallProgress = (downloadedImages + imageProgress) / totalImages;
            chapter.progress = Math.round(overallProgress * 100);
            this.notifyListeners();
          }
        }).promise;

        if (downloadResult.statusCode === 200) {
          downloadedImages++;
        } else {
          throw new Error(`Falha no download: status ${downloadResult.statusCode}`);
        }
      } catch (error: any) {
        throw new Error(`Falha no download da imagem ${i + 1}: ${error.message}`);
      }
    }
  }

  // Pausa o download atual
  pauseDownload(): void {
    this.isDownloading = false;
    if (this.currentDownload) {
      this.currentDownload.status = 'paused';
    }
    this.notifyListeners();
  }

  // Retoma os downloads
  resumeDownload(): void {
    if (!this.isDownloading && this.queue.length > 0) {
      this.startDownload();
    }
  }

  // Remove um download da fila
  async removeDownload(downloadId: string): Promise<void> {
    // Se for o download atual, pausa primeiro
    if (this.currentDownload && this.currentDownload.id === downloadId) {
      this.pauseDownload();
    }
    
    this.queue = this.queue.filter(item => item.id !== downloadId);
    this.notifyListeners();
    await this.saveQueue();
    
    // Se não está baixando mas há itens na fila, reinicia
    if (!this.isDownloading && this.queue.length > 0) {
      this.startDownload();
    }
  }

  // Retorna o status atual dos downloads
  getStatus(): DownloadStatus {
    return {
      queue: [...this.queue],
      currentDownload: this.currentDownload ? {...this.currentDownload} : null,
      isDownloading: this.isDownloading,
      totalDownloaded: this.totalDownloaded
    };
  }

  // Limpa todos os downloads concluídos ou com erro
  async clearCompleted(): Promise<void> {
    this.queue = this.queue.filter(item => 
      item.status !== 'completed' && item.status !== 'error'
    );
    this.notifyListeners();
    await this.saveQueue();
  }
}

// Exporta uma instância singleton do gerenciador de downloads
export default new DownloadManager();