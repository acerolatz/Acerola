import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import { Colors } from '@/constants/Colors'
import { Genre } from '@/helpers/types'
import { dbReadGenres } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'



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
                style={[styles.item, {marginRight: index % 2 == 0 ? '4%' : 0}]} >
                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor, textAlign: "center", alignSelf: "center"}]} >{item.genre}</Text>
            </Pressable>
        )
    }    

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title="Genres">
                <ReturnButton/>
            </TopBar>
            <View style={{flex: 1, width: '100%'}} >
                <FlatList
                    data={genres}
                    numColumns={2}
                    keyExtractor={(item) => item.genre_id.toString()}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={20}
                    renderItem={renderItem}
                    ListFooterComponent={<View style={{height: 62}} />}
                />
            </View>
        </SafeAreaView>
    )
}

export default GenresPage


const styles = StyleSheet.create({
    item: {
        width: '48%',
        height: 52,
        alignItems: "center", 
        justifyContent: "center",         
        backgroundColor: Colors.yellow, 
        borderRadius: 4,
        marginBottom: 10
    }
})