<template>
  <v-dialog v-model="show" max-width="768" persistent>
      <v-card class="course-dialog">
        <v-layout column justify-space-around align-center>
          <h3>Add an Asset to this slide!</h3>
          <v-form
            class="dialog-form"
            ref="login"
            @submit.prevent="onSubmit()"
          >
            <v-text-field
              required
              v-model="id"
              name="slideId"
              label="Slide ID"
              disabled
            ></v-text-field>
            <v-text-field
              required
              v-model="form.assetId"
              name="assetId"
              label="Asset ID"
            ></v-text-field>
            <v-card-actions>
              <v-btn type="submit" dark color="pink">Add</v-btn>
              <v-btn @click="cancel">Cancel</v-btn>
            </v-card-actions>
          </v-form>
        </v-layout>
      </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    showAssetDialog: { type: Boolean, default: false },
    slideId: Number
  },
  data() {
    return {
      form: {
        slideId: '',
        assetId: ''
      }
    }
  },
  computed: {
    show: {
      get() { return this.showAssetDialog },
      set(v) { this.$emit('closeDialog') }
    },
    id: {
      get() { return this.slideId }
    }
  },
  methods: {
    onSubmit() {
      this.form.slideId = this.id.toString()
      this.$emit('submitAssetForm', this.form)
      this.form.assetId = ''
    },
    cancel() {
      this.form.assetId = ''
      this.$emit('closeDialog', this.form)
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
</style>
