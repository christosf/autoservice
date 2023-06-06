import { Meteor } from 'meteor/meteor'
import { createRouter, createWebHistory } from 'vue-router'
import contacts from '../../ui/contacts/routes'
import vehicles from '../../ui/vehicles/routes'
import users from '../../ui/users/routes'
import core from '../../ui/core/routes'

const routes = [
    ...contacts,
    ...vehicles,
    ...users,
    ...core
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(to => {
    if (!Meteor.userId() && to.name !== 'LoginPage') {
        return { name: 'LoginPage' }
    }
})

export default router
