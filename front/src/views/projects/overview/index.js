import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import Overview from './overview'

const queryClient = new QueryClient()

const OverviewPage = () => (
  <QueryClientProvider client={queryClient}>
    <Overview />
  </QueryClientProvider>
)

export default OverviewPage
