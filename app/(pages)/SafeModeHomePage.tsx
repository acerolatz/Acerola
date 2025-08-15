import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'
import { AppStyle } from '@/styles/AppStyle'
import Row from '@/components/util/Row'
import Button from '@/components/buttons/Button'
import { Colors } from '@/constants/Colors'
import { formatTimestamp, hp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import { Todo } from '@/helpers/types'
import { 
    dbCheckPassword, 
    dbCreateTodo, 
    dbDeleteTodo, 
    dbReadTodos, 
    dbUpdateTodo 
} from '@/lib/database'
import { TextInput } from 'react-native-gesture-handler'
import Column from '@/components/util/Column'
import Toast from 'react-native-toast-message'
import { Keyboard } from 'react-native'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { router } from 'expo-router'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import TopBar from '@/components/TopBar'
import Footer from '@/components/util/Footer'
import CloseBtn from '@/components/buttons/CloseButton'
import { Typography } from '@/constants/typography'
import { ToastMessages } from '@/constants/Messages'


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
        <Column style={styles.createTodoContainer} >
            <Column style={{gap: AppConstants.COMMON.GAP}} >
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
                <Text style={[Typography.regular, {color: Colors.backgroundColor}]} >Create</Text>
            </Pressable>
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
            <Row style={{...styles.todoItemTop, backgroundColor}} >
                <Text style={{...Typography.regularLg, color: Colors.backgroundColor, flexShrink: 1}}>{todo.title}</Text>
                <View style={styles.checkBox} >
                    <Ionicons name='checkmark' size={AppConstants.ICON.SIZE} color={checkmarkBackgroundColor} />
                </View>
            </Row>
            <Column style={[styles.todoItemBottom, {borderColor: backgroundColor}]} >
                {todo.descr && <Text style={Typography.regular}>{todo.descr} </Text>}
                <Row style={{justifyContent: "space-between"}} >
                    <View>
                        <Text style={Typography.light}>Created at: {formatTimestamp(todo.created_at)}</Text>
                        {finishedAt && <Text style={Typography.light}>Finished at: {formatTimestamp(finishedAt)}</Text>}
                    </View>
                    {
                        isCompleted &&
                        <Pressable onPress={deleteTodo} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
                            <Ionicons name='trash' size={AppConstants.ICON.SIZE} color={Colors.neonRed} />
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
    const [showPassword, setShowPassword] = useState(false)
    const passwordIcon = showPassword ? "eye-off-outline" : "eye-outline"

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
            Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
            router.replace("/HomePage")
        } else {
            Toast.show(ToastMessages.EN.INVALID_PASSWORD)
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

    const handleShowPassword = () => {
        setShowPassword(prev => !prev)
    }    

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='To do List' >
                    <Button iconName='settings-outline' />
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>
        )
    }    

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='To do List' >
                <Button iconName='settings-outline' onPress={handleOpenBottomSheet} />
            </TopBar>
            <View style={{flex: 1}} >
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.todo_id.toString()}
                    renderItem={({item}) => <TodoComponent todo={item} setTodos={setTodos} />}
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
                    <TopBar title='Settings'>
                        <CloseBtn onPress={handleCloseBottomSheet}/>
                    </TopBar>                    
                    <View style={{flex: 1, gap: AppConstants.COMMON.GAP}} >
                        <Text style={{...Typography.light, color: Colors.neonRed}}>A password is required to access the settings.</Text>
                        <View>
                            <TextInput
                                style={styles.passwordInput}
                                autoCapitalize='none'
                                secureTextEntry={!showPassword}
                                placeholder='password'
                                placeholderTextColor={'white'}
                                onChangeText={setText}
                                value={text}
                            />
                            <Pressable
                                onPress={handleShowPassword}
                                hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL}
                                style={styles.showPasswordIcon}>
                                <Ionicons name={passwordIcon} size={AppConstants.ICON.SIZE} color={Colors.yellow} />
                            </Pressable>
                        </View>
                        <Row style={{gap: AppConstants.COMMON.MARGIN}} >
                            <Pressable onPress={handleCloseBottomSheet} style={AppStyle.buttonCancel} >
                                <Text style={{...Typography.regular, color: Colors.yellow}} >Cancel</Text>
                            </Pressable>
                            <Pressable onPress={checkPassword} style={AppStyle.button} >
                                <Text style={{...Typography.regular, color: Colors.backgroundColor}} >OK</Text>
                            </Pressable>
                        </Row>
                    </View>
                    <Footer height={hp(50)} />
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
    )
}

export default SafeModeHomePage

const styles = StyleSheet.create({
    todoItem: {
        width: '100%',
        marginBottom: AppConstants.COMMON.GAP
    },
    createTodoContainer: {
        gap: AppConstants.COMMON.GAP, 
        marginBottom: AppConstants.COMMON.GAP
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
        paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL
    },
    handleStyle: {
        backgroundColor: Colors.backgroundSecondary, 
        borderTopLeftRadius: AppConstants.BOTTOMSHEET_HANDLE_RADIUS, 
        borderTopRightRadius: AppConstants.BOTTOMSHEET_HANDLE_RADIUS
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.yellow
    },
    backgroundStyle: {
        backgroundColor: Colors.backgroundSecondary
    },
    todoItemTop: {
        width: '100%', 
        borderTopRightRadius: AppConstants.COMMON.BORDER_RADIUS, 
        borderTopLeftRadius: AppConstants.COMMON.BORDER_RADIUS, 
        paddingHorizontal: AppConstants.COMMON.ITEM_PADDING_HORIZONTAL,
        paddingVertical: AppConstants.COMMON.ITEM_PADDING_VERTICAL,
        gap: AppConstants.COMMON.GAP,
        justifyContent: "space-between"
    },
    todoItemBottom: {
        paddingHorizontal: 10, 
        paddingVertical: 8, 
        borderWidth: 1, 
        borderTopWidth: 0,
        borderBottomLeftRadius: AppConstants.COMMON.BORDER_RADIUS, 
        borderBottomRightRadius: AppConstants.COMMON.BORDER_RADIUS
    },
    passwordInput: {
        ...AppStyle.input, 
        backgroundColor: Colors.backgroundColor, 
        paddingRight: AppConstants.ICON.SIZE * 2
    },
    showPasswordIcon: {
        position: "absolute",
        right: 8,
        top: "50%",
        transform: [{ translateY: -11 }]
    }
})