import * as R from 'ramda'
import * as Users from './UserService'
import * as Mutations from '@/store.mutations'

export const ID_REF = idValue => e => e && e.id === idValue

export const UsersActions = {
  ADJUST_TAGS: 'userAdjustTags',
  FETCH_USERS: 'usersFetch',
  FETCH_USER: 'userFetch',
  GET_ADDRESS: 'userGetAddress',
  GET_PHONE: 'userGetPhone',
  GET_USER: 'userGet',
  GET_USER_CREDENTIALS: 'getCredentials',
  PUSH_APT_SEARCH: 'pushAppointment',
  START_VIEWING: 'userStartViewing',
  STOP_VIEWING: 'userStopViewing',
  STOP_VIEWING_APT: 'userStopViewingAppointment',
  UPSERT_USER: 'userUpsert',
  UPDATE_SLUG: 'userUpdateSlug',
  CREATE_SLUG: 'userCreateSlug'
}

export const UsersMutations = {
  CREATE_PHONE: 'usersCreatePhone',
  POP_ONE: 'usersPopOne',
  PUSH_ONE: 'usersPushOne',
  SET_ONE: 'usersSetOne',
  SET_SEARCHED: 'usersSetSearched',
  SET_SEARCHED_APT: 'usersSetSearchedApt',
  UPDATE_ADDRESS: 'usersUpdateAddress',
  UPDATE_SUBSET: 'usersUpdateSubset',
  UPDATE_ONE: 'usersUpsertOne',
  UPDATE_PHONE: 'usersUpdatePhone'
}

export const UsersStore = {
  state: {
    associations: [],
    searched: {
      results: [],
      loading: false,
      totalResults: 0
    },
    searchedAppointment: [],
    viewing: []
  },
  mutations: {
    [UsersMutations.SET_ONE]: (state, { property, value }) => {
      state[property] = value
    },
    [UsersMutations.PUSH_ONE]: (state, { prop, value, ref }) => {
      const arr = R.pathOr([], [prop], state)
      if (typeof ref === 'function') {
        const idx = arr.findIndex(ref)
        if (idx > -1) {
          arr[idx] = value
        } else {
          arr.push(value)
        }
      } else {
        arr.push(value)
      }

      state[prop] = [...arr]
    },
    [UsersMutations.UPDATE_ONE]: (state, { prop, value, ref }) => {
      const arr = R.pathOr([], [prop], state)
      const idx = arr.findIndex(ref)
      if (idx > -1) {
        arr[idx] = value
      }
      state[prop] = [...arr]
    },
    [UsersMutations.POP_ONE]: (state, { prop, value, ref }) => {
      const arr = R.pathOr([], [prop], state)
      let idx
      if (typeof ref === 'function') {
        idx = arr.findIndex(ref)
      } else {
        idx = arr.indexOf(value)
      }
      let result
      if (idx > -1) {
        result = arr.splice(idx, 1)
      }
      state[prop] = [...arr]
      return result
    },
    [UsersMutations.CREATE_PHONE]: async ({ commit }, params) => {
      const result = await Users.createPhone(params)
      return result
    },
    [UsersMutations.UPDATE_ADDRESS]: async ({ commit }, params) => {
      const result = await Users.updateAddress(params)
      return result
    },
    [UsersMutations.UPDATE_SUBSET]: async ({ commit }, params) => {
      const result = await Users.updateMemberSubset(params)
      return result
    },
    [UsersMutations.UPDATE_PHONE]: async ({ commit }, params) => {
      const result = await Users.updatePhone(params)
      return result
    },
    [UsersMutations.SET_SEARCHED]: (state, results) =>
      (state.searched = { loading: false, results: results.details, totalResults: results.totalResults }),
    [Mutations.INIT]: state => {
      state.searched = {
        loading: false,
        results: []
      }
      return state
    }
  },
  actions: {
    [UsersActions.FETCH_USERS]: async ({ commit, state }, filter) => {
      const results = await Users.search(filter)
      const members = results.nodes
      const totalResults = results.totalCount

      const details = members.map(m =>
        R.pick(
          ['id', 'displayName', 'contacts', 'mrn', 'profileUrl', 'tags'],
          m
        )
      )
      await commit(UsersMutations.SET_SEARCHED, { details, totalResults })
    },
    [UsersActions.PUSH_APT_SEARCH]: async ({ commit, state }, details) => {
      commit(UsersMutations.PUSH_ONE, {
        prop: 'searchedAppointment',
        value: details,
        ref: ID_REF(details.id)
      })
    },
    [UsersActions.GET_USER]: async ({ commit }, params) => {
      const result = await Users.get(params)
      if (result) {
        const details = R.pick(
          [
            'id',
            'displayName',
            'contactEmail',
            'mrn',
            'profileUrl',
            'sponsorOid'
          ],
          result
        )
        await commit(UsersMutations.PUSH_ONE, {
          prop: 'viewing',
          value: details,
          ref: ID_REF(details.id)
        })
      }
      return result
    },
    [UsersActions.UPSERT_USER]: async ({ commit }, user) => {
      const result = await Users.upsert(user)
      const details = R.pick(
        ['id', 'displayName', 'contactEmail', 'mrn', 'profileUrl'],
        result
      )
      await commit(UsersMutations.UPDATE_ONE, {
        prop: 'viewing',
        value: details,
        ref: ID_REF(details.id)
      })
      return result
    },
    [UsersActions.ADJUST_TAGS]: async ({ commit }, payload) => {
      const result = await Users.adjustTags(payload)
      return result
    },
    [UsersActions.GET_USER_CREDENTIALS]: async ({ commit }, id) => {
      const result = await Users.getCredentials(id)
      return result
    },
    [UsersActions.START_VIEWING]: async ({ commit }, user) => {
      const details = R.pick(
        ['id', 'displayName', 'contactEmail', 'mrn', 'profileUrl'],
        user
      )
      commit(UsersMutations.PUSH_ONE, {
        prop: 'viewing',
        value: details,
        ref: ID_REF(details.id)
      })
      return details
    },
    [UsersActions.STOP_VIEWING]: async ({ commit, state }, userId) => {
      return commit(UsersMutations.POP_ONE, {
        prop: 'viewing',
        ref: ID_REF(userId)
      })
    },
    [UsersActions.STOP_VIEWING_APT]: async ({ commit, state }, userId) => {
      return commit(UsersMutations.POP_ONE, {
        prop: 'searchedAppointment',
        ref: ID_REF(userId)
      })
    },
    [UsersActions.GET_ADDRESS]: async ({ commit, state }, contactId) => {
      const result = await Users.getAddress(contactId)
      return result
    },
    [UsersActions.GET_PHONE]: async ({ commit, state }, conactId) => {
      const result = await Users.getPhone(conactId)
      return result
    },
    [UsersActions.UPDATE_SLUG]: async ({ commit, state }, slug) => {
      const result = await Users.updateSlug(slug)
      return result
    },
    [UsersActions.CREATE_SLUG]: async ({ commit, state }, slug) => {
      const result = await Users.createSlug(slug)
      return result
    }
  },
  getters: {
    getViewing: state => {
      return state.viewing.reverse()
    }
  }
}
