import HandleBars from 'handlebars/runtime';

import ChordLyricsPair from './chord_sheet/chord_lyrics_pair';
import Tag from './chord_sheet/tag';
import { INDETERMINATE, NONE } from './constants';
import { hasChordContents, hasTextContents } from './utilities';

const lineHasContents = line => line.items.some(item => item.isRenderable());

HandleBars.registerHelper('isChordLyricsPair', item => item instanceof ChordLyricsPair);

HandleBars.registerHelper('isTag', item => item instanceof Tag);

HandleBars.registerHelper('isComment', item => item.name === 'comment');
HandleBars.registerHelper('isCommentBox', item => item.name === 'comment_box');
HandleBars.registerHelper('isSOC', item => item.name === 'start_of_chorus');
HandleBars.registerHelper('isSOV', item => item.name === 'start_of_verse');

HandleBars.registerHelper('shouldRenderLine', (line, options) => {
  if (options.data.root.renderBlankLines) {
    return true;
  }

  return lineHasContents(line);
});

HandleBars.registerHelper('hasChordContents', hasChordContents);

HandleBars.registerHelper('hasTextContents', hasTextContents);

HandleBars.registerHelper('lineHasContents', lineHasContents);

HandleBars.registerHelper('lineClasses', (line) => {
  const classes = ['row'];

  if (!lineHasContents(line)) {
    classes.push('empty-line');
  }

  if (line.type == 'chorus') {
    classes.push('chorus');
  }

  return classes.join(' ');
});

HandleBars.registerHelper('toUpperCase', line => line.toUpperCase());

HandleBars.registerHelper('renderLyrics', item => (item.lyrics == '' && item.chords != '') ? ' ' : item.lyrics);

HandleBars.registerHelper('paragraphClasses', (paragraph) => {
  const classes = ['paragraph'];

  if (paragraph.type !== INDETERMINATE && paragraph.type !== NONE) {
    classes.push(paragraph.type);
  }

  return classes.join(' ');
});
