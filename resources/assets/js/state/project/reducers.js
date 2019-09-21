import {
  PROJECT_REQUEST,
  PROJECT_SUCCESS,
  PROJECT_FAILURE
} from './projectConstants';

const initialState = {
  item: {
    servers: [],
  },
  isFetching: false
};

const project = (state = initialState, action) => {
  switch(action.type) {
    case PROJECT_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case PROJECT_SUCCESS:
      return {
        item: action.project,
        isFetching: false
      };
    case PROJECT_FAILURE:
      return {
        ...state,
        isFetching: false
      };

    default:
      return state;
  }
};

export default project;