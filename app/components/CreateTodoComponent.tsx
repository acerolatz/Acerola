import { Keyboard, Pressable, StyleSheet, Text, TextInput } from 'react-native'
import React, { useRef, useState } from 'react'
import { Todo } from '@/helpers/types'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'
import { dbCreateTodo } from '@/lib/database'
import Column from './util/Column'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import { Typography } from '@/constants/typography'


interface CreateTodoComponentProps {
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}


const CreateTodoComponent = ({setTodos}: CreateTodoComponentProps) => {

    const db = useSQLiteContext()
    const [text, setText] = useState('')
    const [description, setDescription] = useState('')
    const inputRef = useRef<TextInput>(null)
    const inputRef1 = useRef<TextInput>(null)    

    const create = async () => {
        Keyboard.dismiss()
        if (text.trim() === '') {
            Toast.show(ToastMessages.EN.INVALID_TASK)
            return
        }
        const newTodo: Todo | null = await dbCreateTodo(
            db, 
            text.trim(),
            description.trim() !== '' ? description.trim() : null
        )

        if (!newTodo) {
            Toast.show(ToastMessages.EN.COULD_NOT_CREATE_TODO)
        } else {
            setText('')
            setDescription('')
            inputRef.current?.clear()
            inputRef1.current?.clear()
            setTodos(prev => [...[newTodo], ...prev])
        }
    }

    return (
        <Column style={styles.container} >
            <Column style={AppStyle.gap} >
                <TextInput
                    ref={inputRef}
                    placeholder='Enter tasks, ideas, notes...'
                    placeholderTextColor={Colors.white}
                    autoCapitalize='sentences'                    
                    style={AppStyle.input}
                    onChangeText={setText}
                />
                <TextInput
                    ref={inputRef1}
                    placeholder='description (optional)...'
                    placeholderTextColor={Colors.white}
                    textAlignVertical='top'
                    multiline={true}
                    autoCapitalize='sentences'
                    style={AppStyle.inputMedium}
                    onChangeText={setDescription}
                />
            </Column>            
            <Pressable onPress={create} style={AppStyle.formButton} >
                <Text style={Typography.regularBlack} >Create</Text>
            </Pressable>
        </Column>
    )
}


export default CreateTodoComponent

const styles = StyleSheet.create({
    container: {
        gap: AppConstants.UI.GAP, 
        marginBottom: AppConstants.UI.GAP
    },
})