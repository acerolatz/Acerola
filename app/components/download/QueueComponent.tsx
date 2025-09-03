import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { PendingDownloadByManhwa } from '@/helpers/types'
import { StyleSheet, Text } from 'react-native'
import { Colors } from '@/constants/Colors'
import Column from '../util/Column'
import React from 'react'


interface QueueComponentProps {
  download: PendingDownloadByManhwa
}


const QueueComponent = ({download}: QueueComponentProps) => {
  return (
    <Column style={styles.container} >
      <Text numberOfLines={1} style={Typography.regularBlack} >{download.manhwa.title}</Text>
      <Text style={Typography.regularBlack} >Pending downloads: {download.pending_downloads}</Text>
    </Column>
  )
}


function areEqual(prev: QueueComponentProps, next: QueueComponentProps) {
  return prev.download.manhwa.manhwa_id === next.download.manhwa.manhwa_id
}


export default QueueComponent;


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary, 
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    marginBottom: AppConstants.UI.MARGIN,
    paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
    paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL
  }
})