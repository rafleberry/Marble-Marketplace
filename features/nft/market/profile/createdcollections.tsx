import CollectionCard from 'components/NFT/collection/collection-card'
import useAxios from 'hooks/useAxios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
// import { CollectionFilter } from './filter'

import { LinkBox } from '@chakra-ui/react'
import { getCurrentWallet } from 'util/sender-wallet'

let nftCurrentIndex
const MyCreatedCollections = ({ id }) => {
  const { fetchCollectionsByCreator } = useAxios()
  // const profileData = useSelector((state: State) => state.profileData)
  // const { profile_status } = profileData
  const [collections, setCollections] = useState([])
  const wallet = getCurrentWallet()

  useEffect(() => {
    ;(async () => {
      if (!id || id === '[id]') return
      const _collections = await fetchCollectionsByCreator(id)
      const _collectionInfos = await Promise.all(
        _collections.map(async (element) => {
          let res_collection: any = {}
          let collection_info: any = {}
          try {
            let ipfs_collection = await fetch(
              process.env.NEXT_PUBLIC_PINATA_URL + element.reference
            )
            res_collection = await ipfs_collection.json()
          } catch (err) {
            res_collection = {}
          }
          collection_info.id = element.id
          collection_info.name = element.title
          collection_info.description = res_collection.description
          collection_info.image = res_collection.featuredImage
            ? process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage
            : '/default-image.png'
          collection_info.banner_image = res_collection.logo
            ? process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
            : '/default-image.png'
          collection_info.slug = res_collection.slug
          collection_info.creator = id
          return collection_info
        })
      )
      setCollections(_collectionInfos)
    })()
  }, [id])

  return (
    <CollectionWrapper>
      <CollectionList>
        {/* {loading ? (
          <ChakraProvider>
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Spinner size="xl" />
            </div>
          </ChakraProvider>
        ) : (
          <InfiniteScroll
            dataLength={nfts.length}
            next={getMoreNfts}
            hasMore={false}
            loader={<h3> Loading...</h3>}
            endMessage={<h4></h4>}
          >
            <NftTable data={filtered} id="0" type="sell" nft_column_count={2} />
          </InfiniteScroll>
        )} */}
        {collections.map((collection, idx) => (
          <Link href={`/collection/${collection.id}`} passHref key={idx}>
            <LinkBox as="picture">
              <CollectionCard key={idx} collection={collection} />
            </LinkBox>
          </Link>
        ))}
      </CollectionList>
    </CollectionWrapper>
  )
}

const CollectionWrapper = styled.div`
  padding: 30px 0;
  @media (max-width: 650px) {
    width: fit-content;
  }
`

const CollectionList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`

export default MyCreatedCollections
