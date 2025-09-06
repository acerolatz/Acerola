import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { formatTimestampWithHour, hp, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import React, { useCallback } from 'react'
import { Note } from '@/helpers/types'
import Button from './buttons/Button'
import { router } from 'expo-router'
import Row from './util/Row'


const NoteComponent = ({note, deleteNote}: {note: Note, deleteNote: (note: Note) => Promise<any>}) => {
    const content = note.content.slice(0, 256)

    const onPress = useCallback(() => {
        router.navigate({
            pathname: "/(pages)/UpdateNotePage",
            params: { note_id: note.note_id }
        })
    }, [note.note_id])

    const onDelete = useCallback(async () => {
        await deleteNote(note)
    }, [note.note_id])

    return (
        <Pressable onPress={onPress} style={styles.noteContainer} >
            <Text style={Typography.semibold} >{note.title}</Text>
            <Text numberOfLines={1} style={Typography.regular} >{content}</Text>
            <Row style={{justifyContent: "space-between"}} >
                <Text style={Typography.light}>{formatTimestampWithHour(new Date(note.updated_at).toString())}</Text>
                <Row style={{gap: AppConstants.UI.GAP * 2}} >
                    <Button onPress={onDelete} iconName='trash-outline' />
                    <Button onPress={onPress} iconName='create-outline' />
                </Row>
            </Row>
        </Pressable>
    )
}

interface NotesProps {
    notes: Note[]
    deleteNote: (note: Note) => Promise<any>
}


const Notes = ({ notes, deleteNote }: NotesProps) => {

    const KeyExtractor = useCallback((item: Note) => item.note_id.toString(), [])

    const renderItem = useCallback(({item}: {item: Note}) => <NoteComponent note={item} deleteNote={deleteNote} />, [])

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
        gap: AppConstants.UI.GAP,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: AppConstants.UI.BORDER_RADIUS,
        paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
        paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
        marginBottom: AppConstants.UI.MARGIN
    }
})