import axios from 'axios'
const { VUE_APP_API_ENDPOINT } = process.env

export const reports = {
  run: async (report, tenantId, parameters = {}) => {
    return axios({
      url: `${VUE_APP_API_ENDPOINT}/reporting/${tenantId}/reports/${
        report.id
      }/runs`,
      method: 'POST',
      data: parameters,
      responseType: 'blob' // important
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${report.name}.csv`)
      document.body.appendChild(link)
      link.click()
    })
  }
}
