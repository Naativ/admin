import { feed } from '@/api/feeds'

export const FeedActions = {
  JOB_ACTION: 'jobActions'
}

export const FeedMutations = {
  JOB_ACTION_LOADING: 'jobLoading',
  JOB_ACTION_ERROR: 'jobError'
}

export const FeedStore = {
  state: {
    loading: false,
    error: ''
  },
  mutations: {
    [FeedMutations.JOB_ACTION_ERROR](state, error) {
      state.error = error
    },
    [FeedMutations.JOB_ACTION_LOADING](state, loading) {
      state.loading = loading
    }
  },
  actions: {
    [FeedActions.JOB_ACTION]: async ({ state, commit }, { id, action }) => {
      try {
        commit(FeedMutations.JOB_ACTION_LOADING, true)
        await feed.action(id, action, state.user.principal.tenantId)
      } catch (error) {
        commit(FeedMutations.JOB_ACTION_ERROR, error)
      }
      commit(FeedMutations.JOB_ACTION_LOADING, false)
    }
  },
  getters: {}
}
