export type RunCodeResult = {
  stdout: string;
  stderr: string;
  status: string;
  time: number | null;
  memory: number | null;
  judge0LanguageId?: number | null;
};
