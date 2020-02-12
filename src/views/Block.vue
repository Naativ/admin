<template>
  <v-flex xs12>
    <div class='block'>
      <h1>Blocks</h1>
        </div>
        <v-card>
    <v-card-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
    :search="search"
    :headers="headers"
    :items="courses"
    class="elevation-1">
    <template slot="headerCell" slot-scope="props">
      <v-tooltip bottom>
        <span slot="activator">
          {{ props.header.text }}
        </span>
      </v-tooltip>
    </template>
    <template slot="items" slot-scope="props">
      <td class="text-xs-left">{{ props.item.course }}</td>
      <td class="text-xs-left">{{ props.item.description }}</td>
      <td class="text-xs-left">{{ props.item.level }}</td>
      <td class="text-xs-left">{{ props.item.createdAt | formatDate }}</td>
    </template>
      <v-alert slot='no-results' :value="true" color="error" icon="warning">
        Your search for "{{ search }}" found no results.
      </v-alert>
    </v-data-table>
        </v-card>
      <v-layout column class="fab-container">
        <v-btn v-show="!hidden"
          color="pink"
          fab
          dark
          normal
          @click="alert = !alert">
          <v-icon>add</v-icon>
        </v-btn>
     <v-alert :value="alert" color="white" transition="scale-transition" style="width: 400px">
      <v-form lazy-validation ref="newCourseForm">
        <p>Add A New Course</p>
        <v-text-field prepend-icon="book" label="Course" v-model="newCourse.course" :rules="rules.required"></v-text-field>
        <v-text-field prepend-icon="description" label="Description" v-model="newCourse.description" :rules="rules.required"></v-text-field>
        <v-text-field prepend-icon="trending_up" label="Level" v-model="newCourse.level" :rules="rules.required"></v-text-field>

      <v-menu
        ref="menu"
        :close-on-content-click="true"
        v-model="menu"
        :nudge-right="40"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        min-width="290px"
      >
        <v-text-field
          :rules="rules.required"
          slot="activator"
          v-model="newCourse.createdAt"
          label="Created On"
          prepend-icon="event"
          readonly
        ></v-text-field>
        <v-date-picker v-model="newCourse.createdAt" no-title scrollable>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
        </v-date-picker>
      </v-menu>
        <v-btn block @click="saveTopic">Submit</v-btn>
      </v-form>
</v-alert>
  </v-layout>
  <div>
  <v-app>
    <v-footer
      height="auto"
      color="primary lighten-1"
    >
      <v-layout
        justify-center
        row
        wrap
      >
        <v-btn
          color="white"
          flat
          round>
          <a href="./curriculum">Curriculum</a></v-btn>
        <v-btn color="white" flat round><a href="./topic">Topics</a></v-btn>
        <v-btn color="white" flat round><a href="./unit">Units</a></v-btn>
        <v-btn color="white" flat round><a href="./lesson">Lessons</a></v-btn>
        <v-btn color="white" flat round><a href="./content">Content</a></v-btn>
        <v-btn color="white" flat round><a href="./slides">Slides</a></v-btn>
        <v-flex
          primary
          lighten-2
          py-3
          text-xs-center
          white--text
          xs12
        >
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</div>
</v-flex>
</template>
<script>
export default {
  name: 'Block',
  methods: {
    saveTopic() {
      if (this.$refs.newCourseForm.validate()) {
        // This only runs when the form is valid
        this.courses.push(this.newCourse)
        this.newCourse = {
          course: '',
          description: '',
          level: '',
          createdAt: ''
        }
      }
    }
  },
  data() {
    return {
      search: '',
      createdAt: null,
      menu: false,
      modal: false,
      hidden: false,
      alert: false,
      newCourse: {
        course: '',
        description: '',
        level: '',
        createdAt: ''
      },
      headers: [
        {
          text: 'Course',
          align: 'left',
          sortable: true,
          value: 'course'
        },
        { text: 'Description', value: 'description' },
        { text: 'Level', value: 'level' },
        { text: 'Created On', value: 'createdAT' }
      ],
      courses: [],
      rules: {
        required: [v => !!v || 'This field is required']
      }
    }
  }
}
</script>
<style scoped>
a {
  color: white;
  text-decoration: none;
}
a:hover {
  font-weight: bolder;
}
</style>
