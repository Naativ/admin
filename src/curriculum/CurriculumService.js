import { apolloClient } from '@/vue-apollo'
const gql = require('./curriculum.gql')

const doQuery = (query, args) =>
  apolloClient.query({
    query,
    variables: args,
    fetchPolicy: 'no-cache'
  })

const doMutate = (mutation, args) =>
  apolloClient.mutate({
    mutation,
    variables: args
  })

export const searchCourse = async () => {
  const result = await doQuery(gql.getCourses, {})
  return result
}

export const upsertCourse = async params => {
  const {
    name,
    description,
    key,
    priority
  } = params
  const result = await doMutate(gql.upsertCourse, {
    input: {
      name,
      description,
      key,
      priority: ~~priority
    }
  })
  return result
}

export const getUnits = async params => {
  const input = { courseIds: params, page: 1, pageSize: 25 }
  const result = await doQuery(gql.getUnits, { input })
  return result
}

export const upsertUnit = async params => {
  const {
    name,
    description,
    key,
    priority,
    courseId
  } = params
  const result = await doMutate(gql.upsertUnit, {
    input: {
      name,
      description,
      key,
      priority: ~~priority,
      courseId: ~~courseId
    }
  })
  return result
}

export const getBlocks = async params => {
  const input = { unitIds: params, page: 1, pageSize: 25 }
  const result = await doQuery(gql.getBlocks, { input })
  return result
}

export const upsertBlock = async params => {
  const {
    name,
    description,
    key,
    priority,
    unitId
  } = params
  const result = await doMutate(gql.upsertBlock, {
    input: {
      name,
      description,
      key,
      priority: ~~priority,
      unitId: ~~unitId
    }
  })
  return result
}

export const getLessons = async params => {
  const input = { blockIds: params, page: 1, pageSize: 25 }
  const result = await doQuery(gql.getLessons, { input })
  return result
}

export const upsertLesson = async params => {
  const {
    name,
    description,
    key,
    priority,
    blockId,
    metadata
  } = params
  const result = await doMutate(gql.upsertLesson, {
    input: {
      name,
      description,
      key,
      priority: ~~priority,
      blockId: ~~blockId,
      metadata
    }
  })
  return result
}

export const getLessonsById = async params => {
  const input = { id: params }
  const result = await doQuery(gql.getLessonsById, { input })
  return result
}

export const upsertSlide = async params => {
  const {
    name,
    description,
    key,
    priority,
    lessonId,
    typeId,
    metadata,
    id
  } = params
  const result = await doMutate(gql.upsertSlide, {
    input: {
      name,
      description,
      key,
      priority: ~~priority,
      lessonId: ~~lessonId,
      typeId: ~~typeId,
      metadata,
      id
    }
  })
  return result
}

export const detachAssetFromSlide = async params => {
  const {
    slideId,
    assetId
  } = params
  const result = await doMutate(gql.detachAssetFromSlide, {
    input: {
      slideId: ~~slideId,
      assetId: ~~assetId
    }
  })
  return result
}

export const attachAssetToSlide = async params => {
  const {
    slideId,
    assetId
  } = params
  const result = await doMutate(gql.attachAssetToSlide, {
    input: {
      slideId: ~~slideId,
      assetId: ~~assetId
    }
  })
  return result
}

export const lessonProgression = async params => {
  const result = await doMutate(gql.lessonProgression, {
    input: {
      ...params
    }
  })
  return result
}
