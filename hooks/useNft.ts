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
  return { getCommentsCnt, addComment }
}

export default useNft
