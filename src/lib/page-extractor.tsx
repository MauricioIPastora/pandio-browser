/**
 * Extracts readable content from a webpage.
 * This script runs inside the webview context.
 */
export const PAGE_EXTRACTION_SCRIPT = `
(function() {
  // Get the page title
  const title = document.title || '';
  
  // Get meta description
  const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
  
  // Get the main content - prioritize semantic elements
  const contentSelectors = [
    'main',
    'article', 
    '[role="main"]',
    '.content',
    '#content',
    '.post',
    '.article'
  ];
  
  let mainContent = '';
  for (const selector of contentSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      mainContent = el.innerText;
      break;
    }
  }
  
  // Fallback to body text if no semantic content found
  if (!mainContent) {
    mainContent = document.body.innerText;
  }
  
  // Clean up the text - remove excessive whitespace
  mainContent = mainContent
    .replace(/\\s+/g, ' ')
    .replace(/\\n\\s*\\n/g, '\\n')
    .trim();
  
  // Limit content length to avoid token limits (roughly 4 chars per token)
  const maxLength = 8000; // ~2000 tokens
  if (mainContent.length > maxLength) {
    mainContent = mainContent.substring(0, maxLength) + '... [content truncated]';
  }
  
  // Get selected text if any (user might have highlighted something specific)
  const selectedText = window.getSelection()?.toString() || '';
  
  return {
    url: window.location.href,
    title: title,
    description: metaDesc,
    content: mainContent,
    selectedText: selectedText
  };
})();
`;

export interface PageContent {
  url: string;
  title: string;
  description: string;
  content: string;
  selectedText: string;
}

/**
 * Extracts content from an Electron webview
 */
export async function extractPageContent(
  webview: Electron.WebviewTag
): Promise<PageContent | null> {
  try {
    const result = await webview.executeJavaScript(PAGE_EXTRACTION_SCRIPT);
    return result as PageContent;
  } catch (error) {
    console.error("Failed to extract page content:", error);
    return null;
  }
}
