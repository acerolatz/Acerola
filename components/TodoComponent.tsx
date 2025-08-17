import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Row from './util/Row'
import { Typography } from '@/constants/typography'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import Column from './util/Column'
import { useSQLiteContext } from 'expo-sqlite'
import { dbDeleteTodo, dbUpdateTodo } from '@/lib/database'
import Toast from 'react-native-toast-message'
import { Todo } from '@/helpers/types'
import { wp } from '@/helpers/util'


interface TodoComponentProps {
    todo: Todo
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}


const TodoComponent = ({todo, setTodos}: TodoComponentProps) => {

    const db = useSQLiteContext()    
    const [isCompleted, setIsCompleted] = useState(todo.completed === 1)
    const backgroundColor = isCompleted ? Colors.green : Colors.primary
    const checkmarkBackgroundColor = isCompleted ? Colors.green : Colors.backgroundColor

    const clickCheckbox = async () => {
        const newStatus: boolean = !isCompleted
        const success = await dbUpdateTodo(db, todo.todo_id, todo.title, todo.descr, newStatus ? 1 : 0)
        if (!success) {
            Toast.show({text1: "Error", text2: "Could not update to-do", type: "error"})
        } else {
            setIsCompleted(newStatus)
        }
    }

    const deleteTodo = async () => {
        await dbDeleteTodo(db, todo.todo_id)
        setTodos(prev => prev.filter(i => i.todo_id !== todo.todo_id))
    }

    return (
        <Pressable onPress={clickCheckbox} style={styles.todoItem} >
            <Row style={{...styles.todoItemTop, backgroundColor}} >
                <Text style={{...Typography.regularLg, color: Colors.backgroundColor, flexShrink: 1}}>{todo.title}</Text>
                <Row style={{gap: AppConstants.GAP * 1.5}} >
                    {
                        isCompleted &&
                        <Pressable onPress={deleteTodo} style={styles.deleteButton} hitSlop={AppConstants.HIT_SLOP.NORMAL} >
                            <Ionicons name='trash' size={AppConstants.ICON.SIZE} color={Colors.red} />
                        </Pressable>
                    }
                    <View style={styles.checkBox} >
                        <Ionicons name='checkmark' size={AppConstants.ICON.SIZE} color={checkmarkBackgroundColor} />
                    </View>
                </Row>
            </Row>
            {
                todo.descr !== null &&
                <Column style={[styles.todoItemBottom, {borderColor: backgroundColor}]} >
                    <Text style={Typography.regular}>{todo.descr} </Text>
                </Column>
            }
        </Pressable>
    )
}

export default TodoComponent

const styles = StyleSheet.create({
    todoItem: {
        width: '100%',
        marginBottom: AppConstants.GAP
    },
    checkBox: {
        backgroundColor: Colors.backgroundColor, 
        borderRadius: AppConstants.ICON.SIZE, 
        alignItems: "center", 
        justifyContent: "center", 
        padding: wp(1)
    },
    deleteButton: {
        padding: wp(1), 
        backgroundColor: Colors.backgroundColor, 
        borderRadius: AppConstants.ICON.SIZE
    },
    todoItemTop: {
        width: '100%', 
        borderTopRightRadius: AppConstants.BORDER_RADIUS, 
        borderTopLeftRadius: AppConstants.BORDER_RADIUS, 
        paddingHorizontal: AppConstants.ITEM_PADDING_HORIZONTAL,
        paddingVertical: AppConstants.ITEM_PADDING_VERTICAL,
        gap: AppConstants.GAP,
        justifyContent: "space-between"
    },
    todoItemBottom: {
        paddingHorizontal: 10, 
        paddingVertical: 8, 
        borderWidth: 1, 
        borderTopWidth: 0,
        borderBottomLeftRadius: AppConstants.BORDER_RADIUS, 
        borderBottomRightRadius: AppConstants.BORDER_RADIUS
    }
})