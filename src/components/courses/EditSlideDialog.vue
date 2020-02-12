<template>
  <v-dialog v-model="show" max-width="768" persistent>
      <v-card class="course-dialog">
        <v-layout column justify-space-around align-center>
          <h3>Slide Details</h3>
          <v-btn
            class="edit-btn"
            v-if="!editing"
            absolute
            dark
            fab
            top
            right
            color="pink"
            @click="editing = true"
          >
            <v-icon>edit</v-icon>
          </v-btn>
          <v-speed-dial
            absolute
            dark
            fab
            top
            right
            color="pink"
            v-model="saveSpeedDial"
            direction="bottom"
            :open-on-hover="true"
            transition="slide-y-transition"
            :disabled="!saving"
            v-else
            class="edit-speed-dial"
          >
            <v-btn
              slot="activator"
              v-model="saveActivator"
              color="pink"
              dark
              fab
            >
              <v-icon>save</v-icon>
              <v-icon>close</v-icon>
            </v-btn>
            <v-btn
              fab
              dark
              small
              color="green"
              @click="saveData"
            >
              <v-icon>check</v-icon>
            </v-btn>
            <v-btn
              fab
              dark
              small
              color="red"
              @click="cancelEdit"
            >
              <v-icon>cancel</v-icon>
            </v-btn>
          </v-speed-dial>
          <v-layout row wrap v-if="slide">
            <template v-for="(data, index) in slide">
              <v-flex v-if="index !== 'assets' && index !== 'metadata' && index !== '__typename'" xs6 :key="index">
                <v-text-field
                  class="fields"
                  :label="index"
                  v-model="slide[index]"
                  required
                  :box="editing"
                  :regular="!editing"
                  :disabled="!editing"
                ></v-text-field>
              </v-flex>
            </template>
            <v-flex :class="{gray: !editing}" xs6>
              <h3 v-if="tips.length">Tips</h3>
              <h3 v-else-if="!editing">Edit to add tips</h3>
              <v-form @submit.prevent="addTip">
                <v-layout row>
                  <v-text-field
                    v-if="editing"
                    class="fields"
                    label="Add Tip"
                    v-model="tip"
                    :box="editing"
                  ></v-text-field>
                  <v-btn v-if="editing" @click="addTip">Add</v-btn>
                </v-layout>
              </v-form>
              <v-list>
                <template v-for="(item, index) in tips">
                  <v-layout class="list" :key="index">
                    <v-list-tile-content :class="{gray: !editing}">
                      {{ item }}
                    </v-list-tile-content>
                    <v-list-tile-action v-if="editing">
                      <v-btn icon @click="removeTip(index)">
                        <v-icon>close</v-icon>
                      </v-btn>
                    </v-list-tile-action>
                  </v-layout>
                </template>
              </v-list>
            </v-flex>
            <v-flex xs6 :class="{gray: !editing}">
              <h3 v-if="actions.length">Actions</h3>
              <h3 v-else-if="!editing">Edit to add actions</h3>
              <v-form @submit.prevent="addAction">
              <v-layout row>
                <v-text-field
                  v-if="editing"
                  class="fields"
                  label="Add Action"
                  v-model="action"
                  :box="editing"
                ></v-text-field>
                <v-btn v-if="editing" @click="addAction">Add</v-btn>
              </v-layout>
              </v-form>
              <v-list>
                <template v-for="(item, index) in actions">
                  <v-layout class="list" :key="index">
                    <v-list-tile-content :class="{gray: !editing}">
                      {{ item }}
                    </v-list-tile-content>
                    <v-list-tile-action v-if="editing">
                      <v-btn icon @click="removeAction(index)">
                        <v-icon>close</v-icon>
                      </v-btn>
                    </v-list-tile-action>
                  </v-layout>
                </template>
              </v-list>
            </v-flex>
            <template v-for="(data, index) in slide.assets">
              <v-flex xs12 :key="index">
                <v-card >
                  <v-img :src="data.url"></v-img>
                  <v-card-actions>
                    <v-btn @click="remove(data.id)">Remove</v-btn>
                  </v-card-actions>
                </v-card>
              </v-flex>
            </template>
          </v-layout>
          <v-layout>
            <v-btn @click="addAsset">Add Asset</v-btn>
            <v-btn @click="cancel">Cancel</v-btn>
          </v-layout>
        </v-layout>
      </v-card>
      <AddAssetDialog
        :showAssetDialog="showAssetDialog"
        :slideId="slide.id"
        @closeDialog="closeDialog"
        @submitAssetForm="submitAssetForm"
      />
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { CurriculumActions } from '@/curriculum/CurriculumStore'

import AddAssetDialog from '@/components/courses/AddAssetDialog.vue'

export default {
  components: {
    AddAssetDialog
  },
  props: {
    editDialog: { type: Boolean, default: false },
    selected: Object
  },
  data() {
    return {
      form: {
        name: '',
        key: '',
        description: '',
        priority: '',
        unitId: ''
      },
      lessonId: ~~this.$route.params.lessonId,
      showAssetDialog: false,
      editing: false,
      saving: false,
      saveSpeedDial: false,
      saveActivator: false,
      tip: '',
      action: ''
    }
  },
  computed: {
    show: {
      get() { return this.editDialog },
      set(v) { this.$emit('closeDialog') }
    },
    slide: {
      get() {
        const slideData = { ...this.selected, metadata: { ...this.selected.metadata } }
        return slideData
      }
    },
    tips: {
      get() {
        return this.slide.metadata.tips && Array.isArray(this.slide.metadata.tips)
          ? this.slide.metadata.tips.slice() : []
      }
    },
    actions: {
      get() {
        return this.slide.metadata.actions && Array.isArray(this.slide.metadata.actions)
          ? this.slide.metadata.actions.slice() : []
      }
    }
  },
  methods: {
    ...mapActions([
      CurriculumActions.REMOVE_ASSET_FROM_SLIDE,
      CurriculumActions.ATTACH_ASSET,
      CurriculumActions.UPSERT_SLIDE]),
    removeTip(index) {
      this.tips.splice(index, 1)
      this.tip = ' '
      this.tip = ''
    },
    removeAction(index) {
      this.actions.splice(index, 1)
      this.action = ' '
      this.action = ''
    },
    addTip() {
      this.tips.push(this.tip)
      this.tip = ''
    },
    addAction() {
      this.actions.push(this.action)
      this.action = ''
    },
    cancel() {
      this.$emit('closeSlide', this.form)
    },
    addAsset() {
      this.showAssetDialog = true
    },
    closeDialog() {
      this.showAssetDialog = false
    },
    submitAssetForm(val) {
      this.attachAsset(val)
      this.showAssetDialog = false
      this.$emit('closeSlide')
    },
    remove(assetId) {
      const input = { slideId: ~~this.slide.id, assetId: assetId }
      this.removeAsset(input)
      this.$emit('closeSlide')
    },
    async cancelEdit () {
      this.editing = false
    },
    async saveData() {
      this.saving = true
      this.slide.metadata.tips = this.tips
      this.slide.metadata.actions = this.actions
      await this.upsertSlide({ ...this.slide, lessonId: this.$route.params.lessonId })
      this.editing = false
      this.saving = false
    }
  }
}
</script>

<style scoped>
.course-dialog {
  padding: 10px;
}

.dialog-form {
  width: 100%;
}

.meta {
  padding: 10px 20px;
  color: grey;
}

.gray {
  color: rgba(0,0,0,.38)
}

.list {
  padding: 0 10px
}

.asset {
  max-width: 400px;
}
</style>
