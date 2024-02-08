import SimpleSchema from 'simpl-schema'
import { convertToSearchableString } from '../utilities'

const tagsSchema = new SimpleSchema({
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

        tagsField.value.forEach((tag) => {
          searchableTags.push(convertToSearchableString({ value: tag }))
        })

        return searchableTags
      }

      return this.unset()
    }
  },
  'searchableTags.$': String
})

export default tagsSchema
