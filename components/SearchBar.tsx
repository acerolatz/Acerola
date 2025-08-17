import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useRef } from 'react'
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native'


interface SearchBarProps {
    onChangeText: (text: string) => any
    placeholder?: string
    color?: string
    style?: ViewStyle
}


const SearchBar = ({ 
    onChangeText, 
    style, 
    placeholder = 'search', 
    color = Colors.primary 
}: SearchBarProps) => {    

    const inputRef = useRef<TextInput>(null)

    const clearText = () => {
        inputRef.current?.clear()
        onChangeText('')
    }

    return (
        <View style={[{width: '100%'}, style]} >
            <TextInput
                ref={inputRef}
                placeholder={placeholder}
                placeholderTextColor={color}
                style={[styles.input, {color}]}
                onChangeText={onChangeText}
            />
            <Pressable 
                style={styles.icon}
                onPress={clearText} 
                hitSlop={AppConstants.HIT_SLOP.LARGE} >
                <Ionicons name='close-circle-outline' size={24} color={color} />
            </Pressable>
        </View>
    )
}

export default SearchBar

const styles = StyleSheet.create({
    input: {
        paddingHorizontal: 10,
        height: 52,
        borderRadius: AppConstants.BORDER_RADIUS,
        backgroundColor: Colors.backgroundSecondary,
        fontSize: 18,
        color: Colors.white,
        fontFamily: "LeagueSpartan_400Regular"
    },
    icon: {
        position: 'absolute', 
        height: '100%', 
        right: 10, 
        alignItems: "center", 
        justifyContent: "center"
    }
})