import { dbCheckPassword, dbReadTodos, dbSetLastRefresh, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import CreateTodoComponent from '@/components/CreateTodoComponent'
import { hasInternetAvailable, hp } from '@/helpers/util'
import { TextInput } from 'react-native-gesture-handler'
import { AppConstants } from '@/constants/AppConstants'
import CloseBtn from '@/components/buttons/CloseButton'
import TodoComponent from '@/components/TodoComponent'
import { ToastMessages } from '@/constants/Messages'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import Button from '@/components/buttons/Button'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from 'react-native-toast-message'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { Keyboard } from 'react-native'
import { Todo } from '@/helpers/types'
import { router } from 'expo-router'


/**
 * SafeModeHomePage component – manages a local todo list with protected settings.
 *
 * Features:
 * - Displays todos fetched from local SQLite database (`dbReadTodos`).
 * - Supports creating, updating, and deleting todos via `CreateTodoComponent` and `TodoComponent`.
 * - Settings require a password check (`dbCheckPassword`) to access.
 * - Syncs local database with server if internet is available and update is needed.
 * - BottomSheet is used for password-protected settings, with show/hide password toggle.
 *
 * State:
 * - `todos` – list of Todo items.
 * - `loading` – boolean to indicate data fetching.
 * - `text` – password input text.
 * - `showPassword` – toggles password visibility.
 *
 * Refs:
 * - `bottomSheetRef` – controls the BottomSheet instance.
 * - `isCheckingPassword` – prevents multiple password check triggers.
 *
 * Methods:
 * - `checkPassword()` – validates password, optionally syncs database, and navigates to HomePage.
 * - `handleOpenBottomSheet()` – opens settings BottomSheet.
 * - `handleCloseBottomSheet()` – closes BottomSheet and clears input.
 * - `handleShowPassword()` – toggles password visibility.
 *
 * Components:
 * - `TopBar` – page header with title and settings button.
 * - `FlatList` – lists todos with create component as header and footer.
 * - `BottomSheet` – password-protected settings area.
 * - `CreateTodoComponent`, `TodoComponent`, `Footer` – manage todos and page layout.
 *
 */
const SafeModeHomePage = () => {

    const db = useSQLiteContext()
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(false)
    const [text, setText] = useState('')

    const bottomSheetRef = useRef<BottomSheet>(null)
    const [showPassword, setShowPassword] = useState(false)
    const passwordIcon = showPassword ? "eye-off-outline" : "eye-outline"
    
    const isCheckingPassword = useRef(false)

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
        if (isCheckingPassword.current) { return }
        isCheckingPassword.current = true
            Keyboard.dismiss()
            const success = await dbCheckPassword(db, text)
            if (!success) {
                Toast.show(ToastMessages.EN.INVALID_PASSWORD)
                isCheckingPassword.current = false
                return
            }
            
            if (await hasInternetAvailable() && await dbShouldUpdate(db, 'server')) {
                Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE);
                await dbUpdateDatabase(db);
                await dbSetLastRefresh(db, 'client');
                Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED);
            }
        isCheckingPassword.current = false
        router.replace("/(pages)/HomePage")
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
                    <View style={{flex: 1, gap: AppConstants.GAP}} >
                        <Text style={{...Typography.light, color: Colors.red}}>A password is required to access the settings.</Text>
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
                                hitSlop={AppConstants.HIT_SLOP.NORMAL}
                                style={AppStyle.iconCenter}>
                                <Ionicons name={passwordIcon} size={AppConstants.ICON.SIZE} color={Colors.primary} />
                            </Pressable>
                        </View>
                        <Row style={{gap: AppConstants.MARGIN}} >
                            <Pressable onPress={handleCloseBottomSheet} style={AppStyle.buttonCancel} >
                                <Text style={{...Typography.regular, color: Colors.primary}} >Cancel</Text>
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
    bottomSheetContainer: {
        paddingTop: 10,
        paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL
    },
    handleStyle: {
        backgroundColor: Colors.backgroundSecondary, 
        borderTopLeftRadius: AppConstants.BOTTOMSHEET_HANDLE_RADIUS, 
        borderTopRightRadius: AppConstants.BOTTOMSHEET_HANDLE_RADIUS
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.primary
    },
    backgroundStyle: {
        backgroundColor: Colors.backgroundSecondary
    },
    passwordInput: {
        ...AppStyle.input, 
        backgroundColor: Colors.backgroundColor, 
        paddingRight: AppConstants.ICON.SIZE * 2
    }    
})