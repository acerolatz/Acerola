import { FlatList, Pressable, StyleSheet, Text } from 'react-native'
import React, { useCallback } from 'react'
import { Document } from '@/helpers/types'
import Footer from '../util/Footer'
import Column from '../util/Column'
import { Typography } from '@/constants/typography'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { formatTimestampWithHour } from '@/helpers/util'
import Button from '../buttons/Button'


interface DocumentItemProps {
  item: Document
  deleteItem: (item: Document) => any
  updateItem: (item: Document) => any  
}


const DocumentItem = ({item, updateItem, deleteItem}: DocumentItemProps) => {

  const showButtons = item.name !== "Pornhwas"

  const onPress = useCallback(() => {
      router.navigate({
          pathname: "/(pages)/DocumentPage",
          params: {
            document_name: item.name,
            document_path: item.path
          }
      })
  }, [item.path])

  return (
    <Pressable onPress={onPress} style={styles.item} >
      <Column style={{flex: 1, paddingRight: AppConstants.UI.ICON.SIZE}} >
        <Text style={Typography.semiboldBlack}>{item.name}</Text>
        <Text style={Typography.regularBlack}>{item.descr}</Text>        
      </Column>
      {
        showButtons &&
        <Column style={styles.buttonColumn}>
          <Button onPress={() => deleteItem(item)} iconName='trash-outline' iconColor={Colors.backgroundColor} />
          <Button onPress={() => updateItem(item)} iconName='create-outline' iconColor={Colors.backgroundColor} />
        </Column>
      }
    </Pressable>
  )
}



interface DocumentsGridProps {
    documents: Document[]
    updateItem: (item: Document) => any
    deleteItem: (item: Document) => any
    onEndReached?: () => any
}


const DocumentsGrid = ({documents, updateItem, deleteItem, onEndReached}: DocumentsGridProps) => {

    const KeyExtractor = useCallback((item: Document) => item.path, [])

    const renderFooter = useCallback(() => <Footer/>, [])

    const renderItem = useCallback(({item}: {item: Document}) => (
        <DocumentItem item={item} updateItem={updateItem} deleteItem={deleteItem}/>
    ), [])
    
    return (
        <FlatList
            data={documents}
            keyExtractor={KeyExtractor}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            windowSize={5}
            onEndReachedThreshold={2}
            onEndReached={onEndReached}
        />
    )
}

export default DocumentsGrid

const styles = StyleSheet.create({
  item: {
    padding: AppConstants.UI.GAP,
    backgroundColor: Colors.primary,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    marginBottom: AppConstants.UI.MARGIN,
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  buttonColumn: {
    gap: AppConstants.UI.GAP * 2, 
    alignItems: "center", 
    justifyContent: "center"
  }
})