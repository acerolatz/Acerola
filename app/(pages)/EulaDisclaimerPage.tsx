import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { spFetchEulaAndDisclaimer } from '@/lib/supabase'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { useTextState } from '@/store/appTextState'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { wp } from '@/helpers/util'
import { 
    Animated, 
    SafeAreaView, 
    ScrollView, 
    StyleSheet, 
    Text, 
    View 
} from 'react-native'


const width = AppConstants.SCREEN.WIDTH - AppConstants.SCREEN.PADDING_HORIZONTAL * 2


const EulaAndDisclaimerPage = () => {

    const { textMap, setTextMap } = useTextState()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('EULA')
    const titles = ['EULA', 'Disclaimer']

    const EULA: string | undefined = textMap.get('eula')
    const DISCLAIMER: string | undefined = textMap.get('disclaimer')

    const texts = [
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
            <View style={{flex: 1, paddingHorizontal: wp(1)}} >
                <Text style={Typography.regular}>{EULA ? EULA : ''}</Text>
            </View>
            <Footer/>
        </ScrollView>,
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
            <View style={{flex: 1, paddingHorizontal: wp(1)}} >
                <Text style={Typography.regular}>{DISCLAIMER ? DISCLAIMER : ''}</Text>
            </View>
            <Footer/>
        </ScrollView>      
    ];    

    useEffect(
        () => {
            let isCancelled = false
            const init = async () => {
                if (textMap.size === 0) {
                    setLoading(true)
                        const d = await spFetchEulaAndDisclaimer()
                        if (isCancelled) { return }
                        const m =  new Map<string, string>(d.map(i => [i.name, i.value]))
                        setTextMap(m)
                    setLoading(false)
                }
            }
            init()
            return () => { isCancelled = true }
        },
        [textMap]
    )

    const scrollX = useRef(new Animated.Value(0)).current;
    const handleMomentumScrollEnd = (e: any) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setTitle(titles[index])
    };

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title={title}>
                    <ReturnButton/>
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>
        )
    }

    if (EULA && DISCLAIMER) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title={title}>
                    <ReturnButton/>
                </TopBar>
                <View style={styles.container}>
                    <View style={styles.dotsContainer}>
                        {
                            texts.map((_, i) => {
                                const opacity = scrollX.interpolate({
                                    inputRange: [(i - 1) * width, i * width, (i + 1) * width, ],
                                    outputRange: [0.3, 1, 0.3],
                                    extrapolate: 'clamp',
                                });        
                                return (
                                    <Animated.View key={i} style={[styles.dot, { opacity }]}/>
                                );
                            })
                        }
                    </View>            
                    <Animated.FlatList
                        data={texts}
                        keyboardShouldPersistTaps='handled'
                        renderItem={({ item }) => <View style={{ width }}>{item}</View>}
                        keyExtractor={(_, index) => index.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={width}
                        decelerationRate="fast"
                        bounces
                        onMomentumScrollEnd={handleMomentumScrollEnd}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={16}
                    />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={title}>
                <ReturnButton/>
            </TopBar>
        </SafeAreaView>
    )
}


export default EulaAndDisclaimerPage


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: AppConstants.MARGIN
    },
    dot: {
        height: AppConstants.ICON.SIZE * 0.5,
        width: AppConstants.ICON.SIZE * 0.5,
        borderRadius: AppConstants.ICON.SIZE,
        backgroundColor: Colors.primary,
        marginHorizontal: 4,
    }
})