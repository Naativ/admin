<template>
<v-container>
  <v-progress-linear v-if="loading" color="blue" indeterminate></v-progress-linear>
    <div class="text-xs-center">
      <v-pagination v-model="assetSearch.page" :length="library.totalPages" :total-visible="7"></v-pagination>
    </div>
    <AssetList
      :assets="library.assets"
    />
    <div class="text-xs-center">
      <v-pagination v-model="assetSearch.page" :length="library.totalPages" :total-visible="7"></v-pagination>
    </div>
</v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ContentActions, ContentGetters } from '@/content/ContentStore'

import AssetList from '../assets/AssetList.vue'

export default {
  components: {
    AssetList
  },
  data() {
    return {
      assetSearch: {
        pageSize: 25,
        page: 1,
        owners: []
      },
      loading: true
    }
  },
  computed: {
    id() {
      return ~~this.$route.params.id
    },
    ...mapGetters({
      assetMeta: ContentGetters.assetMeta,
      library: ContentGetters.libraryAssets
    })
  },
  methods: {
    ...mapActions({
      refreshLibrary: ContentActions.REFRESH_LIBRARY_ASSETS
    }),
    async goGetAssets() {
      this.loading = true
      await this.refreshLibrary(this.assetSearch)
      this.loading = false
    }
  },
  async mounted() {
    this.assetSearch.owners.push(this.id)
    this.goGetAssets()
  },
  watch: {
    'assetSearch.page'(newVal, oldVal) {
      this.goGetAssets()
    }
  }

}
</script>

<style>

</style>
