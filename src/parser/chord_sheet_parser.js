import Song from '../chord_sheet/song';

const WHITE_SPACE = /\s/;
// const CHORD_LINE_REGEX = /^\s*((([A-G])(#|b)?([^/\s]*)(\/([A-G])(#|b)?)?)(\s|$)+)+(\s|$)+/;
const CHORD_LINE_REGEX = /^(\s|\|)*((([A-H]|[a-h])(#|b)?(m|s|es|is|sus|dim|maj|min|aug)?([0-9])?(\/([A-H])(#|b)?)?)(\s|$|\|)+)+(\s|$)+/;

/**
 * Parses a normal chord sheet
 */
export default class ChordSheetParser {
  constructor({ preserveWhitespace = true } = {}) {
    this.preserveWhitespace = (preserveWhitespace === true);
  }

  /**
   * Parses a chord sheet into a song
   * @param {string} chordSheet The ChordPro chord sheet
   * @returns {Song} The parsed song
   */
  parse(chordSheet) {
    this.initialize(chordSheet);

    if (this.hasNextLine()) {
      const title = this.readLine();
      this.song.addTag('title: ' + title);
    }
    if (this.hasNextLine()) {
      this.song.addLine();
      let artist = this.readLine();
      if (artist.trim().length > 0) {
          artist = artist.replace(/[\(|\)]/g, '');
          this.song.addTag('artist: ' + artist);
      }
    }

    let expectedEndTag = '';
    let sectionType = 'none';
    while (this.hasNextLine()) {
      const line = this.readLine();
      if (line.match(/^\[?([1-9][\.|x]|zw\.|zw\.sp|zwsp|zwischenspiel|intro|outro|bridge|solo|\/\/.*|#.*):?/i)) {
        this.song.addTag('comment: ' + line);
        continue;
      } else if (line.match(/^\[?(verse(.*)|strophe(.*)|str |str\. ):?/i)) {
        this.song.addTag('start_of_verse: ' + line);
        expectedEndTag = 'end_of_verse';
        continue;
      } else if (line.match(/^\[?(chorus|refrain|refr\.)\]?/i)) {
        const nextline = this.lines[this.currentLine+1];
        if (nextline && nextline.trim().length == 0) {
          this.song.addTag('comment: ' + line);
          this.currentLine += 1;
        } else {
          this.song.addTag('soc: ');
          sectionType = 'chorus';
          expectedEndTag = 'eoc';          
        }
        continue;
      } else if (line.trim().length === 0 && expectedEndTag.length > 0) {
        this.song.addLine();
        this.song.addTag(expectedEndTag + ': ');
        expectedEndTag = '';
        sectionType = 'none';
        continue;
      }
      this.parseLine(line);
      this.song.setCurrentLineType(sectionType);
    }

    this.song.finish();
    return this.song;
  }

  parseLine(line) {
    this.songLine = this.song.addLine();

    if (line.trim().length === 0) {
      this.chordLyricsPair = null;
    } else {
      this.parseNonEmptyLine(line);
    }
  }

  parseNonEmptyLine(line) {
    this.chordLyricsPair = this.songLine.addChordLyricsPair();

    if (CHORD_LINE_REGEX.test(line) && this.hasNextLine()) {
      const nextLine = this.readLine();
      this.parseLyricsWithChords(line, nextLine);
    } else {
      this.chordLyricsPair.lyrics = `${line}`;
    }
  }

  initialize(document) {
    this.song = new Song();
    
    document = document.replace(/\r/g, "");
    this.lines = document.split('\n');
    this.currentLine = 0;
    this.lineCount = this.lines.length;
    this.processingText = true;
  }

  readLine() {
    const line = this.lines[this.currentLine];
    this.currentLine += 1;
    return line;
  }

  hasNextLine() {
    return this.currentLine < this.lineCount;
  }

  parseLyricsWithChords(chordsLine, lyricsLine) {
    this.processCharacters(chordsLine, lyricsLine);

    this.chordLyricsPair.lyrics += lyricsLine.substring(chordsLine.length);

    this.chordLyricsPair.chords = this.chordLyricsPair.chords.trim();
    this.chordLyricsPair.lyrics = this.chordLyricsPair.lyrics.trim();

    if (!lyricsLine.trim().length) {
      this.songLine = this.song.addLine();
    }
  }

  processCharacters(chordsLine, lyricsLine) {
    for (let c = 0, charCount = chordsLine.length; c < charCount; c += 1) {
      const chr = chordsLine[c];
      const nextChar = chordsLine[c + 1];
      const isWhiteSpace = WHITE_SPACE.test(chr);
      this.addCharacter(chr, nextChar);

      this.chordLyricsPair.lyrics += lyricsLine[c] || '';
      this.processingText = !isWhiteSpace;
    }
  }

  addCharacter(chr, nextChar) {
    const isWhiteSpace = WHITE_SPACE.test(chr);

    if (!isWhiteSpace) {
      this.ensureChordLyricsPairInitialized();
    }

    if (!isWhiteSpace || this.shouldAddCharacterToChords(nextChar)) {
      this.chordLyricsPair.chords += chr;
    }
  }

  shouldAddCharacterToChords(nextChar) {
    return (nextChar && WHITE_SPACE.test(nextChar) && this.preserveWhitespace);
  }

  ensureChordLyricsPairInitialized() {
    if (!this.processingText) {
      this.chordLyricsPair = this.songLine.addChordLyricsPair();
      this.processingText = true;
    }
  }
}
