import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native'
import BugReportButton from '../buttons/BugReportButton'
import { AppConstants } from '@/constants/AppConstants'
import RotatingButton from '../buttons/RotatingButton'
import { useChapterState } from '@/store/chapterState'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import ReturnButton from '../buttons/ReturnButton'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import Column from '../util/Column'
import { Image } from 'expo-image'
import TopBar from '../TopBar'
import Row from '../util/Row'
import React, { useState } from 'react'
import Button from '../buttons/Button'
import { dbCreateChapterDocument } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { downloadImages } from '@/helpers/storage'
import { spFetchChapterImages } from '@/lib/supabase'
import { DownloadProgress } from '@/helpers/types'
import Toast from 'react-native-toast-message'


interface ChapterHeaderProps {
  mangaTitle: string
  loading: boolean
  reloadChapter: () => any  
}


const ChapterHeader = ({ 
  mangaTitle,
  loading,
  reloadChapter  
}: ChapterHeaderProps) => {

  const db = useSQLiteContext()

  const { chapters, currentChapterIndex, setCurrentChapterIndex } =  useChapterState()  
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const chapterName = currentChapterIndex < chapters.length ? chapters[currentChapterIndex].chapter_name : ''
  const reportTitle = `${mangaTitle}/${chapterName}`

  const exitChapter = async () => {
    Image.clearMemoryCache()
    router.back()
  }
  
  const isFirstChapter = currentChapterIndex === 0
  const isLastChapter = currentChapterIndex >= chapters.length - 1

  const goToNextChapter = () => {
    if (loading) { return }
    if (currentChapterIndex + 1 < chapters.length) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  const goToPreviousChapter = () => {
    if (loading) { return }
    if (currentChapterIndex - 1 >= 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)      
    }
  }

  const downloadChapter = async () => {
    const currentChapter = chapters[currentChapterIndex]
    const d = await dbCreateChapterDocument(db, mangaTitle, currentChapter.chapter_num)
    
    const onProgress = (progress: DownloadProgress) => {
      setDownloadProgress(progress.percentage)
    }

    if (d) {
      const imgs = await spFetchChapterImages(currentChapter.chapter_id)
      setIsDownloading(true)
        Toast.show({text1: "Downloading", type: "info"})
        await downloadImages(imgs.map(i => i.image_url), d.path, 8, onProgress)
        Toast.show({
          text1: "Download Completed!", 
          text2: `Document: Pornhwas/${mangaTitle}/chapter_${currentChapter.chapter_num}`, 
          type: "info"
        })
      setIsDownloading(false)
    }

  }

  return (
    <Column style={styles.container} >
      <TopBar title={mangaTitle} titleColor={'white'} >
        <ReturnButton onPress={exitChapter} color={'white'}/>
      </TopBar>

      <Row style={{justifyContent: "space-between"}} >
        
        <Row style={{gap: AppConstants.UI.ICON.SIZE}} >
          <BugReportButton title={reportTitle} />
          <RotatingButton onPress={reloadChapter} />]
          {
            isDownloading ?
            <View style={{alignItems: "center", justifyContent: "center"}} >
              <Text style={Typography.regular} >{downloadProgress}%</Text>
            </View>
            :
            <Button onPress={downloadChapter} iconName='download-outline' iconColor={Colors.white} />
          }
        </Row>

        <Row style={styles.chapterSelector} >
          <Text style={Typography.regular}>Chapter</Text>
          {
            !isFirstChapter &&
            <Button iconName='chevron-back' onPress={goToPreviousChapter} iconColor={Colors.white} />
          }
          <View style={styles.chapterNum} >
            {
              loading ?
              <ActivityIndicator size={AppConstants.UI.ICON.SIZE} color={Colors.white} /> :
              <Text style={Typography.regular}>{chapterName}</Text>
            }
          </View>
          {
            !isLastChapter &&
            <Button iconName='chevron-forward' onPress={goToNextChapter} iconColor={Colors.white} />
          }
        </Row>

      </Row>
    </Column>
  )
}

export default ChapterHeader

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: AppConstants.UI.GAP,
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL, 
    paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
    marginBottom: AppConstants.UI.GAP * 2
  },
  chapterSelector: {
    gap: AppConstants.UI.GAP, 
    justifyContent: "flex-start"
  },
  chapterNum: {
    alignItems: "center", 
    justifyContent: "center"
  }
})