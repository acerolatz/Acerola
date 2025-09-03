import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback } from 'react'
import { Note } from '@/helpers/types'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { formatTimestampWithHour, hp, wp } from '@/helpers/util'
import { router } from 'expo-router'
import { Typography } from '@/constants/typography'


const NoteComponent = ({note}: {note: Note}) => {

    const content = note.content.slice(0, 256)

    return (
        <Pressable style={styles.noteContainer} >
            <Text style={Typography.semibold} >{note.title}</Text>
            <Text numberOfLines={1} style={Typography.regular} >{content}</Text>
            <Text style={Typography.light}>{formatTimestampWithHour(new Date(note.created_at).toString())}</Text>
        </Pressable>
    )
}

interface NotesProps {
    notes: Note[]
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>
}

const Notes = ({notes, setNotes}: NotesProps) => {

    const KeyExtractor = useCallback((item: Note) => item.note_id.toString(), [])

    const renderItem = useCallback(({item}: {item: Note}) => <NoteComponent note={item} />, [])

    return (
        <View style={styles.container} >      
            <FlatList
                data={notes}
                keyExtractor={KeyExtractor}
                renderItem={renderItem}
            />
            <Pressable onPress={() => router.navigate("/(pages)/CreateNotePage")} style={styles.addButton} >
                <Ionicons name='add' size={AppConstants.UI.BUTTON.SIZE / 2} color={Colors.backgroundColor} />
            </Pressable>
        </View>
    )
}

export default Notes

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: AppConstants.UI.GAP
    },
    addButton: {
        position: 'absolute',
        bottom: hp(7),
        right: wp(1),
        width: AppConstants.UI.BUTTON.SIZE,
        height: AppConstants.UI.BUTTON.SIZE,
        borderRadius: AppConstants.UI.BUTTON.SIZE,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center"
    },
    noteContainer: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: AppConstants.UI.BORDER_RADIUS,
        paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
        paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
        marginBottom: AppConstants.UI.MARGIN
    }
})