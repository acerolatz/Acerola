import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'
import { AppStyle } from '@/styles/AppStyle'
import Row from '@/components/util/Row'
import AppLogo from '@/components/util/Logo'
import Button from '@/components/buttons/Button'
import { Colors } from '@/constants/Colors'
import { formatTimestamp, hp, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import { Todo } from '@/helpers/types'
import { dbCreateTodo, dbDeleteTodo, dbReadTodos, dbUpdateTodo } from '@/lib/database'
import { TextInput } from 'react-native-gesture-handler'
import Column from '@/components/util/Column'
import Toast from 'react-native-toast-message'
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { Keyboard } from 'react-native'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { router } from 'expo-router'


const SCREEN_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)


const CreateTodoComponent = ({setTodos}: {setTodos: React.Dispatch<React.SetStateAction<Todo[]>>}) => {

    const db = useSQLiteContext()
    const [text, setText] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<TextInput>(null)
    const inputRef1 = useRef<TextInput>(null)    

    const create = async () => {
        Keyboard.dismiss()
        if (text.trim() === '') {
            Toast.show({text1: "Invalid Task", type: 'error'})
            return
        }
        setLoading(true)
            const newTodo: Todo | null = await dbCreateTodo(
                db, 
                text.trim(),
                description.trim() !== '' ? description.trim() : null
            )
            if (!newTodo) {
                Toast.show({text1: "Error", text2: "Could not create todo", type: "error"})
            } else {
                setText('')
                setDescription('')
                inputRef.current?.clear()
                inputRef1.current?.clear()
                setTodos(prev => [...[newTodo], ...prev])
            }
        setLoading(false)
    }

    return (
        <Column style={{gap: 10, marginBottom: 20}} >
            <Column style={{gap: 10,  width: '100%'}} >
                <TextInput
                    ref={inputRef}
                    placeholder='Enter tasks, ideas, notes...'
                    placeholderTextColor={Colors.white}
                    autoCapitalize='sentences'
                    style={{color: Colors.white, borderBottomWidth: 1, borderRadius: 4, borderColor: 'white'}}
                    onChangeText={setText}
                />
                <TextInput
                    ref={inputRef1}
                    placeholder='description (optional)...'
                    placeholderTextColor={Colors.white}
                    textAlignVertical='top'
                    multiline={true}
                    autoCapitalize='sentences'
                    style={{color: Colors.white, borderBottomWidth: 1, borderRadius: 4, borderColor: 'white', height: 80}}
                    onChangeText={setDescription}
                />
            </Column>
            <Row>
                {
                    loading ?
                    <View style={{flex: 1, height: 52, backgroundColor: Colors.yellow, borderRadius: AppConstants.COMMON.BORDER_RADIUS, alignItems: "center", justifyContent: "center", alignSelf: "flex-start"}} >
                        <CustomActivityIndicator color={Colors.yellow} /> 
                    </View>
                    :                    
                    <Pressable onPress={create} style={{flex: 1, height: 52, backgroundColor: Colors.yellow, borderRadius: AppConstants.COMMON.BORDER_RADIUS, alignItems: "center", justifyContent: "center", alignSelf: "flex-start"}} >
                        <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >Create</Text>
                    </Pressable>
                }
            </Row>
        </Column>
    )
}


const TodoComponent = ({todo, setTodos}: {todo: Todo, setTodos: React.Dispatch<React.SetStateAction<Todo[]>>}) => {

    const db = useSQLiteContext()    
    const [isCompleted, setIsCompleted] = useState(todo.completed === 1)
    const [finishedAt, setFinishedAt] = useState<string | null>(todo.finished_at)
    const backgroundColor = isCompleted ? Colors.ononokiGreen : Colors.yellow
    const checkmarkBackgroundColor = isCompleted ? Colors.ononokiGreen : Colors.backgroundColor

    const clickCheckbox = async () => {
        const newStatus: boolean = !isCompleted
        const newFinishedAt: string | null = newStatus ? new Date().toISOString() : null
        const success = await dbUpdateTodo(db, todo.todo_id, todo.title, todo.descr, newStatus ? 1 : 0)
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
        <Pressable onPress={clickCheckbox} style={[styles.todoItem, {borderColor: backgroundColor}]} >
            <Row style={{backgroundColor, width: '100%', paddingHorizontal: 10, paddingVertical: 8, justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor, maxWidth: '85%'}]}>{todo.title} </Text>
                <View style={styles.checkBox} >
                    <Ionicons name='checkmark' size={20} color={checkmarkBackgroundColor} />
                </View>
            </Row>
            <Column style={{paddingHorizontal: 10, paddingVertical: 8}} >
                {todo.descr && <Text style={AppStyle.textRegular}>{todo.descr} </Text>}
                <Row style={{justifyContent: "space-between"}} >
                    <View>
                        <Text style={[AppStyle.textRegular, {fontSize: 14}]}>Created at: {formatTimestamp(todo.created_at)}</Text>
                        {finishedAt && <Text style={[AppStyle.textRegular, {fontSize: 14}]}>Finished at: {formatTimestamp(finishedAt)}</Text>}
                    </View>
                    {
                        isCompleted &&
                        <Pressable onPress={deleteTodo} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
                            <Ionicons name='trash' size={20} color={Colors.neonRed} />
                        </Pressable>
                    }
                </Row>
            </Column>
        </Pressable>
    )
}


const SafeModeHomePage = () => {

    const db = useSQLiteContext()
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(false)    

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    await dbReadTodos(db).then(t => setTodos(t))
                setLoading(false)
            }
            init()
        },
        [db]
    )    

    const openSettings = () => {
        router.navigate("/SafeModeSettings")
    }

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <Row style={{width: '100%', paddingRight: 2, marginTop: 4, marginBottom: 10, justifyContent: "space-between"}} >
                    <AppLogo name='To do List' />
                    <Button 
                        iconName='options-outline' 
                        iconSize={22} 
                        iconColor={Colors.white} 
                        showLoading={false} />
                </Row>
                <PageActivityIndicator color={Colors.yellow} />
            </SafeAreaView>
        )
    }

    const renderItem = ({item}: {item: Todo}) => {
        return <TodoComponent todo={item} setTodos={setTodos} />
    }


    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <Row style={{width: '100%', paddingRight: 2, marginTop: 4, marginBottom: 10, justifyContent: "space-between"}} >
                <AppLogo name='To do List' />
                <Button 
                    iconName='settings-outline' 
                    onPress={openSettings}
                    iconSize={22} 
                    iconColor={Colors.white} 
                    showLoading={false} />
            </Row>
            <View style={{flex: 1, gap: 10}} >                
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.todo_id.toString()}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps='always'
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<CreateTodoComponent setTodos={setTodos} />}
                    ListFooterComponent={<View style={{height: 52}} />}
                />
            </View>
        </SafeAreaView>
    )
}

export default SafeModeHomePage

const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        elevation: 5,        
        zIndex: 100
    },
    menuBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 1.2,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    },
    button: {
        width: '100%',
        height: 52,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.yellow,
        alignItems: "center",
        justifyContent: "center"
    },
    todoItem: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 20
    },
    checkBox: {
        backgroundColor: Colors.backgroundColor, 
        borderRadius: 20, 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 4
    }
})