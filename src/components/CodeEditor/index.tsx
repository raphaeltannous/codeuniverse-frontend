import { useState } from "react";
import Editor, { type OnChange } from "@monaco-editor/react";

interface CodeEditorOptions {
  codeSnippet?: string;
  language?: string;
}


export default function CodeEditor({
  codeSnippet = "// golang",
  language = "go",
}: CodeEditorOptions) {
  const [code, setCode] = useState(codeSnippet);

  const handleChange: OnChange = (value) => {
    setCode(value || "");
  }

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      value={code}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
      }}
      />
  )
}
