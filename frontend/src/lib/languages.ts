export type Language =
  | "bash"
  | "c"
  | "cpp"
  | "csharp"
  | "go"
  | "java"
  | "kotlin"
  | "nodejs"
  | "php"
  | "python"
  | "ruby"
  | "rust"
  | "swift"
  | "typescript";

export type LanguageMeta = {
  label: string;
  badgeLabel: string;
  monacoLanguage: string;
  extension: string;
};

export const LANGUAGE_CATALOG: Record<Language, LanguageMeta> = {
  bash: {
    label: "Bash",
    badgeLabel: "Bash",
    monacoLanguage: "shell",
    extension: ".sh",
  },
  c: {
    label: "C",
    badgeLabel: "C",
    monacoLanguage: "c",
    extension: ".c",
  },
  cpp: {
    label: "C++",
    badgeLabel: "C++",
    monacoLanguage: "cpp",
    extension: ".cpp",
  },
  csharp: {
    label: "C#",
    badgeLabel: "C#",
    monacoLanguage: "csharp",
    extension: ".cs",
  },
  go: {
    label: "Go",
    badgeLabel: "Go",
    monacoLanguage: "go",
    extension: ".go",
  },
  java: {
    label: "Java",
    badgeLabel: "Java",
    monacoLanguage: "java",
    extension: ".java",
  },
  kotlin: {
    label: "Kotlin",
    badgeLabel: "Kotlin",
    monacoLanguage: "kotlin",
    extension: ".kt",
  },
  nodejs: {
    label: "JavaScript (Node.js)",
    badgeLabel: "JavaScript",
    monacoLanguage: "javascript",
    extension: ".js",
  },
  php: {
    label: "PHP",
    badgeLabel: "PHP",
    monacoLanguage: "php",
    extension: ".php",
  },
  python: {
    label: "Python",
    badgeLabel: "Python",
    monacoLanguage: "python",
    extension: ".py",
  },
  ruby: {
    label: "Ruby",
    badgeLabel: "Ruby",
    monacoLanguage: "ruby",
    extension: ".rb",
  },
  rust: {
    label: "Rust",
    badgeLabel: "Rust",
    monacoLanguage: "rust",
    extension: ".rs",
  },
  swift: {
    label: "Swift",
    badgeLabel: "Swift",
    monacoLanguage: "swift",
    extension: ".swift",
  },
  typescript: {
    label: "TypeScript",
    badgeLabel: "TypeScript",
    monacoLanguage: "typescript",
    extension: ".ts",
  },
};

export const PROJECT_LANGUAGE_OPTIONS = Object.entries(LANGUAGE_CATALOG).map(
  ([value, meta]) => ({
    value: value as Language,
    label: meta.label,
  })
);
