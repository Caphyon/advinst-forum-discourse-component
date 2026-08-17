// Plain text in a bare <th> inherits the browser's default bold/larger
// heading style, unlike core's own header cells (which reset the font via
// an inner <button>/<span> — see sortable-column.gjs in Discourse core).
// common.scss overrides the font explicitly on `th.author` to match.
const AuthorColumnHeader = <template>
  <th class="author topic-list-data" scope="col">Author</th>
</template>;

export default AuthorColumnHeader;
