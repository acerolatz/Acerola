import { dbCreateDocument, dbDeleteDocument, dbReadDocument, dbReadSubDocuments, dbUpdateDocument } from '@/lib/database'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import CreateDocumentForm from '@/components/form/CreateDocumentForm'
import UpdateDocumentForm from '@/components/form/UpdateDocumentForm'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import ReturnButton from '@/components/buttons/ReturnButton'
import DocumentsGrid from '@/components/grid/DocumentsGrid'
import { router, useLocalSearchParams } from 'expo-router'
import { AppConstants } from '@/constants/AppConstants'
import CloseBtn from '@/components/buttons/CloseButton'
import { Typography } from '@/constants/typography'
import Button from '@/components/buttons/Button'
import { useSQLiteContext } from 'expo-sqlite'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { Document } from '@/helpers/types'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { hp } from '@/helpers/util'


const DocumentPage = () => {

    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const root_document_name = params.document_name as string
    const root_document_path = params.document_path as string
    const allowEdit = root_document_path !== AppConstants.PATHS.PORNHWAS_DOCUMENT

    const [rootDocument, setRootDocument] = useState<Document | null>(null)
    const [documents, setDocuments] = useState<Document[]>([])
    const [documentToUpdate, setDocumentToUpdate] = useState<Document | null>(null)

    const bottomSheetRef = useRef<BottomSheet>(null)
    const updateDocumentBottomSheetRef = useRef<BottomSheet>(null)

    const documentsRef = useRef<Document[]>([])
    const fetching = useRef(true)
    const hasResults = useRef(true)    
    const page = useRef(0)    

    const loadSubDocuments = async () => {        
        const d = await dbReadSubDocuments(db, root_document_path, 0, AppConstants.VALIDATION.PAGE_LIMIT)
        documentsRef.current = d
        hasResults.current = d.length >= AppConstants.VALIDATION.PAGE_LIMIT
        setDocuments(d)
    }

    const loadRootDocument = async () => {
        const d = await dbReadDocument(db, root_document_path)
        setRootDocument(d)
    }

    useEffect(
        () => {            
            if (!root_document_path || !root_document_name) { return }
            const init = async () => {
                fetching.current = true
                page.current = 0
                await Promise.all([
                    loadRootDocument(), 
                    loadSubDocuments()
                ])
                fetching.current = false
            }
            init()
        },
        [db, root_document_path, root_document_name]
    )

    const onEndReached = useCallback(async () => {
        if (fetching.current || !hasResults.current) { return }
        console.log("end")
        fetching.current = true    
        page.current += 1
        const d: Document[] = await dbReadSubDocuments(
          db,
          root_document_path,
          page.current * AppConstants.VALIDATION.PAGE_LIMIT, 
          AppConstants.VALIDATION.PAGE_LIMIT
        )
        if (d.length) {
          documentsRef.current.push(...d)
          setDocuments([...documentsRef.current])
          hasResults.current = d.length >= AppConstants.VALIDATION.PAGE_LIMIT
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
          descr.trim() === '' ? null : descr.trim(),
          root_document_path
        )
        if (newDocument) {
          setDocuments(prev => [...[newDocument], ...prev])
          handleCloseBottomSheet()
        }
    }

    const upDocument = async () => {
        if (!rootDocument) {
            return
        }
        if (rootDocument.parent_document_path === null) {
            router.back()
            return
        }

        const d = await dbReadDocument(db, rootDocument.parent_document_path)
        if (!d) {
            router.back()
            return
        }

        router.navigate({
            pathname: "/DocumentPage",
            params: {
                document_path: d.path,
                document_name: d.name
            }
        })
    }

    const deleteItem = async (item: Document) => {
        const success = await dbDeleteDocument(db, item.path)
        if (success) {
            setDocuments(prev => prev.filter(i => i.path != item.path))
        }
    }

    const updateItem = (item: Document) => {
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
        const newDocument: Document = {
            ...documentToUpdate, 
            name: newName, 
            descr: newDescr, 
            updated_at: new Date().toString()
        }
        if (success) {
            setDocuments(prev => [
                ...[newDocument], 
                ...prev.filter(i => i.path != documentToUpdate.path)
            ])
        }
        setDocumentToUpdate(null)
        handleCloseUpdateDocumentBottomSheet()
    }


    if (!root_document_name || !root_document_path) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Invalid Document' >
                    <Row style={{gap: AppConstants.UI.GAP * 2}}>
                        {allowEdit && <Button iconName='add'iconColor={Colors.primary} onPress={handleOpenBottomSheet} />}                        
                        <ReturnButton/>
                    </Row>
                </TopBar>
            </SafeAreaView>    
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={root_document_name} >
                <Row style={{gap: AppConstants.UI.GAP * 2}}>
                    {allowEdit && <Button iconName='add'iconColor={Colors.primary} onPress={handleOpenBottomSheet} />}                    
                    <Button iconName='chevron-up' iconColor={Colors.primary} onPress={upDocument} />
                    <ReturnButton onPress={upDocument} />
                </Row>
            </TopBar>
            <View style={styles.container} >            
                {
                    rootDocument?.descr &&
                    <Text style={Typography.regular} >{rootDocument.descr}</Text>
                }

                <DocumentsGrid
                    documents={documents}
                    deleteItem={deleteItem}
                    updateItem={updateItem}
                    onEndReached={onEndReached}
                />
            </View>            
            
            {
                allowEdit &&
                <>
                    <BottomSheet
                        ref={bottomSheetRef}
                        index={-1}
                        handleIndicatorStyle={styles.handleIndicatorStyle}
                        handleStyle={styles.handleStyle}
                        backgroundStyle={styles.bottomSheetBackgroundStyle}
                        enablePanDownToClose={true}>
                        <BottomSheetView style={styles.bottomSheetContainer} >
                            <TopBar title='Create'>
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
                </>
            }
        </SafeAreaView>
    )
}

export default DocumentPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: AppConstants.UI.GAP
    },
    bottomSheetContainer: {
        paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL, 
        paddingTop: 10,
        gap: AppConstants.UI.GAP,
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
})