import Line from './line';
import Tag, { META_TAGS } from './tag';
import Paragraph from './paragraph';
import { pushNew } from '../utilities';
import ChordLyricsPair from "./chord_lyrics_pair";


/**
 * Represents a song in a chord sheet. Currently a chord sheet can only have one song.
 */
class Song {
  constructor(metaData = {}) {
    /**
     * The {@link Line} items of which the song consists
     * @member
     * @type {Array<Line>}
     */
    this.lines = [];

    /**
     * The {@link Paragraph} items of which the song consists
     * @member
     * @type {Array<Line>}
     */
    this.paragraphs = [];

    this.currentLine = null;
    this.currentParagraph = null;
    this.assignMetaData(metaData);
  }

  assignMetaData(metaData) {
    this.rawMetaData = {};

    Object.keys(metaData).forEach((key) => {
      this.setMetaData(key, metaData[key]);
    });
  }

  /**
   * Returns the song lines, skipping the leading empty lines (empty as in not rendering any content). This is useful
   * if you want to skip the "header lines": the lines that only contain meta data.
   * @returns {Array<Line>} The song body lines
   */
  get bodyLines() {
    if (this._bodyLines === undefined) {
      this._bodyLines = [...this.lines];

      while (!this._bodyLines[0].hasRenderableItems()) {
        this._bodyLines.shift();
      }
    }

    return this._bodyLines;
  }

  chords(chr) {
    this.currentLine.chords(chr);
  }

  lyrics(chr) {
    this.ensureLine();
    this.currentLine.lyrics(chr);
  }

  addLine() {
    this.ensureParagraph();
    this.flushLine();
    this.currentLine = pushNew(this.lines, Line);
    return this.currentLine;
  }

  setCurrentLineType(type) {
    if (this.currentLine) {
      this.currentLine.type = type;
    }
  }

  flushLine() {
    if (this.currentLine !== null) {
      if (this.currentLine.isEmpty()) {
        this.addParagraph();
      } else if (this.currentLine.hasRenderableItems()) {
        this.currentParagraph.addLine(this.currentLine);
      }
    }
  }

  finish() {
    this.flushLine();
  }

  addChordLyricsPair() {
    this.ensureLine();
    return this.currentLine.addChordLyricsPair();
  }

  ensureLine() {
    if (this.currentLine === null) {
      this.addLine();
    }
  }

  addParagraph() {
    this.currentParagraph = pushNew(this.paragraphs, Paragraph);
    return this.currentParagraph;
  }

  ensureParagraph() {
    if (this.currentParagraph === null) {
      this.addParagraph();
    }
  }

  addTag(tagContents) {
    const tag = Tag.parse(tagContents);

    if (tag.isMetaTag()) {
      this.setMetaData(tag.name, tag.value);
    }

    this.ensureLine();
    this.currentLine.addTag(tag);

    return tag;
  }

  /**
   * Returns a deep clone of the song
   * @returns {Song} The cloned song
   */
  clone() {
    const clonedSong = new Song();
    clonedSong.lines = this.lines.map(line => line.clone());
    clonedSong.rawMetaData = { ...this.rawMetaData };
    return clonedSong;
  }

  setMetaData(name, value) {
    this.optimizedMetaData = null;

    if (!(name in this.rawMetaData)) {
      this.rawMetaData[name] = new Set();
    }

    this.rawMetaData[name].add(value);
  }

  /**
   * Returns the song metadata. When there is only one value for an entry, the value is a string. Else, the value is
   * an array containing all unique values for the entry.
   * @returns {object} The metadata
   */
  get metaData() {
    if (!this.optimizedMetaData) {
      this.optimizedMetaData = this.getOptimizedMetaData();
    }

    return this.optimizedMetaData;
  }

  getOptimizedMetaData() {
    const optimizedMetaData = {};

    Object.keys(this.rawMetaData).forEach((key) => {
      const valueSet = this.rawMetaData[key];
      optimizedMetaData[key] = this.optimizeMetaDataValue(valueSet);
    });

    return optimizedMetaData;
  }

  optimizeMetaDataValue(valueSet) {
    if (valueSet === undefined) {
      return null;
    }

    const values = [...valueSet];

    if (values.length === 1) {
      return values[0];
    }

    return values;
  }

  getMetaData(name) {
    return this.metaData[name] || null;
  }

  hideChords() {
    this.lines.forEach((line) => {
      line.items.forEach((item) => {
        if (item instanceof ChordLyricsPair) {
          item.chords = "";
        }        
      });
    });
  }

  transpose(transpose) {
    // create Array for the 12 notes available
    let chordArr = [
      'A',
      ['Bb','A#', 'Ais'],
      ['B', 'H'],
      'C', ['C#', 'Cis', 'Db', 'Des'],
      'D', ['D#', 'Dis', 'Eb', 'Es'],
      'E',
      'F', ['F#', 'Fis', 'Gb', 'Ges'],
      'G', ['G#', 'Gis', 'Ab', 'As']
    ]
    var transpose_chord = function( chord, trans ) {
      if (trans == 0) {
        return chord;
      }
      let chordnote = 
      chord = chord.replace('es', 'b');
      chord = chord.replace('is', '#');
      var notes = ['A', 'B', 'H', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

      var regex = /([A-Z][(sus)(es)(is)sb#]?)/g;
      var modulo = function(n, m) {
          return ((n % m) + m) % m;
      }
      return chord.replace( regex, function( $1 ) {
        let chord = $1;
        // if( $1.length > 1 && $1[1] == 'b' ) {  
        //   if( chord[0] == 'A' ) {
        //     chord = "H#";
        //   } else {
        //     chord = String.fromCharCode(chord[0].charCodeAt() - 1) + '#';
        //   }
        // }
        var index = chordArr.findIndex( (notes) => {
          if (!Array.isArray(notes)) {
            notes = [notes];
          }
          let note = notes.find( (note) => chord.indexOf(note) == 0)
          return note;
        } );
        if( index != -1 ) {
          index = modulo( ( index + trans ), notes.length );
          return notes[index];
        }
        return $1;
      });
    }
    this.lines.forEach((line) => {
      line.items.forEach((item) => {
        if (item instanceof ChordLyricsPair) {
          if (item.chords != "") {
            item.chords = transpose_chord(item.chords, transpose);
          }
        }        
      });
    });
    return this;
  }
}

const defineProperty = Object.defineProperty;
const songPrototype = Song.prototype;

META_TAGS.forEach((tagName) => {
  defineProperty(songPrototype, tagName, {
    get() {
      return this.getMetaData(tagName);
    },
  });
});

export default Song;
