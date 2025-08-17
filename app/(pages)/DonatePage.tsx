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
import { Typography } from '@/constants/typography'


const WIDTH = wp(92)
const HEIGHT = getRelativeHeight(
  AppConstants.DONATION.DONATE_BANNER.WIDTH, 
  AppConstants.DONATION.DONATE_BANNER.HEIGHT, 
  WIDTH
)


const Donate = () => {  

  const db = useSQLiteContext()
  const { donates, setDonates } = useDonateState()
  const [loading, setLoading] = useState(false)
  const [donateImageUrl, setDonateImageUrl] = useState<string | null | undefined>(null)

  useEffect(
    () => {
      let isCancelled = false      
      const init = async () => {
        
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
        <TopBar title='Donate'>
            <ReturnButton/>
        </TopBar>
        <PageActivityIndicator/>
      </SafeAreaView>  
    )
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate'>
            <ReturnButton />
        </TopBar>        
        <FlatList
            data={donates.filter(i => i.method !== 'donation-banner')}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
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
  item: {
    paddingHorizontal: 20,
    height: 52,
    borderRadius: AppConstants.BORDER_RADIUS,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: WIDTH, 
    height: HEIGHT, 
    marginBottom: AppConstants.MARGIN, 
    alignSelf: "center", 
    borderRadius: AppConstants.BORDER_RADIUS
  }
})