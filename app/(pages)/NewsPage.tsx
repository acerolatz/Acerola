import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import { Feedback, Post } from '@/helpers/types'
import { spFetchNews } from '@/lib/supabase'
import { FlashList } from '@shopify/flash-list'
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import Footer from '@/components/util/Footer'
import { formatTimestamp } from '@/helpers/util'
import Row from '@/components/util/Row'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'


const PAGE_LIMIT = 16
const TEXT_LENGHT_LIMIT = 256


const Item = ({item}: {item: Post}) => {

    const [expandText, setExpandText] = useState(false)
    const text = expandText ? item.message : item.message.length > TEXT_LENGHT_LIMIT ? `${item.message.slice(0, TEXT_LENGHT_LIMIT)}...` : item.message    
    const iconName = expandText ? 'chevron-back' : 'chevron-forward'
    
    const handleTextExpand = () => { setExpandText(prev => !prev) }

    return (
        <View style={styles.itemContainer} >
            <View style={styles.itemTitleContainer} >
                <Text style={[Typography.semibold, {color: Colors.backgroundColor}]}>{item.title}</Text>
            </View>
            <View style={styles.itemBodyContainer}>
                <Text style={Typography.regular}>{text}</Text>
                <Row style={{justifyContent: "space-between", marginTop: 10}} >
                    <Text style={Typography.light}>{formatTimestamp(item.created_at)}</Text>
                    {
                        item.message.length > TEXT_LENGHT_LIMIT &&
                        <Pressable style={{alignItems: "flex-end"}} onPress={handleTextExpand} hitSlop={AppConstants.HIT_SLOP.LARGE} >
                            <Row style={{gap: 4}} >
                                <Text style={Typography.light}>{expandText ? 'Collapse' : 'Expand'}</Text>
                                <Ionicons 
                                    name={iconName} 
                                    color={Colors.white} 
                                    style={{marginTop: 3}} 
                                    size={AppConstants.ICON.SIZE} />
                            </Row>
                        </Pressable>
                    }
                </Row>
            </View>
        </View>
    )
}

const NewsPage = () => {

    const [loading, setLoading] = useState(false)
    const [posts, setPosts] = useState<Post[]>([])

    const isInitialized = useRef(false)
    const page = useRef(0)
    const hasResults = useRef(true)

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    const f = await spFetchNews(0, PAGE_LIMIT)
                    hasResults.current = f.length >= PAGE_LIMIT
                    isInitialized.current = true
                    setPosts(f)
                setLoading(false)
            }
            init()
        },
        []
    )

    const onEndReached = async () => {
        if (!hasResults.current || !isInitialized.current) { return }
        page.current += 1
        setLoading(true)
            const f = await spFetchNews(page.current, PAGE_LIMIT)
            hasResults.current = f.length >= PAGE_LIMIT
            setPosts(prev => [...prev, ...f])
        setLoading(false)
    }

    const renderFooter = () => {
        if (loading && hasResults.current) {
            return <CustomActivityIndicator/>
        }
        return <Footer/>
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='News' >
                <ReturnButton/>
            </TopBar>
            <View style={{flex: 1}} >
                <FlashList
                    data={posts}
                    estimatedItemSize={300}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={onEndReached}
                    renderItem={({item}) => <Item item={item} />}
                    ListFooterComponent={renderFooter}
                />
            </View>
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
