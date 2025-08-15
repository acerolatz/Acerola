import ReturnButton from '@/components/buttons/ReturnButton'
import RequestManhwaForm from '@/components/form/RequestManhwaForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView } from 'react-native'


const RequestManhwa = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Request Manhwa'>
            <ReturnButton/>
        </TopBar>
        <RequestManhwaForm/>
    </SafeAreaView>
  )
}


export default RequestManhwa
