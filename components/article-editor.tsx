"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface ArticleEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function ArticleEditor({ value, onChange, placeholder }: ArticleEditorProps) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`px-3 py-1 text-sm rounded-md ${
            !preview ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`px-3 py-1 text-sm rounded-md ${
            preview ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Preview
        </button>
      </div>

      {preview ? (
        <div className="min-h-[300px] p-4 border rounded-md prose">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="text-muted-foreground">No content to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Write your article content here..."}
          className="min-h-[300px] font-mono"
        />
      )}

      <div className="text-xs text-muted-foreground">
        <p>You can use HTML tags for formatting:</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <li>
            <code>&lt;p&gt;</code> for paragraphs
          </li>
          <li>
            <code>&lt;h1&gt;-&lt;h6&gt;</code> for headings
          </li>
          <li>
            <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code> for lists
          </li>
          <li>
            <code>&lt;img&gt;</code> for images
          </li>
          <li>
            <code>&lt;a&gt;</code> for links
          </li>
          <li>
            <code>&lt;blockquote&gt;</code> for quotes
          </li>
        </ul>
      </div>
    </div>
  )
}
