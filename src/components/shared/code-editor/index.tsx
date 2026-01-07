import Editor, { type OnChange } from "@monaco-editor/react";
import { useTheme } from "~/context/ThemeContext";

interface CodeEditorProps {
  code: string;
  language?: string;
  onCodeChange: (newCode: string) => void;
  readonly: boolean;
}

const languageMap: Record<string, string> = {
  go: "go",
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  cpp: "cpp",
  json: "json",
};

export default function CodeEditor({
  code,
  language = "plaintext",
  onCodeChange,
  readonly,
}: CodeEditorProps) {
  const handleChange: OnChange = (value) => {
    onCodeChange(value || "");
  };
  const { theme } = useTheme();

  return (
    <Editor
      height="100%"
      language={languageMap[language] || "plaintext"}
      value={code}
      onChange={handleChange}
      theme={theme === "light" ? "vs-light" : "vs-dark"}
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        readOnly: readonly,
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
