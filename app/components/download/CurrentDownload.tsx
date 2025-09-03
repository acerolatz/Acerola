import { downloadManager } from '@/helpers/DownloadManager'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { DownloadRequest } from '@/helpers/types'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { Colors } from '@/constants/Colors'
import Column from '../util/Column'
import Row from '../util/Row'


const CurrentDownload = ({ item }: { item: DownloadRequest }) => {
  const [percentage, setPercentage] = useState<number>(downloadManager.getCurrentDownloadProgressPercentage())

  useEffect(() => {
    const interval = setInterval(() => {
      const progress = downloadManager.getCurrentDownloadProgressPercentage()
      setPercentage(progress)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <Row style={styles.container}>
      <Column>
        <Text numberOfLines={1} style={{ ...Typography.regularBlack, flexShrink: 1 }}>{item.manhwa_name}</Text>
        <Text style={Typography.regularBlack}>Downloading chapter: {item.chapter_name}</Text>
      </Column>
      <Text style={Typography.regularBlack}>{percentage}%</Text>
    </Row>
  )
}

export default CurrentDownload

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
    paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    justifyContent: 'space-between',
  },
})
