import axios from 'axios'
import { backend_url } from 'util/constants'

export const createNewCollection = async (inputData) => {
  try {
    const { data } = await axios.post(
      `${backend_url}/collection/set_collection`,
      inputData
    )
    return data
  } catch (err) {
    console.log('set collection error: ', err)
    return false
  }
}

export const getActivedCollections = async (category) => {
  const { data } = await axios.get(
    `${backend_url}/collection/get_actived_collections`,
    {
      params: {
        category,
      },
    }
  )
  return data
}

export const getCollectionCategory = async (id) => {
  try {
    const { data } = await axios.get(
      `${backend_url}/collection/get_collection`,
      {
        params: {
          id,
        },
      }
    )
    console.log('collection category: ', data)
    return data.category
  } catch (err) {
    return 'Undefined'
  }
}
export const setCollectionCategory = async (req) => {
  try {
    const { data } = await axios.post(
      `${backend_url}/collection/edit_collection`,
      req
    )
    return data
  } catch (err) {
    return false
  }
}
