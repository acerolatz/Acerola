import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'

interface BubImageProps {
    uri: string
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>
}

const BugImage = ({uri, setPhotos}: BubImageProps) => {

    const onPress = () => {
        setPhotos(prev => prev.filter(i => i != uri))
    }

    return (
        <View style={{marginRight: AppConstants.COMMON.MARGIN}} >
            <Image source={{uri}} style={styles.image} contentFit='cover' />
            <Pressable onPress={onPress} style={styles.removeImageButton} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
                <Ionicons name='trash-outline' size={18} color={Colors.backgroundColor} />
            </Pressable>
        </View>
    )
}
export default BugImage

const styles = StyleSheet.create({
    image: {
        width: 200, 
        height: 312, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    },
    removeImageButton: {
        position: "absolute", 
        left: 8, 
        top: 8, 
        padding: 6, 
        backgroundColor: Colors.BugReportColor, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    } 
})