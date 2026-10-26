import ThunderHeadingTableSpacing from '../src/rules/thunder-heading-table-spacing';
import dedent from 'ts-dedent';
import {ruleTest} from './common';

ruleTest({
  RuleBuilderClass: ThunderHeadingTableSpacing,
  testCases: [
    {
      testName: 'Heading gets one blank before and none after',
      before: dedent`
        Content here.
        ## Heading


        Content directly under the heading.
        ## Next
        More content.
      `,
      after: dedent`
        Content here.

        ## Heading
        Content directly under the heading.

        ## Next
        More content.
      `,
    },
    {
      testName: 'Table directly under a heading keeps its one blank line',
      before: dedent`
        ## Table
        | Column 1 | Column 2 |
        |----------|----------|
        | foo      | bar      |
      `,
      after: dedent`
        ## Table

        | Column 1 | Column 2 |
        |----------|----------|
        | foo      | bar      |
      `,
    },
    {
      testName: 'Table after prose gets one blank before and nothing after is forced',
      before: 'Intro\n| A | B |\n|---|---|\n| 1 | 2 |\nAfter table.',
      after: 'Intro\n\n| A | B |\n|---|---|\n| 1 | 2 |\nAfter table.',
    },
    {
      testName: 'Stacked headings stay stacked by default',
      before: '# Title\n\n## Subtitle\nContent.',
      after: '# Title\n## Subtitle\nContent.',
    },
    {
      testName: 'Blank between headings option stacks with a blank',
      before: '# Title\n## Subtitle\nContent.',
      after: '# Title\n\n## Subtitle\nContent.',
      options: {blankBetweenHeadings: true},
    },
    {
      testName: 'First heading gets no leading blank, last heading loses trailing blanks',
      before: '\n\n# First\nContent.\n\n# Last\n\n\n',
      after: '# First\nContent.\n\n# Last',
    },
    {
      testName: 'Leaves heading-like lines inside fenced code alone',
      before: '```\n# inside\n\ntext\n```\n\n# Real\n\nContent.',
      after: '```\n# inside\n\ntext\n```\n\n# Real\nContent.',
    },
    {
      testName: 'Leaves other blank lines alone',
      before: 'Para one.\n\n\nPara two.\n\n## H\nContent.',
      after: 'Para one.\n\n\nPara two.\n\n## H\nContent.',
    },
  ],
});
