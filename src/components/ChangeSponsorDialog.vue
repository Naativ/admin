<template>
  <v-dialog v-model="showing" :persistent="true" :fullscreen="true">
    <v-snackbar :timeout="8000" :top="true" :right="true" v-model="snackbar.show">
      {{snackbar.message}}
      <v-btn flat color="pink" @click.native="snackbar.show = false">Close</v-btn>
    </v-snackbar>
    <v-card>
      <v-toolbar class="black white--text" primary-title>
        <v-spacer />
        <v-toolbar-title>
          <h1>Change Sponsor</h1>
        </v-toolbar-title>
        <v-spacer />
        <v-tooltip left>
          <template slot="activator">
            <v-btn style="color: white;" flat icon @click="close">
              <v-icon>close</v-icon>
            </v-btn>
          </template>
          <span>Close</span>
        </v-tooltip>
      </v-toolbar>
      <div style="padding: 0 25px; margin-top: 25px;">
        <p>Use the form below to search for members by name, then drag them by the name to the table below.</p>
        <v-flex>
          <MemberSearch
            @emitDragging="emitDragging"
            @emitDraggingStop="emitDraggingStop"
            :draggable="true"
            @memberSelected="childSelected"
            :disabled="locked"
            :defaultMember="defaultMember"
          />
        </v-flex>
        <br />
        <br />
        <p>
          Drop the member below to add them to the list, then drop another member
          into the "New Sponsor" column to update the sponsor.
        </p>
        <p>
          <strong>Warning:</strong> Make sure you're not creating "cycles" where a
          member's sponsor is part of their downline, as the entire operation will fail.
        </p>
        <br />
        <v-data-table :headers="headers" :items="selected" hide-actions class="elevation-1">
          <template v-if="Object.keys(props.item).length" slot="items" slot-scope="props">
            <td>{{ props.item.member.id }}</td>
            <td>{{ props.item.member.name }}</td>
            <td>{{ props.item.sponsor ? props.item.sponsor.displayName : '' }}</td>
            <td class="dropcol">
              <drop
                class="drop"
                :class="{ over: over == props.item.id, dragging: dragging, error: error }"
                @dragover="over = props.item.id"
                @dragleave="over = undefined"
                @drop="handleDrop"
              >{{ props.item.newSponsor ? props.item.newSponsor.displayName : 'Drop a new Sponsor here' }}</drop>
            </td>
            <td>
              <a @click="childRemoved(props.item)" :disabled="locked">Delete</a>
            </td>
          </template>
          <template slot="no-data">
            <td colspan="4" style="display: none"></td>
          </template>
          <template slot="footer">
            <td colspan="4" class="dropcol">
              <drop
                class="drop"
                :class="{ dragging, over: over == -1 }"
                @dragover="over = -1"
                @dragleave="over = undefined"
                @drop="childSelected"
              >Drop a member here to change their sponsor</drop>
            </td>
          </template>
        </v-data-table>
      </div>
      <v-card-actions class="px-4 pt-5">
        <v-btn color="secondary" @click="attemptChanges" :disabled="locked">Persist Changes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import MemberSearch from '@/components/MemberSearch'
import { Drag, Drop } from 'vue-drag-drop'
import CHANGE_SPONSOR from '@/graphql/ChangeSponsor.gql'

const defaultData = {
  id: 2,
  selected: [],
  over: undefined,
  snackbar: {
    show: false,
    message: undefined
  },
  locked: false,
  dragging: false,
  error: false
}
export default {
  props: {
    showing: Boolean,
    defaultMember: Object
  },
  name: 'SponsorDialog',
  components: {
    MemberSearch,
    Drag,
    Drop
  },
  data () {
    return {
      ...defaultData,
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Member', value: 'displayName' },
        { text: 'Current Sponsor', value: 'currentSponsor' },
        { text: 'New Sponsor', value: 'newSponsor' },
        { text: '', value: 'actions' }
      ]
    }
  },
  methods: {
    emitDragging (e) {
      this.error = false
      this.dragging = true
    },
    emitDraggingStop (e) {
      this.dragging = false
    },
    handleDrop (data) {
      const idx = this.selected.findIndex(e => e.id === this.over)
      this.over = undefined
      const updated = {
        ...this.selected[idx],
        newSponsor: data.member
      }
      this.selected.splice(idx, 1, updated)
    },
    childSelected ({ member }) {
      this.over = undefined
      let sponsor = null
      if (member && member.upline && member.upline.length > 1) {
        sponsor = member.upline[member.upline.length - 2]
      }
      this.selected.push({
        id: this.id++,
        member,
        sponsor,
        newSponsor: undefined
      })
    },
    childRemoved ({ id }) {
      const idx = this.selected.findIndex(e => e.id === id)
      this.selected.splice(idx, 1)
    },
    attemptChanges () {
      const mappedNewSponsors = this.selected.map(s => s.newSponsor)
      if (mappedNewSponsors.indexOf(undefined) > -1) {
        this.error = true
        return null
      }

      this.locked = true

      const changes = this.selected.map(e => ({
        memberId: e.member.id,
        sponsorId: e.newSponsor.id
      }))
      const { tenantId } = this.$store.state.user.principal
      this.$apollo
        .mutate({
          mutation: CHANGE_SPONSOR,
          variables: {
            input: { changes: { changes }, tenantId }
          },
          update: async (store, { data: { changeSponsors: { members } } }) => {
            this.selected = []
            this.close({
              message: `Successfully updated the sponsor for ${
                members.length
              } member(s)`
            })
            this.reset()
            this.locked = false
          }
        })
        .catch(error => {
          this.close({
            message: `There was a problem updating the sponsor. Please contact customer support`
          })
          this.reset()
          this.locked = false
          console.error(error)
          throw new Error(error)
        })
    },
    close (config = {}) {
      this.$emit('close', config)
      this.reset()
    },
    reset () {
      const selectedBuffer = [this.defaultMember]

      Object.assign(this, defaultData)
      this.selected = selectedBuffer
    }
  },
  watch: {
    defaultMember(newVal, oldVal) {
      const selectedBuffer = [newVal]
      this.selected = selectedBuffer
    }
  }
}
</script>

<style>
td.dropcol .drop {
  padding: 12px 24px;
}
.drop {
  transition: all 500ms ease-in;
}
.drop.over {
  color: white;
  background: #1976d2 !important;
  transition: all 500ms ease-in;
}
.drop.dragging {
  color: white;
  background: #78a3cd;
  transition: all 250ms ease-in;
}
.drop.error {
  color: white;
  background: red;
  transition: all 250ms ease-in;
}
td.dropcol {
  padding: 0px !important;
}
</style>
