import { 
    dbCheckPassword, 
    dbReadNotes, 
    dbReadTodos, 
    dbSetLastDatabaseSync, 
    dbShouldSyncDatabase, 
    dbSyncDatabase 
} from '@/lib/database'
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import PageActivityIndicator from '@/app/components/util/PageActivityIndicator'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { hasInternetAvailable, hp, wp } from '@/helpers/util'
import { TextInput } from 'react-native-gesture-handler'
import { AppConstants } from '@/constants/AppConstants'
import CloseBtn from '@/app/components/buttons/CloseButton'
import { ToastMessages } from '@/constants/Messages'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import Button from '@/app/components/buttons/Button'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from 'react-native-toast-message'
import Footer from '@/app/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { SafeAreaView } from 'react-native'
import TopBar from '@/app/components/TopBar'
import Row from '@/app/components/util/Row'
import { Keyboard } from 'react-native'
import { Note, Todo } from '@/helpers/types'
import { router, useFocusEffect } from 'expo-router'
import Tasks from '../components/Tasks'
import Notes from '../components/Notes'


const SafeModeHomePage = () => {

    const db = useSQLiteContext()
    const [title, setTitle] = useState('Tasks')
    const [todos, setTodos] = useState<Todo[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(false)
    const [text, setText] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const passwordIcon = showPassword ? "eye-off-outline" : "eye-outline"

    const bottomSheetRef = useRef<BottomSheet>(null)
    const scrollX = useRef(new Animated.Value(0)).current;
    const isCheckingPassword = useRef(false)
    const titles = ['Tasks', 'Notes']

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                const t = await dbReadTodos(db)
                setTodos(t)
                setLoading(false)
            }
            init()
        },
        [db]
    )

    const reload = async () => {
        const n = await dbReadNotes(db)
        setNotes(n)
    }

    useFocusEffect(useCallback(() => {
        reload()
    }, []))

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
            if (await hasInternetAvailable() && await dbShouldSyncDatabase(db)) {
                Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_TYP1);
                await dbSyncDatabase(db);
                await dbSetLastDatabaseSync(db);
                Toast.show(ToastMessages.EN.SYNC_LOCAL_DATABASE_COMPLETED_TYP1);
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

    const forms = [
      <Tasks todos={todos} setTodos={setTodos} />,
      <Notes notes={notes} setNotes={setNotes} />
    ];

    const handleMomentumScrollEnd = (e: any) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / AppConstants.UI.SCREEN.VALID_WIDTH);
        setTitle(titles[index])
    };

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title={title} >
                    <Button iconName='settings-outline' />
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>
        )
    }    

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={title} >
                <Row style={{gap: AppConstants.UI.GAP}} >
                    <View style={AppStyle.dotsContainer}>
                        {forms.map((_, i) => {
                            const opacity = scrollX.interpolate({
                                inputRange: [(i - 1) * AppConstants.UI.SCREEN.VALID_WIDTH, i * AppConstants.UI.SCREEN.VALID_WIDTH, (i + 1) * AppConstants.UI.SCREEN.VALID_WIDTH],
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });
                            return <Animated.View key={i} style={[AppStyle.dot, { opacity }]} />
                        })}
                    </View>
                    <Button iconName='settings-outline' onPress={handleOpenBottomSheet} iconColor={Colors.primary} />
                </Row>
            </TopBar>
            <View style={{flex: 1}} >
                <Animated.FlatList
                    data={forms}
                    keyboardShouldPersistTaps='handled'
                    renderItem={({ item }) => <View style={{ width: AppConstants.UI.SCREEN.VALID_WIDTH }}>{item}</View>}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={AppConstants.UI.SCREEN.VALID_WIDTH}
                    decelerationRate='fast'
                    disableIntervalMomentum={true}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    bounces
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
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
                    <View style={{flex: 1, gap: AppConstants.UI.GAP}} >
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
                                hitSlop={AppConstants.UI.HIT_SLOP.NORMAL}
                                style={AppStyle.iconCenter}>
                                <Ionicons name={passwordIcon} size={AppConstants.UI.ICON.SIZE} color={Colors.primary} />
                            </Pressable>
                        </View>
                        <Row style={{gap: AppConstants.UI.MARGIN}} >
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
        paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL
    },
    handleStyle: {
        backgroundColor: Colors.backgroundSecondary, 
        borderTopLeftRadius: AppConstants.UI.BOTTOMSHEET_HANDLE_RADIUS, 
        borderTopRightRadius: AppConstants.UI.BOTTOMSHEET_HANDLE_RADIUS
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
        paddingRight: AppConstants.UI.ICON.SIZE * 2
    }    
})