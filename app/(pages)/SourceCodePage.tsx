import { FlatList, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import ReturnButton from '@/components/buttons/ReturnButton'
import { SourceCodeLink } from '@/helpers/types'
import { spFetchSourceCodeLinks } from '@/lib/supabase'
import Footer from '@/components/util/Footer'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import SourceCodeButton from '@/components/buttons/SourceCodeButton'


const SourceCodePage = () => {

    const [sources, setSources] = useState<SourceCodeLink[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    const s = await spFetchSourceCodeLinks()
                    setSources(s)
                setLoading(false)
            }
            init()
        },
        []
    )

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Source Code' titleColor={Colors.sourceCodeColor} >
                    <ReturnButton color={Colors.sourceCodeColor} />
                </TopBar>
                <PageActivityIndicator color={Colors.sourceCodeColor} />
            </SafeAreaView>    
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Source Code' titleColor={Colors.sourceCodeColor} >
                <ReturnButton color={Colors.sourceCodeColor} />
            </TopBar>
            <FlatList
                data={sources}
                keyExtractor={(item) => item.url}
                renderItem={({item}) => <SourceCodeButton item={item} />}
                ListFooterComponent={<Footer/>}
            />
        </SafeAreaView>
    )
}

export default SourceCodePage
