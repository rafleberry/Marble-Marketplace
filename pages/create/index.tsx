import React, { useReducer, useState, useEffect, useRef } from 'react'
import { Stack, HStack, ChakraProvider, Textarea } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import styled from 'styled-components'
import { RoundedIcon } from 'components/RoundedIcon'
import { default_image } from 'util/constants'
import { Button } from 'components/Button'
import Checkbox from 'components/Checkbox'
import { Create, Chevron } from 'icons'
import { AppLayout } from 'components/Layout/AppLayout'
import NFTUpload from 'components/NFTUpload'
import { nftViewFunction, nftFunctionCall, checkTransaction } from 'util/near'
import { getCurrentWallet } from 'util/sender-wallet'
import { isMobile } from 'util/device'
import {
  failToast,
  getURLInfo,
  successToast,
  getErrorMessage,
} from 'components/transactionTipPopUp'
import { GradientBackground, SecondGradientBackground } from 'styles/styles'

const PUBLIC_PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
const PUBLIC_PINATA_SECRET_API_KEY =
  process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || ''

export default function NFTCreate() {
  const wallet = getCurrentWallet()
  const { asPath } = useRouter()
  // const token_series_id = asPath.split('/')[2]
  const { txHash, pathname, errorType } = getURLInfo()
  const router = useRouter()
  const [collection, setCollection] = useState<any>({})
  const [error, setError] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [original, setOriginal] = useState(false)
  const [kind, setKind] = useState(false)
  const [creative, setCreative] = useState(false)
  const [isJsonUploading, setJsonUploading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ownedCollections, setOwnedCollections] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const ref = useRef()
  const fetchCollections = async () => {
    try {
      const data = await nftViewFunction({
        methodName: 'nft_get_series',
        args: {},
      })
      return data
    } catch (error) {
      console.log('nft_get_series Error: ', error)
      return []
    }
  }
  const fetchCollectionSize = async (id) => {
    try {
      const data = await nftViewFunction({
        methodName: 'nft_supply_for_series',
        args: {
          token_series_id: id,
        },
      })
      return data
    } catch (err) {
      console.log('nft supply for a collection error: ', err)
      return 0
    }
  }
  useEffect(() => {
    ;(async () => {
      let collections = []
      const collectionList = await fetchCollections()
      collectionList.forEach((collection) => {
        if (collection.creator_id === wallet.accountId) {
          collections.push(collection)
        }
      })
      const data = await Promise.all(
        collections.map(async (element) => {
          const el = await fetchCollectionSize(element.token_series_id)
          return el
        })
      )
      collections = collections.map((element, index) => {
        element.counts = data[index]
        element.media = element.metadata.media
          ? process.env.NEXT_PUBLIC_PINATA_URL + element.metadata.media
          : default_image
        return element
      })
      setOwnedCollections(collections)
    })()
  }, [])
  function useOutsideClick(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowDropdown(false)
        }
      }
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [ref])
  }
  useOutsideClick(ref)
  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_IN_DROP_ZONE':
        return { ...state, inDropZone: action.inDropZone }
      case 'ADD_FILE_TO_LIST':
        return { ...state, fileList: state.fileList.concat(action.files) }
      case 'SET_NFT':
        return { ...state, nft: action.nft }
      default:
        return state
    }
  }

  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    fileList: [],
    nft: '',
  })
  useEffect(() => {
    if (txHash && getCurrentWallet().wallet.isSignedIn()) {
      checkTransaction(txHash)
        .then((res: any) => {
          const transactionErrorType = getErrorMessage(res)
          const transaction = res.transaction
          const event = res?.receipts_outcome[0]?.outcome.logs[0] || ''
          return {
            isSwap:
              transaction?.actions[1]?.['FunctionCall']?.method_name ===
                'ft_transfer_call' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'ft_transfer_call' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'nft_mint',
            transactionErrorType,
            event,
          }
        })
        .then(({ isSwap, transactionErrorType, event }) => {
          if (isSwap && !transactionErrorType && !errorType) {
            const stringifiedEvent = event.split('EVENT_JSON:')[1]
            const tokenId = JSON.parse(stringifiedEvent).data[0].token_ids[0]
          }
          if (isSwap) {
            !transactionErrorType && !errorType && successToast(txHash)
            transactionErrorType && failToast(txHash, transactionErrorType)
            router.push('/explore/nfts')
            return
          }
        })
    }
  }, [txHash])

  const handleAgree = () => {
    if (original && kind && creative) {
      setAgreed(true)
      setError(false)
    } else {
      setError(true)
    }
  }
  const handleMint = async () => {
    if (!wallet.accountId) {
      toast.warning(`Please connect your wallet.`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }
    if (!collection.token_series_id) {
      toast.warning(`Please select your collection.`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (!data.nft) {
      toast.warning(`Please upload your nft picture.`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (name == '') {
      toast.warning(`Please input the NFT name.`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }
    const jsonData: any = {}
    jsonData['name'] = name
    jsonData['description'] = description
    jsonData['uri'] = data.nft
    jsonData['owner'] = wallet.accountId
    jsonData['collectionId'] = collection.token_series_id
    const pinataJson = {
      pinataMetadata: {
        name: name,
      },
      pinataContent: jsonData,
    }
    setJsonUploading(true)
    let url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
    let response = await axios.post(url, pinataJson, {
      maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
      headers: {
        'Content-Type': `application/json`,
        pinata_api_key: PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: PUBLIC_PINATA_SECRET_API_KEY,
      },
    })
    let ipfsHash = ''
    if (response.status == 200) {
      ipfsHash = response.data.IpfsHash
      try {
        await nftFunctionCall({
          methodName: 'nft_mint',
          args: {
            token_series_id: collection.token_series_id,
            receiver_id: wallet.accountId,
            nft_metadata: {
              media: data.nft,
              reference: ipfsHash,
            },
          },
          amount: '0.01',
        })
        toast.success(`You have created your NFT successfully.`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      } catch (error) {
        console.log('Create series error: ', error)
      }
    }
  }
  return (
    <AppLayout fullWidth={true}>
      <ChakraProvider>
        {wallet.accountId && (
          <Container>
            <Stack alignItems="center" spacing="50px">
              <Stack>
                <h1>Create On Marble Dao</h1>
                {!agreed && !collection.count && (
                  <p style={{ textAlign: 'center' }}>
                    Before you mint your first NFT, Please read through and
                    agree to <br />
                    our community guidelines.
                  </p>
                )}
              </Stack>
              <MainWrapper>
                <Card>
                  <Stack spacing="40px">
                    <h2>Mint An NFT</h2>
                    <Stack>
                      <h3>Add Details</h3>
                      <p>
                        Once your NFT is minted to the Marble blockchain, you
                        will not be able to edit or update any of this
                        information.
                      </p>
                    </Stack>
                    <Stack>
                      <Text>Collection</Text>
                      {/* <CollectionDropdown  /> */}
                      <DropdownContent ref={ref}>
                        <CollectionCard
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          {!collection.token_series_id ? (
                            <DropDownText>Select A Collection</DropDownText>
                          ) : (
                            <SelectedItem>
                              <RoundedIcon
                                size={isMobile() ? '50px' : '70px'}
                                src={collection.media}
                                alt="collection"
                              />
                              <Stack marginLeft="20px">
                                <DropDownText>
                                  {collection.metadata?.title}
                                </DropDownText>
                                <DropDownText
                                  fontWeight="600"
                                  fontFamily="Mulish"
                                >
                                  {collection.counts} NFTs
                                </DropDownText>
                              </Stack>
                            </SelectedItem>
                          )}
                          <ChevronIconWrapper>
                            <Chevron />
                          </ChevronIconWrapper>
                        </CollectionCard>
                        <DropDownContentWrapper show={showDropdown}>
                          {ownedCollections.map((info, index) => (
                            <DropdownItem
                              key={index}
                              onClick={() => {
                                console.log('info: ', info.token_series_id)
                                setCollection(info)
                                setShowDropdown(false)
                              }}
                            >
                              <RoundedIcon
                                size={isMobile() ? '50px' : '70px'}
                                src={info.media}
                                alt="collection"
                              />
                              <Stack marginLeft="20px">
                                <DropDownText
                                  fontSize={isMobile() ? '14px' : '20px'}
                                  fontWeight="700"
                                >
                                  {info.metadata.title}
                                </DropDownText>
                                <DropDownText
                                  fontSize={isMobile() ? '14px' : '20px'}
                                  fontWeight="600"
                                  fontFamily="Mulish"
                                >
                                  {info.counts} NFTs
                                </DropDownText>
                              </Stack>
                            </DropdownItem>
                            // </Link>
                          ))}
                          <Link href="/collection/create" passHref>
                            <DropdownItem
                              onClick={() => setShowDropdown(false)}
                            >
                              <IconWrapper>
                                <Create />
                              </IconWrapper>
                              <DropDownText
                                fontSize={isMobile() ? '14px' : '20px'}
                                fontWeight="700"
                              >
                                Create A New Collection
                              </DropDownText>
                            </DropdownItem>
                          </Link>
                        </DropDownContentWrapper>
                      </DropdownContent>
                    </Stack>
                    <Stack>
                      <Text>Name</Text>
                      <StyledInput
                        placeholder="Name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                        }}
                      />
                    </Stack>
                    <Stack>
                      <Text>Description</Text>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength="1000"
                      />
                      <Footer>
                        <div>Use markdown syntax to embed links</div>
                        <div>{description.length}/1000</div>
                      </Footer>
                    </Stack>
                    <Stack padding={isMobile() ? '0' : '0 150px'}>
                      <Button
                        className="btn-buy btn-default"
                        css={{
                          background: '$white',
                          color: '$black',
                          stroke: '$black',
                          width: '100%',
                          marginTop: '20px',
                        }}
                        variant="primary"
                        size="large"
                        onClick={async () => {
                          if (!collection.token_series_id) return
                          await handleMint()
                        }}
                        disabled={!collection.token_series_id}
                      >
                        Mint NFT
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                <NFTContainer>
                  <Stack spacing="20px">
                    <ImgDiv className="nft-img-url">
                      {/* <Image
                            src={process.env.NEXT_PUBLIC_PINATA_URL + data.nft}
                            alt="NFT Image"
                          /> */}
                      <NFTUpload
                        data={data}
                        dispatch={dispatch}
                        item="nft-create"
                      />
                    </ImgDiv>
                    <h2 style={{ textAlign: 'left' }}>Upload your NFT</h2>
                  </Stack>
                </NFTContainer>
              </MainWrapper>
            </Stack>
          </Container>
        )}
      </ChakraProvider>
    </AppLayout>
  )
}

const DropDownText = styled.div`
  font-size: 20px;
  @media (max-width: 650px) {
    font-size: 14px;
  }
`

const Text = styled.div`
  font-size: 14px;
  font-weight: 400;
  padding: 0 40px;
`
const Divider = styled.div`
  height: 0px;
  border: 1px solid #363b4e;
  margin: 60px 0;
`
const Container = styled.div`
  padding: 70px;
  p {
    font-size: 18px;
    font-family: Mulish;
  }
  h1 {
    font-size: 46px;
    font-weight: 600;
  }
  h2 {
    font-size: 30px;
    font-weight: 600;
    text-align: center;
  }
  h3 {
    font-size: 20px;
    font-weight: 600;
  }
  a {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    text-decoration-line: underline;
    font-family: Mulish;
    cursor: pointer;
  }
  @media (max-width: 1024px) {
    padding-top: 100px;
    h1 {
      font-size: 30px;
    }
    h2 {
      font-size: 20px;
    }
    h3 {
      font-size: 14px;
    }
    p {
      font-size: 14px;
      font-family: Mulish;
    }
  }
  @media (max-width: 650px) {
    padding: 0;
    h1 {
      font-size: 22px;
    }
    h2 {
      font-size: 20px;
    }
    h3 {
      font-size: 14px;
    }
    p {
      font-size: 14px;
      font-family: Mulish;
    }
  }
`
const Card = styled(SecondGradientBackground)<{ fullWidth: boolean }>`
  &:before {
    opacity: 0.3;
    border-radius: 30px;
  }
  padding: 40px;
  max-width: 1000px;
  width: 100%;
  @media (max-width: 1024px) {
    padding: 20px;
  }
`
const DropdownContent = styled.div`
  position: relative;
`

const DropDownContentWrapper = styled.div<{ show: boolean }>`
  position: absolute;
  top: 120px;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: ${({ show }) => (show ? 'block' : 'none')};
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  height: fit-content;
  max-height: 500px;
  overflow: auto;
  width: 100%;
  /* max-height: 200px;
  overflow: auto; */
`

const DropdownItem = styled.div`
  padding: 25px;
  display: flex;
  align-items: center;
  height: 120px;
  cursor: pointer;
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
  }
`

const StyledInput = styled.input`
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09);
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 20px;
  font-size: 20px;
  font-family: Mulish;
  @media (max-width: 650px) {
    font-size: 16px;
  }
`
const Input = styled(Textarea)`
  background: #272734 !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09) !important;
  backdrop-filter: blur(40px) !important;
  /* Note: backdrop-filter has minimal browser support */
  font-family: Mulish;
  border-radius: 20px !important;
`
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  opacity: 0.5;
  font-size: 14px;
  padding: 0 10px;
  div {
    font-family: Mulish;
  }
`
const CollectionCard = styled.div`
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120px;
  cursor: pointer;
`
const NFTContainer = styled(SecondGradientBackground)`
  &:before {
    border-radius: 30px;
    opacity: 0.3;
  }
  width: 35%;
  padding: 25px;

  height: fit-content;
  @media (max-width: 800px) {
    width: 100%;
  }
`
const ImgDiv = styled.div`
  width: 100%;
  /* padding-bottom: 100%; */
  display: block;
  position: relative;
  height: fit-content;
`
const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 20px;
`
const MainWrapper = styled.div`
  display: flex;
  align-items: start;
  column-gap: 40px;
  justify-content: space-between;
  @media (max-width: 800px) {
    flex-direction: column-reverse;
    width: 100%;
    row-gap: 20px;
  }
`
const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.16);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  @media (max-width: 650px) {
    width: 50px;
    height: 50px;
  }
`
const SelectedItem = styled.div`
  display: flex;
  align-items: center;
`
const ChevronIconWrapper = styled.div`
  transform: rotate(-90deg);
`
