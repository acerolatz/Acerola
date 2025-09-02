import TopBar from '@/components/TopBar'
import UserDataComponent from '@/components/UserActivityComponent'
import ReturnButton from '@/components/buttons/ReturnButton'
import CacheForm from '@/components/form/CacheForm'
import SafeModeForm from '@/components/form/SafeModeForm'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { getCacheSizeBytes, wp } from '@/helpers/util'
import { dbIsSafeModeEnabled, dbReadSafeModePassword } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View} from 'react-native'


const width = wp(92)

const Settings = () => {

    const params = useLocalSearchParams()
    const cache_size = params.cache_size as any

    const db = useSQLiteContext()
    const [currentCacheSize, setCurrentCacheSize] = useState<number>(0)
    const [safeModePassword, setSafeModePassword] = useState<string>('')
    const [safeModeOn, setSafeModeOn] = useState<boolean>(false)

    const [loading, setLoading] = useState(false)    

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
      <SafeModeForm safeModeOn={safeModeOn} safeModePassword={safeModePassword} />,
      <CacheForm currentCacheSize={currentCacheSize} currentMaxCacheSize={cache_size} />,
      <UserDataComponent/>
    ];

    const scrollX = useRef(new Animated.Value(0)).current;

    if (loading || safeModePassword === null || safeModeOn === null) {
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
                    <View style={styles.dotsContainer}>
                        {forms.map((_, i) => {
                            const opacity = scrollX.interpolate({
                                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });
        
                            return <Animated.View key={i} style={[styles.dot, { opacity }]} />
                        })}
                    </View>
                    <ReturnButton/>
                </Row>
            </TopBar>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <View style={{flex: 1}}>                    

                <Animated.FlatList
                    data={forms}
                    keyboardShouldPersistTaps='handled'
                    renderItem={({ item }) => <View style={{ width }}>{item}</View>}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={width}
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
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  dot: {
    height: AppConstants.UI.ICON.SIZE * 0.5,
    width: AppConstants.UI.ICON.SIZE * 0.5,
    borderRadius: AppConstants.UI.ICON.SIZE,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  }
});
