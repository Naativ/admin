const gql = require('graphql-tag')

export const getCourses = gql`
  query getCourses {
    getCourses {
      page
      pageSize
      totalPages
      totalResults
      results {
        ...on CurriculumCourse {
          id
          key
          description
          tenantId
        }
      }
    }
  }
`

export const upsertCourse = gql`
  mutation upsertCourse($input: UpsertCourseInput) {
    upsertCourse(input: $input) {
      id
      name
    }
  }
`

export const getBlocks = gql`
  query getBlocks($input: CurriculumCondition) {
    getBlocks(input: $input) {
      page
      pageSize
      totalPages
      totalResults
      results {
        ...on CurriculumBlock {
          id
          unitId
          key
          name
          description
          modifiedBy
          priority
        }
      }
    }
  }
`

export const upsertBlock = gql`
  mutation upsertBlock($input: UpsertBlockInput) {
    upsertBlock(input: $input) {
      id
      name
    }
  }
`

export const getUnits = gql`
  query getUnits($input: CurriculumCondition) {
    getUnits(input: $input) {
      page
      pageSize
      totalPages
      totalResults
      results {
        ...on CurriculumUnit {
          id
          courseId
          key
          name
          description
          modifiedBy
          priority
        }
      }
    }
  }
`

export const upsertUnit = gql`
  mutation upsertUnit($input: UpsertUnitInput) {
    upsertUnit(input: $input) {
      id
      name
    }
  }
`

export const getLessons = gql`
  query getLessons($input: CurriculumCondition) {
    getLessons(input: $input) {
      page
      pageSize
      totalPages
      totalResults
      results {
        ...on CurriculumLesson {
          id
          key
          nextLessonId
          description
          modifiedBy
          priority
          name
          blockId
          metadata
          progressions {
            id
            fromId
            toId
          }
        }
      }
    }
  }
`

export const getLessonsById = gql`
  query getLessonById($input: CurriculumLessonCondition) {
    getLessonById(input: $input) {
      ...on CurriculumLesson {
        id
        name
        key
        description
        priority
        createdBy
        modifiedBy
        blockId
        nextLessonId
        metadata
        slides {
          typeId
          id
          name
          description
          priority
          key
          metadata
          assets {
            url
            id
          }
        }
      }
    }
  }
`

export const upsertSlide = gql`
  mutation upsertSlide($input: UpsertSlideInput) {
    upsertSlide(input: $input) {
      id
      name
    }
  }
`

export const detachAssetFromSlide = gql`
  mutation detachAssetFromSlide($input: AssetSlideInput) {
    detachAssetFromSlide(input: $input) 
  }
`

export const attachAssetToSlide = gql`
  mutation attachAssetToSlide($input: AssetSlideInput) {
    attachAssetToSlide(input: $input) 
  }
`
export const upsertLesson = gql`
  mutation upsertLesson($input: UpsertLessonInput) {
    upsertLesson(input: $input) {
      id
      name
    }
  }
`

export const lessonProgression = gql`
  mutation lessonProgression($input: LessonProgressionInput) {
    lessonProgression(input: $input) {
      id
      fromId
      toId
    }
  }
`
