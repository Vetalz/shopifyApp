import {createAction} from "redux-actions";

const createRequestActions = (type, payloaderCreator) => {
  const action = createAction(type, payloaderCreator);
  action.success = type + '_SUCCESS';
  action.fail = type + '_FAIL';

  return action;
}

export const getAllCount = createRequestActions('GET_ALL_COUNT', () => ({
  request: {
    url: '/count',
  }
}));

export const getActiveCount = createRequestActions('GET_ACTIVE_COUNT', () => ({
  request: {
    url: '/count?published_status=published',
  }
}));

export const getDraftCount = createRequestActions('GET_DRAFT_COUNT', () => ({
  request: {
    url: '/count?published_status=unpublished',
  }
}));