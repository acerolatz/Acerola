import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useRef } from 'react'
import { 
    Pressable, 
    TextInput, 
    View, 
    ViewStyle 
} from 'react-native'


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
                style={[AppStyle.input, {color, paddingRight: AppConstants.UI.ICON.SIZE * 2}]}
                onChangeText={onChangeText}
            />
            <Pressable 
                style={AppStyle.iconCenter}
                onPress={clearText} 
                hitSlop={AppConstants.UI.HIT_SLOP.LARGE} >
                <Ionicons name='close-circle-outline' size={AppConstants.UI.ICON.SIZE} color={color} />
            </Pressable>
        </View>
    )
}

export default SearchBar