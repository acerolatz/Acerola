import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { formatTimestamp } from '@/helpers/util'
import { Post } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { spFetchNews } from '@/lib/supabase'
import Footer from '@/components/util/Footer'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'


const PAGE_LIMIT = 16
const TEXT_LENGTH_LIMIT = 128

interface ItemProps {
    item: Post
}

const Item = memo(({ item }: ItemProps) => {
    const [expandText, setExpandText] = useState(false)

    const toggleExpand = useCallback(() => setExpandText(prev => !prev), [])

    const text = expandText || item.message.length <= TEXT_LENGTH_LIMIT
        ? item.message
        : `${item.message.slice(0, TEXT_LENGTH_LIMIT)}...`

    return (
        <View style={styles.itemContainer}>
            <View style={styles.itemTitleContainer}>
                <Text style={[Typography.semibold, { color: Colors.backgroundColor }]}>{item.title}</Text>
            </View>
            <View style={styles.itemBodyContainer}>
                <Text style={Typography.regular}>{text}</Text>
                <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
                    <Text style={Typography.light}>{formatTimestamp(item.created_at)}</Text>
                    {item.message.length > TEXT_LENGTH_LIMIT && (
                        <Pressable onPress={toggleExpand} hitSlop={AppConstants.HIT_SLOP.LARGE}>
                            <Row style={{ gap: 4 }}>
                                <Text style={Typography.light}>{expandText ? 'Collapse' : 'Expand'}</Text>
                                <Ionicons
                                    name={expandText ? 'chevron-back' : 'chevron-forward'}
                                    color={Colors.white}
                                    style={{ marginTop: 3 }}
                                    size={AppConstants.ICON.SIZE}
                                />
                            </Row>
                        </Pressable>
                    )}
                </Row>
            </View>
        </View>
    )
})

const NewsPage = () => {

    const [loading, setLoading] = useState(false)
    const [posts, setPosts] = useState<Post[]>([])

    const fetching = useRef(false)
    const hasResults = useRef(true)
    const isMounted = useRef(true)
    const page = useRef(0)

    useEffect(
        () => {
            isMounted.current = true
            const init = async () => {
                setLoading(true)
                    const f = await spFetchNews(0, PAGE_LIMIT)
                    if (!isMounted.current) { return }
                    setPosts(f)
                    hasResults.current = f.length >= PAGE_LIMIT
                setLoading(false)
            }
            init()
            return () => { isMounted.current = false }
        },
        []
    )

    const onEndReached = useCallback(async () => {
        if (!hasResults.current || fetching.current) return
        fetching.current = true
        page.current += 1
        const f = await spFetchNews(page.current, PAGE_LIMIT)
        hasResults.current = f.length >= PAGE_LIMIT
        setPosts(prev => [...prev, ...f])
        fetching.current = false
    }, [])

    const renderFooter = useCallback(() => {
        return <Footer/>
    }, [])

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='News' >
                <ReturnButton/>
            </TopBar>
            {
                loading ?
                <PageActivityIndicator/> : 
                (
                    <FlatList
                        data={posts}
                        keyExtractor={(_, index) => index.toString()}
                        onEndReached={onEndReached}
                        renderItem={({item}) => <Item item={item} />}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        ListFooterComponent={renderFooter}
                    />
                )
            }
        </SafeAreaView>
    )
}

export default NewsPage

const styles = StyleSheet.create({
    itemContainer: {
        width: '100%', 
        marginBottom: 10
    },
    itemTitleContainer: {
        padding: 10, 
        backgroundColor: Colors.primary, 
        borderRadius: AppConstants.BORDER_RADIUS, 
        borderBottomLeftRadius: 0, 
        borderBottomRightRadius: 0
    },
    itemBodyContainer: {
        padding: 10, 
        borderWidth: 1, 
        borderTopWidth: 0, 
        borderTopLeftRadius: 0, 
        borderTopRightRadius: 0, 
        borderColor: Colors.primary, 
        borderRadius: AppConstants.BORDER_RADIUS
    }
})
