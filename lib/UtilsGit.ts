import { execFileSync } from "node:child_process";

/**
 * Utility functions for working with Git.
 * @module Git
 */

export interface RefreshGitIndexOptions {
  /**
   * Working directory in which to run the git commands.
   * Defaults to the current working directory of the process.
   */
  cwd?: string;
}

export interface RefreshGitIndexResult {
  /**
   * Whether the working tree still has real differences after the refresh.
   * `false` means the index and the working tree content are identical.
   */
  hasRealChanges: boolean;
  /**
   * Trimmed output of `git status --short`.
   * An empty string when there are no real differences.
   */
  status: string;
}

/**
 * Refreshes the Git index stat cache and reports the remaining real differences.
 *
 * Formatters such as Prettier or oxfmt rewrite files in write mode, which updates
 * the file inode/ctime even when the content is unchanged. Git's stat cache then
 * becomes stale and `git status` falsely reports those files as modified.
 * Running `git update-index --refresh` re-checks the stat information: files with
 * identical content have their flags cleared automatically, while files with
 * real content changes are kept and reported by `git status --short`.
 *
 * Note: `git update-index --refresh` exits with a non-zero status when real
 * differences exist; that exit code is intentionally ignored because the
 * subsequent `git status --short` reports the details.
 *
 * @category Git
 * @param options - Options for the refresh operation.
 * @param options.cwd - Working directory in which to run the git commands. Defaults to `process.cwd()`.
 * @returns An object describing whether real differences remain and the raw short status output.
 *
 * @example
 * import { refreshGitIndex } from "nsuite";
 *
 * // After running formatters in write mode
 * const { hasRealChanges, status } = refreshGitIndex();
 * if (hasRealChanges) {
 *   console.log("Remaining real changes:");
 *   console.log(status);
 * } else {
 *   console.log("Working tree content matches the index, no real changes.");
 * }
 *
 * @example
 * import { refreshGitIndex } from "nsuite";
 *
 * // Target a specific repository directory
 * const result = refreshGitIndex({ cwd: "/path/to/repo" });
 */
export function refreshGitIndex(
  options?: RefreshGitIndexOptions,
): RefreshGitIndexResult {
  const execGit = (args: string[]): string =>
    execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      cwd: options?.cwd,
    }).toString();

  try {
    execGit(["update-index", "--refresh"]);
  } catch {
    // Git exits non-zero when real differences exist; the status call below reports them.
  }

  const status = execGit(["status", "--short"]).trim();
  return {
    hasRealChanges: status.length > 0,
    status,
  };
}
