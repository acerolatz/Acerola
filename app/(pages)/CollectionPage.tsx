import { useLocalSearchParams } from 'expo-router/build/hooks'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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

    const manhwasRef = useRef<Manhwa[]>([])
    const fetching = useRef(false)
    const hasResults = useRef(true)
    const isMounted = useRef(true)
    const page = useRef(0)
    
    useEffect(() => {
        isMounted.current = true
        const init = async () => {            
            const m = await spFetchCollectionItems(collection_id, 0, AppConstants.PAGE_LIMIT)
            if (!isMounted.current) { return }
            setManhwas(m)
            manhwasRef.current = m
            hasResults.current = m.length >= AppConstants.PAGE_LIMIT
        }
        init()
        return () => { isMounted.current = false }
    }, [collection_id])

    const onEndReached = useCallback(async () => {
        if (fetching.current || !hasResults.current) { return }
        fetching.current = true
        page.current += 1
        const m = await spFetchCollectionItems(
            collection_id,
            AppConstants.PAGE_LIMIT * page.current,
            AppConstants.PAGE_LIMIT
        )
        if (isMounted.current && m.length) {
            manhwasRef.current.push(...m)
            setManhwas([...manhwasRef.current])
            hasResults.current = m.length >= AppConstants.PAGE_LIMIT
        }
        fetching.current = false
    }, [collection_id])

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={collection_name} >
                <ReturnButton />
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                onEndReached={onEndReached}/>
        </SafeAreaView>
    )
}

export default CollectionPage