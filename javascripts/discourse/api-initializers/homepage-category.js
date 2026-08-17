import { apiInitializer } from "discourse/lib/api";
import Category from "discourse/models/category";
import DiscourseURL from "discourse/lib/url";
import getURL from "discourse/lib/get-url";

// Matches the exact category page and its sub-routes (e.g. "/l/latest",
// "?order=..."), but NOT a different category whose url happens to share the
// same string prefix (e.g. "/c/foo/5" must not match "/c/foo/50/...").
function isCategoryUrl(url, categoryUrl) {
  return (
    url === categoryUrl ||
    url.startsWith(`${categoryUrl}/`) ||
    url.startsWith(`${categoryUrl}?`)
  );
}

export default apiInitializer((api) => {
  // `homepage_category` is a "categories" schema field inside an `objects`
  // setting (Discourse has no simpler category-picker setting type). Its
  // value is always an array, even with `validations: max: 1` — so this is
  // `[{ category_id: [123] }]`, NOT `{ category_id: 123 }`. Both `[0]`s are
  // required.
  const categoryId = settings.homepage_category?.[0]?.category_id?.[0];
  if (!categoryId) {
    // No category configured: don't redirect, don't touch the body class.
    return;
  }

  const homeUrl = getURL("/");

  api.onPageChange((url) => {
    // Look up the category by id (not cached) so a slug change on the
    // Discourse side is picked up automatically without editing settings.
    const category = Category.findById(categoryId);
    if (!category) {
      return;
    }

    if (url === homeUrl) {
      DiscourseURL.routeTo(category.url);
      return;
    }

    // Drives the `#list-area` hiding rule in common.scss — kept as a body
    // class (rather than a slug-based CSS selector) so both behaviors stay
    // tied to this one setting.
    document.body.classList.toggle(
      "ai-forum-index",
      isCategoryUrl(url, category.url)
    );
  });
});
