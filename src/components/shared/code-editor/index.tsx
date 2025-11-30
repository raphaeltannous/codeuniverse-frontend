import Editor, { type OnChange } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  language?: string;
    onCodeChange: (newCode: string) => void;
}

const languageMap: Record<string, string> = {
  golang: "go",
  python3: "python",
  javascript: "javascript",
  typescript: "typescript",
  cpp: "cpp",
};

export default function CodeEditor({
  code,
  language = "plaintext",
  onCodeChange,
}: CodeEditorProps) {
  const handleChange: OnChange = (value) => {
    onCodeChange(value || "");
  };

  return (
    <Editor
      height="100%"
      language={languageMap[language] || "plaintext"}
      value={code}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
