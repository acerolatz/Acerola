import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import Footer from '@/components/util/Footer'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import { Genre } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbReadGenres } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { 
    FlatList, 
    Pressable, 
    SafeAreaView, 
    StyleSheet, 
    Text, 
    View 
} from 'react-native'


const NUM_COLUMNS = 2
const ITEM_WIDTH = (wp(92) - AppConstants.COMMON.MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS
const ITEM_HEIGHT = hp(8)


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
        [db]
    )

    const onPress = async (genre: Genre) => {
        router.navigate({
            pathname: '/(pages)/ManhwaByGenre', 
            params: {
                genre: genre.genre,
                genre_id: genre.genre_id
            }
        })
    }
    
    const renderItem = ({item, index}: {item: Genre, index: number}) => {
        return (
            <Pressable
                onPress={() => onPress(item)}
                style={[styles.item, {marginRight: index % 2 == 0 ? AppConstants.COMMON.MARGIN : 0}]} >
                <Text style={styles.itemText} >{item.genre}</Text>
            </Pressable>
        )
    }    

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title="Genres">
                <ReturnButton/>
            </TopBar>
            <View style={{width: '100%'}} >
                <FlatList
                    data={genres}
                    numColumns={2}
                    keyExtractor={(item) => item.genre_id.toString()}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={30}
                    renderItem={renderItem}
                    ListFooterComponent={<Footer height={hp(12)}/>}
                />
            </View>
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
        backgroundColor: Colors.yellow, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        marginBottom: AppConstants.COMMON.MARGIN
    },
    itemText: {
        ...Typography.regular, 
        color: Colors.backgroundColor, 
        textAlign: "center", 
        alignSelf: "center"
    }
})