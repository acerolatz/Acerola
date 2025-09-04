import { 
    Animated, 
    KeyboardAvoidingView, 
    Platform, 
    SafeAreaView, 
    StyleSheet, 
    View
} from 'react-native'
import PageActivityIndicator from '@/app/components/util/PageActivityIndicator'
import { dbCountRows, dbIsSafeModeEnabled, dbReadSafeModePassword } from '@/lib/database'
import UserDataComponent from '@/app/components/UserActivityComponent'
import ReturnButton from '@/app/components/buttons/ReturnButton'
import SafeModeForm from '@/app/components/form/SafeModeForm'
import React, { useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import CacheForm from '@/app/components/form/CacheForm'
import { getCacheSizeBytes, wp } from '@/helpers/util'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/app/components/TopBar'
import Row from '@/app/components/util/Row'



const Settings = () => {

    const params = useLocalSearchParams()
    const maxCacheSize = params.cache_size as any

    const db = useSQLiteContext()
    const [currentCacheSize, setCurrentCacheSize] = useState<number>(0)
    const [safeModePassword, setSafeModePassword] = useState<string>('')
    const [safeModeOn, setSafeModeOn] = useState<boolean>(false)
    const [loading, setLoading] = useState(false)

    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                    await Promise.all([
                        dbIsSafeModeEnabled(db),
                        dbReadSafeModePassword(db),
                        getCacheSizeBytes()                        
                    ]).then(([s, p, c]) => {
                        setSafeModeOn(s),
                        setSafeModePassword(p),
                        setCurrentCacheSize(c)                        
                    })
                setLoading(false)
            }
            init()
        },
        []
    )

    const forms = [
        <View style={styles.screenStyle} >
            <SafeModeForm safeModeOn={safeModeOn} safeModePassword={safeModePassword} />
        </View>,
        <View style={styles.screenStyle} >
            <CacheForm currentCacheSize={currentCacheSize} currentMaxCacheSize={maxCacheSize} />
        </View>,
        <View style={styles.screenStyle} >
            <UserDataComponent/>
        </View>      
    ];

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Settings'>
                    <ReturnButton/>
                </TopBar>      
                <PageActivityIndicator/>
            </SafeAreaView>    
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Settings'>
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
                    <ReturnButton/>
                </Row>
            </TopBar>
            <KeyboardAvoidingView style={AppStyle.flex} behavior={AppConstants.APP.KEYBOARD_VIEW_BEHAVIOR as any} >
                <View style={AppStyle.flex}>
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
                        bounces
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Settings

const styles = StyleSheet.create({
    screenStyle: {
        flex: 1,
        paddingHorizontal: 2
    }
})
