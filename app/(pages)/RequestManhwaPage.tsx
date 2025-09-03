import RequestManhwaForm from '@/app/components/form/RequestManhwaForm'
import ReturnButton from '@/app/components/buttons/ReturnButton'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/app/components/TopBar'
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
