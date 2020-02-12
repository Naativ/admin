import * as R from 'ramda'
import { StoreActions } from '@/store'
import * as Mutations from '@/store.mutations'
// import { stat } from 'fs'
// import { flattenSelections } from 'apollo-utilities'

export const UserActions = {
  LOGIN_SUCCESS: 'loginSuccess',
  LOGOUT: 'logout'
}

export const UserMutations = {
  SET_JWT: 'setJwt',
  AUTH_STATUS: 'authStatus',
  LOGIN_ERROR: 'setLoginError',
  LOGIN_TOGGLE_LOCK: 'toggleLoginLock',
  INIT: 'storeInt',
  SET_PRINCIPAL: 'setPrincipal'
}

export const UserStore = {
  state: {
    authorized: false,
    jwt: null,
    login: {
      locked: false,
      error: null
    },
    principal: null
  },
  mutations: {
    [UserMutations.SET_JWT]: (state, jwt) => (state.jwt = jwt),
    [UserMutations.SET_PRINCIPAL]: (state, principal) =>
      (state.principal = principal),
    [UserMutations.AUTH_STATUS]: (state, status) => (state.authorized = status),
    [UserMutations.LOGIN_ERROR]: (state, err) => (state.login.error = err),
    [UserMutations.LOGIN_TOGGLE_LOCK]: (state, val) =>
      (state.login.locked = val === undefined ? !state.login.locked : val),
    [Mutations.INIT]: state => {
      state.login = { locked: false }
      return state
    }
  },
  actions: {
    [UserActions.LOGIN_SUCCESS]: async (
      { commit, getters, dispatch },
      principal
    ) => {
      commit(UserMutations.LOGIN_ERROR, null)
      principal.tenantId = principal.tenantId
      commit(UserMutations.SET_PRINCIPAL, principal)
      dispatch(StoreActions.REFRESH_ACCESS)

      if (getters.hasPermission) {
        commit(UserMutations.AUTH_STATUS, true)
      } else {
        commit(
          UserMutations.LOGIN_ERROR,
          'You do not have permissions to access this app.'
        )
        commit(UserMutations.LOGIN_TOGGLE_LOCK, false)
      }
    },
    [UserActions.LOGOUT]: ({ commit }) => {
      localStorage.clear()
    }
  },
  getters: {
    hasPermission: state => {
      const permissions = R.pathOr([], ['principal', 'permissions'], state)
      return !!permissions.find(p => {
        return p.id === 10
      }
      )
    },

    getName: state => {
      return state && state.principal ? state.principal.username : ''
    }
  }
}
