import React from 'react'
import { AppLayout } from 'components/Layout/AppLayout'
import FeedPage from 'features/feed'

export default function Home() {
  return (
    <AppLayout fullWidth={true}>
      <FeedPage />
    </AppLayout>
  )
}
