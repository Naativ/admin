<template>
  <v-flex>
    <h1 v-if="title">{{title}}</h1>
    <div>
      <v-flex xs6 md4 lg3>
        <v-card flat class="pb-3">
          <form @submit.prevent="search" autocomplete="off">
            <v-text-field
              v-model="searchTerm"
              append-icon="search"
              type="text"
              name="searchTerm"
              label="Enter name"
            ></v-text-field>
          </form>
          <v-card-actions class="justify-content-start">
            <v-btn color="secondary" @click="search">Submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </div>
    <div>
      <v-data-table
        :headers="headers"
        :items="items"
        class="elevation-1"
        :loading="loading || searchLoading"
        :rows-per-page-items="[5]"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td>
              <drag
                class="draggable"
                @dragstart="emitDragging"
                @dragend="emitDraggingStop"
                v-if="draggable"
                :transfer-data="{ member: props.item }"
                :effect-allowed="['copy']"
                :drop-effect="'copy'"
              >
                <div slot="image" class="drag-image">
                  <DragImage :props="props" />
                </div>
                <a v-if="!draggable" @click="memberSelected(props.item)">{{ props.item.name }}</a>
                <v-icon>drag_handle</v-icon>
              </drag>
            </td>
            <td>
              <drag
                class="draggable"
                @dragstart="emitDragging"
                @dragend="emitDraggingStop"
                v-if="draggable"
                :transfer-data="{ member: props.item }"
              >
                <div slot="image" class="drag-image">
                  <DragImage :props="props" />
                </div>
                {{ props.item.id }}
              </drag>
            </td>
            <td>
              <drag
                class="draggable"
                @dragstart="emitDragging"
                @dragend="emitDraggingStop"
                v-if="draggable"
                :transfer-data="{ member: props.item }"
              >
                <div slot="image" class="drag-image">
                  <DragImage :props="props" />
                </div>
                {{ props.item.displayName }}
              </drag>
            </td>
            <td>
              <drag
                class="draggable"
                @dragstart="emitDragging"
                @dragend="emitDraggingStop"
                v-if="draggable"
                :transfer-data="{ member: props.item }"
              >
                <div slot="image" class="drag-image">
                  <DragImage :props="props" />
                </div>
                {{ props.item.contactEmail }}
              </drag>
            </td>
            <td>
              <drag
                class="draggable"
                @dragstart="emitDragging"
                @dragend="emitDraggingStop"
                v-if="draggable"
                :transfer-data="{ member: props.item }"
              >
                <div slot="image" class="drag-image">
                  <DragImage :props="props" />
                </div>
                {{ props.item.slug }}
              </drag>
            </td>
            <td>
              <drag
                class="draggable"
                @dragstart="emitDragging"
                @dragend="emitDraggingStop"
                v-if="draggable"
                :transfer-data="{ member: props.item }"
              >
                <div slot="image" class="drag-image">
                  <DragImage :props="props" />
                </div>
                {{ props.item.joinedOn | formatDate}}
              </drag>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
  </v-flex>
</template>

<script>
import { Drag } from 'vue-drag-drop'

import DragImage from '@/components/DragImage'
import SEARCH_QUERY from '@/graphql/Search.gql'
import * as R from 'ramda'

export default {
  props: {
    loading: Boolean,
    draggable: Boolean,
    title: String
  },
  components: {
    Drag,
    DragImage
  },
  data () {
    return {
      searchTerm: '',
      headers: [
        {
          text: '',
          value: 'drag',
          align: 'left',
          sortable: false,
          width: '1%'
        },
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'contactEmail' },
        { text: 'Slug', value: 'slug' },
        { text: 'Joined On', value: 'joinedOn' }
      ],
      items: [],
      searchLoading: false
    }
  },
  methods: {
    emitDragging (e) {
      this.$emit('emitDragging', e)
    },
    emitDraggingStop (e) {
      this.$emit('emitDraggingStop', e)
    },
    async search () {
      this.searchLoading = true
      const res = await this.$apollo.query({
        query: SEARCH_QUERY,
        variables: {
          searchInput: {
            search: this.searchTerm
          }
        }
      })

      this.items = R.pathOr([], ['data', 'searchHierarchy', 'hierarchies'], res)
      this.searchLoading = false
    },
    memberSelected (member) {
      this.$emit('memberSelected', member)
    }
  }
}
</script>
<style>
.drag-image {
  background-color: lightgray;
  vertical-align: middle;
}
.draggable:hover {
  cursor: grab !important;
}
.draggable:active {
  cursor: grabbing !important;
}
</style>
