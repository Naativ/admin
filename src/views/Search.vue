<template>
  <div class="main-container">
    <MemberSearch title="Member Search" @memberSelected="memberSelected"/>
  </div>
</template>

<script>
import MemberSearch from '@/components/MemberSearch'

export default {
  components: {
    MemberSearch
  },
  methods: {
    memberSelected(member) {
      this.$router.push(`/members/${member.id}`)
    }
  }
}
</script>
