<template>
  <div>
    <AssetDialog
      :showAssetDialog="showAssetDialog"
      :asset="this.selectedAsset"
      @closeAssetDialog="closeAssetDialog"
    />
    <v-form>
      <v-layout row just-space-around align-center>
        <!-- <v-combobox
          v-model="assetSearch.owners"
          hide-selected
          label="Search by Owner"
          multiple
          small-chips
          solo
        ></v-combobox> -->
        <v-combobox
          solo
          label="Search Assets By Tag"
          v-model="assetSearch.anyTags"
          item-text="name"
          item-value="id"
          :items="assetMeta.allTags"
          chips
          multiple
        />
        <v-btn @click="goSearchAssets">Search</v-btn>
      </v-layout>
    </v-form>
    <div class="text-xs-center">
      <v-pagination v-model="assetSearch.page" :length="library.totalPages" :total-visible="7"></v-pagination>
    </div>
    <v-data-table
      :headers="headers"
      :items="library.assets"
      :expand="true"
      :hide-actions="true"
      :loading="loading"
    >
      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="props">
        <td>{{ props.item.id }}</td>
        <td>
          <a slot="activator" @click="showAsset(props.item)">
            {{ props.item.name }}
          </a>
        </td>
        <td>{{ props.item.description }}</td>
        <td>{{ props.item.owner.displayName }}</td>
        <td>{{ props.item.categoryKey }}</td>
        <td>{{ convert(props.item.visibilityId) }}</td>
        <td>
          <ul v-for="p in props.item.tags" :key=p.id>
            <li>{{ p.name }}</li>
          </ul>
        </td>
        <td>{{ props.item.url }}</td>
      </template>
    </v-data-table>
    <div class="text-xs-center">
      <v-pagination v-model="assetSearch.page" :length="library.totalPages" :total-visible="7"></v-pagination>
    </div>
  </div>
</template>

<script>
import AssetDialog from '@/content/AssetDialog.vue'

import { getAssetVisibility } from '@/content/content.gql.js'
import { forEach } from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import { ContentActions, ContentGetters } from '@/content/ContentStore'

export default {
  components: {
    AssetDialog
  },
  data() {
    return {
      filtered: [],
      headers: [
        { text: 'ID', value: 'id', width: '50px' },
        { text: 'Name', value: 'name', width: '50px' },
        { text: 'Description', value: 'description', width: '75px' },
        { text: 'Owner', value: 'owner', width: '150px' },
        { text: 'Category', value: 'category', width: '150px' },
        { text: 'Visibility ID', value: 'visibilityId', width: '100px' },
        { text: 'Tags', value: 'tags' },
        { text: 'url', value: 'url' }
      ],
      loading: true,
      search: '',
      selectedAsset: {},
      showAssetDialog: false,
      visibilityIds: {},
      assetSearch: {
        pageSize: 25,
        page: 1,
        anyTags: [],
        owners: []
      }
    }
  },
  async mounted() {
    this.goSearchAssets()
  },
  methods: {
    ...mapActions({
      refreshLibrary: ContentActions.REFRESH_LIBRARY_ASSETS
    }),
    convert(id) {
      return this.visibilityIds[id]
    },
    showAsset(asset) {
      this.showAssetDialog = true
      this.selectedAsset = asset
    },
    closeAssetDialog() {
      this.showAssetDialog = false
      this.selectedAsset = {}
    },
    async getVisibilityIds() {
      const { data } = await this.$apollo.query({
        query: getAssetVisibility,
        fetchPolicy: 'network-only'
      })
      const visibilityArray = data.getAssetVisibility
      forEach(visibilityArray, _ => {
        this.visibilityIds[_.id] = _.name
      })
    },
    async goSearchAssets() {
      let { anyTags } = this.assetSearch
      this.loading = true
      this.assetSearch.owners = this.assetSearch.owners.map(v => ~~v)
      if (anyTags.length) {
        anyTags = anyTags.map(assMap => {
          return assMap.id
        })
      }
      await this.refreshLibrary({ ...this.assetSearch, anyTags })
      await this.getVisibilityIds()
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      library: ContentGetters.libraryAssets,
      assetMeta: ContentGetters.assetMeta
    })
  },
  watch: {
    'assetSearch.page'(newVal, oldVal) {
      this.goSearchAssets()
    }
  }
}
</script>

<style>
.search-box {
  width: 90%;
  justify-content: center;
}
</style>
