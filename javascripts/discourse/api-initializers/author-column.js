import { apiInitializer } from "discourse/lib/api";
import AuthorColumnContent from "../components/author-column-content";
import AuthorColumnHeader from "../components/author-column-header";

export default apiInitializer((api) => {
  // Desktop: the topic-list table supports declarative columns via this
  // value transformer (no DOM patching needed here, unlike the subcategory
  // board's <thead>, which has no such API — see subcategory-table-headers.js).
  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    if (!settings.author_column_enabled) {
      return columns;
    }

    let position;
    switch (settings.author_column_position) {
      case "left":
        position = { before: "topic" };
        break;
      case "right":
        position = {}; // no "before" = appended at the end
        break;
      default:
        // phpBB order: Topic, Author, Replies, Views, Last post.
        position = { before: "replies" };
        break;
    }

    columns.add(
      "author",
      { item: AuthorColumnContent, header: AuthorColumnHeader },
      position
    );

    return columns;
  });

  // Mobile: there's no table/columns on mobile, so the same content
  // component is dropped into whichever plugin outlet best matches the
  // configured desktop position. AuthorColumnContent still renders a <td>
  // in this context (odd outside a table, but it's the same trick the
  // official discourse-topic-list-author component uses) — common.scss
  // strips the table-cell box model back off via
  // `.topic-list-item-mobile-avatar-outlet .author`.
  if (settings.author_column_position === "right") {
    api.renderAfterWrapperOutlet(
      "topic-list-item",
      class extends AuthorColumnContent {
        static shouldRender(args, context) {
          return settings.author_column_enabled && context.site.mobileView;
        }
      }
    );
  } else {
    api.renderInOutlet("topic-list-item-mobile-avatar", AuthorColumnContent);
  }
});
