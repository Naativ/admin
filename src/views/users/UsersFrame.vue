<template>
  <UsersWorkbench :memberId="memberId">
    <router-view />
  </UsersWorkbench>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { UsersActions } from '@/users/UsersStore'
import UsersWorkbench from './UsersWorkbench.vue'
import { TenantsActions } from '@/tenants/TenantsStore'
export default {
  components: {
    UsersWorkbench
  },
  data () {
    return {
      drawer: null,
      valid: true,
      term: '',
      tags: [],
      memberId: null
    }
  },
  mounted () {
    this.searched.results = []
    this.parseMemberId()
    this[TenantsActions.FETCH_MEMBER_TAGS]()
  },
  methods: {
    ...mapActions([UsersActions.FETCH_USERS, TenantsActions.FETCH_MEMBER_TAGS]),
    clearSearch () {
      this.searched.results = []
    },
    open (user) {
      this.$router.push('/members/' + user.id)
      this.searched.results = []
    },
    search () {
      const { term, tags } = this
      this.usersFetch({ term, tags: tags.map(e => e.name) })
    },
    remove (item) {
      this.tags.splice(this.tags.indexOf(item), 1)
      this.tags = [...this.tags]
    },
    parseMemberId (to) {
      const { id } = (to || this.$route || { params: {} }).params
      if (id) {
        this.memberId = ~~id
      } else {
        this.memberId = null
      }
    }
  },
  computed: {
    ...mapState({
      searched: state => state.users.searched,
      availableTags: state => state.tenants.tags
    })
  },
  async beforeRouteUpdate (to, from, next) {
    this.parseMemberId(to)
    next()
  }
}
</script>

<style>
.results {
  margin-top: 5px;
  border-color: black;
  border-style: solid;
  position: absolute;
  z-index: 5;
  width: 600px !important;
}

.search {
  width: 350px;
}

.text {
  padding-right: 10px;
}
</style>
