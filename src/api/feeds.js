import axios from 'axios'
const { VUE_APP_API_ENDPOINT } = process.env

export const feed = {
  action: async (importId, action, tenantId) => {
    return axios.post(
      `${VUE_APP_API_ENDPOINT}/feeds/${tenantId}/imports/${importId}/${action}`,
      {}
    )
  }
}
