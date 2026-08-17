import { apiInitializer } from "discourse/lib/api";

// There's no plugin outlet inside a Discourse <thead>, so the subcategory
// board's header row (a native Discourse feature, not a component-provided
// one) has to be patched via direct DOM manipulation instead of a proper
// outlet/component. This is inherently more fragile to core markup changes
// than the outlet connectors used elsewhere in this component.
export default apiInitializer((api) => {
  function patchHeaders() {
    document
      .querySelectorAll(
        ".category-list.with-topics > thead > tr:not(.ai-forum-patched)"
      )
      .forEach((row) => {
        // Marker class makes this idempotent — re-running patchHeaders() on
        // a row that's already been patched is a no-op.
        row.classList.add("ai-forum-patched");

        const topicsTh = row.querySelector("th.topics");
        const latestTh = row.querySelector("th.latest");

        if (topicsTh && !row.querySelector("th.posts")) {
          const postsTh = document.createElement("th");
          postsTh.className = "posts topic-list-data num";
          postsTh.textContent = "Posts";
          topicsTh.after(postsTh);
        }

        if (latestTh) {
          latestTh.textContent = "Last post";
        }
      });
  }

  api.onPageChange(() => {
    // The subcategory table renders asynchronously after the route
    // transition, so a single attempt right after onPageChange often runs
    // before it exists in the DOM. Poll with a bounded number of retries
    // instead of a MutationObserver, since this only needs to run once per
    // page visit.
    let attempts = 0;
    const tryPatch = () => {
      patchHeaders();
      attempts++;
      if (attempts < 10) {
        setTimeout(tryPatch, 200);
      }
    };
    tryPatch();
  });
});
