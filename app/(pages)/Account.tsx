import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'

const Account = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Account' >
            <ReturnButton/>
        </TopBar>
    </SafeAreaView>
  )
}

export default Account

const styles = StyleSheet.create({})