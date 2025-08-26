import ReturnButton from '@/components/buttons/ReturnButton'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import React, { useCallback, useEffect, useState } from 'react'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import {  Genre } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { router } from 'expo-router'
import { 
    FlatList, 
    Pressable, 
    SafeAreaView, 
    StyleSheet,
    Text
} from 'react-native'
import { dbReadGenres } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'


const NUM_COLUMNS = 2
const ITEM_WIDTH = (wp(92) - AppConstants.MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS
const ITEM_HEIGHT = hp(8)


const Item = ({item, index}: {item: Genre, index: number}) => {

    const onPress = useCallback(() => {
        router.navigate({
            pathname: '/(pages)/ManhwaByGenre', 
            params: {
                genre: item.genre,
                genre_id: item.genre_id
            }
        })
    }, [item.genre_id])

    return (
        <Pressable
            onPress={onPress}
            style={[styles.item, {marginRight: index % 2 == 0 ? AppConstants.MARGIN : 0}]} >
            <Text style={styles.itemText} >{item.genre}</Text>
        </Pressable>
    )
}

const GenresPage = () => {

    const db = useSQLiteContext()
    const [genres, setGenres] = useState<Genre[]>([])

    useEffect(
        () => {
            const init = async () => {
                const g = await dbReadGenres(db)
                setGenres(g)
            }
            init()
        },
        []
    )
    
    const renderItem = useCallback(({item, index}: {item: Genre, index: number}) => (
        <Item item={item} index={index} />
    ), [])

    const KeyExtractor = useCallback((item: Genre) => item.genre_id.toString(), [])

    const renderFooter = useCallback(() => <Footer height={hp(12)}/>, [])

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title="Genres">
                <ReturnButton/>
            </TopBar>
            <FlatList
                data={genres}
                numColumns={2}
                keyExtractor={KeyExtractor}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ListFooterComponent={renderFooter}
            />
        </SafeAreaView>
    )
}

export default GenresPage


const styles = StyleSheet.create({
    item: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        paddingHorizontal: 10,
        alignItems: "center", 
        justifyContent: "center",         
        backgroundColor: Colors.primary, 
        borderRadius: AppConstants.BORDER_RADIUS,
        marginBottom: AppConstants.MARGIN
    },
    itemText: {
        ...Typography.regular, 
        color: Colors.backgroundColor, 
        textAlign: "center", 
        alignSelf: "center"
    }
})