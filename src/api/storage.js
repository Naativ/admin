import axios from 'axios'
const { VUE_APP_API_ENDPOINT } = process.env

export const storage = {
  createDestination: tenantId => {
    return axios.post(
      `${VUE_APP_API_ENDPOINT}/storage/feeds/${tenantId}/sales`,
      {}
    )
  }
}
