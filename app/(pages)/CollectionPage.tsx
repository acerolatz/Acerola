import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { AppConstants } from '@/constants/AppConstants'
import { Manhwa } from '@/helpers/types'
import { spFetchCollectionItems } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const CollectionPage = () => {

    const params = useLocalSearchParams()
    const collection_id = parseInt(params.collection_id as string)
    const collection_name = params.collection_name as string

    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)
    
    const isInitialized = useRef(false)
    const hasResults = useRef(true)
    const page = useRef(0)
    
    useEffect(
        () => {
            let isCancelled = false
            const init = async () => {
                setLoading(true)
                    const m = await spFetchCollectionItems(collection_id, 0, AppConstants.PAGE_LIMIT)
                    if (isCancelled) { return }
                    setManhwas(m)
                    isInitialized.current = true
                setLoading(false)
            }
            init()
            return () => { isCancelled = true }
        },
        []
    )

    const onEndReached = async () => {
        if (!hasResults.current || !isInitialized.current) { return }
        page.current += 1
        setLoading(true)
            const m = await spFetchCollectionItems(
                collection_id, 
                AppConstants.PAGE_LIMIT * page.current, 
                AppConstants.PAGE_LIMIT
            )
          hasResults.current = m.length > 0
          setManhwas(prev => [...prev, ...m])
        setLoading(false)
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={collection_name} >
                <ReturnButton />
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                showChaptersPreview={false}
                loading={loading}
                onEndReached={onEndReached}/>
        </SafeAreaView>
    )
}

export default CollectionPage