import DateCountdown from 'components/DateCountdown'
import CollectionCard from 'components/NFT/collection/collection-card'
import { useEffect, useState } from 'react'
import {
  convertMicroDenomToDenom,
  convertToFixedDecimalNumber,
} from 'util/conversion'
import { ftGetStorageBalance } from 'util/ft-contract'
import {
  executeMultipleTransactions,
  nearFunctionCall,
  nearViewFunction,
  nftViewFunction,
  NFT_CONTRACT_NAME,
  ONE_YOCTO_NEAR,
  STAKING_CONTRACT_NAME,
  STAKING_FT_NAME,
  Transaction,
  checkTransaction,
} from 'util/near'
import { getRandomInt } from 'util/numbers'
import { getCurrentWallet } from 'util/sender-wallet'
import {
  failToast,
  getURLInfo,
  successToast,
  getErrorMessage,
} from 'components/transactionTipPopUp'
import {
  ButtonWrapper,
  CollectionCardWrapper,
  CollectionContent,
  Container,
  CountDownWrapper,
  Header,
  InfoContent,
  StakingCardWrapper,
  StakingInfoContainer,
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
  const wallet = getCurrentWallet()
  const { txHash, pathname, errorType } = getURLInfo()
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
  useEffect(() => {
    if (txHash && getCurrentWallet().wallet.isSignedIn()) {
      checkTransaction(txHash)
        .then((res: any) => {
          const transactionErrorType = getErrorMessage(res)
          const transaction = res.transaction
          const event = res?.receipts_outcome[0]?.outcome.logs[0] || ''
          return {
            isSwap:
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'create_unstake' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'claim_rewards' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'nft_transfer_call' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'fetch_unstake',
            transactionErrorType,
            event,
          }
        })
        .then(({ isSwap, transactionErrorType, event }) => {
          if (isSwap) {
            !transactionErrorType && !errorType && successToast(txHash)
            transactionErrorType && failToast(txHash, transactionErrorType)
            return
          }
        })
    }
  }, [txHash])
  const getClaimableReward = () => {
    if (stakeConfig.interval === 0) return 0
    if (userStakeInfo.create_unstake_timestamp !== 0)
      return convertToFixedDecimalNumber(
        convertMicroDenomToDenom(userStakeInfo.unclaimed_amount, 8)
      )
    if (stakeConfig.total_supply === 0) return 0
    const end_date =
      Date.now() / 1000 > stakeConfig.end_date
        ? stakeConfig.end_date
        : Date.now() / 1000
    if (end_date < userStakeInfo.last_timestamp)
      return convertToFixedDecimalNumber(
        convertMicroDenomToDenom(userStakeInfo.unclaimed_amount, 8)
      )
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
    <Container>
      <Header>NFT staking</Header>
      <StakingCardWrapper>
        <CollectionCardWrapper>
          <CollectionCard collection={collection} />
        </CollectionCardWrapper>
        <CollectionContent>
          <h1>{collection.name}</h1>
          <StakingInfoContainer>
            <InfoContent>
              <h2>Daily Rewards</h2>
              <h3>
                {getDailyRewards()}
                Hera/Day
              </h3>
            </InfoContent>
            <InfoContent>
              <h2>Claimable Reward</h2>
              <h3>{getClaimableReward()} Hera</h3>
            </InfoContent>
            <InfoContent>
              <h2>Total Staked</h2>
              <h3>
                {userStakeInfo.token_ids.length}/
                {ownedNfts.length + userStakeInfo.token_ids.length}
              </h3>
            </InfoContent>
            <InfoContent>
              <h2>Days Left</h2>
              <h3>{getLeftDays()}</h3>
            </InfoContent>
          </StakingInfoContainer>
          {userStakeInfo.create_unstake_timestamp !== 0 && (
            <CountDownWrapper>
              Time Left &nbsp;
              <DateCountdown
                dateTo={
                  userStakeInfo.create_unstake_timestamp + stakeConfig.lock_time
                }
                numberOfFigures={3}
                callback={() => {
                  setRCount(rCount + 1)
                }}
              />
            </CountDownWrapper>
          )}
          <ButtonWrapper>
            {userStakeInfo.create_unstake_timestamp === 0 && (
              <StyledButton
                disabled={ownedNfts.length === 0}
                onClick={handleStake}
              >
                Stake
              </StyledButton>
            )}
            <StyledButton
              disabled={
                userStakeInfo.create_unstake_timestamp + stakeConfig.lock_time >
                  Date.now() / 1000 || userStakeInfo.token_ids.length === 0
              }
              onClick={handleUnstake}
            >
              {userStakeInfo.create_unstake_timestamp === 0
                ? 'Unstake'
                : 'Fetch Nft'}
            </StyledButton>
            <StyledButton
              disabled={getClaimableReward() === 0}
              onClick={handleClaim}
            >
              Claim Rewards
            </StyledButton>
          </ButtonWrapper>
        </CollectionContent>
      </StakingCardWrapper>
    </Container>
  )
}

export default Staking
