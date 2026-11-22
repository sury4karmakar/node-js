# NOTES_RULE

Instructions for any AI tool (Claude, Gemini, Codex, etc.) that writes learning notes for this Node.js project.
Follow this file exactly. Do not invent another format, add extra sections, or change headings, even if you think another format is better. Every tool and every session must produce the same output.

---

## 1. How the user calls this file

The prompt is free-form. It always starts with `@NOTES_RULE.md`, followed by a target. The target can be any file, any code block or topic, or git. Do not match the prompt against fixed examples. Work out the mode and the target from the rules below.

**Prompt pattern:**

```
@NOTES_RULE.md - <target> [- <topic>] [detail words]
```

| Part         | What it can be                                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<target>`   | Any file (`@<any-file>`), pasted code, or the word `git` for the current git changes.                                                                                              |
| `<topic>`    | Optional. Any function, method, class, object, or code block name inside the target (for example `<function>`, `<object>.<method>`). If missing, cover all new code in the target. |
| detail words | Optional. If the prompt contains "detail" or "detailed" anywhere, use detailed mode.                                                                                               |

**Examples (placeholders, not fixed values):**

| Prompt                                               | Meaning                                     |
| ---------------------------------------------------- | ------------------------------------------- |
| `@NOTES_RULE.md - @<file> - <topic>`                 | Basic note for `<topic>` in `<file>`.       |
| `@NOTES_RULE.md - @<file>`                           | Basic notes for all new code in `<file>`.   |
| `@NOTES_RULE.md - git`                               | Basic notes for the current git changes.    |
| `@NOTES_RULE.md - detailed note for <topic> @<file>` | Detailed note for `<topic>` in `<file>`.    |
| `@NOTES_RULE.md - detailed - git`                    | Detailed notes for the current git changes. |

The wording and order of the prompt can vary. Read the intent.

- **Mode:** basic by default. Use detailed mode only when the prompt contains "detail" or "detailed".
- **Target:** a file, a topic inside a file, pasted code, or the current git changes.
- If the target is unclear, ask one short question. Otherwise do not ask questions.

---

## 2. What counts as new code

Write notes only for code that has no note yet.

**For a code block or file:**

1. List the existing topics with `grep -H "^## " docs/*.md` (for detailed mode, `docs/detailed-*.md`; for basic mode, ignore the `detailed-` files and `NOTES_RULE.md`). Do not read note bodies.
2. A topic already has a note if a heading for the same function, class, object, method or import exists in any file. If so, skip it.

**For git changes ("current change"):**

1. Run `git diff HEAD` for modified files and `git ls-files --others --exclude-standard` for new files.
2. Use only added lines (`+` lines). For new untracked files, all lines count as added.
3. Ignore removed lines, whitespace-only changes, and files in `docs/`.
4. Then apply the "already has a note" check above.

**Always skip:**

- Topics that already have a note. Never rewrite, reorder, or edit an existing section.
- Trivial `console.log` calls, unless the user asks for them by name.
- Comments and blank lines.

If an existing note looks outdated because the code changed, do not edit it. Mention it in your final reply.

---

## 3. Where to write

All notes go in the `docs/` folder at the project/docs. Create the folder if it does not exist.

| Mode                | File                        |
| ------------------- | --------------------------- |
| Basic               | `docs/<module>.md`          |
| Detailed            | `docs/detailed-<module>.md` |
| Basic, no module    | `docs/common.md`            |
| Detailed, no module | `docs/detailed-common.md`   |

**Choosing `<module>`:**

- Use the module or library the code works with, in lowercase kebab-case: `http`, `fs`, `path`, `express`, `router`, `error-middleware`.
- Built-ins used as part of that module's code (for example `JSON.stringify` inside a request handler) go in that module's file, in the order they appear in the code.
- Code that uses no module (plain JavaScript logic, helpers) goes in `common.md`. There is only one common file per mode.
- One module = one file. Never create a second file for the same module.

**Adding to an existing file:**

- Append new topics at the end, in the order they appear in the code.
- Put `---` on its own line between topics. Do not put `---` after the last topic.
- Do not change anything above the new topics. (Exception: in detailed files, see "Flow section" in section 5.)

**Creating a new file:** the first line is `# <Module Title>` for basic or `# <Module Title> (Detailed)` for detailed, followed by a blank line, then the first topic.

---

## 4. Basic note template

One topic is one section. Include only the lines that apply to the topic.

````markdown
## `topicName`

```js
// the code, copied from the project
```

**What it does:** One or two plain sentences.

**Parameter(s):**

| Param  | Type | Description |
| ------ | ---- | ----------- |
| `name` | type | What it is. |

**Returns:** type and what it holds.

**In this code:** What this exact usage does.
````

Rules:

- Heading: the function, class, method, or object name in backticks. Use `Importing the module` for an import or `require` line.
- Use the label `**Parameter:**` for one parameter and `**Parameters:**` for several.
- For a callback, add a second table with the columns `Arg | Class | What it is`.
- For a class or object, describe the class and list the properties or methods the code uses, as a table (`Property | Type | Description`).
- Leave out `Parameter(s)` for code with none, and leave out `Returns` for code that returns nothing.
- Keep it short and simple. No long explanations.

---

## 5. Detailed note template

Use this only in detailed mode. Same sections as basic, with more depth:

````markdown
## `topicName`

```js
// the code, copied from the project
```

**What it does:** Full explanation, including what happens if it is not called or used wrongly.

**Signature:** `module.function([optional][, required])`

| Param  | Type | Required | Description                           |
| ------ | ---- | -------- | ------------------------------------- |
| `name` | type | Yes/No   | What it is, defaults, allowed values. |

**Returns:** type and what it holds.

**How it works internally:**

1. Step.
2. Step.

### The `object` object

- **Class:** class name and what it extends.
- **Created by:** who creates it.

| Property      | Type | Description |
| ------------- | ---- | ----------- |
| `object.prop` | type | What it is. |

| Method                | Description   |
| --------------------- | ------------- |
| `object.method(args)` | What it does. |

**Behavior in this code:**

- Bullet points about this exact usage.

**Notes:**

- Errors it can raise, edge cases, common mistakes.
````

Rules:

- Use the same heading, code block and label order as above. Include only the parts that apply to the topic.
- Add the `Required` column to every parameter table.
- Show the function signature with square brackets for optional parts.
- Include the error code or event name when a failure can happen (for example `EADDRINUSE`).
- Name the object classes and their parents (for example `http.IncomingMessage`).
- Mention related methods that the code does not use only in one short line, and mark them as "listed for reference".

**Flow section (detailed files only):**

- At the very end of a detailed file, keep one section `## <Short title> flow in this code` (for example `## Request flow in this code`).
- It is a numbered list of what happens from start to finish when the code runs, then one short paragraph for notable side effects.
- When new topics are added to the file, insert them before this section and update this section to include the new steps. This is the only edit allowed to existing content.
- Skip the flow section if the file has no multi-step flow yet.

---

## 6. Style rules (both modes)

- English only. Simple words. No jokes, emojis, or filler.
- Describe what the code does. Do not give opinions or suggest rewrites. (A "Notes" bullet about a real mistake or limitation is allowed in detailed mode.)
- No extras: no exercises, quizzes, takeaways, summaries, links, or "next steps".
- Use the same names as the code. Wrap code names in backticks.
- Copy code snippets exactly from the project. Do not fix or reformat them. If the snippet is long, copy only the relevant lines.
- Markdown only. Tables use the `| --- |` style shown above. One blank line between blocks.
- Never create files other than the ones listed in section 3.

---

## 7. Steps to follow

1. Read this whole file.
2. Read the target code and decide the mode (section 1).
3. List the topics in the target. Remove the ones that already have a note (section 2).
4. Pick the file for each remaining topic (section 3).
5. Write the sections using the template for the mode (sections 4 and 5), appended in code order with `---` between topics.
6. Reply with a short summary only:
   - **Added:** the topics and the file each went to.
   - **Skipped:** the topics that already had a note.
   - **Possibly outdated:** existing notes that no longer match the code (if any).

   Do not paste the notes into the reply.

---
