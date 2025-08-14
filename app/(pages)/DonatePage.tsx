import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { Colors } from '@/constants/Colors'
import { DonateMethod, UserHistory } from '@/helpers/types'
import { formatNumberWithSuffix, getRelativeHeight, wp } from '@/helpers/util'
import { spGetDonationMethods } from '@/lib/supabase'
import { useDonateState } from '@/store/donateState'
import { AppStyle } from '@/styles/AppStyle'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import DonateComponent from '@/components/DonateComponent'
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { dbGetUserHistory } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import Row from '@/components/util/Row'
import Footer from '@/components/util/Footer'


const WIDTH = wp(92)
const HEIGHT = getRelativeHeight(
  AppConstants.DONATE_BANNER.WIDTH, 
  AppConstants.DONATE_BANNER.HEIGHT, 
  WIDTH
)


const Donate = () => {  

  const db = useSQLiteContext()
  const { donates, setDonates } = useDonateState()
  const [loading, setLoading] = useState(false)
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null)
  const [donateImageUrl, setDonateImageUrl] = useState<string | null | undefined>(null)

  useEffect(
    () => {
      let isCancelled = false      
      const init = async () => {
        await dbGetUserHistory(db).then(u => setUserHistory(u))

        if (donates.length != 0) { 
          setDonateImageUrl(donates.find(i => i.method === 'donation-banner')?.value)
          return 
        }

        setLoading(true)
          const d = await spGetDonationMethods()
          if (isCancelled) { return }
          setDonates(d)
          const img_url = d.find(i => i.method === 'donation-banner')?.value
          if (img_url) {
            await Image.prefetch(img_url)
            setDonateImageUrl(img_url)
          }
        setLoading(false)
      }
      
      init()

      return () => { isCancelled = true }
    },
    [db]
  )  

  const renderItem = ({item}: {item: DonateMethod}) => {
    return <DonateComponent item={item} />
  }

  if (loading) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' titleColor={Colors.donateColor} >
            <ReturnButton color={Colors.donateColor} />
        </TopBar>
        <PageActivityIndicator color={Colors.donateColor} />
      </SafeAreaView>  
    )
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' titleColor={Colors.donateColor} >
            <ReturnButton color={Colors.donateColor} />
        </TopBar>        
        <FlatList
            data={donates.filter(i => i.method !== 'donation-banner')}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {
                  userHistory &&
                  <View style={{ marginBottom: AppConstants.COMMON.MARGIN, gap: AppConstants.COMMON.MARGIN}} >
                      <Text style={[AppStyle.textHeader, {color: Colors.donateColor, fontSize: 20}]}>Activity history</Text>
                      <ScrollView style={{width: '100%'}} showsHorizontalScrollIndicator={false} horizontal={true} >
                        <Row style={{gap: AppConstants.COMMON.MARGIN}} >
                            <View style={styles.item} >
                              <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor, textAlign: "center"}]} >{formatNumberWithSuffix(userHistory.images)} images</Text>
                            </View>
                            <View style={styles.item} >
                              <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor, textAlign: "center"}]} >{formatNumberWithSuffix(userHistory.chapters)} chapters</Text>
                            </View>
                            <View style={styles.item} >
                              <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor, textAlign: "center"}]} >{formatNumberWithSuffix(userHistory.manhwas)} manhwas</Text>
                            </View>
                        </Row>
                      </ScrollView>
                  </View>
                }
                {
                  donateImageUrl && 
                  <Image 
                    source={donateImageUrl} 
                    style={styles.image} 
                    contentFit='cover' />
                }
              </>
            }
            ListFooterComponent={<Footer/>}
            renderItem={renderItem}
        />
    </SafeAreaView>
  )
}

export default Donate

const styles = StyleSheet.create({
  donateButton: {
    maxWidth: '100%', 
    padding: 10, 
    borderRadius: AppConstants.COMMON.BORDER_RADIUS, 
    backgroundColor: Colors.donateColor, 
    marginBottom: AppConstants.COMMON.MARGIN,
  },
  donateTitleContainer: {
    width: "100%", 
    flexDirection: 'row', 
    alignItems: "center", 
    gap: 10, 
    justifyContent: "space-between"
  },
  item: {
    paddingHorizontal: 20,
    height: 52,
    borderRadius: AppConstants.COMMON.BORDER_RADIUS,
    backgroundColor: Colors.donateColor,
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: WIDTH, 
    height: HEIGHT, 
    marginBottom: AppConstants.COMMON.MARGIN, 
    alignSelf: "center", 
    borderRadius: AppConstants.COMMON.BORDER_RADIUS
  }
})
