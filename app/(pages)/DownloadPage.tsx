import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,  
  SafeAreaView,
  Pressable
} from 'react-native';
import { Listener, DownloadItem, DownloadStatus } from '@/helpers/types';
import DownloadManager from '@/helpers/DownloadManager';
import ReturnButton from '@/components/buttons/ReturnButton';
import { Typography } from '@/constants/typography';
import { AppStyle } from '@/styles/AppStyle';
import TopBar from '@/components/TopBar';
import Row from '@/components/util/Row';
import { useSQLiteContext } from 'expo-sqlite';


const DownloadScreen = () => {

  const [downloads, setDownloads] = useState<DownloadStatus>(DownloadManager.getStatus());
  const isDownloading = downloads.isDownloading
  const queueIsEmpty = downloads.queue.length === 0  

  useEffect(() => {
    const handleUpdate: Listener = (status) => {
      setDownloads({...status});
    };

    DownloadManager.addListener(handleUpdate);
    return () => { DownloadManager.removeListener(handleUpdate); };
  }, []);

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.manhwaTitle}>{item.manhwaTitle}</Text>
        <Text style={styles.chapterTitle}>Capítulo: {item.chapterTitle}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${item.progress}%` },
              item.status === 'error' && styles.progressError
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          item.status === 'downloading' && styles.statusDownloading,
          item.status === 'completed' && styles.statusCompleted,
          item.status === 'error' && styles.statusError,
          item.status === 'paused' && styles.statusPaused,
        ]}>
          {getStatusText(item.status)}
        </Text>
        
        {item.status === 'error' && item.errorMessage && (
          <Text style={styles.errorMessage}>{item.errorMessage}</Text>
        )}
      </View>
      
      <Pressable style={styles.removeButton} onPress={() => DownloadManager.removeDownload(item.id)}>
        <Text style={Typography.regular}>Remove</Text>
      </Pressable>
    </View>
  );

  const getStatusText = (status: DownloadItem['status']): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'downloading': return 'Downloading...';
      case 'completed': return 'Finished';
      case 'error': return 'Error';
      case 'paused': return 'Paused';
      default: return status;
    }
  };
  
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Downloads' >
        <ReturnButton/>
      </TopBar>      
      
      <Row style={styles.statsContainer}>
        <Text style={Typography.regular}>Total: {downloads.totalDownloaded}</Text>
      </Row>
      
      {downloads.currentDownload && (
        <View style={styles.currentDownload}>
          <Text style={styles.subHeader}>Current Download:</Text>
          <View style={styles.currentItem}>
            <Text style={styles.currentTitle}>{downloads.currentDownload.manhwaTitle}</Text>
            <Text>Chapter: {downloads.currentDownload.chapterTitle}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${downloads.currentDownload.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{downloads.currentDownload.progress}%</Text>
            </View>
            
            <View style={styles.actions}>
              {
                isDownloading ?
                <Pressable style={[styles.actionButton, styles.pauseButton]} onPress={() => DownloadManager.pauseDownload()}>
                  <Text style={styles.actionButtonText}>Pause</Text>
                </Pressable>
              : 
                <Pressable style={[styles.actionButton, styles.resumeButton]} onPress={() => DownloadManager.resumeDownload()}>
                  <Text style={styles.actionButtonText}>Resume</Text>
                </Pressable>
              }
            </View>
          </View>
        </View>
      )}
      
      <Text style={Typography.semibold}>Queue: {downloads.queue.length}</Text>
      
      {
        !queueIsEmpty &&
        <>
          <FlatList
            data={downloads.queue.filter(item => item !== downloads.currentDownload)}
            renderItem={renderDownloadItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
          <Pressable style={styles.clearButton} onPress={() => DownloadManager.clearCompleted()}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        </>
      }

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333'
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#333'
  },
  statsContainer: {    
    justifyContent: 'space-between'    
  },
  statsText: {
    fontSize: 14,
    color: '#666'
  },
  currentDownload: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8
  },
  currentItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2
  },
  itemHeader: {
    marginBottom: 12
  },
  manhwaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  chapterTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4
  },
  progressError: {
    backgroundColor: '#f44336'
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right'
  },
  statusContainer: {
    marginBottom: 12
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500'
  },
  statusDownloading: {
    color: '#2196f3'
  },
  statusCompleted: {
    color: '#4caf50'
  },
  statusError: {
    color: '#f44336'
  },
  statusPaused: {
    color: '#ff9800'
  },
  errorMessage: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8
  },
  pauseButton: {
    backgroundColor: '#ff9800'
  },
  resumeButton: {
    backgroundColor: '#4caf50'
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500'
  },
  removeButton: {
    alignSelf: 'flex-end',
    padding: 8
  },
  removeButtonText: {
    color: '#f44336',
    fontSize: 14
  },
  list: {
    flex: 1,
    marginBottom: 16
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center'
  },
  clearButton: {
    padding: 16,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center'
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default DownloadScreen;