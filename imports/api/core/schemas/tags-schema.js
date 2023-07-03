import SimpleSchema from 'simpl-schema'
import { convertToSearchableString } from '../functions'

export default new SimpleSchema({
    tags: Array,
    'tags.$': {
        type: String,
        max: 40
    },
    searchableTags: {
        type: Array,
        autoValue() {
            const tagsField = this.field('tags')

            if (tagsField.isSet) {
                const searchableTags = []

                tagsField.value.forEach(tag => {
                    searchableTags.push(convertToSearchableString(tag))
                })
                
                return searchableTags
            }
            
            this.unset()
        }
    },
    'searchableTags.$': String
})
