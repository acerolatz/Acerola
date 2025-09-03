import { Pressable, StyleSheet, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { Image } from 'expo-image'
import React from 'react'


interface BubImageProps {
    uri: string
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>
}


const BugImage = ({uri, setPhotos}: BubImageProps) => {

    const onPress = () => {
        setPhotos(prev => prev.filter(i => i != uri))
    }

    return (
        <View style={{marginRight: AppConstants.UI.MARGIN}} >
            <Image 
                source={{uri}} 
                style={styles.image} 
                contentFit='cover' />
            <Pressable onPress={onPress} style={styles.removeImageButton} hitSlop={AppConstants.UI.HIT_SLOP.LARGE} >
                <Ionicons name='trash-outline' size={AppConstants.UI.ICON.SIZE} color={Colors.backgroundColor} />
            </Pressable>
        </View>
    )
}
export default BugImage

const styles = StyleSheet.create({
    image: {
        width: wp(25),
        height: hp(25), 
        borderRadius: AppConstants.UI.BORDER_RADIUS
    },
    removeImageButton: {
        position: "absolute", 
        left: wp(1),
        top: wp(1),
        padding: wp(1),
        backgroundColor: Colors.primary, 
        borderRadius: AppConstants.UI.BORDER_RADIUS
    } 
})