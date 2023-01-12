import React, { useReducer, useState, useEffect } from 'react'
import axios from 'axios'
import {
  Modal,
  ChakraProvider,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  Textarea,
  Stack,
  HStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Select, { components } from 'react-select'
import { CheckIcon } from '@chakra-ui/icons'
import { toast } from 'react-toastify'
import DropZone from 'components/DropZone'
import { getCurrentWallet } from 'util/sender-wallet'
import FeaturedImageUpload from 'components/FeaturedImageUpload'
import { nftFunctionCall, checkTransaction } from 'util/near'
import { Button } from 'components/Button'
import { Save } from 'icons/Save'
import { setCollectionCategory } from 'hooks/useCollection'
import { StyledCloseIcon } from 'components/Dialog'
import {
  failToast,
  getURLInfo,
  successToast,
  getErrorMessage,
} from 'components/transactionTipPopUp'
import styled from 'styled-components'

const options = [
  {
    value: 'Digital',
    label: 'Digital',
  },
  {
    value: 'Physical',
    label: 'Physical',
  },
  {
    value: 'Music',
    label: 'Music',
  },
  {
    value: 'Painting',
    label: 'Painting',
  },
  {
    value: 'Videos',
    label: 'Videos',
  },
  {
    value: 'Photography',
    label: 'Photography',
  },
  {
    value: 'Sports',
    label: 'Sports',
  },
  {
    value: 'Utility',
    label: 'Utility',
  },
]
const PUBLIC_PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
const PUBLIC_PINATA_SECRET_API_KEY =
  process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || ''
const EditCollectionModal = ({ collectionInfo, category, setCategory }) => {
  console.log('category: ', category)
  const wallet = getCurrentWallet()
  const router = useRouter()
  const { txHash, pathname, errorType } = getURLInfo()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [description, setDescription] = useState(
    collectionInfo.description || ''
  )
  const [isJsonUploading, setJsonUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_IN_DROP_ZONE':
        return { ...state, inDropZone: action.inDropZone }
      case 'ADD_FILE_TO_LIST':
        return { ...state, fileList: state.fileList.concat(action.files) }
      case 'SET_LOGO':
        return { ...state, logo: action.logo }
      case 'SET_FEATURED_IMAGE':
        return { ...state, featuredImage: action.featuredImage }
      default:
        return state
    }
  }
  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    fileList: [],
    logo: collectionInfo.logo.split('ipfs/')[1],
    featuredImage: collectionInfo.featuredImage.split('ipfs/')[1],
  })
  useEffect(() => {
    console.log('txHash: ', txHash)
    if (txHash && getCurrentWallet().wallet.isSignedIn()) {
      checkTransaction(txHash)
        .then((res: any) => {
          const transactionErrorType = getErrorMessage(res)
          const transaction = res.transaction
          const signer = transaction?.signer_id
          const logs = res.receipts_outcome[0]?.outcome?.logs[0]
          return {
            isSuccess:
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
              'nft_edit_series',
            transactionErrorType,
            logs,
            signer,
          }
        })
        .then(({ isSuccess, transactionErrorType, logs, signer }) => {
          if (isSuccess) {
            !transactionErrorType && !errorType && successToast(txHash)
            transactionErrorType && failToast(txHash, transactionErrorType)
            console.log('pathName: ', pathname)
            router.push(pathname)
            onClose()
          }
        })
    }
  }, [txHash])
  const handleChange = async () => {
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
    if (data.logo == '') {
      toast.warning(`Please upload a logo image.`, {
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
    if (data.featuredImage == '') {
      toast.warning(`Please upload a featured image.`, {
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

    const jsonData = {}
    jsonData['logo'] = data.logo
    jsonData['featuredImage'] = data.featuredImage
    jsonData['name'] = collectionInfo.name
    jsonData['description'] = description
    const pinataJson = {
      pinataMetadata: {
        name: collectionInfo.name,
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
    }
    setJsonUploading(false)
    try {
      await nftFunctionCall({
        methodName: 'nft_edit_series',
        args: {
          token_series_id: collectionInfo.token_series_id,
          token_metadata: {
            media: data.logo,
            reference: ipfsHash,
            copies: 10000,
            title: collectionInfo.name,
            description: category, //description means category in nft
          },
        },
      })
    } catch (error) {
      console.log('Create series error: ', error)
    }
  }
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '70px',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2) !important',
      background: '#272734',
      color: '#FFFFFF',
      width: '100%',
    }),
    menuList: (base, state) => ({
      ...base,
      background: '#272734',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      maxHeight: '400px',
    }),
    option: (base, state) => ({
      ...base,
      color: 'white',
      background: '#272734',
      ':hover': {
        background: 'rgba(255, 255, 255, 0.1)',
      },
    }),
    singleValue: (base, state) => ({
      ...base,
      color: 'white',
    }),
    valueContainer: (base, state) => ({
      ...base,
      display: 'flex',
    }),
    menu: (base, state) => ({
      ...base,
      zIndex: '10',
      margin: '0px',
      background: 'none',
    }),
  }
  return (
    <ChakraProvider>
      <Button
        className="btn-buy btn-default"
        css={{
          background: '$white',
          color: '$black',
          stroke: '$black',
          width: '100%',
        }}
        variant="primary"
        onClick={onOpen}
      >
        Edit Collection
      </Button>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />
        <Container>
          <StyledCloseIcon onClick={onClose} offset={20} size="40px" />
          <ModalWrapper>
            <Stack spacing="40px">
              <Title>Edit Collection</Title>
              <Stack>
                <Text>Collection Logo</Text>
                <DropZone
                  data={data}
                  dispatch={dispatch}
                  initHash={collectionInfo.logo.split('ipfs/')[1]}
                />
              </Stack>
              <Stack>
                <Text>Cover Image</Text>
                <FeaturedImageUpload
                  data={data}
                  dispatch={dispatch}
                  initHash={collectionInfo.featuredImage.split('ipfs/')[1]}
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
              <HStack>
                <SelectWrapper>
                  <Select
                    defaultValue={{ label: category, value: category }}
                    options={options}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={customStyles}
                    onChange={(e) => {
                      setCategory(e.value)
                    }}
                  />
                </SelectWrapper>
              </HStack>
              <Stack padding="0 30px">
                <Button
                  className="btn-buy btn-default"
                  css={{
                    background: '$white',
                    color: '$black',
                    stroke: '$black',
                    width: '100%',
                  }}
                  variant="primary"
                  size="large"
                  onClick={handleChange}
                  disabled={isJsonUploading}
                >
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </ModalWrapper>
        </Container>
      </Modal>
    </ChakraProvider>
  )
}

const Container = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 30px !important;
  padding: 30px;
  color: white !important;
  max-width: 900px !important;
  @media (max-width: 650px) {
    max-width: 90vw !important;
    padding: 5px;
  }
`
const ModalWrapper = styled.div`
  max-height: 90vh;
  overflow: auto;
  padding: 20px;
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: white;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
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

const Title = styled.div`
  font-weight: 600;
  font-size: 30px;
  text-align: center;
  @media (max-width: 650px) {
    font-size: 20px;
  }
`

const Text = styled.div`
  font-size: 14px;
  font-weight: 700;
  padding: 0 40px;
  @media (max-width: 650px) {
    font-size: 12px;
  }
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
const SelectWrapper = styled.div`
  width: 100%;
`
const IconWrapper = styled.div`
  cursor: pointer;
`
export default EditCollectionModal
