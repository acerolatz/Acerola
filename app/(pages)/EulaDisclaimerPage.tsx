import PageActivityIndicator from '@/app/components/util/PageActivityIndicator'
import ReturnButton from '@/app/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { spFetchEulaAndDisclaimer } from '@/lib/supabase'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { useTextState } from '@/hooks/appTextState'
import Footer from '@/app/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/app/components/TopBar'
import { wp } from '@/helpers/util'
import { 
    Animated, 
    SafeAreaView, 
    ScrollView,    
    Text, 
    View 
} from 'react-native'
import Row from '@/app/components/util/Row'


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
        const index = Math.round(offsetX / AppConstants.UI.SCREEN.VALID_WIDTH);
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
                    <Row style={AppStyle.gap} >
                        <View style={AppStyle.dotsContainer}>
                            {
                                texts.map((_, i) => {
                                    const opacity = scrollX.interpolate({
                                        inputRange: [(i - 1) * AppConstants.UI.SCREEN.VALID_WIDTH, i * AppConstants.UI.SCREEN.VALID_WIDTH, (i + 1) * AppConstants.UI.SCREEN.VALID_WIDTH, ],
                                        outputRange: [0.3, 1, 0.3],
                                        extrapolate: 'clamp',
                                    });        
                                    return (
                                        <Animated.View key={i} style={[AppStyle.dot, { opacity }]}/>
                                    );
                                })
                            }
                        </View>
                        <ReturnButton/>
                    </Row>
                </TopBar>
                <View style={AppStyle.flex}>
                    <Animated.FlatList
                        data={texts}
                        keyboardShouldPersistTaps='handled'
                        renderItem={({ item }) => <View style={{ width: AppConstants.UI.SCREEN.VALID_WIDTH }}>{item}</View>}
                        keyExtractor={(_, index) => index.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={AppConstants.UI.SCREEN.VALID_WIDTH}
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