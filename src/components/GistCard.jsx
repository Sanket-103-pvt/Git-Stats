import { useState } from "react";
import { Check, Copy, MessageSquare, FileText } from "lucide-react";

function GistSkeleton({ index = 0 }) {
  return (
    <div
      style={{ animationDelay: `${index * 0.05}s` }}
      className="panel p-5 animate-pulse animate-fade-in-up opacity-0"
    >
      <div className="h-5 w-1/2 rounded bg-[var(--gs-surface-alt)]" />
      <div className="mt-4 h-4 w-full rounded bg-[var(--gs-surface-alt)]" />
      <div className="mt-2 h-4 w-5/6 rounded bg-[var(--gs-surface-alt)]" />
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-20 rounded bg-[var(--gs-surface-alt)]" />
        <div className="h-6 w-24 rounded-full bg-[var(--gs-surface-alt)]" />
      </div>
    </div>
  );
}

function GistCard({ gist, loading, index = 0 }) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return <GistSkeleton index={index} />;
  }

  if (!gist) {
    return null;
  }

  const handleCopyCloneUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(gist.html_url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Ignore copy failure
      });
  };

  const files = Object.keys(gist.files || {});
  const firstFileName = files[0] || "gist";
  const language = gist.files?.[firstFileName]?.language;

  return (
    <article
      style={{ animationDelay: `${index * 0.05}s` }}
      className="panel p-5 transition-all duration-200 hover:border-[var(--gs-accent)]/65 hover:bg-[var(--gs-bg)] hover:-translate-y-[2px] animate-fade-in-up opacity-0"
    >
      <div className="flex items-start justify-between gap-4">
        <a
          href={gist.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--gs-accent)] transition hover:brightness-110 flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {firstFileName}
        </a>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--gs-text)]">
            {language || "Unknown"}
          </span>
        </div>
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-6 text-[var(--gs-text-secondary)] line-clamp-3">
        {gist.description || "No description provided."}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--gs-border)] pt-4 text-sm text-[var(--gs-text-secondary)]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-[var(--gs-text-secondary)]" />
            {gist.comments || 0}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-[var(--gs-text-secondary)]" />
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={handleCopyCloneUrl}
            title="Copy URL"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--gs-text-secondary)] hover:text-[var(--gs-accent)] transition-colors p-1 rounded hover:bg-[var(--gs-surface-alt)]"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[var(--gs-success)]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>
        {gist.public ? null : (
          <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">
            Secret
          </span>
        )}
      </div>
    </article>
  );
}

export default GistCard;
