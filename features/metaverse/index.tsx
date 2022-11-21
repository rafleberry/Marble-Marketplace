import { useState, useEffect } from 'react'
import CollectionCard from 'components/NFT/collection/collection-card'
import { Button } from 'components/Button'
import {
  nearFunctionCall,
  nearViewFunction,
  nftViewFunction,
  ONE_YOCTO_NEAR,
} from 'util/near'
import DateCountdown from 'components/DateCountdown'
import { ftGetStorageBalance } from 'util/ft-contract'
import {
  STAKING_NFT_NAME,
  STAKING_CONTRACT_NAME,
  STAKING_FT_NAME,
  Transaction,
  executeMultipleTransactions,
  NFT_CONTRACT_NAME,
} from 'util/near'
import { getCurrentWallet } from 'util/sender-wallet'
import { getRandomInt } from 'util/numbers'
import {
  convertToFixedDecimalNumber,
  convertMicroDenomToDenom,
} from 'util/conversion'
import {
  Container,
  Header,
  StakingCardWrapper,
  CollectionCardWrapper,
  CollectionContent,
  StakingInfoContainer,
  InfoContent,
  ButtonWrapper,
  OwnedNftsContainer,
  CountDownWrapper,
  StyledButton,
} from './styled'

interface UserStakeInfoType {
  address: string
  claimed_amount: number
  claimed_timestamp: number
  create_unstake_timestamp: number
  last_timestamp: number
  token_ids: string[]
  unclaimed_amount: number
}

interface StakeConfigType {
  daily_reward: number
  enabled: boolean
  ft_address: string
  interval: number
  lock_time: number
  nft_address: string
  collection_number: string
  total_supply: number
  end_date: number
}

interface CollectionType {
  image: string
  banner_image: string
  name: string
  creator: string
}

const Staking = () => {
  // const collection = {
  //   image: '/marblenauts.gif',
  //   banner_image: '/logo.png',
  //   name: 'Marblenauts',
  //   creator: 'viernear.testnet',
  // }
  const wallet = getCurrentWallet()
  const [userStakeInfo, setUserStakeInfo] = useState<UserStakeInfoType>({
    address: '',
    claimed_amount: 0,
    claimed_timestamp: 0,
    create_unstake_timestamp: 0,
    last_timestamp: 0,
    token_ids: [],
    unclaimed_amount: 0,
  })
  const [stakeConfig, setStakeConfig] = useState<StakeConfigType>({
    daily_reward: 0,
    enabled: false,
    ft_address: '',
    interval: 0,
    lock_time: 0,
    nft_address: '',
    collection_number: '',
    total_supply: 0,
    end_date: 0,
  })
  const [collection, setCollection] = useState<CollectionType>({
    image: '/marblenauts.gif',
    banner_image: '/logo.png',
    name: 'Marblenauts',
    creator: 'viernear.testnet',
  })
  const [ownedNfts, setOwnedNfts] = useState([])
  const [rCount, setRCount] = useState(0)
  useEffect(() => {
    ;(async () => {
      const config = await nearViewFunction({
        contractId: STAKING_CONTRACT_NAME,
        methodName: 'get_config',
        args: {},
      })
      setStakeConfig(config)

      try {
        const _collection = await nftViewFunction({
          methodName: 'nft_get_series_single',
          args: {
            token_series_id: config.collection_number,
          },
        })
        const ipfs_collection = await fetch(
          process.env.NEXT_PUBLIC_PINATA_URL + _collection.metadata.reference
        )
        const res_collection = await ipfs_collection.json()
        setCollection({
          image: process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo,
          banner_image:
            process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage,
          name: res_collection.name,
          creator: _collection.creator_id,
        })
      } catch (err) {}
    })()
  }, [rCount])

  useEffect(() => {
    ;(async () => {
      if (!wallet?.accountId) return
      const nftInfo = await nearViewFunction({
        contractId: NFT_CONTRACT_NAME,
        methodName: 'nft_tokens_for_owner',
        args: {
          account_id: wallet?.accountId,
        },
      })

      setOwnedNfts(
        nftInfo.filter((_nft) =>
          _nft.token_id.startsWith(`${stakeConfig.collection_number}:`)
        )
      )
    })()
  }, [wallet?.accountId, stakeConfig])

  useEffect(() => {
    ;(async () => {
      if (!wallet?.accountId) return
      try {
        const stakeInfo = await nearViewFunction({
          contractId: STAKING_CONTRACT_NAME,
          methodName: 'get_stake_info',
          args: {
            owner: wallet?.accountId,
          },
        })
        setUserStakeInfo(stakeInfo)
      } catch (err) {
        setUserStakeInfo({
          address: '',
          claimed_amount: 0,
          claimed_timestamp: 0,
          create_unstake_timestamp: 0,
          last_timestamp: 0,
          token_ids: [],
          unclaimed_amount: 0,
        })
      }
    })()
  }, [wallet?.accountId])

  const getClaimableReward = () => {
    if (stakeConfig.interval === 0) return 0
    if (userStakeInfo.create_unstake_timestamp !== 0)
      return userStakeInfo.unclaimed_amount
    if (stakeConfig.total_supply === 0) return 0
    const end_date =
      Date.now() / 1000 > stakeConfig.end_date
        ? stakeConfig.end_date
        : Date.now() / 1000
    if (end_date < userStakeInfo.last_timestamp)
      return convertToFixedDecimalNumber(userStakeInfo.unclaimed_amount)
    const claimable =
      userStakeInfo.unclaimed_amount +
      (Math.floor(
        Math.abs(
          (end_date - userStakeInfo.last_timestamp) / stakeConfig.interval
        )
      ) *
        convertMicroDenomToDenom(stakeConfig.daily_reward, 8) *
        userStakeInfo.token_ids.length) /
        stakeConfig.total_supply

    return convertToFixedDecimalNumber(claimable)
  }
  const getDailyRewards = () => {
    if (
      stakeConfig.total_supply === 0 ||
      userStakeInfo.create_unstake_timestamp !== 0
    )
      return 0
    const dailyReward =
      (convertMicroDenomToDenom(stakeConfig.daily_reward, 8) *
        userStakeInfo.token_ids.length) /
      stakeConfig.total_supply
    return convertToFixedDecimalNumber(dailyReward)
  }

  const getLeftDays = () => {
    return ((stakeConfig.end_date - Date.now() / 1000) / 86400).toFixed(0)
  }
  const handleStake = async () => {
    if (ownedNfts.length === 0) return
    const selectedNum = getRandomInt(ownedNfts.length)
    const transactions: Transaction[] = []
    const storageValueInStaking = await nearViewFunction({
      contractId: STAKING_CONTRACT_NAME,
      methodName: 'storage_balance_of',
      args: {
        account_id: wallet?.accountId,
      },
    })
    if (storageValueInStaking === 0) {
      transactions.push({
        receiverId: STAKING_CONTRACT_NAME,
        functionCalls: [
          {
            methodName: 'storage_deposit',
            args: {
              account_id: wallet?.accountId,
            },
            amount: '0.00859',
          },
        ],
      })
    }
    const storageValueInFt = await ftGetStorageBalance(
      STAKING_FT_NAME,
      wallet?.accountId
    )
    if (!storageValueInFt || storageValueInFt.total === '0') {
      transactions.push({
        receiverId: STAKING_FT_NAME,
        functionCalls: [
          {
            methodName: 'storage_deposit',
            args: {
              account_id: wallet?.accountId,
            },
            amount: '0.1',
          },
        ],
      })
    }
    transactions.push({
      receiverId: NFT_CONTRACT_NAME,
      functionCalls: [
        {
          methodName: 'nft_transfer_call',
          args: {
            receiver_id: STAKING_CONTRACT_NAME,
            token_id: ownedNfts[selectedNum].token_id,
            msg: JSON.stringify({}),
          },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    })
    executeMultipleTransactions(transactions)
  }

  const handleClaim = async () => {
    if (getClaimableReward() === 0) return
    await nearFunctionCall({
      contractId: STAKING_CONTRACT_NAME,
      methodName: 'claim_rewards',
      args: {},
      amount: ONE_YOCTO_NEAR,
    })
  }

  const handleUnstake = async () => {
    if (
      userStakeInfo.create_unstake_timestamp > 0 &&
      userStakeInfo.create_unstake_timestamp + stakeConfig.lock_time >
        Date.now() / 1000
    ) {
      return
    }

    const query =
      userStakeInfo.create_unstake_timestamp === 0
        ? 'create_unstake'
        : 'fetch_unstake'
    await nearFunctionCall({
      contractId: STAKING_CONTRACT_NAME,
      methodName: query,
      args: {},
      amount: ONE_YOCTO_NEAR,
    })
  }
  return (
      <iframe width="100%" height="720px" src="http://spatial.io/s/Marbleverse-633c3595b4f3e70001089a4d" allow="microphone https://spatial.io; camera https://spatial.io"></iframe>
  )
}

export default Staking
