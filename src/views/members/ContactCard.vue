<template>
    <v-card-text id="contact-list">
      <div class="card-list-tile">
        <div
          class ="details"
        >
          <ContactCardName
            @snackbarEmit="message => $emit('snackbarEmit', message)"
          />
          <ContactCardEmail
            @snackbarEmit="message => $emit('snackbarEmit', message)"
          />
          <ContactCardPhones
            @snackbarEmit="message => $emit('snackbarEmit', message)"
          />
        </div>
        <ContactCardAddresses
            @snackbarEmit="message => $emit('snackbarEmit', message)"
        />
      </div>
    </v-card-text>
</template>

<script>

import ContactCardName from './ContactCardName'
import ContactCardEmail from './ContactCardEmail'
import ContactCardAddresses from './ContactCardAddresses'
import ContactCardPhones from './ContactCardPhones'

export default {
  name: 'contact',
  components: {
    ContactCardName,
    ContactCardEmail,
    ContactCardAddresses,
    ContactCardPhones
  }
}
</script>

<style scoped>
.findme {
  border: 2px solid red;
}
.details {
  text-align: left;
}
.addresses {
  display: flex;
  flex-direction: column;
  height: 39vh;
  flex-wrap: wrap;
  min-width: 45vw;
  padding-top: 11px;
  padding-top: 48px;
  position: relative;
}
#contact-list {
  width: 100%;
}
.address-title {
  position: absolute;
  top: 9px;
}
.contact-section-heading {
  display: inline;
}
</style>
