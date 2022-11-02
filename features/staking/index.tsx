import { useState, useEffect } from 'react'
import CollectionCard from 'components/NFT/collection/collection-card'
import { Button } from 'components/Button'
import { nearFunctionCall, nearViewFunction, ONE_YOCTO_NEAR } from 'util/near'
import { ftGetStorageBalance } from 'util/ft-contract'
import {
  STAKING_NFT_NAME,
  STAKING_CONTRACT_NAME,
  STAKING_FT_NAME,
  Transaction,
  executeMultipleTransactions,
} from 'util/near'
import { getCurrentWallet } from 'util/sender-wallet'
import { getRandomInt } from 'util/numbers'
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
}

const Staking = () => {
  const collection = {
    image: '/marblenauts.gif',
    banner_image: '/logo.png',
    name: 'Marblenauts',
    creator: 'viernear.testnet',
  }
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
  })
  const [ownedNfts, setOwnedNfts] = useState([])
  useEffect(() => {
    ;(async () => {
      const config = await nearViewFunction({
        contractId: STAKING_CONTRACT_NAME,
        methodName: 'get_config',
        args: {},
      })
      setStakeConfig(config)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!wallet?.accountId) return
      const nftInfo = await nearViewFunction({
        contractId: STAKING_NFT_NAME,
        methodName: 'nft_tokens_for_owner',
        args: {
          account_id: wallet?.accountId,
        },
      })
      setOwnedNfts(nftInfo)
    })()
  }, [wallet?.accountId])

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
      } catch (err) {}
    })()
  }, [wallet?.accountId])

  const getClaimableReward = () => {
    if (stakeConfig.interval === 0) return 0
    if (userStakeInfo.create_unstake_timestamp !== 0)
      return userStakeInfo.unclaimed_amount
    const claimable =
      userStakeInfo.unclaimed_amount +
      Math.floor(
        Math.abs(
          (Date.now() / 1000 - userStakeInfo.last_timestamp) /
            stakeConfig.interval
        )
      ) *
        stakeConfig.daily_reward *
        userStakeInfo.token_ids.length

    return claimable
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
      receiverId: STAKING_NFT_NAME,
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
  console.log('ownedNfts: ', ownedNfts)
  return (
    <Container>
      <Header>NFT staking</Header>
      <StakingCardWrapper>
        <CollectionCardWrapper>
          <CollectionCard collection={collection} />
        </CollectionCardWrapper>
        <CollectionContent>
          <h1>Marblenauts</h1>
          <StakingInfoContainer>
            <InfoContent>
              <h2>Daily Rewards</h2>
              <h3>
                {stakeConfig.daily_reward * userStakeInfo.token_ids.length}{' '}
                Block/Day
              </h3>
            </InfoContent>
            <InfoContent>
              <h2>Claimable Reward</h2>
              <h3>{getClaimableReward()} Block</h3>
            </InfoContent>
            <InfoContent>
              <h2>Day Staked</h2>
              <h3>10</h3>
            </InfoContent>
            <InfoContent>
              <h2>Days Left</h2>
              <h3>9</h3>
            </InfoContent>
          </StakingInfoContainer>
          <ButtonWrapper>
            {userStakeInfo.create_unstake_timestamp === 0 && (
              <Button
                className="btn-buy btn-default"
                css={{
                  background: '$white',
                  color: '$black',
                  stroke: '$black',
                  padding: '15px auto',
                }}
                disabled={ownedNfts.length === 0}
                onClick={handleStake}
              >
                Stake
              </Button>
            )}
            <Button
              className="btn-buy btn-default"
              css={{
                background: '$white',
                color: '$black',
                stroke: '$black',
                padding: '15px auto',
              }}
              disabled={
                userStakeInfo.create_unstake_timestamp + stakeConfig.lock_time >
                  Date.now() / 1000 || userStakeInfo.token_ids.length === 0
              }
              onClick={handleUnstake}
            >
              {userStakeInfo.create_unstake_timestamp === 0
                ? 'Unstake'
                : 'Fetch Nft'}
            </Button>
            {userStakeInfo.create_unstake_timestamp === 0 && (
              <Button
                className="btn-buy btn-default"
                css={{
                  background: '$white',
                  color: '$black',
                  stroke: '$black',
                  padding: '15px auto',
                }}
                disabled={getClaimableReward() === 0}
                onClick={handleClaim}
              >
                Claim Rewards
              </Button>
            )}
          </ButtonWrapper>
        </CollectionContent>
      </StakingCardWrapper>
      <OwnedNftsContainer>
        {ownedNfts.map((_nft, index) => (
          <CollectionCard
            collection={{
              ...collection,
              name: _nft.token_id,
              creator: _nft.owner_id,
              image: '/collection.png',
            }}
            key={index}
          />
        ))}
      </OwnedNftsContainer>
    </Container>
  )
}

export default Staking
