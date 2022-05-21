import {handleActions} from "redux-actions";
import {getAllCount, getActiveCount, getDraftCount} from "./actions.js"

const defaultState = {
  allCount: null,
  activeCount: null,
  draftCount: null,
}

const handlerAllCountSuccess = (state, {payload}) => {
  return {
    ...state,
    allLoading: false,
    allCount: payload.data.count
  }
};

const handlerActiveCountSuccess = (state, {payload}) => {
  return {
    ...state,
    activeLoading: false,
    activeCount: payload.data.count
  }
};

const handlerDraftCountSuccess = (state, {payload}) => {
  return {
    ...state,
    draftLoading: false,
    draftCount: payload.data.count
  }
};


export const reducer = handleActions(
  {
    [getAllCount.success]: handlerAllCountSuccess,
    [getActiveCount.success]: handlerActiveCountSuccess,
    [getDraftCount.success]: handlerDraftCountSuccess
  },
  defaultState
);