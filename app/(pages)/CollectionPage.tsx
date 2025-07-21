import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { spFetchCollectionItems } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text } from 'react-native'


const CollectionPage = () => {

    const params = useLocalSearchParams()
    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)

    const collection_id = parseInt(params.collection_id as string)
    const collection_descr = params.collection_descr as string | null
    const collection_name = params.collection_name as string

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                await spFetchCollectionItems(collection_id)
                    .then(v => setManhwas([...v]))
                setLoading(false)
            }
            init()
        },
        []
    )

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title={collection_name} titleColor={Colors.yellow} >
                    <ReturnButton color={Colors.yellow} />
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>
        )
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
                estimatedItemSize={400}
                showChaptersPreview={false}
                hasResults={true}
                listMode='FlashList'/>

        </SafeAreaView>
    )
}

export default CollectionPage

const styles = StyleSheet.create({})