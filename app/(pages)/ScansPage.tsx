import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Footer from '@/components/util/Footer'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import { Scan } from '@/helpers/types'
import { openUrl } from '@/helpers/util'
import { spFetchScans } from '@/lib/supabase'
import { useScanState } from '@/store/scansState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { 
    Pressable, 
    SafeAreaView,     
    StyleSheet, 
    Text, 
    View 
} from 'react-native'


const Item = ({item}: {item: Scan}) => {

    const onPress = async () => {
        await openUrl(item.url)
    }

    return (
        <Pressable onPress={onPress} style={styles.scanButton} >
            <Row style={{justifyContent: "space-between", width: "100%"}} >
                <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{item.name}</Text>
                <Ionicons name='globe-outline' size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
            </Row>
        </Pressable>
    )
}


const ScansPage = () => {

    const { scans, setScans, title, setTitle } = useScanState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                if (scans.length != 0) {
                    return
                }
                setLoading(true)
                    const r = await spFetchScans()
                    const t = r.find(i => i.name === 'title')
                    setScans(r.filter(i => i.name != "title"))
                    setTitle(t ? t.url : null)
                setLoading(false)
            }
            init()
        },
        [scans]
    )    

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Scans'>
                    <ReturnButton/>
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>
        )    
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Scans'>
                <ReturnButton/>
            </TopBar>
            <FlatList
                data={scans}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.scanButton} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >
                            {title}
                        </Text>
                    </View>
                }
                ListFooterComponent={<Footer/>}
                renderItem={({item}) => <Item item={item} />}
            />            
        </SafeAreaView>
    )

}

export default ScansPage

const styles = StyleSheet.create({
    scanButton: {
        ...AppStyle.defaultGridItem,
        marginBottom: AppConstants.COMMON.MARGIN
    }    
})