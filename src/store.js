import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as R from 'ramda'
import * as Mutations from '@/store.mutations'
import { forEach, get } from 'lodash'
import { UserStore } from '@/stores/UserStore'
import { UsersStore } from '@/users/UsersStore'
import { AppointmentStore } from '@/appointments/AppointmentStore'
import { TenantsStore } from '@/tenants/TenantsStore'
import { FeedStore } from '@/stores/FeedStore'
import { ClaimStore } from '@/stores/ClaimStore'
import { ContentStore } from '@/content/ContentStore'
import { storage } from '@/api/storage'
import { SecurityService } from '@/security/SecurityService'
import { CurriculumStore } from '@/curriculum/CurriculumStore'

// import vuexCache from 'vuex-cache'
const { VUE_APP_API_ENDPOINT } = process.env

Vue.use(Vuex)

export const StoreGetters = {
  access: 'store:getAccess',
  permission: 'store:getPermissions'
}

export const Actions = {
  FILE_UPLOAD: 'fileUpload',
  GET_UPLOAD_DESTINATION: 'fileUploadDestination',
  REFRESH_ACCESS: 'root:refreshAccess'
}
export const StoreActions = Actions

const store = new Vuex.Store({
  state: {
    access: SecurityService.modelAccess()
  },
  plugins: [
    // vuexCache,
    store => {
      store.commit(Mutations.INIT)
      store.subscribe((mutation, state) => {
        localStorage.setItem('store', JSON.stringify(state))
      })
    }
  ],
  modules: {
    user: UserStore,
    feed: FeedStore,
    claim: ClaimStore,
    users: UsersStore,
    tenants: TenantsStore,
    appts: AppointmentStore,
    content: ContentStore,
    curriculum: CurriculumStore
  },
  mutations: {
    [Mutations.SET]: (state, [value, fn]) => fn(state, value),
    [Mutations.INIT](state) {
      if (localStorage.getItem('store')) {
        const hydratedState = JSON.parse(localStorage.getItem('store'))
        const jwt =
          hydratedState && hydratedState.user && hydratedState.user.jwt
        axios.interceptors.request.use(config => {
          if (jwt && config.url.indexOf(VUE_APP_API_ENDPOINT) > -1) {
            config.headers['Authorization'] = `Bearer ${jwt}`
          }
          return config
        })

        const principal = R.path(['user', 'principal'], hydratedState)
        hydratedState.access = SecurityService.modelAccess(principal)

        this.replaceState(Object.assign(state, hydratedState))
      }
    }
  },
  actions: {
    [Actions.FILE_UPLOAD]: (context, { file, destination }) => {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      const formData = new FormData()
      forEach(destination.fields, f => {
        formData.set(f.name, f.value)
      })
      formData.set('file', file)

      return axios({
        method: 'post',
        url: destination.url,
        data: formData,
        config
      })
    },
    [Actions.GET_UPLOAD_DESTINATION]: async (context, obj) => {
      const { tenantId } = context.state.user.principal
      const dest = await storage.createDestination(tenantId)
      return dest
    },
    [Actions.REFRESH_ACCESS]: async ({ state, commit }) => {
      const principal = R.path(['user', 'principal'], state)
      const access = SecurityService.modelAccess(principal)
      commit(Mutations.SET, [
        { access },
        (state, value) => Object.assign(state, value)
      ])
    }
  },
  getters: {
    [StoreGetters.access]: state => state.access,
    [StoreGetters.permissions]: state => get(state, 'user.principal.permissions', [])
  }
})

export default store
