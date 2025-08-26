import { FlatList, Pressable, StyleSheet, View, Text } from 'react-native'
import { Typography } from '@/constants/typography'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import React, { useCallback } from 'react'
import { Genre } from '@/helpers/types'
import { router } from 'expo-router'


const Item = ({item}: {item: Genre}) => {
    
    const onPress = useCallback((genre: Genre) => {
        router.navigate({
            pathname: '/(pages)/ManhwaByGenre', 
            params: {
                genre: genre.genre,
                genre_id: genre.genre_id
            }
        })
    }, [item.genre_id])
    
    return (
        <Pressable onPress={() => onPress(item)} style={AppStyle.defaultGridItem} >
            <Text style={[Typography.regular, {color: Colors.backgroundColor}]} >{item.genre}</Text>
        </Pressable>
    )
}


const Header = () => {
    const onPress = () => {
        router.navigate("/(pages)/GenresPage")
    }

    return (
        <Pressable onPress={onPress} style={AppStyle.defaultGridItem} >
            <Text style={[Typography.regular, {color: Colors.backgroundColor}]} >Genres</Text>
        </Pressable>
    )
}


const GenreGrid = ({genres}: {genres: Genre[]}) => {

    const KeyExtractor = useCallback((item: Genre) => item.genre, [])

    const renderItem = useCallback(({item}: {item: Genre}) => (
        <Item item={item} />
    ), [])

    const renderHeader = useCallback(() => <Header/>, [])

    if (genres.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <FlatList
                data={genres}
                horizontal={true}
                initialNumToRender={10}
                showsHorizontalScrollIndicator={false}
                keyExtractor={KeyExtractor}
                ListHeaderComponent={renderHeader}
                renderItem={renderItem}
            />
        </View>
    )
}

export default React.memo(GenreGrid)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: "flex-start"
    }
})

