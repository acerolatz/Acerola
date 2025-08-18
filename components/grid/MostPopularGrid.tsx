import React from 'react'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { router } from 'expo-router'
import { Manhwa } from '@/helpers/types'


interface MostPopularGridProps {
    manhwas: Manhwa[]
}

const MostPopularGrid = ({manhwas}: MostPopularGridProps) => {
  return (
    <ManhwaHorizontalGrid
      title='Most Popular'
      onViewAll={() => router.navigate("/(pages)/MostPopularPage")}
      manhwas={manhwas}
    />
  )
}

export default MostPopularGrid
