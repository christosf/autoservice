import Counters from './counters/collection'
import Settings from './settings/collection'
import Users from './users/collection'
import Contacts from './contacts/collection'
import Vehicles from './vehicles/collection'

import './counters/methods'
import './contacts/methods'
import './vehicles/methods'

import './users/links'
import './contacts/links'
import './vehicles/links'
// TODO: denormalize all links and then migrate.

import './vehicles/hooks'

export {
    Counters,
    Settings,
    Users,
    Contacts,
    Vehicles
}
