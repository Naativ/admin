<template>
  <div>
    <v-progress-linear v-if="loading" color="blue" indeterminate></v-progress-linear>
    <AssetList
      :assets="newAssets"
      :loading="library.fetching"
      @uploaded="updateAsset"
      @tagAdded="tagAdded"
    />
    <div class="text-xs-center">
      <v-pagination v-model="assetSearch.page" :length="library.totalPages" :total-visible="7"></v-pagination>
    </div>
  </div>
</template>

<script>
import AssetList from './AssetList.vue'

import { findIndex } from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import { ContentActions, ContentGetters } from '@/content/ContentStore'

export default {
  name: 'ReviewAssets',
  components: {
    AssetList
  },
  async mounted() {
    await this.loadMetadata()
    this.assetSearch.allTags = this.assetMeta.approval
      .filter(e => e.key === 'approval:pending')
      .map(e => e.id)
    this.goGetAssets()
  },
  data() {
    return {
      loading: true,
      uploadDialog: false,
      currentAsset: null,
      filtered: [],
      assetSearch: {
        pageSize: 25,
        page: 1,
        allTags: []
      },
      newAssets: []
    }
  },
  computed: {
    ...mapGetters({
      library: ContentGetters.libraryAssets,
      assetMeta: ContentGetters.assetMeta
    })
  },
  methods: {
    ...mapActions({
      refreshLibrary: ContentActions.REFRESH_LIBRARY_ASSETS,
      loadMetadata: ContentActions.REFRESH_ASSET_META
    }),
    tagAdded() {
      this.goGetAssets()
    },
    async goGetAssets() {
      this.loading = true
      await this.refreshLibrary(this.assetSearch)
      this.loading = false
    },
    updateAsset(asset) {
      if (asset.visibilityId !== 200) return
      const index = findIndex(this.assets.assets, a => a.id === asset.id)
      this.$set(this.assets.assets[index], 'visibilityId', asset.visibilityId)
    }
  },
  watch: {
    'assetSearch.page'(newVal, oldVal) {
      this.goGetAssets()
    },
    async 'library.assets'(newVal) {
      const refreshedAssets = await Promise.all(newVal.map(a => new Promise(resolve => {
        fetch(a.url)
          .then((response) => {
            resolve({ ...a, url: response.url })
          })
      })))
      this.newAssets = refreshedAssets
    }
  }
}
</script>

<style scoped>
</style>
