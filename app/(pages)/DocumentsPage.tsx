import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import Button from '@/components/buttons/Button'
import { Colors } from '@/constants/Colors'
import { useSQLiteContext } from 'expo-sqlite'
import CloseBtn from '@/components/buttons/CloseButton'
import { Typography } from '@/constants/typography'
import Footer from '@/components/util/Footer'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { hp, normalizeDocumentName } from '@/helpers/util'
import CreateDocumentForm from '@/components/form/CreateDocumentForm'
import { dbCreateDocument, dbDeleteDocument, dbReadDocuments } from '@/lib/database'
import { Document } from '@/helpers/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import Column from '@/components/util/Column'


interface DocumentItemProps {
  item: Document
  deleteItem: (item: Document) => any
  updateItem: (item: Document) => any
}


const DocumentItem = ({item, deleteItem}: {item: Document, deleteItem: (item: Document) => any}) => {

  return (
    <Pressable style={styles.item} >
      <Row style={{gap: AppConstants.GAP * 2, justifyContent: "space-between"}} >
        <Column>
          <Text style={{...Typography.semibold, color: Colors.backgroundColor, flexShrink: 1}}>{item.name}</Text>
          <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{item.descr}</Text>
        </Column>
        
        <Column style={{gap: AppConstants.GAP * 2}} >
          <Pressable onPress={() => deleteItem(item)} >
            <Ionicons name='trash-outline' color={Colors.backgroundColor} size={AppConstants.ICON.SIZE} />
          </Pressable>
          <Pressable onPress={() => deleteItem(item)} >
            <Ionicons name='create-outline' color={Colors.backgroundColor} size={AppConstants.ICON.SIZE} />
          </Pressable>
        </Column>
      </Row>
    </Pressable>
  )
}


const DocumentsPage = () => {

  const db = useSQLiteContext()
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(
    () => {
      const init = async () => {
        const d = await dbReadDocuments(db)
        setDocuments(d)
      }
      init()
    },
    [db]
  )

  const bottomSheetRef = useRef<BottomSheet>(null)

  const handleOpenBottomSheet = useCallback(() => {
      bottomSheetRef.current?.expand();        
  }, []);
    
  const handleCloseBottomSheet = useCallback(() => {
      bottomSheetRef.current?.close();        
  }, []);

  const createDocument = async (name: string, descr: string) => {
    const date = new Date().toString()
    const tmpDocument: Document = {
      document_id: 0,
      parent_document_id: null,
      normalized_name: '',
      name: name.trim(),
      descr: descr.trim() === '' ? null : descr.trim(),
      created_at: date,
      updated_at: date
    }
    const newDocument: Document | null = await dbCreateDocument(db, tmpDocument)
    if (newDocument) {
      setDocuments(prev => [...[newDocument], ...prev])
      handleCloseBottomSheet()
    }
  }

  const deleteItem = async (item: Document) => {
    const success = await dbDeleteDocument(db, item.document_id)
    setDocuments(prev => prev.filter(i => i.document_id != item.document_id))
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Documents' >
        <Row style={{gap: AppConstants.GAP * 2}} >
          <Button iconName='add-outline'iconColor={Colors.primary} onPress={handleOpenBottomSheet} />
          <ReturnButton/>
        </Row>
      </TopBar>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.document_id.toString()}
        renderItem={({item}) => <DocumentItem item={item} deleteItem={deleteItem} />}
        ListFooterComponent={<Footer/>}
      />
      
      <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            handleStyle={styles.handleStyle}
            backgroundStyle={styles.bottomSheetBackgroundStyle}
            enablePanDownToClose={true}>
            <BottomSheetView style={styles.bottomSheetContainer} >
                <TopBar title='Create Document'>
                    <CloseBtn onPress={handleCloseBottomSheet}/>
                </TopBar>
                <CreateDocumentForm onPress={createDocument} />
                <Footer />
            </BottomSheetView>
        </BottomSheet>

    </SafeAreaView>
  )
}

export default DocumentsPage

const styles = StyleSheet.create({
  bottomSheetContainer: {
    paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL, 
    paddingTop: 10,
    gap: AppConstants.GAP,
    height: hp(80)
  },
  handleStyle: {
    backgroundColor: Colors.backgroundSecondary, 
    borderTopLeftRadius: 12, 
    borderTopEndRadius: 12
  },
  handleIndicatorStyle: {
    backgroundColor: Colors.primary
  },
  bottomSheetBackgroundStyle: {
    backgroundColor: Colors.backgroundSecondary
  },
  textLink: {
    ...Typography.light,
    marginTop: 10,
    textDecorationLine: 'underline'
  },
  item: {
    padding: AppConstants.GAP,
    backgroundColor: Colors.primary,
    borderRadius: AppConstants.BORDER_RADIUS
  }
})