import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/Login.vue'),
      beforeEnter: (to, from, next) => {
        if (store.state.user.authorized) {
          next('/dashboard')
        } else {
          next()
        }
      }
    },
    {
      path: '/impersonate',
      name: 'impersonate',
      component: () => import('./iam/Impersonate.vue'),
      children: [
        {
          path: ':token',
          alias: '',
          name: 'token',
          component: () => import('./iam/ImpersonatePrompt.vue')
        }
      ]
    },

    {
      path: '/',
      name: 'admin',
      component: () => import('./views/Admin.vue'),
      beforeEnter: (to, from, next) => {
        if (!store.state.user.authorized) {
          next('/login')
        } else {
          next()
        }
      },
      children: [
        {
          path: 'dashboard',
          alias: '',
          name: 'dashboard',
          component: () => import('./views/Dashboard.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('./views/About.vue')
        },
        {
          path: 'comp-plan',
          component: () => import('./views/users/UsersFrame.vue'),
          children: [
            {
              path: '/',
              name: 'comp-plan',
              component: () => import('./views/CompPlan.vue')
            }
          ]
        },
        {
          path: '/teachers',
          name: 'teachers',
          component: () => import('./views/Teachers.vue')
        },
        {
          path: '/teachers/:id',
          name: 'teacher',
          component: () => import('./views/Teacher.vue')
        },
        {
          path: '/members',
          component: () => import('./views/users/UsersFrame.vue'),
          children: [
            {
              path: '',
              component: () => import('./views/users/UsersDashboard.vue')
            },
            {
              path: '/members/:id',
              component: () => import('./views/users/UserFrame.vue'),
              children: [
                {
                  path: '',
                  component: () => import('./views/members/MemberDetails.vue')
                },
                {
                  path: 'old',
                  component: () => import('./views/users/UserDetails.vue')
                },
                {
                  path: 'payouts',
                  component: () => import('./views/users/UserPayouts.vue')
                },
                {
                  path: 'appointments',
                  name: 'UserAppointments',
                  component: () => import('./views/users/UserAppointments.vue')
                },
                {
                  path: 'surveys',
                  name: 'UserSurveys',
                  component: () => import('./views/users/UserSurveys.vue')
                },
                {
                  path: 'team',
                  name: 'teamId',
                  component: () => import('./views/Members.vue')
                },
                {
                  path: 'jungle',
                  component: () => import('./views/users/TeamGraph.vue')
                },
                {
                  path: 'actions',
                  name: 'actions',
                  component: () => import('./views/Actions.vue')
                },
                {
                  path: 'assets',
                  name: 'userAssets',
                  component: () => import('./views/users/UserAssets.vue')
                },
                {
                  path: 'attributes',
                  component: () => import('./views/users/UserAttributes.vue')
                },
                {
                  path: 'permissions',
                  name: 'permissions',
                  component: () => import('./views/users/UserPermissions.vue')
                }
              ]
            }
          ]
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('./views/Settings.vue')
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('./views/Search.vue'),
          beforeEnter: (_, __, next) => {
            const { viewing } = store.state.users
            return viewing.length > 0
              ? next('/members/' + `${viewing[0].id}`)
              : next()
          }
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('./views/Reports.vue')
        },
        {
          path: 'payouts',
          component: () => import('./views/payouts/PayoutsFrame.vue'),
          children: [
            {
              path: '',
              name: 'payouts',
              component: () => import('./views/payouts/Payouts.vue')
            },
            {
              path: ':id',
              component: () => import('./views/payouts/PayoutsMember.vue')
            }
          ]
        },
        {
          path: 'sales',
          component: () => import('./views/sales/SalesFrame.vue'),
          children: [
            {
              path: '',
              name: 'sales',
              component: () => import('./views/sales/Sales.vue')
            },
            {
              path: ':id',
              component: () => import('./views/sales/SalesMember.vue')
            }
          ]
        },
        {
          path: '/import',
          name: 'import',
          component: () => import('./views/Import.vue')
        },
        {
          path: '/job/:id',
          name: 'job',
          component: () => import('./views/Job.vue')
        },
        {
          path: 'curriculum/courses',
          component: () => import('./views/curriculum/CurriculumFrame.vue'),
          children: [
            {
              path: '',
              component: () => import('./views/curriculum/Courses.vue')
            },
            {
              path: ':courseId',
              component: () => import('./views/curriculum/Units.vue')
            },
            {
              path: ':courseId/unit/:unitId',
              component: () => import('./views/curriculum/Blocks.vue')
            },
            {
              path: ':courseId/unit/:unitId/block/:blockId',
              component: () => import('./views/curriculum/Lessons.vue')
            },
            {
              path: ':courseId/unit/:unitId/block/:blockId/lesson/:lessonId',
              component: () => import('./views/curriculum/LessonDetails.vue')
            }
          ]
        },
        {
          path: 'topic',
          name: 'topic',
          component: () => import('./views/Topic.vue')
        },
        {
          path: 'block',
          name: 'block',
          component: () => import('./views/Block.vue')
        },
        {
          path: 'unit',
          name: 'unit',
          component: () => import('./views/Unit.vue')
        },
        {
          path: 'slides',
          name: 'slides',
          component: () => import('./views/Slides.vue')
        },
        {
          path: 'lesson',
          name: 'lesson',
          component: () => import('./views/Lesson.vue')
        },
        {
          path: 'content',
          name: 'content',
          component: () => import('./views/Content.vue')
        },
        {
          path: 'associations',
          component: () => import('./views/associations/AssociationFrame.vue'),
          children: [
            {
              path: '/',
              name: 'associations',
              component: () => import('./views/associations/Association.vue')
            },
            {
              path: 'member/:id',
              name: 'associationsByMember',
              component: () => import('./views/associations/AssociationsByMember.vue')
            },
            {
              path: 'id/:key',
              name: 'membersOfAssociation',
              component: () => import('./views/associations/AssociationDetails.vue')
            }

          ]
        },
        {
          path: 'emails',
          name: 'emails',
          component: () => import('./views/Emails.vue')
        },
        {
          path: 'awards',
          name: 'awards',
          component: () => import('./views/awards/Awards.vue')
        },
        {
          path: '/appointments',
          component: () => import('./views/appointments/AppointmentsFrame.vue'),
          children: [
            {
              path: '',
              name: 'appointments',
              component: () =>
                import('./views/appointments/AppointmentsDashboard.vue')
            },
            {
              path: ':id',
              component: () =>
                import('./views/appointments/AppointmentFrame.vue'),
              children: [
                {
                  path: '',
                  component: () =>
                    import('./views/appointments/AppointmentDetails.vue')
                },
                {
                  path: 'job',
                  component: () => import('./views/appointments/JobDetails.vue')
                },
                {
                  path: 'booking',
                  component: () =>
                    import('./views/appointments/BookingDetails.vue')
                }
              ]
            }
          ]
        },
        {
          path: '/assets',
          component: () => import('./views/assets/Assets.vue'),
          children: [
            {
              path: '',
              name: 'assets',
              component: () => import('./views/assets/ReviewAssets.vue')
            },
            {
              path: 'upload',
              name: 'upload',
              component: () => import('./views/assets/UploadDialog.vue')
            },
            {
              path: 'viewAll',
              name: 'View ALl',
              component: () => import('./views/assets/ViewAll.vue')
            }
          ]
        }
      ]
    },
    {
      path: '*',
      name: 'Admin Redirect',
      component: () => import('./views/Admin.vue'),
      beforeEnter: (_, __, next) => {
        return !store.state.user.jwt
          ? next('/login?returnTo=' + encodeURI('/'))
          : next('/dashboard')
      }
    }
  ]
})
