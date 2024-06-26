import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import './security/fixtures';

import Authors from './authors/collection';
import Comments from './comments/collection';
import Posts from './posts/collection';
import Tags from './tags/collection';
import Groups from './groups/collection';
import Users from './users/collection';
import {Files} from './files/collection';
import {Projects} from './projects/collection';
import {Products, ProductAttributes} from './products/collection';

Authors.remove({});
Comments.remove({});
Posts.remove({});
Tags.remove({});
Groups.remove({});
Users.remove({});
Files.remove({});
Projects.remove({});
Products.remove({});
ProductAttributes.remove({});

const AUTHORS = 6;
const POST_PER_USER = 6;
const COMMENTS_PER_POST = 6;
const USERS = 4;
const TAGS = ['JavaScript', 'Meteor', 'React', 'Other'];
const GROUPS = ['JavaScript', 'Meteor', 'React', 'Other'];
const COMMENT_TEXT_SAMPLES = [
    'Good', 'Bad', 'Neutral'
];

console.log('[testing] Loading test fixtures ...');

let tags = TAGS.map(name => Tags.insert({name}));
let groups = GROUPS.map(name => Groups.insert({
    name,
    createdAt: new Date(),
}));
let authors = _.range(AUTHORS).map(idx => {
    return Authors.insert({
        name: 'Author - ' + idx,
        profile: {
            firstName: 'First Name - ' + idx,
            lastName: 'Last Name - ' + idx
        }
    });
});

let idx = 1;
_.each(authors, (author) => {
    idx++;
    const authorPostLink = Authors.getLink(author, 'posts');
    const authorGroupLink = Authors.getLink(author, 'groups');

    authorGroupLink.add(groups[idx % 4], {
        isAdmin: _.sample([true, false])
    });

    _.each(_.range(POST_PER_USER), (idx) => {
        let post = {
            title: `User Post - ${idx}`,
            metadata: {
                keywords: _.sample(TAGS, _.random(1, 2)),
                language: {
                    ..._.sample([{abbr: 'en', title: 'English'}, {abbr: 'de', title: 'Deutsch'}]),
                }
            },
            createdAt: new Date(),
        };

        authorPostLink.add(post);
        const postCommentsLink = Posts.getLink(post, 'comments');
        const postTagsLink = Posts.getLink(post, 'tags');
        const postGroupLink = Posts.getLink(post, 'group');
        postGroupLink.set(_.sample(groups), {random: Random.id()});

        postTagsLink.add(_.sample(tags));

        _.each(_.range(COMMENTS_PER_POST), (idx) => {
            let comment = {
                text: _.sample(COMMENT_TEXT_SAMPLES)
            };

            postCommentsLink.add(comment);
            Comments.getLink(comment, 'author').set(_.sample(authors));
        })
    })
});

const friendIds = [];
// each user is created so his friends are previously added users
_.range(USERS).forEach(idx => {
    const id = Users.insert({
        name: `User - ${idx}`,
        friendIds,
        subordinateIds: idx === 3 ? [friendIds[2]] : [],
    });

    friendIds.push(id);
});

const project1 = Projects.insert({name: 'Project 1'});
const project2 = Projects.insert({name: 'Project 2'});

Files.insert({
    filename: 'test.txt',
    metas: [{
        type: 'text',
        projectId: project1,
    }, {
        type: 'hidden',
        projectId: project2,
    }],
    meta: {
        type: 'text',
        projectId: project1,
    },
});

Files.insert({
    filename: 'invoice.pdf',
    metas: [{
        type: 'pdf',
        projectId: project2,
    }],
    meta: {
        type: 'pdf',
        projectId: project1,
    },
});

/**
 * Products here are slowly changing dimensions, with price being the the field which creates new version.
 * However, there are also general attributes which do not create versions, such as units & delivery.
 */
Products.insert({
    title: 'Nails',
    price: 1.50,
    productId: 1,
});
Products.insert({
    title: 'Nails',
    price: 1.60,
    productId: 1,
});
Products.insert({
    title: 'Laptop',
    price: 1500,
    productId: 2,
});
ProductAttributes.insert({
    productId: 1,
    unit: 'piece',
    delivery: 0,
});
ProductAttributes.insert({
    productId: 2,
    delivery: 10,
});

// For testing "one" relationship on product
Products.insert({
    title: 'Laptop',
    price: 1300,
    singleProductId: 1,
});

ProductAttributes.insert({
    singleProductId: 1,
    delivery: 12,
});

console.log('[ok] fixtures have been loaded.');
