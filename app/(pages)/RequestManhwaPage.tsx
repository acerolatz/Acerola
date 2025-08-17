import RequestManhwaForm from '@/components/form/RequestManhwaForm'
import ReturnButton from '@/components/buttons/ReturnButton'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import React from 'react'


const RequestPornhwaPage = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Request Pornhwa'>
            <ReturnButton/>
        </TopBar>
        <RequestManhwaForm/>
    </SafeAreaView>
  )
}


export default RequestPornhwaPage
