import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import Footer from '@/components/util/Footer'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Post } from '@/helpers/types'
import { formatTimestamp, wp } from '@/helpers/util'
import { spFetchNews } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'


const PAGE_LIMIT = 16
const IMAGE_WIDTH = AppConstants.COMMON.SCREEN_WIDTH - AppConstants.COMMON.PADDING_HORIZONTAL * 2
const TEXT_LENGHT_LIMIT = 128


const News = ({news}: {news: Post}) => {
    
    const [expandText, setExpandText] = useState(false)
    const hasImage = news.image_url && news.image_width && news.image_height
    const imageHeight = hasImage ? IMAGE_WIDTH * (news.image_height! / news.image_width!) : 0
    const text = expandText ? news.descr : news.descr.length > TEXT_LENGHT_LIMIT ? `${news.descr.slice(0, TEXT_LENGHT_LIMIT)}...` : news.descr

    const handleTextExpand = () => { setExpandText(prev => !prev) }

    if (!hasImage) {
        <Column style={styles.item} >
            <Text style={AppStyle.textHeader}>{news.title}</Text>
            <Text style={AppStyle.textRegular}>{text}</Text>
            <Row style={{justifyContent: "space-between"}} >
                <Text style={AppStyle.textRegular} >{formatTimestamp(news.created_at)}</Text>
                {
                    news.descr.length > TEXT_LENGHT_LIMIT &&
                    <Pressable onPress={handleTextExpand} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
                        <Row style={{gap: 4}} >
                            <Text style={AppStyle.textRegular}>{expandText ? 'Collapse' : 'Expand'}</Text>
                            <Ionicons 
                                name={expandText ? 'chevron-back' : 'chevron-forward'} 
                                color={Colors.newsColor} 
                                style={{marginTop: 3}} 
                                size={20} />
                        </Row>
                    </Pressable>
                }
            </Row>
        </Column>
    }

    return (
        <Column style={styles.item} >
            <Image 
                style={{width: IMAGE_WIDTH, height: imageHeight , borderRadius: AppConstants.COMMON.BORDER_RADIUS}} 
                source={news.image_url} 
                contentFit='cover' />
            <Text style={AppStyle.textHeader}>{news.title}</Text>
            <Text style={AppStyle.textRegular}>{text}</Text>
            <Row style={{justifyContent: "space-between"}} >
                <Text style={AppStyle.textRegular} >{formatTimestamp(news.created_at)}</Text>
                {
                    news.descr.length > TEXT_LENGHT_LIMIT &&
                    <Pressable onPress={handleTextExpand} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
                        <Row style={{gap: 4}} >
                            <Text style={AppStyle.textRegular}>{expandText ? 'Collapse' : 'Expand'}</Text>
                            <Ionicons 
                                name={expandText ? 'chevron-back' : 'chevron-forward'} 
                                color={Colors.newsColor} 
                                style={{marginTop: 3}} 
                                size={20} />
                        </Row>
                    </Pressable>
                }
            </Row>
        </Column>
    )
}


const NewsPage = () => {

    const [news, setNews] = useState<Post[]>([])
    const [loading, setLoading] = useState(false)

    const hasResults = useRef(true)
    const isInitialized = useRef(false)
    const page = useRef(0)

    useEffect(
        () => {
            let isCancelled = false
            const init = async () => {
                setLoading(true)
                    const p = await spFetchNews(page.current, PAGE_LIMIT)
                    if (isCancelled) { return }
                    setNews(p)
                    hasResults.current = p.length >= PAGE_LIMIT
                    isInitialized.current = true
                setLoading(true)
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
          const n= await spFetchNews(page.current, PAGE_LIMIT)
          setNews(prev => [...prev, ...n])
          hasResults.current = n.length >= PAGE_LIMIT
        setLoading(false)
    }

    const renderFooter = () => {
        if (loading && hasResults.current) {
            return <CustomActivityIndicator color={Colors.newsColor} />
        }
        return <Footer/>
    }    

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='News' titleColor={Colors.newsColor} >
                <ReturnButton color={Colors.newsColor} />
            </TopBar>
            <View style={{flex: 1}} >
                <FlashList
                    data={news}
                    estimatedItemSize={300}
                    keyExtractor={(item, index) => item.news_id.toString()}
                    onEndReached={onEndReached}
                    renderItem={({item}) => <News news={item} />}
                    ListFooterComponent={renderFooter}
                />
            </View>
        </SafeAreaView>
    )
}

export default NewsPage

const styles = StyleSheet.create({
    item: {
        width: '100%',
        gap: 20,
        marginBottom: 32
    }
})