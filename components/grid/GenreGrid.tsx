import { FlatList, Pressable, StyleSheet, View, Text } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import ViewAllButton from '../buttons/ViewAllButton'
import { Typography } from '@/constants/typography'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import React, { useCallback } from 'react'
import { Genre } from '@/helpers/types'
import { router } from 'expo-router'
import Row from '../util/Row'
import Title from '../Title'


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


const GenreGrid = ({genres}: {genres: Genre[]}) => {    

    const viewAllGenres = () => {
        router.navigate("/(pages)/GenresPage")
    }

    if (genres.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Genres'/>
                <ViewAllButton onPress={viewAllGenres} />
            </Row>
            <FlatList
                data={genres}
                horizontal={true}
                initialNumToRender={10}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.genre}
                renderItem={({item}) => <Item item={item} />}
            />
        </View>
    )
}

export default GenreGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: AppConstants.GAP,
        alignItems: "flex-start"
    }
})

