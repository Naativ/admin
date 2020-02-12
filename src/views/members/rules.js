import moment from 'moment'

export const rules = {
  required: value => !!value || 'Required.',
  isDate: value => {
    if (!value) return true
    const mValue = moment(value, ['MM-DD-YYYY', 'MM/DD/YYYY'], true)
    const isValid = mValue.isValid()
    return isValid || 'Must be a valid date \'MM/DD/YYYY\''
  },
  isEmail: v => /.+@.+/.test(v) || 'E-mail must be valid'
}
