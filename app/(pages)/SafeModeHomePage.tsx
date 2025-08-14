import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { dbCheckPassword, dbCreateTodo, dbDeleteTodo, dbReadTodos, dbUpdateTodo } from '@/lib/database'
import { TextInput } from 'react-native-gesture-handler'
import Column from '@/components/util/Column'
import Toast from 'react-native-toast-message'
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { Keyboard } from 'react-native'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { router } from 'expo-router'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import TopBar from '@/components/TopBar'
import Footer from '@/components/util/Footer'


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
        <Column style={{gap: 10, marginBottom: 10}} >
            <Column style={{gap: 10,  width: '100%'}} >
                <TextInput
                    ref={inputRef}
                    placeholder='Enter tasks, ideas, notes...'
                    placeholderTextColor={Colors.white}
                    autoCapitalize='sentences'
                    style={styles.input}
                    onChangeText={setText}
                />
                <TextInput
                    ref={inputRef1}
                    placeholder='description (optional)...'
                    placeholderTextColor={Colors.white}
                    textAlignVertical='top'
                    multiline={true}
                    autoCapitalize='sentences'
                    style={styles.inputLarge}
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
        <Pressable onPress={clickCheckbox} style={styles.todoItem} >
            <Row style={[styles.todoItemTop, {backgroundColor}]} >
                <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor, maxWidth: '85%'}]}>{todo.title} </Text>
                <View style={styles.checkBox} >
                    <Ionicons name='checkmark' size={20} color={checkmarkBackgroundColor} />
                </View>
            </Row>
            <Column style={[styles.todoItemBottom, {borderColor: backgroundColor}]} >
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
    const [text, setText] = useState('')
    const bottomSheetRef = useRef<BottomSheet>(null)

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

    const checkPassword = async () => {
        Keyboard.dismiss()
        const success = await dbCheckPassword(db, text)
        if (success) {
            Toast.show({text1: "Success!", type: "success"})
            router.replace("/HomePage")
        } else {
            Toast.show({
                text1: "Error", 
                text2: "Invalid password", 
                type: "error1"
            })
        }
    }

    const handleOpenBottomSheet = useCallback(() => {
        Keyboard.dismiss()
        bottomSheetRef.current?.expand();
    }, []);
    
    const handleCloseBottomSheet = useCallback(() => {
        setText('')
        Keyboard.dismiss()
        bottomSheetRef.current?.close();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <Row style={styles.topBar} >
                    <AppLogo name='To do List' />
                    <Button iconName='settings-outline' />
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
            <Row style={styles.topBar} >
                <AppLogo name='To do List' />
                <Button iconName='settings-outline' onPress={handleOpenBottomSheet} />
            </Row>
            <View style={{flex: 1, gap: 10}} >
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.todo_id.toString()}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps='always'
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<CreateTodoComponent setTodos={setTodos} />}
                    ListFooterComponent={<Footer/>}
                />
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                handleStyle={styles.handleStyle}
                backgroundStyle={styles.backgroundStyle}
                enablePanDownToClose={true}>
                <BottomSheetView style={styles.bottomSheetContainer} >
                    <TopBar title='Settings' titleColor={Colors.yellow}>
                        <Pressable onPress={handleCloseBottomSheet} >
                            <Ionicons name='close-circle-outline' color={Colors.yellow} size={28} />
                        </Pressable>
                    </TopBar>
                    <View style={{width: '100%'}} >
                        <Text style={[AppStyle.textRegular, {color: Colors.neonRed, marginBottom: 10}]}>A password is required to access the settings.</Text>
                        <TextInput
                            style={[AppStyle.input, {backgroundColor: Colors.backgroundColor}]}
                            autoCapitalize='none'
                            secureTextEntry={true}
                            placeholder='password'
                            placeholderTextColor={'white'}
                            onChangeText={setText}
                            value={text}
                        />
                        <Row style={{gap: AppConstants.COMMON.MARGIN}} >
                            <Pressable onPress={handleCloseBottomSheet} style={[styles.button, {backgroundColor: Colors.backgroundSecondary, borderWidth: 1, borderColor: Colors.yellow}]} >
                                <Text style={AppStyle.textRegular} >Cancel</Text>
                            </Pressable>
                            <Pressable onPress={checkPassword} style={styles.button} >
                                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >OK</Text>
                            </Pressable>
                        </Row>
                    </View>
                    <Footer/>
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
    )
}

export default SafeModeHomePage

const styles = StyleSheet.create({
    topBar: {
        width: '100%', 
        paddingRight: 2, 
        marginTop: 4, 
        marginBottom: 10, 
        justifyContent: "space-between"
    },
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
        width: AppConstants.COMMON.SCREEN_WIDTH,
        height: AppConstants.COMMON.SCREEN_HEIGHT * 1.2,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    },
    button: {
        flex: 1,
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.yellow
    },
    todoItem: {
        width: '100%',
        marginBottom: 20
    },
    checkBox: {
        backgroundColor: Colors.backgroundColor, 
        borderRadius: 20, 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 4
    },
    bottomSheetContainer: {
        paddingTop: 10,
        paddingHorizontal: wp(4), 
        gap: 10,
        height: hp(85)
    },
    handleStyle: {
        backgroundColor: Colors.backgroundSecondary, 
        borderTopLeftRadius: 12, 
        borderTopRightRadius: 12
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.yellow
    },
    backgroundStyle: {
        backgroundColor: Colors.backgroundSecondary
    },
    input: {
        color: Colors.white, 
        paddingLeft: 10,
        paddingVertical: 20,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
    },
    inputLarge: {
        color: Colors.white,
        paddingLeft: 10,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        height: 80
    },
    todoItemTop: {
        width: '100%', 
        borderTopRightRadius: AppConstants.COMMON.BORDER_RADIUS, 
        borderTopLeftRadius: AppConstants.COMMON.BORDER_RADIUS, 
        paddingHorizontal: 10, 
        paddingVertical: 8,
        justifyContent: "space-between"
    },
    todoItemBottom: {
        paddingHorizontal: 10, 
        paddingVertical: 8, 
        borderWidth: 1, 
        borderTopWidth: 0,
        borderBottomLeftRadius: AppConstants.COMMON.BORDER_RADIUS, 
        borderBottomRightRadius: AppConstants.COMMON.BORDER_RADIUS
    }
})