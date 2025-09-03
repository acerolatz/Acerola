import { DownloadState, PendingDownloadByManhwa } from '@/helpers/types'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import CurrentDownload from './CurrentDownload'
import TextButton from '../buttons/TextButton'
import QueueComponent from './QueueComponent'
import { AppStyle } from '@/styles/AppStyle'
import React, { useCallback } from 'react'
import Footer from '../util/Footer'
import Row from '../util/Row'



interface DownloadQueueProps {
  state: DownloadState
}


const DownloadQueue = ({state}: DownloadQueueProps) => {

  const KeyExtractor = useCallback((item: PendingDownloadByManhwa) => item.manhwa.manhwa_id.toString(), [])

  const renderItem = useCallback(({item}: {item: PendingDownloadByManhwa}) => <QueueComponent download={item} />, [])

  const renderFooter = useCallback(() => <Footer/>, [])

  return (
    <View style={styles.container} >
          {
            state.currentDownload &&
            <>
            <Row style={AppStyle.margin} >
              <TextButton text="Pause" />
              <TextButton text="Clear" />
            </Row>
            <CurrentDownload item={state.currentDownload} />
            </>
          }
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