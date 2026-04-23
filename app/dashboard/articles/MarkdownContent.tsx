"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="article-markdown-body">
      <style dangerouslySetInnerHTML={{ __html: `
        /* We use inheritance and currentcolor to support both dark/light mode automatically */
        .article-markdown-body {
          line-height: 1.8 !important;
          font-size: 1.125rem !important;
          width: 100% !important;
          max-width: 100% !important;
          word-wrap: break-word !important;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
          /* Explicitly NOT setting a top-level color to allow inheritance from layout */
        }

        .article-markdown-body h1,
        .article-markdown-body h2,
        .article-markdown-body h3,
        .article-markdown-body h4 {
          font-family: Georgia, serif !important;
          color: currentColor !important;
          margin-top: 2.5rem !important;
          margin-bottom: 1.25rem !important;
          display: block !important;
          line-height: 1.25 !important;
          font-weight: 800 !important;
        }

        .article-markdown-body h1 { font-size: 2.5rem !important; margin-top: 0 !important; }
        .article-markdown-body h2 { font-size: 2rem !important; border-bottom: 2px solid currentColor !important; padding-bottom: 0.5rem !important; border-opacity: 0.2; }
        .article-markdown-body h3 { font-size: 1.5rem !important; }

        .article-markdown-body h2 {
          border-bottom: 1px solid rgba(120, 113, 108, 0.2) !important;
        }

        .article-markdown-body p {
          display: block !important;
          margin-bottom: 1.5rem !important;
          color: currentColor !important;
          opacity: 0.9; /* Slightly softer than headings */
        }

        .article-markdown-body strong {
          font-weight: 700 !important;
          color: currentColor !important;
          filter: brightness(1.2);
        }

        .article-markdown-body ul,
        .article-markdown-body ol {
          display: block !important;
          margin-bottom: 1.5rem !important;
          padding-left: 1.5rem !important;
          color: currentColor !important;
        }

        .article-markdown-body ul { list-style-type: disc !important; }
        .article-markdown-body ol { list-style-type: decimal !important; }

        .article-markdown-body li {
          display: list-item !important;
          margin-bottom: 0.5rem !important;
        }

        .article-markdown-body blockquote {
          display: block !important;
          border-left: 4px solid #d97706 !important;
          margin: 2rem 0 !important;
          padding: 1.25rem 1.75rem !important;
          background: rgba(251, 191, 36, 0.1) !important;
          border-radius: 0.25rem 0.75rem 0.75rem 0.25rem !important;
          font-style: italic !important;
          color: currentColor !important;
        }

        .article-markdown-body hr {
          display: block !important;
          border: 0 !important;
          border-top: 1px solid rgba(120, 113, 108, 0.2) !important;
          margin: 3rem 0 !important;
        }

        .article-markdown-body a {
          color: #d97706 !important;
          text-decoration: underline !important;
        }

        .article-markdown-body code {
          background: rgba(120, 113, 108, 0.1) !important;
          padding: 0.2rem 0.4rem !important;
          border-radius: 0.25rem !important;
          font-family: monospace !important;
          font-size: 0.9em !important;
        }
      ` }} />
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
