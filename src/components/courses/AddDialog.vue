<template>
  <v-dialog v-model="show" max-width="768" persistent>
      <v-card class="course-dialog">
        <v-layout column justify-space-around align-center>
          <h3>Create a new {{title}}</h3>
          <v-form
            class="dialog-form"
            @submit.prevent="onSubmit()"
          >
            <template v-for="(data, index) in form">
              <v-text-field
                v-if="typeof(data) !== 'object'"
                :key="index"
                required
                v-model="form[index]"
                :label="formatIndex(index)"
              ></v-text-field>
            </template>
            <template v-if="form.metadata">
              <h3>Metadata</h3>
              <v-flex xs12>
                <template v-for="(data, index) in form.metadata">
                  <v-form :key="index + data.key" @submit.prevent="add(data)">
                  <v-layout row>
                      <v-text-field
                        :label="data.label"
                        v-model="data.item"
                        :hint="data.hint"
                      ></v-text-field>
                      <v-btn @click="add(data)">Add</v-btn>
                  </v-layout>
                  </v-form>
                  <template v-for="(val, i) in data.value">
                    <v-list :key="i">
                      <v-layout>
                        <v-list-tile-content>{{ val }}</v-list-tile-content>
                        <v-list-tile-action>
                          <v-btn icon>
                            <v-icon @click="remove(data, i)">close</v-icon>
                          </v-btn>
                        </v-list-tile-action>
                      </v-layout>
                    </v-list>
                  </template>

                </template>
              </v-flex>

            </template>
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
    showDialog: { type: Boolean, default: false },
    uploadConfig: Object,
    dialogTitle: { type: String, default: 'component' }
  },
  data() {
    return {
    }
  },
  computed: {
    show: {
      get() { return this.showDialog },
      set(v) { this.$emit('closeDialog') }
    },
    form: {
      get() { return this.uploadConfig }
    },
    title: {
      get() { return this.dialogTitle }
    }
  },
  methods: {
    add(data) {
      if (data.key === 'wordList') {
        const val = data.item.split(',')
        val.forEach(d => data.value.push(d))
      } else {
        data.value.push(data.item)
      }
      data.item = ''
    },
    remove(arr, index) {
      arr.value.splice(index, 1)
    },
    onSubmit() {
      this.$emit('submitForm', this.form)
    },
    cancel() {
      this.$emit('closeDialog', this.form)
    },
    formatIndex(label) {
      // return label.charAt(0).toUpperCase() + label.slice(1)
      return label
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
