import Component from "@glimmer/component";
import avatar from "discourse/helpers/avatar";

export default class AuthorColumnContent extends Component {
  static shouldRender() {
    return settings.author_column_enabled;
  }

  // `args.topic` when used as a topic-list-columns "item" component
  // (desktop); `args.outletArgs.topic` when rendered into a plugin outlet
  // instead (mobile) — the two call sites in author-column.js pass topic
  // differently, so this component has to support both shapes.
  get topic() {
    return this.args.topic || this.args.outletArgs?.topic;
  }

  get showAvatar() {
    return settings.author_column_display !== "username_only";
  }

  get showUsername() {
    return settings.author_column_display !== "avatar_only";
  }

  <template>
    <td class="author topic-list-data">
      {{#if this.topic.creator}}
        <a
          class="author-column-link"
          href={{this.topic.creator.path}}
          data-user-card={{this.topic.creator.username}}
        >
          {{#if this.showAvatar}}
            {{avatar this.topic.creator imageSize="30"}}
          {{/if}}
          {{#if this.showUsername}}
            <span class="author-column-username">{{this.topic.creator.username}}</span>
          {{/if}}
        </a>
      {{/if}}
    </td>
  </template>
}
