import * as Curriculum from './CurriculumService.js'

import { get } from 'lodash'

export const CurriculumActions = {
  GET_COURSES: 'getCourses',
  UPSERT_COURSE: 'upsertCourse',
  GET_BLOCKS: 'getBlocks',
  UPSERT_BLOCK: 'upsertBlock',
  UPSERT_UNIT: 'upsertUnit',
  GET_UNITS: 'getUnits',
  GET_LESSONS: 'getLessons',
  GET_LESSONS_BY_ID: 'getLessonsById',
  UPSERT_LESSON: 'upsertLesson',
  UPSERT_SLIDE: 'upsertSlide',
  REMOVE_ASSET_FROM_SLIDE: 'removeAsset',
  ATTACH_ASSET: 'attachAsset',
  LESSON_PROGRESSION: 'lessonProgression'
}

export const CurriculumStore = {
  state: {
    viewing: []
  },
  mutations: {

  },
  actions: {
    [CurriculumActions.GET_COURSES]: async ({ commit, state }, filter) => {
      const result = await Curriculum.searchCourse()
      const value = get(result, 'data.getCourses', {})
      return value
    },
    [CurriculumActions.GET_UNITS]: async ({ commit, state }, input) => {
      const result = await Curriculum.getUnits(input)
      const value = get(result, 'data.getUnits', {})
      return value
    },
    [CurriculumActions.UPSERT_UNIT]: async ({ commit }, unit) => {
      const result = await Curriculum.upsertUnit(unit)
      return result
    },
    [CurriculumActions.UPSERT_COURSE]: async ({ commit }, course) => {
      const result = await Curriculum.upsertCourse(course)
      return result
    },
    [CurriculumActions.GET_BLOCKS]: async ({ commit, state }, input) => {
      const result = await Curriculum.getBlocks(input)
      const value = get(result, 'data.getBlocks', {})
      return value
    },
    [CurriculumActions.UPSERT_BLOCK]: async ({ commit }, block) => {
      const result = await Curriculum.upsertBlock(block)
      return result
    },
    [CurriculumActions.GET_LESSONS]: async ({ commit, state }, input) => {
      const result = await Curriculum.getLessons(input)
      const value = get(result, 'data.getLessons', {})
      return value
    },
    [CurriculumActions.GET_LESSONS_BY_ID]: async ({ commit, state }, input) => {
      const result = await Curriculum.getLessonsById(input)
      const value = get(result, 'data.getLessonById', {})
      return value
    },
    [CurriculumActions.UPSERT_SLIDE]: async ({ commit }, slide) => {
      const result = await Curriculum.upsertSlide(slide)
      return result
    },
    [CurriculumActions.REMOVE_ASSET_FROM_SLIDE]: async ({ commit }, slide) => {
      const result = await Curriculum.detachAssetFromSlide(slide)
      return result
    },
    [CurriculumActions.ATTACH_ASSET]: async ({ commit }, slide) => {
      const result = await Curriculum.attachAssetToSlide(slide)
      return result
    },
    [CurriculumActions.UPSERT_LESSON]: async ({ commit }, lesson) => {
      const result = await Curriculum.upsertLesson(lesson)
      return result
    },
    [CurriculumActions.LESSON_PROGRESSION]: async ({ commit }, lesson) => {
      const result = await Curriculum.lessonProgression(lesson)
      const value = get(result, 'data.lessonProgression', {})
      return value
    }
  }
}
