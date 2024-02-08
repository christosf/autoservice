import { createRouter, createWebHistory } from 'vue-router'

import core from '../../ui/core/routes'
import users from '../../ui/users/routes'
import contacts from '../../ui/contacts/routes'
import vehicles from '../../ui/vehicles/routes'
import jobCards from '../../ui/job_cards/routes'

const routes = [
  ...core,
  ...users,
  ...contacts,
  ...vehicles,
  ...jobCards
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
