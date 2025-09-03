import PageActivityIndicator from '@/app/components/util/PageActivityIndicator'
import ReturnButton from '@/app/components/buttons/ReturnButton'
import React, { useCallback, useEffect, useState } from 'react'
import DonateComponent from '@/app/components/DonateComponent'
import { spFetchDonationMethods } from '@/lib/supabase'
import { useDonateState } from '@/hooks/donateState'
import { getRelativeHeight } from '@/helpers/util'
import { DonateMethod } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/app/components/TopBar'
import { Image } from 'expo-image'
import {
  FlatList,
  SafeAreaView,
  StyleSheet
} from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Footer from '@/app/components/util/Footer'
import { useSQLiteContext } from 'expo-sqlite'


const WIDTH = AppConstants.UI.SCREEN.VALID_WIDTH
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
  const donatesData = donates.filter(i => i.method !== 'donation-banner')

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

  const renderItem = useCallback(
    ({item}: {item: DonateMethod}) => <DonateComponent item={item} />, 
    []
  )

  const renderHeader = useCallback(
    () => (
      donateImageUrl ? (
        <Image 
          source={donateImageUrl} 
          style={styles.image} 
          contentFit="cover" 
        />
      ) : null
    ),
    [donateImageUrl]
  )

  const renderFooter = useCallback(() => <Footer/>, [])

  if (loading) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate'>
          <ReturnButton />
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
          data={donatesData}
          keyExtractor={(item) => item.value}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          renderItem={renderItem}
        />
    </SafeAreaView>
  )
}

export default Donate

const styles = StyleSheet.create({
  image: {
    width: WIDTH, 
    height: HEIGHT, 
    marginBottom: AppConstants.UI.MARGIN, 
    alignSelf: "center", 
    borderRadius: AppConstants.UI.BORDER_RADIUS
  }
})