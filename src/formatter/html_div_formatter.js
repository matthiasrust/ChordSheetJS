import hbs from 'handlebars-inline-precompile';

import '../handlebars_helpers';

const template = hbs`
{{~#with song~}}
  {{~#if title~}}
    <h1>{{~title~}}</h1>
  {{~/if~}}

  {{~#if subtitle~}}
    <h2><em>{{~subtitle~}}</em></h2>
  {{~/if~}}

  {{~#if artist~}}
    <h2>({{~artist~}})</h2>
  {{~/if~}}

  <div class="chord-sheet">
    {{~#each paragraphs as |paragraph|~}}
      <div class="{{paragraphClasses paragraph}}">
        {{~#each lines as |line|~}}
        
          {{~#if (shouldRenderLine line)~}}
            <div class="{{lineClasses line}}">
              {{~#each items as |item|~}}
                {{~#if (isChordLyricsPair item)~}}
                  <div class="column"><div class="chord">{{chords}}</div><div class="lyrics">{{renderLyrics item}}</div></div>
                {{~/if~}}

                {{~#if (isTag item)~}}
                  {{~#if (isComment item)~}}
                    <div class="comment">{{value}}</div>
                  {{~/if~}}
                  {{~#if (isCommentBox item)~}}
                    <div class="comment_box">{{value}}</div>
                  {{~/if~}}
                  {{~#if (isSOC item)~}}
                    <div class="chorus comment">Chorus</div>
                  {{~/if~}}
                  {{~#if (isSOV item)~}}
                    <div class="comment">{{value}}</div>
                  {{~/if~}}
                {{~/if~}}
              {{~/each~}}
            </div>
          {{~/if~}}
        {{~/each~}}
      </div>
    {{~/each~}}
  </div>
{{~/with~}}`;


/**
 * Formats a song into HTML. It uses DIVs to align lyrics with chords, which makes it useful for responsive web pages.
 */
class HtmlDivFormatter {
  /**
   * Formats a song into HTML.
   * @param {Song} song The song to be formatted
   * @returns {string} The HTML string
   */
  format(song) {
    return template({ song });
  }
}

export default HtmlDivFormatter;
