<template>
  <tr>
    <td><v-icon >drag_handle</v-icon></td>
    <td>{{ props.item.displayName }}</td>
    <td>{{ props.item.contactEmail }}</td>
    <td>{{ props.item.slug }}</td>
    <td>{{ props.item.joinedOn | formatDate}}</td>
  </tr>
</template>

<script>
export default {
  name: 'DragImage',
  props: {
    props: {
      type: Object,
      required: true
    }
  }
}
</script>
