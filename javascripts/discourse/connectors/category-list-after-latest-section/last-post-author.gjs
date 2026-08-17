// Outlet is inside the subcategory board's <tr>, right after the "Latest"
// topic cell. featuredTopics.firstObject is the category's one featured
// topic (requires num_featured_topics = 1 — see README "Category
// prerequisites") — its last_poster_username mimics phpBB's "by Author"
// line under the last-post title.
<template>
  {{#let @outletArgs.category.featuredTopics.firstObject as |topic|}}
    {{#if topic.last_poster_username}}
      <td class="last-post-author">
        by
        <a href="/u/{{topic.last_poster_username}}">{{topic.last_poster_username}}</a>
      </td>
    {{/if}}
  {{/let}}
</template>
