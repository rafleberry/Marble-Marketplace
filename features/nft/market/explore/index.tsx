import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { ChakraProvider, Spinner } from '@chakra-ui/react'
import { Button } from 'components/Button'
import { styled } from 'components/theme'
// import useSWR from 'swr';
import { getActivedCollections } from 'hooks/useCollection'
import { NFT_CONTRACT_NAME, nftViewFunction } from 'util/near'
import { CategoryTab, NftCollectionTable } from 'components/NFT'
import { NftCategory, NftCollection } from 'services/nft'

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''

export const Explore = () => {
  const [nftcategories, setNftCategories] = useState<NftCategory[]>([])
  const [nftcollections, setNftCollections] = useState<NftCollection[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState('All')
  const [loading, setLoading] = useState(true)

  const fetchCollections = async (categoryId) => {
    try {
      setLoading(true)
      if (categoryId === 'All') {
        const data = await nftViewFunction({
          methodName: 'nft_get_series',
          args: {},
        })
        setLoading(false)
        return data
      } else {
        const activeCollectionIds = await getActivedCollections(categoryId)

        const data = await nftViewFunction({
          methodName: 'nft_get_series_by_ids',
          args: {
            token_series_ids: activeCollectionIds,
          },
        })
        setLoading(false)
        return data
      }
    } catch (error) {
      console.log('nft_get_series Error: ', error)
      setLoading(false)
      return []
    }
  }
  useEffect(() => {
    ;(async () => {
      nftViewFunction({
        methodName: 'nft_get_total_series',
        args: {},
      }).then((totalSeries) => {
        console.log('nft_get_totla_series: ', totalSeries)
      })
    })()
  }, [])
  useEffect(() => {
    // fetchCollections()
    ;(async () => {
      let res_categories = await fetch(process.env.NEXT_PUBLIC_CATEGORY_URL)
      let categories = await res_categories.json()
      setNftCategories(categories.categories)
      let collections = []
      const collectionList = await fetchCollections(activeCategoryId)
      for (let i = 0; i < collectionList.length; i++) {
        let res_collection: any = {}
        try {
          let ipfs_collection = await fetch(
            process.env.NEXT_PUBLIC_PINATA_URL +
              collectionList[i].metadata.reference
          )
          res_collection = await ipfs_collection.json()
        } catch (err) {
          console.log('err', err)
          res_collection = -{}
        }
        let collection_info: any = {}
        collection_info.id = collectionList[i].token_series_id
        collection_info.name = collectionList[i].metadata.title
        collection_info.description = res_collection.description
        collection_info.image =
          process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage
        collection_info.banner_image =
          process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
        collection_info.slug = res_collection.slug
        collection_info.creator = collectionList[i].creator_id ?? ''
        collections.push(collection_info)
      }
      setNftCollections(collections)
      setLoading(false)
    })()
  }, [activeCategoryId])
  return (
    <ExploreWrapper>
      <CategoryTab
        categories={nftcategories}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
      />
      {loading ? (
        <ChakraProvider>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              padding: '20px',
            }}
          >
            <Spinner size="xl" />
          </div>
        </ChakraProvider>
      ) : (
        <NftCollectionTable collections={nftcollections} />
      )}
    </ExploreWrapper>
  )
}

const ExploreWrapper = styled('div', {
  ' .category-menus': {
    borderBottom: '1px solid $borderColors$default',
    display: 'flex',
    justifyContent: 'space-between',
    overFlow: 'hidden',
    '&.desktop-section': {
      ' >span': {
        minWidth: '8%',
        textAlign: 'center',
        paddingBottom: '$8',
        cursor: 'pointer',
        '&.active': {
          borderBottom: '4px solid $selected',
        },
      },
    },
    '&.mobile-section': {
      ' >span': {
        minWidth: '18%',
        textAlign: 'center',
        paddingBottom: '$8',
        cursor: 'pointer',
        '&.active': {
          borderBottom: '4px solid $selected',
        },
      },
    },
  },
})
