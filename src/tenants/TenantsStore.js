import * as R from 'ramda'
import * as Tenants from '@/tenants/TenantsService'
import * as Mutations from '@/store.mutations'

export const TenantsActions = {
  FETCH_MEMBER_TAGS: 'tenantFetchMemberTags',
  FETCH_TENANT_INFO: 'tenantFetchInfo'
}

export const TenantsMutations = {
  SET_ONE: 'tenantSetOne',
  SET_ALL: 'tenantSetAll'
}

export const TenantsStore = {
  state: {
    info: {
      id: null,
      baseUrl: null,
      name: null,
      slug: null,
      integrations: []
    },
    tags: {
      loading: false,
      values: []
    }
  },
  mutations: {
    [TenantsMutations.SET_ONE]: (state, { property, value }) =>
      (state[property] = value),
    [TenantsMutations.SET_ALL]: (state, { property, value }) => {
      console.log(value)
      state[property] = { ...value }
      console.log(state)
    },
    [Mutations.INIT]: state => {
      state.tags.loading = false
      return state
    }
  },
  actions: {
    [TenantsActions.FETCH_MEMBER_TAGS]: async ({ commit, state }, filter) => {
      commit(TenantsMutations.SET_ONE, {
        property: 'tags',
        value: {
          loading: true,
          values: R.pathOr([], ['tags', 'values'], state)
        }
      })
      const result = await Tenants.getMemberTags()
      commit(TenantsMutations.SET_ONE, {
        property: 'tags',
        value: {
          loading: false,
          values: result
        }
      })
    },
    [TenantsActions.FETCH_TENANT_INFO]: async ({ commit, state }, filter) => {
      const { data: { tenant } } = await Tenants.getTenantInfo()
      commit(TenantsMutations.SET_ALL, { property: 'info', value: tenant })
    }
  }
}
