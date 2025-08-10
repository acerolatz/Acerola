import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'
import { AppStyle } from '@/styles/AppStyle'
import Row from '@/components/util/Row'
import AppLogo from '@/components/util/Logo'
import Button from '@/components/buttons/Button'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import { Todo } from '@/helpers/types'
import { dbCreateTodo, dbDeleteCompletedTodos, dbDeleteTodo, dbReadTodos, dbUpdateTodo } from '@/lib/database'
import { TextInput } from 'react-native-gesture-handler'
import Column from '@/components/util/Column'
import Toast from 'react-native-toast-message'
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { Keyboard } from 'react-native'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import LateralMenu from '@/components/LateralMenu'
import SafeModeLateralMenu from '@/components/SafeModeLateralMenu'


const SCREEN_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)
const PAGE_LIMIT = 30


const CreateTodoComponent = ({setTodos}: {setTodos: React.Dispatch<React.SetStateAction<Todo[]>>}) => {

    const db = useSQLiteContext()
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<TextInput>(null)

    const create = async () => {
        Keyboard.dismiss()
        if (text.trim() === '') {
            Toast.show({text1: "Invalid Task", type: 'error'})
            return
        }
        setLoading(true)
            const newTodo: Todo | null = await dbCreateTodo(db, text.trim())
            if (!newTodo) {
                Toast.show({text1: "Error", text2: "Could not create todo", type: "error"})
            } else {
                setText('')
                inputRef.current?.clear()
                setTodos(prev => [...[newTodo], ...prev])
            }
        setLoading(false)
    }

    return (
        <Column style={{gap: 10}} >
            <Row style={{gap: 10, justifyContent: "flex-start", width: '100%'}} >
                <Ionicons name='add-outline' size={22} color={Colors.white}/>
                <TextInput
                    ref={inputRef}
                    placeholder='Enter tasks, ideas, notes...'
                    placeholderTextColor={Colors.white}
                    autoCapitalize='sentences'
                    style={{color: Colors.white, width: '80%'}}
                    onChangeText={setText}
                />
            </Row>
            <Row>
                {
                    loading ?
                    <Pressable onPress={create} style={{flex: 1, height: 52, backgroundColor: Colors.yellow, borderRadius: AppConstants.COMMON.BORDER_RADIUS, alignItems: "center", justifyContent: "center", alignSelf: "flex-start"}} >
                        <CustomActivityIndicator color={Colors.yellow} /> 
                    </Pressable>
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

    const clickCheckbox = async () => {
        const newStatus = !isCompleted
        const success = await dbUpdateTodo(db, todo.todo_id, todo.title, newStatus ? 1 : 0)
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
        <Pressable onPress={clickCheckbox} style={{flexDirection: 'row', alignItems: "center", justifyContent: "flex-start", gap: 16, marginBottom: 20}} >
            <View
                style={{
                    height: 22, 
                    width: 22, 
                    borderRadius: 22, 
                    borderWidth: 1, 
                    borderColor: Colors.yellow,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isCompleted ? Colors.yellow : Colors.backgroundColor
            }} >
                {isCompleted && <Ionicons name='checkmark' size={21} color={Colors.backgroundColor} />}
            </View> 
            {
                isCompleted && 
                <Pressable onPress={deleteTodo} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
                    <Ionicons name='trash-outline' size={18} color={Colors.neonRed} />
                </Pressable>
            }
            <Text style={[AppStyle.textRegular, {maxWidth: '80%'}]}>{todo.title} </Text>
        </Pressable>
    )
}


const SafeModeHomePage = () => {

    const db = useSQLiteContext()
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(false)

    const menuAnim = useRef(new Animated.Value(-AppConstants.PAGES.HOME.MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current
    const menuVisible = useRef(false)

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

    const openMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME * 1.2,
            useNativeDriver: true
        }).start()
    }
    
    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -AppConstants.PAGES.HOME.MENU_WIDTH,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -SCREEN_WIDTH,
            duration: AppConstants.PAGES.HOME.MENU_ANIMATION_TIME,
            useNativeDriver: true
        }).start()
    }

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <Row style={{width: '100%', paddingRight: 2, marginTop: 4, marginBottom: 10, justifyContent: "space-between"}} >
                    <AppLogo name='To do' />
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
                <AppLogo name='To do' />
                <Button 
                    iconName='options-outline' 
                    onPress={toggleMenu}
                    iconSize={22} 
                    iconColor={Colors.white} 
                    showLoading={false} />
            </Row>
            <View style={{flex: 1, gap: 10}} >
                <CreateTodoComponent setTodos={setTodos} />
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.todo_id.toString()}
                    renderItem={renderItem}
                    ListFooterComponent={<View style={{height: 52}} />}
                />
            </View>
            <Animated.View style={[styles.menuBackground, { width: SCREEN_WIDTH, transform: [{ translateX: backgroundAnim }] }]}>
                <Pressable onPress={closeMenu} style={{width: '100%', height: '100%'}} />
            </Animated.View>
            <Animated.View style={[styles.sideMenu, { width: AppConstants.PAGES.HOME.MENU_WIDTH, transform: [{ translateX: menuAnim }] }]}>
                <SafeModeLateralMenu closeMenu={closeMenu}/>
            </Animated.View>
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
    }
})