// import * as R from 'ramda'
import * as Appointments from './AppointmentService'
import * as Mutations from '@/store.mutations'

export const AppointmentActions = {
  UPSERT_ONE: 'apptUpsertOne'
}

export const AppointmentMutations = {}

const DEFAULT_STATE = {}
export const AppointmentStore = {
  state: DEFAULT_STATE,
  mutations: {
    [Mutations.INIT]: state => {
      // TODO reset anything on refresh
      return state
    }
  },
  actions: {
    [AppointmentActions.UPSERT_ONE]: async ({ commit, state }, data) => {
      const result = await Appointments.upsert(data)
      return result
    }
  },
  getters: {}
}
