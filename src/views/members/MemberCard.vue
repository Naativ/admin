<template>
  <v-card id="member-card-card" class="green darken-1 white--text elevation-4">
    <div v-if="member">
      <div id="member-card-list" class="pa-1">
        <div class="pa-2 card-container">
          <div id="card-col-1" v-if="member.profileUrl">
            <v-avatar
              :id          ="member.profileUrl ? 'avatar' : null"
              :class       ="member.profileUrl ? 'elevation-4' : null"
              @click.stop ="$emit('click:avatar', member)"
            >
              <img :src="member.profileUrl" />
            </v-avatar>
          </div>
          <div id="card-col-2">
            <div id="card-row-1">
              <div id="displayname">{{member.displayName}}</div>
            </div>
            <div id="card-row-2">
              <span class="identifier">
                <v-icon class="white--text">how_to_reg</v-icon>
                {{member.mrn}}
              </span>
              <span class="identifier">
                <v-icon class="white--text">memory</v-icon>
                {{member.id}}
              </span>
              <span v-if="compStats && compStats.rank && compStats.rank.rank" class="identifier">
                Rank {{compStats.rank.rank}}
              </span>
            </div>
            <div v-if="member.awards && member.awards.length" id="card-row-3">
              <v-tooltip v-for="award in member.awards" :key ="award.name" top slot="append">
                <v-chip
                  :class      ="'award-badge elevation-3'"
                  :color      ="award.metadata.color"
                  :text-color ="award.metadata.text"
                  slot="activator"
                >
                  <v-avatar :color="award.metadata.accent">
                    <v-icon>{{award.metadata.icon}}</v-icon>
                  </v-avatar>
                </v-chip>
                <span>{{award.name}}</span>
              </v-tooltip>
            </div>
            <div id="card-row-4">
              <v-menu bottom under nudge-bottom="40">
                <v-btn fab small class="green v-button elevation-3" slot="activator">
                  <v-icon class="white--text">menu</v-icon>
                </v-btn>
                <v-list>
                  <v-list-tile @click="$emit('prepImpersonate')">
                    Impersonate
                  </v-list-tile>
                  <v-list-tile @click="$emit('resendPasswordReset')">
                    Resend Password Reset Email
                  </v-list-tile>
                  <v-list-tile @click="$emit('resendClaimEmail')">
                    Resend Claim Email
                  </v-list-tile>
                  <v-list-tile @click="$emit('changeSponsorClick')">
                    Change Sponsor
                  </v-list-tile>
                </v-list>
              </v-menu>
              <div id="sponsor-container">
                <v-btn round class="green" v-if="linkSponsor && member.sponsor" @click="sponsorClick">
                  <v-icon class="white--text">group</v-icon>
                  <div id="sponsor-displayname" class="white--text">{{member.sponsor.displayName}}</div>
                </v-btn>
                <div class="identifier" v-else-if="member.sponsor">
                  <v-icon class="white--text">group</v-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'MemberCard',
  props: {
    member: Object,
    compStats: Object,
    linkSponsor: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    sponsorClick() {
      const { sponsor: { id: distId } } = this.member
      this.$router.push(`/members/${distId}`)
    },
    changeSponsorClick(e) {
      this.$emit('changeSponsorClick')
    }
  }
}
</script>

<style scoped>
#member-card-card {
  min-width: 100px;
}

.identifier {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-right: 2px;
}

.card-container {
  display: flex;
  justify-content: space-evenly;
  max-width: 445px;
  min-width: 300px;
  flex-wrap: wrap;
}

#displayname {
  text-align: center;
  font-size: x-large;
  font-weight: lighter;
  margin-left: 5px;
  flex-grow: 4;
}

#sponsor-container {
  display: flex;
  align-items: center;
}

#card-row-1 {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

#card-row-2 {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

#card-row-4 {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-grow: 1;
}

#sponsor-displayname {
  white-space: nowrap;
  overflow: hidden;
  max-width: 100px;
  text-overflow: ellipsis;
  margin-left: 10px;
}

#avatar {
  height: 112px !important;
  width: auto !important;
}

#card-col-1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#card-col-2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.award-badge {
  width: 34px;
}
</style>
