import { expect } from 'chai';
import { BacklogWikiParser } from '../../features/backlog-wiki/parser.js';
describe('BacklogWikiParser', () => {
    let parser;
    beforeEach(() => {
        parser = new BacklogWikiParser();
    });
    it('should convert heading to html tags', () => {
        expect(parser.convertToHtml('* Heading 1').value).to.equal('<h1>Heading 1</h1>');
        expect(parser.convertToHtml('*** Heading 3').value).to.equal('<h3>Heading 3</h3>');
    });
    it('should convert inline bold and italic correctly', () => {
        expect(parser.convertToHtml("''bold''").value).to.equal('<strong>bold</strong>');
        expect(parser.convertToHtml("'''italic'''").value).to.equal('<em>italic</em>');
    });
    it('should convert unnumbered and numbered lists', () => {
        const unordered = parser.convertToHtml('- item1\n- item2').value;
        expect(unordered).to.contain('<ul><li>item1</li><li>item2</li></ul>');
        const ordered = parser.convertToHtml('+ step1\n+ step2').value;
        expect(ordered).to.contain('<ol><li>step1</li><li>step2</li></ol>');
    });
    it('should convert tables with headers correctly', () => {
        const table = parser.convertToHtml('|head1|head2|h\n|cell1|cell2|').value;
        expect(table).to.contain('<table>');
        expect(table).to.contain('<th>head1</th>');
        expect(table).to.contain('<td>cell1</td>');
        expect(table).to.contain('</table>');
    });
    it('should handle code blocks with escaping', () => {
        const code = parser.convertToHtml('{code}\n<script>alert(1)</script>\n{/code}').value;
        expect(code).to.contain('<pre><code>&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>');
    });
    it('should handle blockquotes', () => {
        expect(parser.convertToHtml('> quote').value).to.contain('<blockquote>quote</blockquote>');
    });
    it('should convert links', () => {
        expect(parser.convertToHtml('[[Title:https://example.com]]').value).to.equal('<a href="https://example.com">Title</a>');
        expect(parser.convertToHtml('[[https://example.com]]').value).to.equal('<a href="https://example.com">https://example.com</a>');
    });
    it('should handle markdown-style code blocks', () => {
        const code = parser.convertToHtml('```\nlet x = 5;\n```').value;
        expect(code).to.contain('<pre><code>let x = 5;</code></pre>');
    });
    it('should handle markdown-style code blocks with language', () => {
        const code = parser.convertToHtml('```javascript\nlet x = 5;\n```').value;
        expect(code).to.contain('<pre><code>let x = 5;</code></pre>');
    });
    it('should escape html in markdown code blocks', () => {
        const code = parser.convertToHtml('```\n<script>alert(1)</script>\n```').value;
        expect(code).to.contain('<pre><code>&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>');
    });
});
//# sourceMappingURL=parser.test.js.map