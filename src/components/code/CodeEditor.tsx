"use client";

import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

/**
 * C code editor (CodeMirror 6). The dark one-dark-ish palette echoes the
 * app's slate tokens; this is the editor's own CSS (not Tailwind classes).
 */

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#0f172a",
      color: "#e2e8f0",
      fontSize: "13px",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-gutters": {
      backgroundColor: "#0f172a",
      color: "#64748b",
      border: "none",
      borderRight: "1px solid #1e293b",
    },
    ".cm-activeLine": { backgroundColor: "#1e293b59" },
    ".cm-activeLineGutter": { backgroundColor: "#1e293b", color: "#e2e8f0" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "#4f46e555",
    },
    ".cm-cursor": { borderLeftColor: "#818cf8" },
    ".cm-content": { fontFamily: "var(--font-mono)" },
  },
  { dark: true },
);

const cHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#c678dd" },
  { tag: [tags.controlKeyword, tags.moduleKeyword], color: "#c678dd" },
  { tag: tags.string, color: "#98c379" },
  { tag: tags.character, color: "#98c379" },
  { tag: tags.number, color: "#d19a66" },
  { tag: tags.comment, color: "#7f848e", fontStyle: "italic" },
  { tag: tags.function(tags.variableName), color: "#61afef" },
  { tag: tags.typeName, color: "#e5c07b" },
  { tag: tags.standard(tags.variableName), color: "#61afef" },
  { tag: [tags.operator, tags.operatorKeyword], color: "#56b6c2" },
  { tag: [tags.bracket, tags.punctuation], color: "#abb2bf" },
  { tag: tags.definition(tags.variableName), color: "#e06c75" },
  { tag: tags.null, color: "#d19a66" },
]);

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  /** Accessible name for the editor region. */
  label: string;
  minHeight?: number;
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  label,
  minHeight = 240,
}: CodeEditorProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-surface"
      role="group"
      aria-label={label}
    >
      <CodeMirror
        value={value}
        height={`${minHeight}px`}
        theme={editorTheme}
        extensions={[cpp(), syntaxHighlighting(cHighlight)]}
        readOnly={readOnly}
        aria-label={label}
        {...(onChange && !readOnly ? { onChange } : {})}
      />
    </div>
  );
}
