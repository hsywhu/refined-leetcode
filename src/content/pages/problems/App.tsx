import { FC, useState } from 'react'

import { withPage } from '@/hoc'
import { isBetaUI } from '@/utils'
import Beta from './Beta'
import Legacy from './Legacy'
import { useEffectMount } from '@/hooks'

const App: FC<{ beta?: boolean }> = () => {
  const [beta, setBeta] = useState<boolean>()

  useEffectMount(async state => {
    const beta = await isBetaUI()
    if (!state.isMount) return
    setBeta(beta)
  }, [])

  if (beta === undefined) return null

  if (beta) {
    return <Beta />
  } else {
    return <Legacy />
  }
}

export default withPage('problemsPage')(App)
