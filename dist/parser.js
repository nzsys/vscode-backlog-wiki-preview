export class BacklogParser {
    parse(text) {
        let lines = text.split(/\r?\n/);
        let htmlLines = [];
        let inCodeBlock = false;
        let inList = false;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            // Code blocks
            if (line.match(/^\{code.*\}$/)) {
                inCodeBlock = true;
                htmlLines.push('<pre><code>');
                continue;
            }
            if (line.match(/^\{\/code\}$/)) {
                inCodeBlock = false;
                htmlLines.push('</code></pre>');
                continue;
            }
            if (inCodeBlock) {
                htmlLines.push(this.escapeHtml(line));
                continue;
            }
            // Headings
            let headingMatch = line.match(/^(\*{1,5})\s+(.*)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                htmlLines.push(`<h${level}>${this.parseInline(headingMatch[2])}</h${level}>`);
                continue;
            }
            // Lists
            let listMatch = line.match(/^(-{1,3})\s+(.*)$/);
            if (listMatch) {
                if (!inList) {
                    htmlLines.push('<ul>');
                    inList = true;
                }
                htmlLines.push(`<li>${this.parseInline(listMatch[2])}</li>`);
                // Peek next line to see if list continues
                let nextLine = lines[i + 1];
                if (!nextLine || !nextLine.match(/^-{1,3}\s+/)) {
                    htmlLines.push('</ul>');
                    inList = false;
                }
                continue;
            }
            // Regular text
            if (line.trim() === '') {
                htmlLines.push('<br>');
            }
            else {
                htmlLines.push(this.parseInline(line));
            }
        }
        return htmlLines.join('');
    }
    parseInline(text) {
        let result = this.escapeHtml(text);
        // Bold & Italic (order matters)
        // Since we escaped ', we need to match &#039;
        result = result.replace(/&#039;&#039;&#039;(.+?)&#039;&#039;&#039;/g, '<em>$1</em>');
        result = result.replace(/&#039;&#039;(.+?)&#039;&#039;/g, '<strong>$1</strong>');
        // Strikethrough
        result = result.replace(/%%(.+?)%%/g, '<del>$1</del>');
        // Links [[Title:URL]] or [[URL]]
        // Use a more specific regex for URL to avoid stopping at the first colon in https://
        result = result.replace(/\[\[(.+?):((?:https?|ftp):\/\/.+?)\]\]/g, '<a href="$2">$1</a>');
        result = result.replace(/\[\[((?:https?|ftp):\/\/.+?)\]\]/g, '<a href="$1">$1</a>');
        result = result.replace(/\[\[(.+?)\]\]/g, '<a href="$1">$1</a>');
        return result;
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
//# sourceMappingURL=parser.js.map