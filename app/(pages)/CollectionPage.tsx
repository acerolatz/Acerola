import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { spFetchCollectionItems } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView, Text } from 'react-native'


const PAGE_LIMIT = 20


const CollectionPage = () => {

    const params = useLocalSearchParams()
    const collection_id = parseInt(params.collection_id as string)
    const collection_descr = params.collection_descr as string | null
    const collection_name = params.collection_name as string

    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)
    
    const isInitialized = useRef(false)
    const hasResults = useRef(true)
    const page = useRef(0)
    

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                await spFetchCollectionItems(collection_id, 0, PAGE_LIMIT)
                    .then(v => setManhwas([...v]))
                setLoading(false)
                isInitialized.current = true
            }
            init()
        },
        []
    )

    const onEndReached = async () => {
        if (!hasResults.current || !isInitialized.current) { return }
        page.current += 1
        setLoading(true)
          const m = await spFetchCollectionItems(collection_id, PAGE_LIMIT * page.current, PAGE_LIMIT)
          hasResults.current = m.length > 0
          setManhwas(prev => [...prev, ...m])
        setLoading(false)
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={collection_name} titleColor={Colors.yellow} >
                <ReturnButton color={Colors.yellow} />
            </TopBar>
            {
                collection_descr &&
                <Text style={AppStyle.textRegular}>{collection_descr}</Text>
            }
            <ManhwaGrid
                manhwas={manhwas}
                numColumns={2}
                showChaptersPreview={false}
                hasResults={true}
                loading={loading}
                onEndReached={onEndReached}
                listMode='FlashList'/>

        </SafeAreaView>
    )
}

export default CollectionPage