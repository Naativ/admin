export const uploadCourseForm = {
  name: '',
  key: '',
  description: '',
  priority: ''
}

export const uploadUnitForm = {
  name: '',
  key: '',
  description: '',
  priority: ''
}

export const uploadBlockForm = {
  name: '',
  key: '',
  description: '',
  priority: ''
}

export const uploadLessonForm = {
  name: '',
  key: '',
  description: '',
  priority: '',
  metadata: [
    { label: 'Word List', key: 'wordList', value: [], hint: 'Values can be comma separated, or added individually' },
    { label: 'Objectives', key: 'objectives', value: [], hint: 'Values should be entered individually' }
  ]
}

export const uploadSlideForm = {
  name: '',
  key: '',
  description: '',
  priority: '',
  typeId: '',
  metadata: [
    { label: 'Tips', key: 'wordList', value: [], hint: 'Values should be comma separated' },
    { label: 'Actions', key: 'objectives', value: [], hint: 'Values should be comma separated' }
  ]
}
