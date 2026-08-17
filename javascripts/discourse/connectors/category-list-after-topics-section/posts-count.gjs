{{! Outlet is inside the subcategory board's <tr>, right after the Topics
    <td>. Discourse tracks category.post_count but never surfaces it in the
    built-in subcategory table — this just renders it as a matching <td>.
    Pairs with the "Posts" <th> added by subcategory-table-headers.js. }}
<template>
  <td class="posts topic-list-data num">
    {{@outletArgs.category.post_count}}
  </td>
</template>
