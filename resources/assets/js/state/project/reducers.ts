import { initialState } from './state';

import {
  PROJECT_FETCH_REQUEST,
  PROJECT_FETCH_SUCCESS,
  PROJECT_FETCH_FAILURE,
  PROJECT_UPDATE_KEY_REQUEST,
  PROJECT_UPDATE_KEY_SUCCESS,
  TEST_SERVER_CONNECTION_REQUEST,
  UPDATE_SERVER_CONNECTION_STATUS,
  PROJECT_SERVER_REMOVE_SUCCESS,
  PROJECT_SERVER_UPDATE_REQUEST,
  PROJECT_SERVER_UPDATE_SUCCESS,
  PROJECT_SERVER_UPDATE_FAILURE,
} from './constants';
import { buildAlertFromResponse } from '../../utils/alert';

const project = (state = initialState, action) => {
  switch(action.type) {
    // Project
    case PROJECT_FETCH_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case PROJECT_FETCH_SUCCESS:
      return {
        ...state,
        item: action.project,
        isFetching: false
      };

    case PROJECT_FETCH_FAILURE:
      return {
        ...state,
        isFetching: false
      };

    // Project key
    case PROJECT_UPDATE_KEY_REQUEST:
      return {
        ...state,
        isKeyUpdating: true,
      };

    case PROJECT_UPDATE_KEY_SUCCESS:
      return {
        ...state,
        isKeyUpdating: false,
        item: {
          ...state.item,
          key: action.key,
        }
      };

    // Server connection test
    case TEST_SERVER_CONNECTION_REQUEST:
      return {
        ...state,
        item: {
          ...state.item,
          servers: state.item.servers.map(server => {
            if (server.id === action.serverId) {
              return {
                ...server,
                connection_status: 2,
              }
            } else {
              return server;
            }
          })
        }
      };

    case UPDATE_SERVER_CONNECTION_STATUS:
      return {
        ...state,
        item: {
          ...state.item,
          servers: state.item.servers.map(server => {
            if (server.id === action.serverId) {
              return {
                ...server,
                connection_status: action.connectionStatus,
              }
            } else {
              return server;
            }
          })
        }
      };

    // Server remove
    case PROJECT_SERVER_REMOVE_SUCCESS:
      return {
        ...state,
        item: {
          ...state.item,
          servers: state.item.servers.filter(server => {
            return server.id !== action.serverId;
          })
        }
      };

    // Server update
    case PROJECT_SERVER_UPDATE_REQUEST:
      return {
        ...state,
        errors: [],
        isUpdating: true,
        isUpdated: false,
      };

    case PROJECT_SERVER_UPDATE_SUCCESS:
      return {
        ...state,
        errors: [],
        isUpdating: false,
        isUpdated: true,
      };

    case PROJECT_SERVER_UPDATE_FAILURE:
      return {
        ...state,
        errors: buildAlertFromResponse(action.errors),
        isUpdating: false,
        isUpdated: false,
      };

    default:
      return state;
  }
};

export default project;