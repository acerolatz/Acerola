import React from 'react'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { router } from 'expo-router'
import { Manhwa } from '@/helpers/types'


interface LatestUpdatesGridProps {
    manhwas: Manhwa[]
}

const LatestUpdatesGrid = ({manhwas}: LatestUpdatesGridProps) => {
    
  return (
    <ManhwaHorizontalGrid
        title='Latest Updates'
        onViewAll={() => router.navigate("/(pages)/LatestUpdatesPage")}
        manhwas={manhwas}
    />
  )

}

export default LatestUpdatesGrid