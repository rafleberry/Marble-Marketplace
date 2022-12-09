import { ChakraProvider, LinkBox } from '@chakra-ui/react'
import Link from 'next/link'
import { NftCollection } from 'services/nft'
import styled from 'styled-components'
import CollectionCard from './collection-card'
interface NftCollectionProps {
  readonly collections: NftCollection[]
}

export function NftCollectionTable({
  collections,
}: NftCollectionProps): JSX.Element {
  return (
    <ChakraProvider>
      <Container>
        {collections.map((collection, idx) => (
          <Link href={`/collection/${collection.id}`} passHref key={idx}>
            <LinkBox as="picture">
              <CollectionCard key={idx} collection={collection} />
            </LinkBox>
          </Link>
        ))}
      </Container>
    </ChakraProvider>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 50px 30px;
  @media (max-width: 1550px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
