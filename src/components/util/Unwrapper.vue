<template>
  <div>
    <component :is="component" v-bind:[attr]="attrArray || attrObject" v-bind="$attrs" />
  </div>
</template>

<script>
export default {
  name: 'Unwrapper',
  props: {
    component: Object,
    attr: String,
    attrArray: Array,
    attrObject: Object
  }
}
</script>
