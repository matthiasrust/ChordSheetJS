export const TITLE = 'title';
export const SUBTITLE = 'subtitle';
export const COMMENT = 'comment';
export const START_OF_CHORUS = 'start_of_chorus';
export const END_OF_CHORUS = 'end_of_chorus';
export const START_OF_VERSE = 'start_of_verse';
export const END_OF_VERSE = 'end_of_verse';

const TITLE_SHORT = 't';
const SUBTITLE_SHORT = 'st';
const COMMENT_SHORT = 'c';
const START_OF_CHORUS_SHORT = 'soc';
const END_OF_CHORUS_SHORT = 'eoc';

const META_TAGS = [TITLE, SUBTITLE];
const RENDERABLE_TAGS = [COMMENT];

const ALIASES = {
  [TITLE_SHORT]: TITLE,
  [SUBTITLE_SHORT]: SUBTITLE,
  [COMMENT_SHORT]: COMMENT,
  [START_OF_CHORUS_SHORT]: START_OF_CHORUS,
  [END_OF_CHORUS_SHORT]: END_OF_CHORUS,
};

const TAG_REGEX = /^([^:\s]+)(:?\s*(.+))?$/;

const translateTagNameAlias = (name) => {
  if (!name) {
    return name;
  }

  const sanitizedName = name.trim();

  if (sanitizedName in ALIASES) {
    return ALIASES[sanitizedName];
  }

  return sanitizedName;
};

export default class Tag {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  static parse(tag) {
    const matches = tag.match(TAG_REGEX);

    if (matches.length) {
      return new Tag(matches[1], matches[3] || null);
    }

    return null;
  }

  set name(name) {
    this._name = translateTagNameAlias(name);
    this._originalName = name;
  }

  get name() {
    return this._name.trim();
  }

  get originalName() {
    return this._originalName.trim();
  }

  set value(value) {
    this._value = value;
  }

  get value() {
    if (this._value) {
      return this._value.trim();
    }

    return this._value || null;
  }

  hasValue() {
    return this.value !== null && this.value.trim().length > 0;
  }

  isRenderable() {
    return RENDERABLE_TAGS.indexOf(this.name) !== -1;
  }

  isMetaTag() {
    return META_TAGS.indexOf(this.name) !== -1;
  }

  clone() {
    return new Tag(this.name, this.value);
  }

  toString() {
    return `Tag(name=${this.name}, value=${this.name})`;
  }
}
