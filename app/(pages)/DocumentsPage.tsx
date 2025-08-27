import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
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
import { hp } from '@/helpers/util'
import CreateDocumentForm from '@/components/form/CreateDocumentForm'
import { dbCreateDocument, dbDeleteDocument, dbReadDocuments, dbUpdateDocument } from '@/lib/database'
import { Document } from '@/helpers/types'
import DocumentsGrid from '@/components/grid/DocumentsGrid'
import { useFocusEffect } from 'expo-router'
import UpdateDocumentForm from '@/components/form/UpdateDocumentForm'



const DocumentsPage = () => {

  const db = useSQLiteContext()
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentToUpdate, setDocumentToUpdate] = useState<Document | null>(null)

  const bottomSheetRef = useRef<BottomSheet>(null)
  const updateDocumentBottomSheetRef = useRef<BottomSheet>(null)

  const documentsRef = useRef<Document[]>([])
  const fetching = useRef(false)
  const hasResults = useRef(true)
  const isMounted = useRef(true)
  const page = useRef(0)

  useEffect(
    () => {
      isMounted.current = true
      const init = async () => {
        const d = await dbReadDocuments(db, null, 0, AppConstants.PAGE_LIMIT)
        if (!isMounted.current) { return }
        setDocuments(d)
        documentsRef.current = d
        hasResults.current = d.length >= AppConstants.PAGE_LIMIT
      }
      init()
      return () => { isMounted.current = false }
    },
    [db]
  )

  const reload = async () => {
    page.current = 0
    const d = await dbReadDocuments(db, null, 0, AppConstants.PAGE_LIMIT)
    setDocuments(d)
  }

  useFocusEffect(
    useCallback(() => {
      reload()
    }, [])
  )

  const onEndReached = useCallback(async () => {
    if (fetching.current || !hasResults.current) { return }
    fetching.current = true    
    page.current += 1
    const d: Document[] = await dbReadDocuments(
      db,
      null,
      page.current * AppConstants.PAGE_LIMIT, 
      AppConstants.PAGE_LIMIT
    )
    if (isMounted.current && d.length) {
      documentsRef.current.push(...d)
      setDocuments([...documentsRef.current])
      hasResults.current = d.length >= AppConstants.PAGE_LIMIT
    }
    fetching.current = false
  }, [db])  

  const handleOpenBottomSheet = useCallback(() => {
      bottomSheetRef.current?.expand();        
  }, []);
    
  const handleCloseBottomSheet = useCallback(() => {
      bottomSheetRef.current?.close();        
  }, []);

  const handleOpenUpdateDocumentBottomSheet = useCallback(() => {
    updateDocumentBottomSheetRef.current?.expand()
  }, [])
  
  const handleCloseUpdateDocumentBottomSheet = useCallback(() => {
    updateDocumentBottomSheetRef.current?.close()
  }, [])

  const createDocument = async (name: string, descr: string) => {
    const newDocument: Document | null = await dbCreateDocument(
      db, 
      name.trim(),
      descr.trim() === '' ? null : descr.trim()      
    )
    if (newDocument) {
      setDocuments(prev => [...[newDocument], ...prev])
      handleCloseBottomSheet()
    }
  }

  const deleteItem = async (item: Document) => {
    const success = await dbDeleteDocument(db, item.path)
    if (success) {
      setDocuments(prev => prev.filter(i => i.path != item.path))
    }
  }

  const updateItem = async (item: Document) => {
    setDocumentToUpdate(item)
    handleOpenUpdateDocumentBottomSheet()
  }

  const updateDocument = async (name: string, descr: string) => {
    if (documentToUpdate === null) {
        return
    }
    const newName = name.trim()
    const newDescr = descr.trim() === '' ? null : descr.trim()
    const success = await dbUpdateDocument(
        db, 
        documentToUpdate.path,
        newName,
        newDescr        
    )
    const newDocument: Document = {...documentToUpdate, name: newName, descr: newDescr}
    if (success) {
        setDocuments(prev => [
            ...[newDocument], 
            ...prev.filter(i => i.path != documentToUpdate.path)
        ])
    }
    setDocumentToUpdate(null)
    handleCloseUpdateDocumentBottomSheet()
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Documents' >
        <Row style={{gap: AppConstants.GAP * 2}} >
          <Button iconName='add-outline'iconColor={Colors.primary} onPress={handleOpenBottomSheet} />
          <ReturnButton/>
        </Row>
      </TopBar>

      <DocumentsGrid 
        documents={documents}
        updateItem={updateItem}
        deleteItem={deleteItem}
        onEndReached={onEndReached}
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

      <BottomSheet
        ref={updateDocumentBottomSheetRef}
        index={-1}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        handleStyle={styles.handleStyle}
        backgroundStyle={styles.bottomSheetBackgroundStyle}
        enablePanDownToClose={true}>
        <BottomSheetView style={styles.bottomSheetContainer} >
            <TopBar title='Edit'>
                <CloseBtn onPress={handleCloseUpdateDocumentBottomSheet}/>
            </TopBar>
            <UpdateDocumentForm 
                name={documentToUpdate ? documentToUpdate.name : ''} 
                descr={documentToUpdate ? documentToUpdate.descr : ''}
                onPress={updateDocument} />
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