import * as nearAPI from 'near-api-js'
import { convertMicroDenomToDenom } from 'util/conversion'
import { getCurrentWallet } from 'util/sender-wallet'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NEAR_STATUS } from 'store/types'
import { setNearData } from 'store/actions/coinAction'

export const getTokenBalance = async (tokenInfo) => {
  const { wallet } = getCurrentWallet()
  if (!tokenInfo) return 0
  if (!wallet.getAccountId()) return 0
  if (tokenInfo.symbol === 'NEAR') {
    const res = await wallet.account().getAccountBalance()
    return convertMicroDenomToDenom(Number(res.total), tokenInfo.decimals)
  }

  const hera = new nearAPI.Contract(
    wallet.account(), // the account object that is connecting
    tokenInfo.token_address,
    {
      viewMethods: ['ft_balance_of'],
      changeMethods: [],
    }
  )
  try {
    // @ts-ignore
    const res = await hera.ft_balance_of({
      account_id: wallet.account().accountId,
    })
    return convertMicroDenomToDenom(Number(res), tokenInfo.decimals)
  } catch (err) {
    return 0
  }
}

export const FetchCoinInfo = () => {
  const dispatch = useDispatch()
  // axios.get('https://')
  const url =
    'https://api.coingecko.com/api/v3/simple/price?ids=near&include_last_updated_at=true&vs_currencies=usd'
  useEffect(() => {
    axios.get(url).then(({ data }) => {
      setNearData(NEAR_STATUS, data.near.usd, dispatch)
    })
  })
  return null
}
