import { DownloadState, PendingDownloadByManhwa } from '@/helpers/types'
import { FlatList, StyleSheet, View, Text } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import CurrentDownload from './CurrentDownload'
import TextButton from '../buttons/TextButton'
import QueueComponent from './QueueComponent'
import { AppStyle } from '@/styles/AppStyle'
import React, { useCallback, useState } from 'react'
import Footer from '../util/Footer'
import Row from '../util/Row'
import { downloadManager } from '@/helpers/DownloadManager'
import { useSQLiteContext } from 'expo-sqlite'
import { Typography } from '@/constants/typography'



interface DownloadQueueProps {
  state: DownloadState
}


const DownloadQueue = ({state}: DownloadQueueProps) => {

  const db = useSQLiteContext()
  const [paused, setPaused] = useState(downloadManager.iPaused())  

  const KeyExtractor = useCallback((item: PendingDownloadByManhwa) => item.manhwa.manhwa_id.toString(), [])

  const renderItem = useCallback(({item}: {item: PendingDownloadByManhwa}) => <QueueComponent download={item} />, [])

  const renderFooter = useCallback(() => <Footer/>, [])

  const pause = () => { 
    if (paused) {
      downloadManager.resumeDownloads(db)
      setPaused(false)
    } else {
      downloadManager.pauseDownloads();
      setPaused(true)
    }
  }

  const cancel = () => { downloadManager.cancelAllDownloads(db); }

  if (state.pendingDownloads.length == 0 && !state.currentDownload) {
    return (
      <Text style={Typography.regular} >You have no downloads queued.</Text>
    )
  }

  return (
    <View style={styles.container} >
      {
        state.pendingDownloads.length > 0 &&
        <Row style={AppStyle.margin} >
          <TextButton text={paused ? 'Resume' : 'Pause'} onPress={pause} />
          <TextButton text="Clear" onPress={cancel} />
        </Row>
      }
      {state.currentDownload && <CurrentDownload item={state.currentDownload} />}
      <FlatList
        data={state.pendingDownloads}
        keyExtractor={KeyExtractor}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
      />
    </View>
  )
}

export default DownloadQueue

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: AppConstants.UI.MARGIN
  }
})