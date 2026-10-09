import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

function git(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) {
    throw new Error(`无法运行 Git：${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} 执行失败`);
  }
  return result.stdout.trimEnd();
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function writeJson(path, value) {
  writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) throw new Error(`不支持的版本号：${value}`);
  return match.slice(1).map(Number);
}

function bumpVersion(version, level) {
  const [major, minor, patch] = parseVersion(version);
  if (level === "major") return `${major + 1}.0.0`;
  if (level === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function parseCommits(raw) {
  const commits = raw
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const separator = record.indexOf("\0");
      if (separator < 0) throw new Error("无法解析 Git 提交记录。");
      return {
        subject: record.slice(0, separator).trim(),
        body: record.slice(separator + 1).trim(),
      };
    });

  const parsed = commits.map((commit) => {
    if (/^chore\(release\):/i.test(commit.subject)) return null;
    const match = /^([a-z][a-z0-9-]*)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i.exec(commit.subject);
    if (!match) {
      throw new Error(`提交信息不符合 Conventional Commits：\n  ${commit.subject}`);
    }

    const [, type, scope, breakingMark, description] = match;
    const breakingNote = commit.body.match(/^BREAKING CHANGE:\s*(.+(?:\n(?![A-Z][A-Z -]*:).+)*)/im)?.[1];
    return {
      type: type.toLowerCase(),
      scope,
      description: description.trim(),
      breaking: Boolean(breakingMark || breakingNote),
      breakingNote: breakingNote?.replace(/\s+/g, " ").trim(),
    };
  }).filter(Boolean);

  if (parsed.length === 0) throw new Error("基线标签之后没有可发布的 Conventional Commits 提交。");
  return parsed;
}

function releaseLevel(commits) {
  if (commits.some((commit) => commit.breaking)) return "major";
  if (commits.some((commit) => commit.type === "feat")) return "minor";
  return "patch";
}

function category(commit) {
  if (commit.breaking) return "Breaking Changes";
  if (commit.type === "feat") return "Added";
  if (commit.type === "fix") return "Fixed";
  if (commit.type === "perf") return "Performance";
  return "Changed";
}

function formatCommit(commit) {
  const label = commit.scope ? `**${commit.scope}:** ` : "";
  const note = commit.breakingNote ? `（${commit.breakingNote}）` : "";
  return `- ${label}${commit.description}${note}`;
}

function shanghaiDate() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function makeEntry(version, commits) {
  const groups = new Map();
  for (const commit of commits) {
    const key = category(commit);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(formatCommit(commit));
  }
  const order = ["Breaking Changes", "Added", "Fixed", "Changed", "Performance"];
  const sections = order
    .filter((key) => groups.has(key))
    .map((key) => `### ${key}\n\n${groups.get(key).join("\n")}`);
  return `## [${version}] - ${shanghaiDate()}\n\n${sections.join("\n\n")}`;
}

function insertEntry(changelog, entry) {
  const lines = changelog.trimEnd().split(/\r?\n/);
  const firstRelease = lines.findIndex((line) => line.startsWith("## ["));
  const insertion = firstRelease >= 0 ? firstRelease : lines.length;
  lines.splice(insertion, 0, entry, "");
  return `${lines.join("\n")}\n`;
}

try {
  const repoRoot = resolve(git(["rev-parse", "--show-toplevel"]));
  if (repoRoot !== root) {
    throw new Error("请从项目根目录仓库运行发布脚本；当前项目目录不是 Git 仓库根目录。");
  }
  if (git(["status", "--porcelain"])) {
    throw new Error("工作区有未提交改动。请先提交改动，再生成版本日志。");
  }

  const tags = git(["tag", "--list", "v[0-9]*", "--sort=-version:refname"])
    .split(/\r?\n/)
    .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag));
  if (tags.length === 0) {
    throw new Error("找不到版本基线标签。请先提交当前 1.0.0 版本，再运行：git tag v1.0.0");
  }

  const current = readJson("package.json").version;
  const baseline = tags[0].slice(1);
  if (current !== baseline) {
    throw new Error(`package.json 版本为 ${current}，最新版本标签为 v${baseline}。请先对齐版本基线。`);
  }

  const commits = parseCommits(git(["log", `${tags[0]}..HEAD`, "--no-merges", "--format=%s%x00%b%x1e"]));
  const next = bumpVersion(current, releaseLevel(commits));
  const entry = makeEntry(next, commits);

  if (dryRun) {
    process.stdout.write(`版本预览：${current} → ${next}\n\n${entry}\n`);
    process.exitCode = 0;
  } else {
    const rootPackage = readJson("package.json");
    const rootLock = readJson("package-lock.json");
    const uiPackage = readJson("ui-draft/package.json");
    const uiLock = readJson("ui-draft/package-lock.json");
    const mygoConfigPath = resolve(root, "mygo.config.ts");
    const mygoConfig = readFileSync(mygoConfigPath, "utf8");
    const versionMatches = [...mygoConfig.matchAll(/\bversion\s*:\s*"([^"]+)"/g)];
    if (versionMatches.length !== 1) {
      throw new Error("无法唯一定位 mygo.config.ts 中的版本号。");
    }
    const changelogPath = resolve(root, "CHANGELOG.md");
    const changelog = readFileSync(changelogPath, "utf8");

    rootPackage.version = next;
    rootLock.version = next;
    rootLock.packages[""].version = next;
    uiPackage.version = next;
    uiLock.version = next;
    uiLock.packages[""].version = next;

    writeJson("package.json", rootPackage);
    writeJson("package-lock.json", rootLock);
    writeJson("ui-draft/package.json", uiPackage);
    writeJson("ui-draft/package-lock.json", uiLock);
    writeFileSync(mygoConfigPath, mygoConfig.replace(/(\bversion\s*:\s*")[^"]+("\s*,)/, `$1${next}$2`), "utf8");
    writeFileSync(changelogPath, insertEntry(changelog, entry), "utf8");
    process.stdout.write(`已更新版本：${current} → ${next}\n已同步更新版本清单、锁文件、MyGo 配置和 CHANGELOG.md。\n`);
  }
} catch (error) {
  process.stderr.write(`发布流程未完成：${error.message}\n`);
  process.exitCode = 1;
}
