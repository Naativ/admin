<template>
  <div>
    <div id="section-header-container">
      <v-toolbar class="indigo darken-1 white--text">
        <v-toolbar-title class="section-subheader">Member Details</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <EditButton
            id             ="member-details-edit-btn"
            :disabled      ="disabled"
            @editClicked   ="editClicked"
            @saveClicked   ="saveClicked"
            @cancelClicked ="cancelClicked"
          />
        </v-toolbar-items>
      </v-toolbar>
    </div>
    <v-card class="white lighten-5">
      <v-layout row wrap>
        <v-form id="form" ref="form">
          <v-card-text class="details" v-if="model">
            <v-layout row wrap>
              <v-flex xs6>
                <v-text-field
                  class   ="details-field"
                  label   ="System ID"
                  v-model ="model.id"
                  disabled
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  class   ="details-field"
                  label   ="Employer / Company ID"
                  v-model ="model.tenantOid"
                  disabled
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  class   ="details-field"
                  label   ="Joined On"
                  v-model ="model.joinedOn"
                  disabled
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  class   ="details-field"
                  label   ="Claimed On"
                  v-model ="model.claimedOn"
                  disabled
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  class     ="details-field"
                  label     ="First Name"
                  :disabled ="disabled"
                  v-model   ="model.firstName"
                />
                </v-flex>
              <v-flex xs6>
                <v-text-field
                  class     ="details-field"
                  label     ="Last Name"
                  v-model   ="model.lastName"
                  :disabled ="disabled"
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  class     ="details-field"
                  label     ="Legal Name"
                  v-model   ="model.name"
                  :disabled ="disabled"
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  class     ="details-field"
                  label     ="Display Name"
                  :disabled ="disabled"
                  v-model   ="model.displayName"
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  class     ="details-field"
                  label     ="Date of Birth"
                  :disabled ="disabled"
                  v-model   ="model.birthdate"
                  placeholder="MM/DD/YYYY"
                  :rules="[
                    rules.isDate
                  ]"
                />
              </v-flex>
              <v-flex xs6>
                <v-combobox
                  class      ="details-field-select"
                  label      ="Slugs"
                  v-model    ="slugModel"
                  :items     ="items"
                  item-text  ="slug"
                  item-value ="slug"
                  :disabled  ="disabled"
                  return-object
                  chips
                  deletable-chips
                  multiple
                  @update:searchInput="debouncedSearchUpdate"
                  :menu-props="{
                    closeOnClick: false,
                    closeOnContentClick: true,
                    disableKeys: true,
                    openOnClick: false,
                    maxHeight: 304
                  }"
                >
                  <template slot="item" slot-scope="props">
                    <div>
                      {{`Slug \'${props.item.slug}\' is available!`}}
                    </div>
                  </template>
                </v-combobox>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-form>
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import { cloneDeep, get, debounce } from 'lodash'
import { mapState } from 'vuex'

import {
  MemberDetailsGQL,
  UpdateMemberSubset,
  CheckSlugQuery,
  AddMemberSlug,
  UpdateMemberSlug
} from '../../users/members.gql'
import EditButton from './EditButton'
import { rules } from './rules'
import moment from 'moment'

export default {
  name: 'MemberDetailsCard',
  components: {
    EditButton
  },
  data () {
    return {
      debounce,
      rules,
      model: null,
      disabled: true,
      memberId: ~~this.$route.params.id,
      items: [],
      slugModel: [],
      debouncedSearchUpdate: debounce(this.updateSearch, 500)
    }
  },
  methods: {
    editClicked () {
      this.disabled = false
    },
    async saveClicked() {
      const { form } = this.$refs
      const valid = form.validate()

      if (!valid) { return null }
      this.disabled = true

      try {
        const { slugModel, tenantId, memberId } = this

        if (slugModel && slugModel.length) {
          for (let i = 0; i < slugModel.length; i++) {
            const { slug } = slugModel[i]
            const { id } = this.memberDetails.slugs[i] ? this.memberDetails.slugs[i] : { id: null }
            const mappedSlugs = this.memberDetails.slugs.map(s => s.slug)
            const alreadyHadSlug = this.memberDetails.slugs.hasOwnProperty(i)

            if (slug && !alreadyHadSlug) {
              await this.$apollo.mutate({
                mutation: AddMemberSlug,
                variables: {
                  input: {
                    memberId,
                    slug,
                    tenantId
                  }
                }
              })
            } else if (slug && alreadyHadSlug && mappedSlugs.indexOf(slug) < 0) {
              await this.$apollo.mutate({
                mutation: UpdateMemberSlug,
                variables: {
                  input: {
                    id,
                    memberId,
                    slug,
                    tenantId,
                    priority: 0
                  }
                }
              })
            }
          }
        }

        const birthdate = this.model.birthdate ? moment(this.model.birthdate).format('YYYY-MM-DD') : null
        await this.$apollo.mutate({
          mutation: UpdateMemberSubset,
          variables: {
            input: {
              id: this.memberId,
              displayName: this.model.displayName,
              firstName: this.model.firstName,
              lastName: this.model.lastName,
              name: this.model.name,
              birthday: birthdate
            }
          }
        })

        this.$emit('snackbarEmit', 'Member details saved!')
        this.$apollo.queries.memberDetails.refetch()
      } catch (error) {
        this.$emit('snackbarEmit', error.message)
        throw new Error(`Error saving Member Details: ${error.message}`)
      }
    },
    async cancelClicked () {
      this.disabled = true
      await this.$apollo.queries.memberDetails.refetch()
      this.initMember(this.memberDetails)
    },
    initMember(contact) {
      this.model = cloneDeep(contact)
      this.model.birthdate = this.model.birthdate ? moment(this.model.birthdate).format('MM/DD/YYYY') : null
      this.model.claimedOn = this.model.claimedOn ? moment(this.model.claimedOn).format('MM/DD/YYYY') : null
      this.model.joinedOn = this.model.joinedOn ? moment(this.model.joinedOn).format('MM/DD/YYYY') : null
    },
    async checkSlug(slugs) {
      const { slug } = slugs.length > 0 ? slugs[0] : { slug: null }
      if (!slug) return null
      const slugRes = await this.$apollo.query({
        query: CheckSlugQuery,
        variables: {
          input: {
            slug
          }
        }
      })
      return slugRes
    },
    async updateSearch(search) {
      try {
        const slugRes = await this.checkSlug([{ slug: search }])

        if (!slugRes.data) throw new Error('Error verifying slug')

        const { data: { checkSlug } } = slugRes
        if (!checkSlug) {
          this.items = [{ slug: search }]
        } else {
          if (checkSlug.memberId === this.memberId) {
            this.items = [{ slug: search }]
          }
        }
      } catch (error) {

      }
    }
  },
  watch: {
    memberDetails (next) {
      this.initMember(next)
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
      this.disabled = true
    },
    'model.slugs'(slugs) {
      this.items = slugs
      this.slugModel = slugs
    }
  },
  computed: {
    ...mapState({
      tenantId: state => state.user.principal.tenantId
    })
  },
  apollo: {
    memberDetails: {
      ...MemberDetailsGQL,
      variables() {
        return {
          memberId: this.memberId
        }
      },
      update(data) {
        let member = { ...get(data, 'members.nodes.0') }
        return member
      }
    }
  }
}
</script>

<style scoped>
.findme {
  border: 2px solid red;
}
#contact-list {
  width: 100%;
}
.address-title {
  position: absolute;
  top: 9px;
}
.member-section-heading {
  display: inline;
}
#form {
  min-width: 100%;
}
.section-subheader {
  font-size: 18px !important;
}
#section-header-container {
  display: flex;
  justify-content: space-between;
}
.details-field {
  padding: 12px 10px 0px 10px;
}
.details-field-select {
  padding: 2px 10px 0px 10px;
}
</style>
