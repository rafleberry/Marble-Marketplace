import { NEAR_STATUS } from '../types'
// import { Dispatch, AnyAction } from "redux"

export const setNearData = (action: string, data, dispatch) => {
  // console.log("dispatch", action, data)
  try {
    switch (action) {
      case NEAR_STATUS:
        dispatch({
          type: action,
          payload: data,
        })
        break
    }
  } catch (error) {
    console.log(error)
  }
}
