import Editor, { type OnChange } from "@monaco-editor/react";
import { useTheme } from "~/context/ThemeContext";

interface CodeEditorProps {
  code: string;
  language?: string;
  onCodeChange: (newCode: string) => void;
  readonly: boolean;
  resizable?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

const languageMap: Record<string, string> = {
  go: "go",
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  cpp: "cpp",
  json: "json",
  ruby: "ruby",
  java: "java",
};

export default function CodeEditor({
  code,
  language = "plaintext",
  onCodeChange,
  readonly,
  resizable = false,
  minHeight = "300px",
  maxHeight = "1000px",
}: CodeEditorProps) {
  const handleChange: OnChange = (value) => {
    onCodeChange(value || "");
  };
  const { theme } = useTheme();

  return (
    <div
      style={{
        height: "100%",
        resize: resizable ? "vertical" : "none",
        overflow: "auto",
        minHeight: resizable ? minHeight : undefined,
        maxHeight: resizable ? maxHeight : undefined,
      }}
    >
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
    </div>
  );
}
