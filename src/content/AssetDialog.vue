<template>
  <v-dialog v-model="showAssetDialog" persistent max-width="768">
    <v-card>
      <v-card-title class="application-title">
        <h3>{{asset.name}}</h3>
      </v-card-title>
      <v-card-text>
        <p>{{displayName}} (#{{mrn}})</p>
        <p>{{asset.description}}</p>
        <video v-if="asset.categoryKey === 'video'" ref="video" style="width: 100%;" controls :src="asset.url" />
        <img v-if="asset.categoryKey === 'image'" ref="image" style="width: 100%;" controls :src="asset.url" />
        <object v-if="asset.categoryKey === 'doc'" :data="asset.url" style="width: 100%; height: 400px;" type="application/pdf">
            <embed v-if="!$browser.isMobile" :src="asset.url" type="application/pdf" target="_blank"/>
            <p class="pdf">Preview not available</p>
        </object>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="$emit('closeAssetDialog')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AssetDialog',
  props: {
    showAssetDialog: {
      type: Boolean,
      default: false
    },
    asset: {
      type: Object,
      required: true
    }
  },
  computed: {
    displayName() {
      return this.asset.owner ? this.asset.owner.displayName : ''
    },
    mrn() {
      return this.asset.owner ? this.asset.owner.mrn : ''
    }
  }
}
</script>
