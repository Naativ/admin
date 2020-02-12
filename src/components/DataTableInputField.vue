<template>
  <v-text-field
    v-if="edittingMetaDataArr[props.index].metadata"
    :disabled="!editting[props.index]"
    @input="$emit('edittingMetaDataArr', props.index, inputValue)"
    @click.stop
    v-model="inputValue"
    style="max-width: 20%; padding-top: 0;"
  />
</template>

<script>
export default {
  name: 'DataTableInputField',
  data() {
    return {
      inputValue: []
    }
  },
  props: {
    editting: {
      type: Array,
      required: true
    },
    edittingMetaDataArr: {
      type: Array,
      required: true
    },
    props: {
      type: Object,
      required: true
    }
  }
}
</script>

<style>

</style>
