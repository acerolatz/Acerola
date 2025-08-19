import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import ReturnButton from '@/components/buttons/ReturnButton'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import React, { useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useScanState } from '@/store/scansState'
import Footer from '@/components/util/Footer'
import { spFetchScans } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { openUrl } from '@/helpers/util'
import Row from '@/components/util/Row'
import { Scan } from '@/helpers/types'
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


/**
 * ScansPage component – displays a list of scan sources.
 *
 * Fetches scans from Supabase and renders them in a scrollable FlatList.
 * Includes a header with the title, a return button, and a footer.
 * Each scan item can be pressed to open its associated URL.
 *
 * @remarks
 * - Uses Zustand `useScanState` for global scan list and title management.
 * - Shows `PageActivityIndicator` while loading.
 * - The first item in the list header displays the `title` scan URL.
 * - Each item uses `Item` sub-component with `Pressable` and `Ionicons`.
 *
 * @components
 * - `TopBar` – shows page title and return button.
 * - `ReturnButton` – navigates back.
 * - `PageActivityIndicator` – shows loading spinner.
 * - `Footer` – optional page footer.
 *
 */
const ScansPage = () => {

    const { scans, setScans, title, setTitle } = useScanState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                if (scans.length != 0) { return }
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
        marginBottom: AppConstants.MARGIN
    }    
})