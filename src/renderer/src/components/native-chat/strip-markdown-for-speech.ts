/** Strips the markdown syntax that reads worst aloud (fences, headings,
 *  emphasis markers, link/image brackets) before handing text to
 *  speechSynthesis. Not a full markdown parser — good enough that a
 *  read-aloud pass doesn't narrate backticks and hash signs. */
export function stripMarkdownForSpeech(markdown: string): string {
  return markdown
    .replace(/```[^\n]*\n?/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^-{3,}\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
