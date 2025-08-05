import { AppState, Button, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import ReturnButton from '@/components/buttons/ReturnButton'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Row from '@/components/util/Row'
import { formatTimestamp, wp } from '@/helpers/util'
import CreateDocumentForm from '@/components/form/CreateDocumentForm'
import { dbCreateDocument, dbGetRootDocuments } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { Document } from '@/helpers/types'
import { FlashList } from '@shopify/flash-list'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'


const DocumentComponent = ({document}: {document: Document}) => {
  return (
    <Pressable style={styles.documentContainer} >
      <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor, marginBottom: 10}]}>{document.name}</Text>
      {document.descr && <Text style={AppStyle.textRegular} >{document.descr}</Text>}
      <Text>Created at: {formatTimestamp(document.created_at)}</Text>
    </Pressable>
  )
}


const Documents = () => {

  const db = useSQLiteContext()
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [loading, setLoading] = useState(false)
  const snapPoints = useMemo(() => ['25%', '80%'], []);  
  const [documents, setDocuments] = useState<Document[]>([])

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand()
  }

  const createDocument = async (data: {name: string, descr: string | null}) => {
    const newDocument = await dbCreateDocument(db, data.name, data.descr, null)
    bottomSheetRef.current?.close()
    if (newDocument) {
      setDocuments(prev => [...[newDocument], ...prev])
    } else {
      console.log("falha ao criar documento")
    }
  }

  useEffect(
    () => {
      const init = async () => {
        setLoading(true)
          const d = await dbGetRootDocuments(db)
          setDocuments(d)
        setLoading(false)
      }
      init()
    },
    []
  )

  const renderItem = ({item}: {item: Document}) => {
    return <DocumentComponent document={item} />
  }

  if (loading) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Documents' titleColor={Colors.documentsColor} >
          <ReturnButton color={Colors.documentsColor} />
        </TopBar>
        <PageActivityIndicator color={Colors.documentsColor} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Documents' titleColor={Colors.documentsColor} >
          <Row style={{gap: 30}} >
            <Pressable onPress={handleOpenBottomSheet} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
              <Ionicons name='add-outline' size={32} color={Colors.documentsColor} />
            </Pressable>
            <ReturnButton color={Colors.documentsColor} />
          </Row>
        </TopBar>
        <View style={{flex: 1}} >
          <FlashList
            data={documents}
            estimatedItemSize={200}
            keyExtractor={(item) => item.document_id.toString()}
            renderItem={renderItem}
          />
        </View>
        <BottomSheet
          handleIndicatorStyle={{backgroundColor: Colors.documentsColor}}
          backgroundStyle={{backgroundColor: Colors.gray}}
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}          
          enablePanDownToClose={true}
        >
        <BottomSheetView style={styles.contentContainer}>
          <TopBar title='Create Document' titleColor={Colors.documentsColor} />
          <CreateDocumentForm createDocumentFunc={createDocument} />
        </BottomSheetView>
      </BottomSheet>

    </SafeAreaView>
  )
}


export default Documents


const styles = StyleSheet.create({
  createDocumentButton: {
    width:'100%', 
    height: 140, 
    backgroundColor: Colors.documentsColor, 
    borderRadius: AppConstants.COMMON.BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center"
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: wp(4)
  },
  documentContainer: {
    width: '100%',
    padding: 10,
    borderRadius: AppConstants.COMMON.BORDER_RADIUS, 
    gap: 10,
    marginBottom: 20,
    backgroundColor: Colors.documentsColor
  }
})