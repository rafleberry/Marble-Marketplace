import { useEffect, useCallback } from 'react'
import axios from 'axios'
import { backend_url } from 'util/constants'

const useNft = () => {
  const getCommentsCnt = useCallback(async (token_id) => {
    const { data } = await axios.get(
      `${backend_url}/comment/get_comment_counts`,
      {
        params: {
          token_id,
        },
      }
    )
    return data.comment
  }, [])
  const addComment = useCallback(async (token_id, writer, content) => {
    try {
      await axios.post(`${backend_url}/comment/add_comment`, {
        token_id,
        writer,
        content,
      })
      return true
    } catch (err) {
      return false
    }
  }, [])
  const getFavoritesCnt = useCallback(async (token_id, user) => {
    const { data } = await axios.get(
      `${backend_url}/favorite/get_favorite_counts`,
      {
        params: {
          token_id,
          user,
        },
      }
    )
    return data
  }, [])
  const addFavorite = useCallback(async (token_id, user) => {
    try {
      await axios.post(`${backend_url}/favorite/add_favorite`, {
        token_id,
        user,
      })
      return true
    } catch (err) {
      return false
    }
  }, [])
  return { getCommentsCnt, addComment, getFavoritesCnt, addFavorite }
}

export default useNft
