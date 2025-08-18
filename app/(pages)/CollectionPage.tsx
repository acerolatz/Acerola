import { useLocalSearchParams } from 'expo-router/build/hooks'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { spFetchCollectionItems } from '@/lib/supabase'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


const CollectionPage = () => {

    const params = useLocalSearchParams()
    const collection_id = parseInt(params.collection_id as string)
    const collection_name = params.collection_name as string

    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)
    
    const fetchingOnEndReached = useRef(false)
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
                setLoading(false)
                isInitialized.current = true
                hasResults.current = m.length >= AppConstants.PAGE_LIMIT
            }
            init()
            return () => { isCancelled = true }
        },
        []
    )

    const onEndReached = async () => {
        if (
            fetchingOnEndReached.current ||
            !hasResults.current || 
            !isInitialized.current
        ) { return }        
        fetchingOnEndReached.current = true
        page.current += 1
        setLoading(true)
            const m = await spFetchCollectionItems(
                collection_id, 
                AppConstants.PAGE_LIMIT * page.current, 
                AppConstants.PAGE_LIMIT
            )
            setManhwas(prev => [...prev, ...m])
        setLoading(false)
        hasResults.current = m.length >= AppConstants.PAGE_LIMIT
        fetchingOnEndReached.current = false
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
                hasResults={hasResults.current}
                onEndReached={onEndReached}/>
        </SafeAreaView>
    )
}

export default CollectionPage