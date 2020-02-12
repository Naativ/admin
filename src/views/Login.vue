<template>
  <v-content>
    <v-container
      fluid
      fill-height
    >
      <v-layout
        align-center
        justify-center
      >
        <v-flex
          xs12
          sm8
        >
          <v-card class="elevation-12">
            <v-toolbar
              dark
              color="black"
            >
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img
                class="logo"
                src="../assets/logo.png"
              >
              <div>
                <v-alert
                  dismissible
                  icon="error"
                  v-model="$store.state.user.login.error"
                  v-if="$store.state.user.login.error"
                >{{ $store.state.user.login.error }}</v-alert>
              </div>
              <v-form
                ref="login"
                @submit.prevent="onSubmit()"
              >
                <v-text-field
                  data-cy="Tenant Login Page"
                  required
                  v-model.number="form.tenantId"
                  :rules="form.rules"
                  prepend-icon="business"
                  name="tenantId"
                  label="Tenant ID"
                ></v-text-field>
                <v-text-field
                  data-cy="Email Login Page"
                  required
                  :rules="form.rules"
                  v-model="form.email"
                  prepend-icon="person"
                  name="login"
                  label="Login"
                  type="email"
                ></v-text-field>
                <v-text-field
                  data-cy="Password Login Page"
                  required
                  v-model="form.password"
                  :rules="form.rules"
                  prepend-icon="lock"
                  name="password"
                  label="Password"
                  id="password"
                  type="password"
                ></v-text-field>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    data-cy="Login Login Page"
                    :loading="$store.state.user.login.locked"
                    type="submit"
                    color="deep-purple"
                    dark
                  >Login</v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import AUTHENTICATE_MUTATION from '../graphql/Authenticate.gql'
import { UserActions, UserMutations } from '@/stores/UserStore'

export default {
  name: 'Login',
  data () {
    return {
      form: {
        rules: [v => !!v || 'Field is required'],
        email: '',
        password: '',
        tenantId: 1001
      }
    }
  },
  methods: {
    async onSubmit () {
      const formValidated = this.$refs.login.validate()
      if (formValidated) {
        this.$store.commit(UserMutations.LOGIN_TOGGLE_LOCK, true)
        try {
          const { data } = await this.$apollo.mutate({
            mutation: AUTHENTICATE_MUTATION,
            variables: {
              authInput: {
                tenantId: this.form.tenantId,
                username: this.form.email,
                password: this.form.password
              }
            }
          })
          const result = data
          const {
            login: { token, principal }
          } = result
          if (token) {
            this.$store.commit(UserMutations.SET_JWT, token)
            await this.$store.dispatch(UserActions.LOGIN_SUCCESS, principal)
            this.$router.push('/dashboard')
          } else {
            this.$store.commit(
              UserMutations.LOGIN_ERROR,
              'Invalid Username/Password.'
            )
            this.$store.commit(UserMutations.LOGIN_TOGGLE_LOCK, false)
          }
        } catch (error) {
          console.error({ error })
          this.$store.commit(
            UserMutations.LOGIN_ERROR,
            'Error communicating with server.'
          )
          this.$store.commit(UserMutations.LOGIN_TOGGLE_LOCK, false)
        }
      } else {
        console.error('Error in form')
      }
    }
  }
}

</script>

<style scoped>
.box-card {
  width: 480px;
  margin: auto;
}
.error {
  margin: 5px;
  padding: 10px;
  text-align: center;
}
.logo {
  width: 100%;
  max-width: 250px;
  margin: auto;
  display: block;
}
</style>
