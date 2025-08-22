import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { Manhwa } from '@/helpers/types'
import { router } from 'expo-router'
import React from 'react'


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

export default React.memo(LatestUpdatesGrid)