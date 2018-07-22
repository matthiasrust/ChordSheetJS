import { expect } from 'chai';

import Paragraph from '../../src/chord_sheet/paragraph';
import { createLine, createParagraph } from '../utilities';
import { CHORUS, INDETERMINATE, NONE, VERSE } from '../../src/constants';

describe('Paragraph', () => {
  describe('#type', () => {
    context('when all line types are equal or none', () => {
      it('returns the common type', () => {
        const paragraph = createParagraph([
          createLine([], VERSE),
          createLine([], VERSE),
        ]);

        expect(paragraph.type).to.equal(VERSE);
      });
    });

    context('when the line types vary', () => {
      it('returns indeterminate', () => {
        const paragraph = createParagraph([
          createLine([], VERSE),
          createLine([], CHORUS),
        ]);

        expect(paragraph.type).to.equal(INDETERMINATE);
      });
    });
  });
});
