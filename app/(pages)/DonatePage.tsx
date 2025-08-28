import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import ReturnButton from '@/components/buttons/ReturnButton'
import DonateComponent from '@/components/DonateComponent'
import { getRelativeHeight, wp } from '@/helpers/util'
import { spFetchDonationMethods } from '@/lib/supabase'
import { useDonateState } from '@/store/donateState'
import React, { useEffect, useState } from 'react'
import { DonateMethod } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { Image } from 'expo-image'
import {
  FlatList,
  SafeAreaView,
  StyleSheet
} from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import Footer from '@/components/util/Footer'


const WIDTH = wp(92)
const HEIGHT = getRelativeHeight(
  AppConstants.UI.DONATION.DONATE_BANNER.WIDTH, 
  AppConstants.UI.DONATION.DONATE_BANNER.HEIGHT, 
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
          const d = await spFetchDonationMethods()
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

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate'>
            <ReturnButton />
        </TopBar>
        {
          loading ?
          <PageActivityIndicator/> :
          (
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
          )
        }       
    </SafeAreaView>
  )
}

export default Donate

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 20,
    height: 52,
    borderRadius: AppConstants.UI.BORDER_RADIUS,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: WIDTH, 
    height: HEIGHT, 
    marginBottom: AppConstants.UI.MARGIN, 
    alignSelf: "center", 
    borderRadius: AppConstants.UI.BORDER_RADIUS
  }
})