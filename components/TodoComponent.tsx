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
import { formatTimestamp, formatTimestampWithHour, wp } from '@/helpers/util'


interface TodoComponentProps {
    todo: Todo
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}


const TodoComponent = ({todo, setTodos}: TodoComponentProps) => {

    const db = useSQLiteContext()    
    const [isCompleted, setIsCompleted] = useState(todo.completed === 1)
    const backgroundColor = isCompleted ? Colors.green : Colors.primary
    const checkmarkBackgroundColor = isCompleted ? Colors.green : Colors.backgroundColor
    const [finishedAt, setFinishedAt] = useState<string | null>(todo.finished_at)


    const clickCheckbox = async () => {
        const newStatus: boolean = !isCompleted
        const success = await dbUpdateTodo(db, todo.todo_id, todo.title, todo.descr, newStatus ? 1 : 0)
        const newFinishedAt = newStatus ? new Date().toString() : null
        if (!success) {
            Toast.show({text1: "Error", text2: "Could not update to-do", type: "error"})
        } else {
            setIsCompleted(newStatus)
            setFinishedAt(newFinishedAt)
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
                <Row style={{gap: AppConstants.UI.GAP * 1.5}} >
                    <View style={styles.checkBox} >
                        <Ionicons name='checkmark' size={AppConstants.UI.ICON.SIZE} color={checkmarkBackgroundColor} />
                    </View>
                </Row>
            </Row>            
            <Column style={[styles.todoItemBottom, {borderColor: backgroundColor}]} >
                {todo.descr !== null && <Text style={Typography.regular}>{todo.descr} </Text>}
                <Row style={{justifyContent: "space-between"}} >
                    <Column>
                        <Text style={Typography.light} >created at: {formatTimestampWithHour(todo.created_at)}</Text>
                        {finishedAt !== null && <Text style={Typography.light} >finished at: {formatTimestampWithHour(finishedAt)}</Text>}
                    </Column>
                    {
                        isCompleted &&
                        <Pressable onPress={deleteTodo} hitSlop={AppConstants.UI.HIT_SLOP.NORMAL} >
                            <Ionicons name='trash' size={AppConstants.UI.ICON.SIZE} color={Colors.red} />
                        </Pressable>
                    }
                </Row>
            </Column>
        </Pressable>
    )
}

export default TodoComponent

const styles = StyleSheet.create({
    todoItem: {
        width: '100%',
        marginBottom: AppConstants.UI.GAP
    },
    checkBox: {
        backgroundColor: Colors.backgroundColor, 
        borderRadius: AppConstants.UI.ICON.SIZE, 
        alignItems: "center", 
        justifyContent: "center", 
        padding: wp(1)
    },
    todoItemTop: {
        width: '100%', 
        borderTopRightRadius: AppConstants.UI.BORDER_RADIUS, 
        borderTopLeftRadius: AppConstants.UI.BORDER_RADIUS, 
        paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
        paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
        gap: AppConstants.UI.GAP,
        justifyContent: "space-between"
    },
    todoItemBottom: {
        paddingHorizontal: 10, 
        paddingVertical: 8, 
        borderWidth: 1, 
        gap: AppConstants.UI.GAP,
        borderTopWidth: 0,
        borderBottomLeftRadius: AppConstants.UI.BORDER_RADIUS, 
        borderBottomRightRadius: AppConstants.UI.BORDER_RADIUS
    }
})