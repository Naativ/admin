<template>
  <div class="pa-3">
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card>
          <v-toolbar color="teal" dark>
            <v-toolbar-title class="text-xs-center">Awards</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="editAward(awardBlueprint)">
              <v-icon>add</v-icon>
            </v-btn>
          </v-toolbar>
          <template v-if="showNewAward">
            <h2>Create New Award</h2>
            <v-layout row wrap >
              <v-flex xs12 sm5>
                <v-chip :color="createAward.metadata.color" :text-color="createAward.metadata.text">
                  <v-avatar :color="createAward.metadata.accent">
                    <v-icon>{{createAward.metadata.icon}}</v-icon>
                  </v-avatar>
                  {{createAward.name}}
                </v-chip>
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field
                  solo
                  label="name"
                  v-model="createAward.name"
                />
                <v-text-field
                  solo
                  label="key"
                  v-model="createAward.key"
                />
                <v-layout row py-2 my-2 text-xs-center>
                  <v-flex>
                    <h4>Color</h4>
                    <verte v-model="createAward.metadata.color" :showHistory="null" model="hex"></verte>
                  </v-flex>
                  <v-flex>
                    <h4>Text</h4>
                    <verte v-model="createAward.metadata.text" :showHistory="null" model="hex"></verte>
                  </v-flex>
                  <v-flex>
                    <h4>Accent</h4>
                    <verte v-model="createAward.metadata.accent" :showHistory="null" model="hex"></verte>
                  </v-flex>
                </v-layout>
                <v-combobox
                  v-model="createAward.metadata.icon"
                  :items="icons"
                  label="Icons"
                  solo
                >
                  <template v-slot:selection="{ item, parent, selected }">
                    <v-btn>
                      <v-icon left>{{ item }}</v-icon>
                      {{item}}
                    </v-btn>
                  </template>
                  <template v-slot:item="{ index, item }">
                      <v-btn>
                        <v-icon left>{{ item }}</v-icon>
                        {{item}}
                      </v-btn>
                  </template>
                </v-combobox>
              </v-flex>
            </v-layout>
            <v-btn color="success" @click="saveAward">
              <v-icon left>save</v-icon> Create Award
            </v-btn>
            <v-divider></v-divider>
          </template>
          <v-layout row wrap ma-3 text-xs-center>
            <v-flex  v-for="award in awards" :key="award.id">
              <v-chip @click="editAward(award)" :color="award.metadata.color" :text-color="award.metadata.text">
                <v-avatar :color="award.metadata.accent">
                  <v-icon>{{award.metadata.icon}}</v-icon>
                </v-avatar>
                {{award.name}}
              </v-chip>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import Verte from 'verte'
import 'verte/dist/verte.css'
import icons from './icons'
import { GET_ALL_AWARDS, SAVE_AWARD } from '@/graphql/Awards.gql.js'
import { cloneDeep } from 'lodash'
export default {
  name: 'Awards',
  components: {
    Verte
  },
  data() {
    return {
      awards: [],
      createAward: null,
      awardBlueprint: {
        name: '',
        key: '',
        metadata: {
          icon: 'star',
          text: 'black',
          color: '#e0e0e0',
          accent: '#a0a0a0'
        },
        config: {}
      },
      showNewAward: false,
      filter: '',
      icons
    }
  },
  methods: {
    async saveAward() {
      console.log('saving', this.createAward)
      await this.$apollo.mutate({
        mutation: SAVE_AWARD,
        variables: {
          input: {
            id: this.createAward.id,
            key: this.createAward.key,
            name: this.createAward.name,
            config: this.createAward.config,
            metadata: this.createAward.metadata
          }
        }
      })
      await this.$apollo.queries.awards.refetch()
      this.showNewAward = false
    },
    editAward(award) {
      this.showNewAward = true
      this.createAward = cloneDeep(award)
    }
  },
  apollo: {
    awards: {
      query: GET_ALL_AWARDS,
      update({ recognitionGetAllAwards }) {
        return recognitionGetAllAwards
      }
    }
  }
}
</script>
