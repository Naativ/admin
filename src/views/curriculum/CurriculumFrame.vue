<template>
  <v-container>
    <v-layout class="full-width" left column justify-space-around>
      <v-breadcrumbs class="curriculum" :items="breadcrumbs" divider=" / "></v-breadcrumbs>
    </v-layout>
    <router-view class="full-width"></router-view>
  </v-container>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  computed: {
    courseId() {
      return ~~this.$route.params.courseId ? ~~this.$route.params.courseId : ''
    },
    unitId() {
      return ~~this.$route.params.unitId ? ~~this.$route.params.unitId : ''
    },
    blockId() {
      return ~~this.$route.params.blockId ? ~~this.$route.params.blockId : ''
    },
    lessonId() {
      return ~~this.$route.params.lessonId ? ~~this.$route.params.lessonId : ''
    },
    breadcrumbs() {
      return [
        {
          text: 'Courses',
          disabled: !this.courseId,
          href: '/curriculum/courses'
        },
        {
          text: 'Units',
          disabled: !this.unitId,
          href: '/curriculum/courses/' + this.courseId
        },
        {
          text: 'Blocks',
          disabled: !this.blockId,
          href: '/curriculum/courses/' + this.courseId + '/unit/' + this.unitId
        },
        {
          text: 'Lessons',
          disabled: !this.lessonId,
          href: '/curriculum/courses/' + this.courseId + '/unit/' + this.unitId + '/block/' + this.blockId
        }
      ]
    }
  }
}
</script>

<style>
.full-width {
  width: 100%;
}

</style>
