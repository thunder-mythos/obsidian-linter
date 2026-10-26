import {IgnoreTypes} from '../utils/ignore-types';
import {Options, RuleType} from '../rules';
import RuleBuilder, {BooleanOptionBuilder, ExampleBuilder, OptionBuilderBase} from './rule-builder';
import dedent from 'ts-dedent';
import {ProtectedRanges} from '../utils/protected-ranges';
import {textReplacement} from '../utils/strings';
import {applyNonOverlappingReplacements} from '../utils/text-edits';
import {getEditsBetween} from '../utils/text-edits';
import {getAllTablesInText} from '../utils/mdast';

class ThunderHeadingTableSpacingOptions implements Options {
  blankBetweenHeadings: boolean = false;
}

@RuleBuilder.register
export default class ThunderHeadingTableSpacing extends RuleBuilder<ThunderHeadingTableSpacingOptions> {
  constructor() {
    super({
      nameKey: 'rules.thunder-heading-table-spacing.name',
      descriptionKey: 'rules.thunder-heading-table-spacing.description',
      type: RuleType.SPACING,
      ruleIgnoreTypes: [IgnoreTypes.code, IgnoreTypes.math, IgnoreTypes.yaml, IgnoreTypes.link, IgnoreTypes.wikiLink],
    });
  }
  get OptionsClass(): new () => ThunderHeadingTableSpacingOptions {
    return ThunderHeadingTableSpacingOptions;
  }
  apply(text: string, options: ThunderHeadingTableSpacingOptions, protectedRanges: ProtectedRanges): string {
    const projection = protectedRanges.projection();
    const projectedText = ThunderHeadingTableSpacing.applyToProjection(projection.text, options);

    const replacements: textReplacement[] = [];
    for (const edit of getEditsBetween(projection.text, projectedText)) {
      const range = projection.editRangeToSource(edit);
      if (range) {
        replacements.push({...range, value: edit.value});
      }
    }

    return applyNonOverlappingReplacements(text, replacements);
  }
  static applyToProjection(text: string, options: ThunderHeadingTableSpacingOptions): string {
    if (text === '') {
      return text;
    }
    const tableStartLines = new Set<number>();
    for (const table of getAllTablesInText(text)) {
      const lineIndex = text.substring(0, table.startIndex).split('\n').length - 1;
      tableStartLines.add(lineIndex);
    }

    const lines = text.split('\n');
    const out: string[] = [];
    let pendingBlanks = 0;
    let prevType: 'heading' | 'table' | 'other' | null = null;

    const isHeading = (line: string): boolean => /^#+\s/.test(line);
    const isTableStart = (index: number, line: string): boolean => {
      if (!tableStartLines.has(index)) {
        return false;
      }
      // Blockquote/callout tables are left to empty-line-around-tables:
      // a plain empty line between them would break the quote.
      if (/^\s*>/.test(line)) {
        return false;
      }
      return true;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        pendingBlanks++;
        continue;
      }
      const type: 'heading' | 'table' | 'other' = isHeading(line) ? 'heading' : isTableStart(i, line) ? 'table' : 'other';
      let required: number | null = null;
      if (prevType === null) {
        required = 0;
      } else if (type === 'heading') {
        required = prevType === 'heading' && !options.blankBetweenHeadings ? 0 : 1;
      } else if (type === 'table') {
        required = 1;
      } else if (prevType === 'heading') {
        required = 0;
      } else {
        required = null;
      }
      const blanksToEmit = required === null ? pendingBlanks : required;
      for (let b = 0; b < blanksToEmit; b++) {
        out.push('');
      }
      out.push(line);
      pendingBlanks = 0;
      prevType = type;
    }
    if (prevType !== 'heading') {
      for (let b = 0; b < pendingBlanks; b++) {
        out.push('');
      }
    }
    return out.join('\n');
  }
  get exampleBuilders(): ExampleBuilder<ThunderHeadingTableSpacingOptions>[] {
    return [
      new ExampleBuilder({
        description: 'Headings get exactly one blank line before them and none after them',
        before: dedent`
          Content here.
          ## Heading
          ${''}
          ${''}
          Content directly under the heading.
          ## Next
          More content.
        `,
        after: dedent`
          Content here.
          ${''}
          ## Heading
          Content directly under the heading.
          ${''}
          ## Next
          More content.
        `,
      }),
      new ExampleBuilder({
        description: 'A table directly under a heading keeps the one blank line it needs to render',
        before: dedent`
          ## Table
          | Column 1 | Column 2 |
          |----------|----------|
          | foo      | bar      |
        `,
        after: dedent`
          ## Table
          ${''}
          | Column 1 | Column 2 |
          |----------|----------|
          | foo      | bar      |
        `,
      }),
      new ExampleBuilder({
        description: 'Stacked headings stay stacked unless Blank between headings is on',
        before: dedent`
          # Title
          ${''}
          ## Subtitle
          Content.
        `,
        after: dedent`
          # Title
          ## Subtitle
          Content.
        `,
      }),
    ];
  }
  get optionBuilders(): OptionBuilderBase<ThunderHeadingTableSpacingOptions>[] {
    return [
      new BooleanOptionBuilder({
        OptionsClass: ThunderHeadingTableSpacingOptions,
        nameKey: 'rules.thunder-heading-table-spacing.blank-between-headings.name',
        descriptionKey: 'rules.thunder-heading-table-spacing.blank-between-headings.description',
        optionsKey: 'blankBetweenHeadings',
      }),
    ];
  }
}
