import { Colors } from '@/constants/Colors'
import { Genre } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'


type GenreType = Genre | 'Header'


interface GenreGridProps {
    genres: Genre[]
}

const GenreGrid = ({genres}: GenreGridProps) => {

    const onPress = (genre: Genre) => {
        router.navigate({
            pathname: '/(pages)/ManhwaByGenre', 
            params: {
                genre: genre.genre,
                genre_id: genre.genre_id
            }
        })
    }

    const viewAllGenres = () => {
        router.navigate("/(pages)/GenresPage")
    }

    const renderItem = ({item}: {item: GenreType}) => {
        if (item === "Header") {
            return (
                <Pressable onPress={viewAllGenres} style={styles.button} >
                    <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>All Genres</Text>
                </Pressable>
            )
        }
        return (
            <Pressable onPress={() => onPress(item)} style={styles.button} >
                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{item.genre}</Text>
            </Pressable>
        )
    }

    if (genres.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <FlatList
                data={[...['Header'], ...genres] as GenreType[]}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                renderItem={renderItem}
            />
        </View>
    )
}

export default GenreGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10,
        alignItems: "flex-start"
    },
    button: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        backgroundColor: Colors.yellow,
        marginRight: 10
    }
})