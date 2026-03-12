export interface WikiHtml {
    readonly value: string
}

export class BacklogWikiParser {
    public convertToHtml(rawText: string): WikiHtml {
        const lines = rawText.split(/\r?\n/)
        const htmlLines: string[] = []
        let inCodeBlock = false
        let inUnorderedList = false
        let inOrderedList = false
        let inTable = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            if (line.match(/^\{code.*\}$/)) {
                inCodeBlock = true
                htmlLines.push('<pre><code>')
                continue
            }
            if (line.match(/^\{\/code\}$/)) {
                inCodeBlock = false
                htmlLines.push('</code></pre>')
                continue
            }
            if (inCodeBlock) {
                htmlLines.push(this.escapeHtml(line))
                continue
            }

            if (line.match(/^-{4,}$/)) {
                htmlLines.push('<hr>')
                continue
            }

            if (line.startsWith('>')) {
                htmlLines.push(`<blockquote>${this.parseInline(line.substring(1).trim())}</blockquote>`)
                continue
            }

            const tableMatch = line.match(/^\|(.*)\|([hH])?$/)
            if (tableMatch) {
                if (!inTable) {
                    htmlLines.push('<table>')
                    inTable = true
                }
                const isHeader = !!tableMatch[2]
                const content = tableMatch[1]
                const cells = content.split('|')
                const tag = isHeader ? 'th' : 'td'

                htmlLines.push('<tr>')
                cells.forEach(cell => {
                    htmlLines.push(`<${tag}>${this.parseInline(cell.trim())}</${tag}>`)
                })
                htmlLines.push('</tr>')

                const nextLine = lines[i + 1];
                if (!nextLine || !nextLine.startsWith('|')) {
                    htmlLines.push('</table>')
                    inTable = false
                }
                continue
            }

            const headingMatch = line.match(/^(\*{1,5})\s+(.*)$/);
            if (headingMatch) {
                const level = headingMatch[1].length
                htmlLines.push(`<h${level}>${this.parseInline(headingMatch[2])}</h${level}>`)
                continue
            }

            const orderedListMatch = line.match(/^(\+{1,3})\s+(.*)$/)
            if (orderedListMatch) {
                if (!inOrderedList) {
                    htmlLines.push('<ol>')
                    inOrderedList = true
                }
                htmlLines.push(`<li>${this.parseInline(orderedListMatch[2])}</li>`)

                const nextLine = lines[i + 1]
                if (!nextLine || !nextLine.match(/^\+{1,3}\s+/)) {
                    htmlLines.push('</ol>')
                    inOrderedList = false
                }
                continue
            }

            const unorderedListMatch = line.match(/^(-{1,3})\s+(.*)$/)
            if (unorderedListMatch) {
                if (!inUnorderedList) {
                    htmlLines.push('<ul>')
                    inUnorderedList = true
                }
                htmlLines.push(`<li>${this.parseInline(unorderedListMatch[2])}</li>`)

                const nextLine = lines[i + 1]
                if (!nextLine || !nextLine.match(/^-{1,3}\s+/)) {
                    htmlLines.push('</ul>')
                    inUnorderedList = false
                }
                continue
            }

            if (line.trim() === '') {
                htmlLines.push('<br>')
            } else {
                htmlLines.push(this.parseInline(line))
            }
        }

        return { value: htmlLines.join('') }
    }

    private parseInline(text: string): string {
        let result = this.escapeHtml(text)

        result = result.replace(/&#039;&#039;&#039;(.+?)&#039;&#039;&#039;/g, '<em>$1</em>')
        result = result.replace(/&#039;&#039;(.+?)&#039;&#039;/g, '<strong>$1</strong>')

        result = result.replace(/%%(.+?)%%/g, '<del>$1</del>')

        result = result.replace(/\[\[(.+?):((?:https?|ftp):\/\/.+?)\]\]/g, '<a href="$2">$1</a>')
        result = result.replace(/\[\[((?:https?|ftp):\/\/.+?)\]\]/g, '<a href="$1">$1</a>')
        result = result.replace(/\[\[(.+?)\]\]/g, '<a href="$1">$1</a>')

        return result
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }
}
