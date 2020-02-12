import ClaimApi from '@/api/claim'

export const ClaimActions = {
  CLAIM: 'claim',
  RESET: 'reset'
}

export const ClaimStore = {
  state: {},
  mutations: {},
  actions: {
    [ClaimActions.CLAIM]: ({ state }, { memberId, email, tenantId }) => {
      return ClaimApi.create({ tenantId, memberId, email, type: 'claim' })
    },
    [ClaimActions.RESET]: ({ state }, { memberId, email, tenantId }) => {
      return ClaimApi.create({ tenantId, memberId, email, type: 'reset' })
    }
  },
  getters: {}
}
