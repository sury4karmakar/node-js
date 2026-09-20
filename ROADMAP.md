# Node.js Core Backend Roadmap — Zero Frameworks

> **Scope:** Core Node.js only. No Express, Fastify, Koa, Nest, Prisma, ORMs, or any framework.
> A handful of *libraries* appear only in Phase 7+ and are clearly marked **OPTIONAL** — and only after you can build the same thing by hand.
>
> **Built for:** someone comfortable with modern JavaScript (destructuring, closures, array methods, modules, promises, `async/await`).
> **Pace assumption:** 7–10 hrs/week → the schedule in [Section 4](#4-the-18-week-schedule) runs 18 weeks.
> **Target runtime:** Node.js v24.x (your machine: `v24.13.1`, npm `11.19.0`). Version-specific features are flagged with their minimum version.

---

## Table of Contents

**Foundations**

1. [How To Use This File](#1-how-to-use-this-file)
2. [The 5 Ground Rules](#2-the-5-ground-rules)
3. [The Node Mental Model (read this twice)](#3-the-node-mental-model)

**The Learning Path** — read in order, top to bottom

- [Phase 0 — JS Pre-Flight Checklist](#phase-0--js-pre-flight-checklist-23-hrs) — 2–3 hrs
- [Phase 1 — The Runtime, `process`, and the CLI](#phase-1--the-runtime-process-and-the-cli) — 1 week
- [Phase 2 — Modules, npm, and Project Layout](#phase-2--modules-npm-and-project-layout) — 2 weeks
- [Phase 3 — The Event Loop and Async Mastery](#phase-3--the-event-loop-and-async-mastery) — 2 weeks ← **the most important phase**
- [Phase 4 — Events, Streams, Workers, Child Processes](#phase-4--events-streams-workers-child-processes) — 3 weeks
- [Phase 5 — Networking: `net` and `http` From Scratch](#phase-5--networking-net-and-http-from-scratch) — 2 weeks
- [Phase 6 — Build a REST API With Zero Dependencies](#phase-6--build-a-rest-api-with-zero-dependencies) — 2 weeks
- [Phase 7 — Persistence and the Data Layer](#phase-7--persistence-and-the-data-layer) — 1.5 weeks
- [Phase 8 — Testing, Debugging, Quality](#phase-8--testing-debugging-quality) — 1.5 weeks
- [Phase 9 — Production Hardening and Observability](#phase-9--production-hardening-and-observability) — 2 weeks
- [Phase 10 — Capstone Projects](#phase-10--capstone-projects)

**Reference**

4. [The 18-Week Schedule](#4-the-18-week-schedule)
5. [Common Traps and Anti-Patterns](#5-common-traps-and-anti-patterns)
6. [Resources Worth Your Time](#6-resources-worth-your-time)
7. [Graduation Checklist: Are You Ready For A Framework?](#7-graduation-checklist-are-you-ready-for-a-framework)
8. [Deliberately Out of Scope (For Now)](#8-deliberately-out-of-scope-for-now)
9. [Core Module Quick Reference](#9-core-module-quick-reference)

---

## 1. How To Use This File

**The loop for every phase is the same:**

```
READ the concept  →  BREAK it on purpose  →  BUILD the phase project  →  ANSWER the self-check
```

Rules of engagement:

- **Never move to the next phase until you can pass that phase's self-check questions out loud, without notes.** Reading without building is the single biggest reason people stall.
- **Every phase ends with a shipped project.** Not a tutorial you followed — a project you wrote, that ran, that you can explain line by line.
- **Keep a `notes/` folder in this repo.** One markdown file per phase. Write the explanation in your own words as if teaching someone. This is the highest-ROI activity in this entire document.
- **Commit after every working milestone.** Run `git init` in this folder if you haven't, and commit at the end of each session.
- **Time estimates are for the topics only.** The projects usually take as long again. Budget accordingly.

Suggested repo layout as you go:

```
learning-nodejs/
├── ROADMAP.md              ← this file
├── notes/                  ← your explanations, one per phase
│   ├── 01-runtime.md
│   ├── 02-modules.md
│   └── ...
├── experiments/            ← throwaway "what happens if..." scripts
│   └── event-loop-order.js
├── exercises/              ← small focused drills
│   └── 03-concurrency-limit.js
└── projects/
    ├── 01-cli-tool/
    ├── 02-todo-cli/
    ├── 03-log-analyzer/
    └── ...
```

---

## 2. The 5 Ground Rules

| # | Rule | Why |
|---|------|-----|
| 1 | **Zero npm dependencies until Phase 7.** Use only `node:*` built-ins. | Forces you to learn the platform instead of learning a framework's opinions. `npm install` is a crutch you can pick up later in an afternoon. |
| 2 | **Official docs first, search engines second.** `nodejs.org/api/…` | Node's docs are excellent and version-accurate. Random blog posts are usually 6 years stale. |
| 3 | **If you can't explain it, you don't know it.** | Write the note. Say it out loud. Then build it. |
| 4 | **The event loop is not an advanced topic — it's *the* topic.** | Almost every Node bug you will ever hit is a misunderstanding of the event loop, of backpressure, or of error propagation. |
| 5 | **Break things deliberately.** | After learning a feature, write the script that misuses it. Watching a process die from an unhandled stream error teaches more than any article. |

---

## 3. The Node Mental Model

Read this now, then re-read it after Phase 3. It will make far more sense the second time.

### 3.1 What Node actually is

```
┌──────────────────────────────────────────────────────┐
│  YOUR JAVASCRIPT CODE                                │
├──────────────────────────────────────────────────────┤
│  Node.js APIs  (fs, http, net, stream, crypto, ...)  │  ← built-in modules
├──────────────────────────────────────────────────────┤
│  V8 Engine          │  libuv                        │
│  (compiles + runs   │  (event loop, thread pool,    │
│   your JS, manages  │   async I/O, DNS, timers)     │
│   memory/GC)        │                               │
├──────────────────────────────────────────────────────┤
│  Operating System (files, sockets, signals)          │
└──────────────────────────────────────────────────────┘
```

- **V8** runs your JavaScript. It is single-threaded.
- **libuv** is a C library that owns the event loop, a **thread pool** (default size 4, tunable via `UV_THREADPOOL_SIZE`), and the async I/O machinery.
- **Node APIs** are the glue: JavaScript functions that hand work to libuv and register a callback for when it finishes.

### 3.2 The three consequences that explain everything

1. **Your JS never runs in parallel with your other JS.** Only one line of your code executes at any instant. `Promise.all` does *not* make your JavaScript concurrent — it makes the *I/O waits* overlap.
2. **The thread pool does the blocking work.** File reads, `dns.lookup`, `crypto`, and `zlib` are offloaded to libuv's thread pool. Sockets use the OS's own async primitives (epoll/kqueue/IOCP) and generally don't consume thread-pool slots.
3. **Blocking the loop blocks everything.** A 3-second synchronous computation means *every* connected client waits 3 seconds. There is no request-per-thread safety net like in Java/PHP. This is the defining constraint of Node backend work.

### 3.3 The vocabulary you're building toward

| Concept | One-line meaning |
|---------|------------------|
| Event loop | The scheduler that decides what runs next |
| Callback | "Call this when done" |
| Promise | A placeholder for a future value |
| `async/await` | Syntactic sugar so `await` reads like blocking code that isn't |
| Microtask | Highest-priority queued work (promises, `queueMicrotask`) |
| EventEmitter | Node's core pub/sub primitive |
| Stream | Process data in chunks instead of all at once |
| Backpressure | Telling the producer to slow down because the consumer is full |
| Worker thread | A real OS thread running a separate JS isolate for CPU work |

---

## Phase 0 — JS Pre-Flight Checklist (2–3 hrs)

You said you're comfortable with modern JS, so this is a **checklist, not a course**. Run through it, and only stop to study anything that feels shaky. Everything here is a prerequisite for the Node phases.

- [ ] `let` / `const` / block scoping / TDZ
- [ ] Closures and lexical scope — *be able to explain why a counter closure works*
- [ ] `this` binding: method call, plain call, arrow functions, `call`/`apply`/`bind`
- [ ] Prototypes and `class` syntax (you'll see this in `EventEmitter` and custom errors)
- [ ] Destructuring, spread/rest, default params
- [ ] Array methods: `map`, `filter`, `reduce`, `find`, `some`, `every`, `flatMap`
- [ ] Object helpers: `Object.keys/values/entries/fromEntries`, `Object.freeze`
- [ ] Optional chaining `?.` and nullish coalescing `??`
- [ ] Template literals, tagged templates
- [ ] `Map` / `Set` and `WeakMap` (used for caches and Node internals)
- [ ] Error handling: `throw`, `try/catch/finally`, `Error` subclasses, `error.cause`
- [ ] Iterators and generators (`function*`) — streams and async iterators build on these
- [ ] ES Modules: `import` / `export` / default vs named
- [ ] Promises: chaining, `Promise.all`, `allSettled`, `race`, `any`
- [ ] `async/await` including sequential vs parallel awaits
- [ ] `structuredClone`, JSON round-tripping, and when each is wrong

**Drill:** write `experiments/js-warmup.js` containing a hand-rolled `map`/`filter`/`reduce`, a closure counter, a custom `Error` subclass, and a `Promise.allSettled` usage. If all four are easy, move on.

**Resources if you need to fill gaps:** *You Don't Know JS Yet* (free on GitHub), MDN's JavaScript guide.

---

## Phase 1 — The Runtime, `process`, and the CLI

**Time:** ~1 week (5–8 hrs) · **Project:** CLI argument tool

### Goal
Stop thinking of Node as "JavaScript in a terminal" and start thinking of it as an operating-system-level runtime with a process, a filesystem, and a lifecycle.

### Topics, in order

1. **What Node is and isn't** — V8 + libuv + bindings (see [Section 3](#3-the-node-mental-model)). No `window`, no `document`, no DOM. `globalThis` exists in both.
2. **Installing and managing Node correctly**
   - `nvm` / `fnm` for version switching; understand **LTS vs Current**
   - `node --version`, `npm --version`
   - Even-numbered majors = LTS line. Learn where release notes live (`nodejs.org/en/blog`).
3. **Running code**
   - `node file.js`, `node --eval "..."` / `-e`, `node --print` / `-p`
   - REPL (`node` with no args): `.help`, `.load`, `.editor`, `_` for last result
   - `node --watch file.js` *(v18.11+, stable since v22)* — built-in restart, no `nodemon` needed
   - `node --check file.js` — syntax check without executing
4. **The `process` object** — this is the heart of Phase 1
   - `process.argv` (argv[0]=node, argv[1]=script, argv[2+]=your args)
   - `process.env` — read env vars; note all values are **strings**
   - `process.env.NODE_ENV` and why it's a convention, not a feature
   - `process.exit(code)` vs `process.exitCode = 1` — **know the difference**
   - `process.cwd()` vs `process.chdir()` — and why `cwd` ≠ script location
   - `process.stdin` / `stdout` / `stderr` — the three standard streams
   - `process.platform`, `process.arch`, `process.pid`, `process.ppid`, `process.versions`
   - `process.memoryUsage()`, `process.uptime()`
   - `process.hrtime.bigint()` → later replaced by `performance.now()`
   - `process.nextTick()` — preview only; full story in Phase 3
5. **Globals** — `globalThis`, `console` (and `console.table`, `console.dir`, `console.time`), `Buffer`, `URL`/`URLSearchParams`, `setTimeout`/`setInterval`/`setImmediate`, `queueMicrotask`, `structuredClone`, `fetch`, `AbortController`, `crypto`
6. **Timers properly**
   - `setTimeout`, `setInterval`, `setImmediate`, `clearTimeout`/`clearInterval`
   - `setTimeout` from `node:timers/promises` → returns a promise; supports `signal`
   - `setInterval` from `node:timers/promises` → async iterator
   - `timer.unref()` / `ref()` — **critical**: lets the process exit even with a pending timer
7. **Signal handling** — `process.on('SIGINT')`, `SIGTERM`, `SIGHUP`; `process.kill(pid, 'SIGTERM')`
8. **Exit codes and streams as a Unix citizen**
   - Exit `0` = success, non-zero = failure
   - Write errors to `stderr`, data to `stdout` — this is what makes piping work
   - Read from `stdin` so your tool composes: `cat file | mytool | grep x`
9. **CLI argument parsing**
   - `node:util` → `parseArgs()` *(v18.3+)* — built-in flag parser; replaced `minimist`/`yargs` for simple tools
   - `node:readline/promises` for interactive prompts

### Practice
1. **Print-the-environment script.** Print Node version, platform, pid, cwd, and the raw `process.argv`. Run it with flags in different orders.
2. **Exit-code drill.** Write a script that exits `0` on a valid flag and `1` on an invalid one. Verify with `echo $?` in your shell.
3. **Sigint drill.** Write a script that loops forever, trap `SIGINT`, print "cleaning up…", then exit. Confirm Ctrl+C behaves.
4. **Unref drill.** Create a script with a 10-second `setTimeout` — see it hold the process open. Add `.unref()` — see it exit immediately.

### Phase Project — `projects/01-cli-tool/`
A dependency-free CLI called `mytool` that:
- Accepts `--name <string>`, `--count <number>`, `--verbose`, `--help` via `util.parseArgs`
- Validates input and prints a clear usage message plus exit code `1` on bad input
- Prints output to `stdout`, errors to `stderr`
- Works when piped: `cat names.txt | node index.js --count 3`
- Handles `SIGINT` gracefully
- Is runnable via `npm start` and `node --run start` *(v22+)*

### Definition of Done
- Zero entries in `dependencies`
- `node index.js --help` documents every flag
- `echo $?` shows the right exit code for both success and failure paths
- You can explain `process.exit()` vs `process.exitCode` without looking it up

### Self-Check
1. What's the difference between `process.exit(1)` and `process.exitCode = 1`?
2. Why does `process.cwd()` sometimes differ from the folder your script lives in?
3. What does `.unref()` do to a timer, and when do you need it?
4. Which stream should errors go to, and why does it matter?
5. What are the first two elements of `process.argv`?

---

## Phase 2 — Modules, npm, and Project Layout

**Time:** ~2 weeks (12–16 hrs) · **Project:** Todo CLI with JSON file persistence

### Goal
Understand how Node resolves code, how packages actually work on disk, and how to lay out a multi-file program without a framework's scaffolding doing it for you.

### Topics, in order

#### 2.1 The two module systems

1. **CommonJS (CJS)** — the default for `.js` without `"type": "module"`
   - `require()`, `module.exports`, `exports` (and the classic `exports` vs `module.exports` footgun)
   - **The module cache** — modules are singletons, evaluated once, then cached. This is why "global" state in a module persists.
   - `require.resolve()`, `require.cache`, `delete require.cache[...]`
   - Circular requires — what actually happens and why you should avoid them
2. **ES Modules (ESM)** — the standard
   - `import` / `export`, named vs default, `export *`
   - `.mjs` vs `.cjs` vs `"type": "module"` in `package.json`
   - **ESM differences that bite:** no `require`, no `__dirname`/`__filename` (use `import.meta.url` + `fileURLToPath`), no `__filename`-relative tricks, imports are hoisted and statically analyzed, top-level `await` works
   - `import.meta.dirname` / `import.meta.filename` *(v20.11+/21.2+)* — the modern fix
   - Dynamic `import()` — works in both CJS and ESM, returns a promise
   - `require(esm)` *(v22.12+, enabled by default in v23+)* — you can `require()` an ESM module on your Node v24
3. **Module resolution algorithm**
   - `node:` prefix (`node:fs`) — always prefer it, it's unambiguous and can't be shadowed by an npm package
   - Bare specifiers → `node_modules` lookup walking up the tree
   - Relative specifiers, `exports`/`imports` maps, extension-less resolution in CJS
   - `--experimental-…`? No. Use `node --help | grep module` to explore.

> **Decision to make now:** pick **ESM** for all your projects (`"type": "module"` in `package.json`). It's the future, it's what you'll write in production, and CJS will be easy to read anyway because you'll have seen it.

#### 2.2 npm — the parts you actually need

- `npm init`, `npm init -y`, and what each `package.json` field means:
  - `name`, `version`, `description`, `main`, `type`, `exports`, `imports`, `engines`, `scripts`, `private`
- **Dependencies vs devDependencies vs peerDependencies vs optionalDependencies**
- **Semver and ranges** — `^1.2.3`, `~1.2.3`, `1.2.3`, `>=`, `*`. Understand `^0.x` being special.
- `package-lock.json` — what it locks, why you commit it, and `npm ci` vs `npm install`
- `node_modules` — the nested/flattened reality, hoisting, and why it's not magic
- Useful commands: `npm ls`, `npm outdated`, `npm audit`, `npm pkg get/set`, `npm run`, `npx`, `npm ci`, `npm link`, `npm pack`
- **npm scripts**: lifecycle hooks (`pre`/`post`), `--` for passing args, `&&`/`&` portability, `npm run --silent`
- `node --run <script>` *(v22+)* — run package.json scripts without npm overhead
- `overrides` for pinning transitive versions
- Workspaces — read about it, don't use it yet

#### 2.3 The filesystem and paths

- **`node:fs` three API styles** — pick `fs/promises` and stay there:
  - Callback: `fs.readFile(path, cb)`
  - Sync: `fs.readFileSync(path)` — **learn when this is acceptable** (startup/config) and when it's a sin (inside a request handler)
  - Promise: `fs.promises.readFile` / `import { readFile } from 'node:fs/promises'` ✅
- Reading/writing: `readFile`, `writeFile`, `appendFile`, `readdir`, `stat`, `mkdir` (`{ recursive: true }`), `rm`, `rename`, `copyFile`, `unlink`
- **Atomic writes** — write to `file.tmp` then `rename()`. This is how you avoid corrupting a JSON store on crash.
- `fs.watch` / `fs.watchFile` — file watching (overview only)
- File descriptors: `fs.open`, `fd`, `fs.read`/`fs.write`, and *why* descriptors must be closed
- **`node:path`**
  - `join`, `resolve`, `dirname`, `basename`, `extname`, `parse`, `format`, `sep`
  - `path.join` vs `path.resolve` — know the difference cold
  - `path.posix` vs `path.win32`
- **Directory traversal defence** — resolve the user path, then verify it's still inside your root. Non-negotiable skill; you'll use it in Phase 5.
- **Permissions** — `chmod`, mode bits, `fs.access`, `constants`

#### 2.4 Other core modules to skim now, master later

- `node:os` — `cpus()`, `totalmem()`, `freemem()`, `platform()`, `homedir()`, `tmpdir()`, `EOL`
- `node:url` — `URL`, `URLSearchParams`, `fileURLToPath`, `pathToFileURL`
- `node:util` — `promisify`, `inspect`, `parseArgs`, `format`, `types`, `deprecate`
- `node:assert` / `node:assert/strict` — assertions (needed for tests in Phase 8)
- `node:crypto` — `randomUUID()`, `randomBytes()`, `createHash()`, `scrypt`, `timingSafeEqual`
- `node:buffer` — `Buffer.from`, `Buffer.alloc`, `toString('utf8'|'hex'|'base64')`, and **why Buffer is not a Uint8Array in spirit**

#### 2.5 Configuration and environment

- `--env-file=.env` *(v20.6+)* and `--env-file-if-exists` *(v22.9+)* — built-in `.env` support, no `dotenv` package
- `process.loadEnvFile()` *(v21.7+)*
- **Validate config at startup, then freeze it.** Create a single `config.js` that reads env, applies defaults, validates, and exports a frozen object. Scattered `process.env.FOO` across 30 files is a maintenance disaster.
- Never commit `.env`. Add it to `.gitignore` immediately.

### Practice
1. Convert a CJS snippet to ESM and back. Note every error you hit.
2. Reproduce the `exports` vs `module.exports` trap and explain it in your notes.
3. Prove the module cache: two files requiring the same module, one mutates it, the other sees the mutation.
4. `path` drill: given `__dirname` and a user string like `../../etc/passwd`, write a function that safely resolves a file inside a public folder and returns `null` if it escapes.
5. Build a "read a JSON file, modify it, write it atomically" helper with proper error handling for missing/corrupt files.

### Phase Project — `projects/02-todo-cli/`
A multi-file, dependency-free todo app:
- `index.js` (CLI entry), `src/store.js` (persistence), `src/config.js` (env + validation), `src/format.js` (output), `src/errors.js` (custom errors)
- Commands: `add`, `list`, `done <id>`, `remove <id>`, `clear`
- Persists to `data/todos.json` using **atomic writes** and `mkdir -p` semantics
- Handles: missing file, corrupt JSON, unknown command, invalid id — each with a distinct exit code
- `--data-dir` flag overrides the storage location (uses `path.resolve`)
- Refuses any `--data-dir` that isn't absolute, or create it if `.gitignore`d
- Fully ESM with `"type": "module"`

### Definition of Done
- No `dependencies`, no `devDependencies` except maybe `eslint` if you want (Phase 8 formalizes this)
- Corrupting `todos.json` by hand produces a clean error message, not a stack dump
- Killing the process mid-write can never leave a half-written JSON file (verify by reasoning about `rename`)
- You can draw the module dependency graph on paper

### Self-Check
1. Why is a module a singleton, and how does that leak state between tests?
2. In ESM, how do you get the directory of the current file — and why doesn't `__dirname` work?
3. What does `path.resolve('a', 'b')` give you, and how is that different from `path.join`?
4. Why is `fs.readFileSync` fine at startup but dangerous in a request handler?
5. Why write-then-rename instead of writing in place?
6. What's in `package-lock.json`, and why commit it?

---

## Phase 3 — The Event Loop and Async Mastery

**Time:** ~2 weeks (14–18 hrs) · **Project:** Concurrency-limited task runner

> **This is the most important phase in the roadmap.** If you rush it, everything after it becomes cargo-culting. Take the extra week.

### Goal
Be able to predict, before running it, the order in which lines of your program execute — and be able to explain why a slow request made a fast one slow.

### Topics, in order

#### 3.1 Callbacks and the shape of Node's async model
- Error-first callbacks: `(err, result) => {}` — the historical convention
- Why `if (err) return cb(err)` matters
- Callback hell and why it happened

#### 3.2 The event loop, phase by phase
```
   ┌───────────────────────────┐
┌─►│           timers          │  setTimeout / setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     pending callbacks     │  deferred I/O callbacks from the OS
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │       idle, prepare       │  internal
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │           poll            │  ← waits for I/O; the loop mostly lives here
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │           check           │  setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
└──┤      close callbacks      │  socket.on('close')
   └───────────────────────────┘

Between EVERY phase:  process.nextTick queue  →  Promise microtask queue
(and microtasks can starve the loop if they keep queueing more work)
```

- **The queues, in priority order:** `process.nextTick` → Promise microtasks → one event-loop phase → repeat
- `setImmediate` (check phase) vs `setTimeout(fn, 0)` (timers phase) — **which fires first and why it's non-deterministic at the top level but deterministic inside I/O callbacks**
- `process.nextTick` vs `queueMicrotask` vs Promises — all "before the loop continues", but nextTick has its own higher-priority queue
- Starvation: a recursive `process.nextTick` or an infinite promise chain will freeze timers and I/O forever
- `UV_THREADPOOL_SIZE` and which operations use the pool (`fs`, `dns.lookup`, `crypto`, `zlib`)
- Why `dns.lookup` uses the thread pool but `dns.resolve` doesn't
- Long-running synchronous work → measure it → then fix it in Phase 4 with workers

**Mandatory experiment:** write `experiments/event-loop-order.js` that prints from: top-level code, `process.nextTick`, `queueMicrotask`, `Promise.then`, `setTimeout(…, 0)`, `setImmediate`, and inside an `fs.readFile` callback. Predict the order *on paper first*, then run it, then explain every deviation.

#### 3.3 Promises properly
- States: pending, fulfilled, rejected (and "settled")
- Chaining, returning values vs returning promises (thenables)
- **Error propagation**: `.catch` placement, `throw` inside `.then`, and the "forgot to return the promise" bug
- `Promise.all` (fail-fast) · `allSettled` (never rejects) · `race` · `any` (`AggregateError`)
- `Promise.withResolvers()` *(v22+)* — finally no more `new Promise` boilerplate for deferreds
- Promisifying callback APIs by hand, then with `util.promisify`
- **Unhandled rejections** — `process.on('unhandledRejection')`, and why your Node v24 defaults to *terminating* the process

#### 3.4 `async/await`
- `await` as a suspension point, not a thread block
- **Sequential vs parallel awaits** — the classic performance bug:
  ```js
  // SLOW: 3 sequential round-trips
  const a = await getA(); const b = await getB(); const c = await getC();
  // FAST: all in flight at once
  const [a, b, c] = await Promise.all([getA(), getB(), getC()]);
  ```
- `try/catch/finally` with `await`, and what does *not* get caught
- Loops with `await`: `for…of` (sequential) vs `Promise.all(map)` (parallel) — and when sequential is *correct* (rate limits, ordering)
- `for await…of` — async iteration over streams; you'll use this heavily later
- Top-level `await` in ESM
- async functions always return promises — consequences for `EventEmitter` and callbacks

#### 3.5 Concurrency control
- Why `Promise.all` over 50,000 URLs will exhaust sockets, file descriptors, and RAM
- **Build your own limiter** (this is the exercise that makes it click):
  ```js
  export async function mapLimit(items, limit, fn) { /* … */ }
  ```
- Semaphore pattern; queue + worker-pool pattern
- **`AbortController` / `AbortSignal`** — the universal cancellation primitive
  - `fetch(url, { signal })`, `fs.readFile(p, { signal })`, `timers/promises` with `signal`
  - `AbortSignal.timeout(ms)`, `AbortSignal.any([...])` *(v20+)*
  - Why cancellation is essential for timeouts on downstream calls
- Timeouts: racing a promise against a timer, and why the loser must be cancelled or it leaks

#### 3.6 Error handling as a discipline
- `throw` only `Error` objects, never strings
- Subclassing `Error` correctly (`extends Error`, `this.name`, `Error.captureStackTrace`)
- `error.cause` *(v16.9+)* for wrapping errors without losing the original
- **Operational errors** (expected: bad input, network down, 404) vs **programmer errors** (bugs: `undefined` deref, wrong types)
- `process.on('uncaughtException')` — what it means and why the correct response is almost always "log, then exit"
- `unhandledRejection` vs `uncaughtException`
- `--report-on-fatalerror` and `process.report` for post-mortem diagnostics

### Practice
1. `experiments/event-loop-order.js` — as described above. Do the paper prediction first.
2. `experiments/starve-the-loop.js` — prove a recursive `process.nextTick` blocks timers.
3. **Thread-pool experiment:** kick off 8 concurrent `crypto.pbkdf2` calls and log completion order. Run with default pool size, then with `UV_THREADPOOL_SIZE=2` and `=8`. Explain the pattern.
4. `exercises/03-promisify.js` — promisify a callback API by hand, then with `util.promisify`.
5. `exercises/03-seq-vs-parallel.js` — time 5 simulated 200 ms "requests" sequentially vs with `Promise.all`.
6. `exercises/03-map-limit.js` — implement `mapLimit` from scratch and prove it never exceeds the limit.
7. `exercises/03-timeout.js` — `withTimeout(promise, ms)` using `AbortController`, and prove the underlying work is actually cancelled.
8. `exercises/03-async-iterator.js` — build an async generator that yields paginated "pages" from a fake API.

### Phase Project — `projects/03-task-runner/`
A dependency-free concurrent task runner CLI:
- Reads a list of "jobs" from a JSON file (each with a name, a duration, and a failure rate)
- Runs them with a configurable `--concurrency N` (default 4)
- Each job has a `--timeout`; on timeout the job is **aborted**, not just ignored
- Retries failed jobs up to `--retries N` with exponential backoff
- Prints a live progress line, a final summary table, and an aggregate exit code
- Handles `SIGINT` by aborting in-flight jobs and shutting down cleanly
- Writes a JSON report to disk

### Definition of Done
- You can draw the event-loop diagram from memory and place every callback in your program
- Increasing `--concurrency` above ~64 stops helping — and you can explain why using `UV_THREADPOOL_SIZE`
- No `setTimeout`-based sleep passes without a `signal`
- Zero unhandled rejections across all failure paths (verify by running every failure mode)

### Self-Check
1. In what order do `setTimeout(fn, 0)` and `setImmediate(fn)` run at the top level? Inside an I/O callback? Why the difference?
2. What's the difference between `process.nextTick` and `queueMicrotask`?
3. Your server's p99 latency spikes to 2 s while CPU looks idle. Name three likely event-loop causes.
4. Why doesn't `Promise.all` use multiple CPU cores?
5. What happens to the rest of the process when an `unhandledRejection` occurs in Node 24?
6. Why is `await` in a `for` loop sometimes *correct* even though it's slower?
7. How do you actually cancel an in-flight `fetch`?

---

## Phase 4 — Events, Streams, Workers, Child Processes

**Time:** ~3 weeks (20–26 hrs) · **Projects:** EventEmitter pub/sub, streaming log analyzer, worker-thread hasher

### Goal
Master the three mechanisms Node uses to handle scale: events for decoupling, streams for memory efficiency, and threads/processes for CPU work.

### Topics, in order

#### 4.1 `EventEmitter` — Node's pub/sub primitive
- `const { EventEmitter } = require('node:events')` / `import`
- `emit`, `on`, `once`, `off`, `removeAllListeners`, `listenerCount`
- `prependListener`, `setMaxListeners`, `getEventListeners`, `events.getEventListeners()`
- **Listener leaks** — the `MaxListenersExceededWarning` and what it really means
- `error` events are special: **an unhandled `error` event throws**. This is a top-5 Node gotcha.
- `captureRejections: true` — routing async listener errors into the `error` event
- `events.once(emitter, 'event')` — promisified event waiting
- `events.on(emitter, 'event')` — async iterator over events, with `{ signal }`
- Best practice: **extend EventEmitter for your own classes**, don't use it as a global bus
- Real-world emitters you already use: `http.Server`, `net.Socket`, `process`, streams

#### 4.2 Streams — the hardest and most valuable topic
- **Why streams exist:** constant memory regardless of input size. A 10 GB file should use ~64 KB of RAM.
- The four types: **Readable**, **Writable**, **Duplex** (`net.Socket`), **Transform** (`zlib`, `crypto`)
- **Object mode** vs binary mode
- **Readable:** `read()`, `on('data')`, `pause()`/`resume()`, `on('end')`, `on('readable')`
  - **Flowing vs paused mode** — and that attaching a `data` listener switches modes
  - `readable.pipe()`, `stream.pipeline()`, `stream.finished()`
  - `readable[Symbol.asyncIterator]()` → `for await (const chunk of readable)`
- **Writable:** `write()`, `end()`, `drain`, `cork()`/`uncork()`
- **Backpressure** — the concept that separates juniors from seniors:
  - `write()` returns `false` → stop writing → wait for `'drain'`
  - `pipeline()` handles backpressure automatically; `pipe()` doesn't handle *errors*
  - High-water marks: `highWaterMark`, `objectMode` defaults
- **`stream.pipeline()`** — always use it. It propagates errors and destroys all streams on failure. `pipe()` leaks on error. This is the single most common stream bug in production.
- `stream.finished()`, `stream.addAbortSignal()` *(v18+)*
- **Building a Transform stream** by hand (`_transform`, `_flush`)
- **String decoding across chunk boundaries** — the `StringDecoder` / `setEncoding` trap when a multi-byte UTF-8 character is split across chunks
- Real streams you'll use: `fs.createReadStream`/`createWriteStream`, `zlib.createGzip`, `crypto.createCipheriv`, `http.IncomingMessage` (readable), `http.ServerResponse` (writable)
- **Web Streams** — `ReadableStream`/`WritableStream`/`TransformStream` globals, `stream.Readable.fromWeb` / `.toWeb`, and when each API matters (fetch bodies are web streams)
- `readline` / `readline/promises` — line-by-line processing, and how it wraps a stream
- `stream.Readable.from(iterable)` and `Readable.from(asyncGenerator())`

#### 4.3 Worker threads — real parallelism for CPU work
- Why promises can't help CPU-bound work
- `new Worker(new URL('./worker.js', import.meta.url))`
- `parentPort.postMessage` / `worker.postMessage` — **structured clone**, not shared references
- `workerData` for initial data
- `postMessage` with `transferList` — zero-copy transfer of `ArrayBuffer`
- **`SharedArrayBuffer` and `Atomics`** — real shared memory (overview; know it exists)
- Worker lifecycle: `online`, `message`, `error`, `exit`, `worker.terminate()`
- **Worker pools** — spawning a worker per task is expensive (~30–50 ms); build a pool
- `os.availableParallelism()` *(v18.14+)* to size the pool
- When to use workers vs when to just scale horizontally
- Contrast: `worker_threads` shares memory space (threads); `child_process` doesn't (processes)

#### 4.4 `child_process` — running other programs
- `exec` (shell, buffered) vs `spawn` (streamed, no shell) vs `execFile` vs `fork`
- **`exec` buffers the entire output into memory** → never use it for large or untrusted output
- `spawn` with `stdio: 'inherit' | 'pipe' | 'ignore'`
- Reading child `stdout`/`stderr` as streams; wiring them into a pipeline
- `kill()`, `signal`, exit codes
- **Command injection** — why `exec` with interpolated user input is a critical vulnerability, and how `spawn` with an args array avoids it
- `fork()` — spawn a new Node process with an IPC channel
- `{ detached: true }`, `unref()`, and orphaned processes

#### 4.5 `cluster` and process-level scaling
- `cluster.fork()`, the primary/worker model, shared server ports
- How `cluster` round-robins connections on most platforms
- Why `cluster` is often replaced today by a container orchestrator running N processes
- `reusePort: true` *(v22.12+)* — `SO_REUSEPORT` without the `cluster` module

### Practice
1. `experiments/emitter-error.js` — emit an `'error'` event with no listener and watch the process die. Then add a listener.
2. `experiments/stream-memory.js` — read a 1 GB file (generate one) three ways: `readFile`, `createReadStream` with `data`, and `for await`. Compare peak RSS with `process.memoryUsage()`.
3. `experiments/backpressure.js` — build a slow Writable and a fast Readable. Show `write()` returning `false`, then fix it with `pipeline()`.
4. `experiments/utf8-split.js` — force a multi-byte character to split across chunk boundaries and observe the mojibake. Fix it with `setEncoding`.
5. `experiments/worker-hash.js` — hash a large file on the main thread, then in a worker. Time both. Watch the main thread stay responsive in the second case.
6. `experiments/spawn-vs-exec.js` — prove `exec` buffers everything and `spawn` streams.

### Phase Projects (three small ones)

**`projects/04a-pubsub/`** — a typed mini event bus:
- A `TaskQueue` class extending `EventEmitter` with `enqueue`, `process`, `on('complete')`, `on('failed')`
- Proper error events, `once` cleanup, no listener leaks (verify `listenerCount` returns to 0)
- A `waitFor(event)` promise helper built on `events.once`

**`projects/04b-stream-log-analyzer/`** — streaming log processor:
- `node analyze.js < access.log` and `node analyze.js --file huge.log`
- Processes line by line using a **constant amount of memory** (build it on `readline` + a Transform, no `readFile`)
- Computes counts per status code, top 10 URLs, requests per minute, p95 response time
- Writes a gzip-compressed report using `zlib.createGzip` + `pipeline`
- Must handle a 1 GB log file without exceeding ~100 MB RSS — **measure and prove it**

**`projects/04c-worker-hasher/`** — parallel file hasher:
- Walks a directory, hashes every file with `crypto` using a **worker pool** sized to `os.availableParallelism()`
- Streams each file (never loads it fully) — combines Phase 4.2 and 4.3
- Reports progress from the main thread, proving it stays responsive
- Handles worker crashes by restarting the worker and reporting the failure

### Definition of Done
- The log analyzer has a measured, constant memory profile you can show in a graph
- You can explain backpressure without using the word "buffer" more than twice
- You have never used `pipe()` where `pipeline()` was correct
- You can explain the difference between a worker thread and a child process in one sentence each

### Self-Check
1. What happens when you `emit('error')` with no listener, and why is that special?
2. Compare `readable.pipe(writable)` and `stream.pipeline(readable, writable)`. What does `pipeline` do that `pipe` doesn't?
3. Explain backpressure to a colleague in three sentences.
4. How do you turn a `Readable` stream into something you can `for await…of`?
5. When is `fs.readFileSync` actually fine?
6. Why does `exec()` with user input create a command-injection vulnerability, and what replaces it?
7. Worker threads vs child processes — memory model, startup cost, and communication mechanism?
8. Why does a `postMessage` of a 100 MB object cost real time, and how do you avoid it?

---

## Phase 5 — Networking: `net` and `http` From Scratch

**Time:** ~2 weeks (14–18 hrs) · **Project:** Static file server + hand-rolled router

### Goal
Removing the mystery from web frameworks. By the end of this phase, Express's entire design will look obvious.

### Topics, in order

#### 5.1 TCP with `node:net`
- The OSI/TCP-IP basics you need: ports, sockets, connections, the 3-way handshake
- `net.createServer(socket => {})`, `server.listen(port, host)`, `server.address()`
- `net.connect()` / `net.createConnection()` as a client
- Socket events: `connect`, `data`, `end`, `error`, `close`, `timeout`
- `socket.write()`, `socket.end()`, `socket.destroy()`
- `socket.setNoDelay(true)` (disable Nagle), `setKeepAlive`, `setTimeout`
- **TCP is a byte stream, not a message stream** — you must frame your own messages. This is *the* reason HTTP has `Content-Length` and chunked encoding.
- Building a simple length-prefixed protocol to prove the framing problem
- **Unix domain sockets** — `listen('/tmp/app.sock')`, faster than TCP for local IPC
- `server.maxConnections`, connection counting, `EADDRINUSE` handling

#### 5.2 HTTP by hand with `node:http`
- **The HTTP/1.1 message format** — request line, headers, blank line, body. Read the raw bytes with `net` first, then with `http`.
- `http.createServer((req, res) => {})`
- **`IncomingMessage` (`req`)**: `method`, `url` (raw string!), `httpVersion`, `headers` (lowercased), `rawHeaders`, `socket`, `complete`
- **Parsing the URL properly**: `new URL(req.url, \`http://${req.headers.host}\`)`, `url.pathname`, `url.searchParams`
- **`ServerResponse` (`res`)**: `statusCode`, `statusMessage`, `setHeader`, `getHeader`, `removeHeader`, `writeHead`, `write`, `end`, `headersSent`, `writableEnded`
- **Reading the body:** `for await (const chunk of req)`, then `JSON.parse`. Know that `req` is a Readable stream.
- **The body-size limit problem** — why you must count bytes and abort past a limit, or a client can OOM your server
- `Content-Length` vs `Transfer-Encoding: chunked`
- Keep-alive, `Connection: close`, and `res.setHeader('Connection', …)`
- **Server timeouts** — `headersTimeout` (default 60 s), `requestTimeout` (default 300 s), `keepAliveTimeout` (default 5 s), `server.timeout`. These defaults exist to slow *slowloris* attacks. Know them.
- The `'checkContinue'`, `'clientError'`, `'upgrade'` server events
- **`http.request()` as a client** — and then the same thing with global `fetch()`. Compare.
- **HTTPS/TLS** — `node:tls`, `https.createServer({ key, cert })`, self-signed certs with `openssl`, `rejectUnauthorized`, TLS versions, the fact that you should terminate TLS at a proxy in production
- **HTTP/2** — `node:http2`, multiplexing, one connection per origin. Read the docs; implement a tiny server.
- **WebSockets by hand** — the Upgrade handshake: `Sec-WebSocket-Key` + magic GUID → SHA-1 → base64. Implement the handshake in ~30 lines to demystify it. (Full framing is an optional capstone.)
- **HTTP status codes** — 1xx/2xx/3xx/4xx/5xx, and the ~20 you'll actually use. Know: 200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 405, 409, 415, 422, 429, 500, 502, 503.
- **HTTP semantics** — idempotency, safe methods, why `PUT` should be idempotent, `Location` on 201, `ETag`/`If-None-Match`, `Cache-Control`
- **CORS** — it's just headers. `Access-Control-Allow-Origin`, preflight `OPTIONS` with `Access-Control-Request-Method`, `Access-Control-Max-Age`, credentials + wildcard incompatibility. Implement it by hand.
- **Cookies** — `Set-Cookie` attributes: `HttpOnly`, `Secure`, `SameSite`, `Max-Age`, `Path`. Parse `Cookie` header by hand.
- **Sessions** — the concept: opaque session id in a cookie → server-side store. Implement with a `Map`.
- **Security headers you should set yourself** — `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`. (This is what `helmet` does — now you know.)
- **Rate limiting basics** — fixed window vs sliding window vs token bucket. Implement a token bucket with a `Map` and an interval.
- **Static file serving done right:** MIME types (build your own small map), `Content-Length`, `Last-Modified`, `ETag`, range requests (`206 Partial Content`) — and **path traversal defence**, which you learned in Phase 2.

#### 5.3 The middleware pattern — invented by you
This is the payoff. Build a tiny router and middleware system, then compare it to how Express does it:
```js
// The whole idea: an array of (req, res, next) => {} functions.
// next(err) → error middleware. next() → continue.
// Four args = error handler. That's the ONLY difference.
```
- Path matching: exact, params (`/users/:id`), wildcards
- Method matching and `405 Method Not Allowed`
- Layered dispatch: router → middleware chain → handler → error handler
- Body parsing as middleware (that's all `body-parser` is)
- Logging as middleware
- **Write down, in your notes: "Express = http + this router + these middleware."** That realization is the whole point of Phase 5.

### Practice
1. `experiments/raw-http.js` — a `net` server that prints the raw request bytes for a `curl` call. Read the actual HTTP text.
2. `experiments/framing.js` — a `net` server and client exchanging messages; prove that two `write()` calls can arrive as one `data` event.
3. `experiments/timeout-attack.js` — open a connection with `nc`, send a partial request, and watch `headersTimeout` close it.
4. `experiments/fetch-vs-http-request.js` — make the same API call both ways, compare ergonomics and failure modes.
5. `exercises/05-mime.js` — a MIME type lookup with a 30-entry map and a safe default.
6. `exercises/05-token-bucket.js` — a reusable rate limiter class with tests.

### Phase Project — `projects/05-static-server/`
A dependency-free static file server with an API layer:
- Serves a directory over HTTP with correct MIME types, `Content-Length`, `Last-Modified`, and `ETag`
- Returns `304 Not Modified` on `If-None-Match`
- Supports `Range` requests → `206 Partial Content`
- **Returns `404` for anything outside the root**, including `%2e%2e%2f` encoded traversal attempts. This is testable and graded.
- Directory listing at `/` with escaped HTML (no XSS)
- A `/api/health` endpoint returning JSON with uptime, pid, and memory
- A `/api/echo` endpoint that parses JSON bodies with a 1 MB limit
- A hand-rolled middleware chain with request logging and a final error handler
- **Full CORS support including preflight**
- Streams large files (never `readFile` for responses)
- Batches headers via `writeHead`; sets the security headers listed above
- Handles `clientError` and `EADDRINUSE` cleanly

### Definition of Done
- `curl -v` against your server looks correct in every header
- A traversal fuzzer (`curl` with `%2e%2e%2f`, `..%2f`, absolute paths, null bytes) gets you nothing but 404s
- Your server survives `ab -n 10000 -c 200` without crashing or leaking memory
- You can explain every header your server sends

### Self-Check
1. Why is `req.url` raw and why must you parse it with `new URL()`?
2. Why does a body-size limit matter, and how do you enforce one on a stream?
3. What is a slowloris attack and which server timeout defends against it?
4. CORS: what exactly is a preflight request, and when is it sent?
5. What does `Content-Type: application/json` *not* guarantee, and why do you still validate?
6. What are the four arguments of an Express error handler, and where did that convention come from?
7. Why must you never build a file path from `req.url` without resolving and checking it?

---

## Phase 6 — Build a REST API With Zero Dependencies

**Time:** ~2 weeks (14–18 hrs) · **Project:** A complete, hardened, framework-less REST API

### Goal
Ship a real API using nothing but `node:http` and your own architecture. This is your portfolio piece and your proof that you understand backends.

### Topics, in order

1. **REST design** — resources, collections vs items, nesting, verbs, status codes, idempotency, pagination (`limit`/`offset` or cursors), filtering, sorting, versioning (`/v1/`)
2. **Layered architecture** (the pattern every framework expects you to bring):
   ```
   request → router → middleware (auth, validate, log)
                    → controller/handler   (HTTP concerns only)
                    → service             (business logic, framework-agnostic)
                    → repository          (data access)
                    → store (file / SQLite / API)
   ```
   Keep the service layer free of `req`/`res` so it's testable in isolation.
3. **Request validation** — hand-written validators (don't reach for Zod yet): type coercion, required fields, string lengths, enum membership, and a consistent error shape
4. **A consistent error contract** — pick a JSON error shape and use it everywhere:
   ```json
   { "error": { "code": "VALIDATION_FAILED", "message": "…", "details": [ … ] } }
   ```
   Map your custom error classes to HTTP status codes in one place.
5. **Authentication**
   - Password hashing with `node:crypto` → `scrypt` (or `pbkdf2`). Never SHA-256 alone. Discuss bcrypt/argon2 and why they're slow by design.
   - `timingSafeEqual` for token comparison; why `===` leaks timing
   - Sessions (cookie + server store) vs stateless tokens
   - **JWT by hand** — HMAC-SHA256 sign and verify in ~40 lines. Then you'll know exactly what the libraries do, and you'll know JWT is signed-not-encrypted.
   - API keys, and hashing them at rest
6. **Authorization** — roles/permissions, ownership checks, and the difference between 401 and 403
7. **Common API concerns**
   - Pagination with total counts
   - Idempotency keys for `POST`
   - Optimistic concurrency with `ETag`/`If-Match`
   - `X-Request-Id` generation and propagation
   - Correct `201 Created` + `Location` header
   - `204 No Content` on delete
   - Graceful handling of malformed JSON (→ `400`, not a crash)
8. **Security hardening pass** — you built these in Phase 5; now apply them systematically:
   - Input size limits, per-route rate limits, auth rate limits (brute-force defence)
   - **Prototype pollution** — `Object.create(null)` for parsed input, rejecting `__proto__`/`constructor` keys
   - **ReDoS** — dangerous regex patterns; keep user input out of regex
   - **Path traversal** on any file operation
   - Never leaking stack traces to clients; logging them server-side instead
   - Secrets from env only, never in code or logs
   - `npm audit` and `--ignore-scripts` for install safety (even with zero deps, know it)

### Practice
1. Write the same endpoint three ways: raw `http`, your middleware chain, then (for comparison only, at the very end) Express. Note what Express saved you and what it hid.
2. Implement JWT sign/verify by hand and test tampered signatures.
3. Build a validator that rejects an object containing a `__proto__` key.
4. Write a `timingSafeEqual`-based API-key comparison and a timing test that shows `===` leaking.
5. Write an idempotency-key middleware backed by a `Map` with TTL.

### Phase Project — `projects/06-rest-api/`
A complete REST API for a domain you pick (book library, expense tracker, workout log — something with two related resources so you must handle relationships). Requirements:

- **Zero runtime dependencies.** Still.
- **Resources:** e.g. `/v1/users`, `/v1/books`, `/v1/loans` — with a relationship between two of them
- **Full CRUD** on each resource with correct status codes and `Location` headers
- **Auth:** register, login (session cookie), logout, `GET /v1/me`; passwords hashed with `scrypt`; login rate-limited
- **Authorization:** users can only modify their own records; an `admin` role can do more
- **Validation** on every write endpoint with a documented error shape
- **Pagination, filtering, and sorting** on list endpoints
- **A single error-handling layer** mapping error classes → status codes; stack traces logged, never returned
- **Structured request logging** — method, path, status, duration, request id
- **Layered structure:** `src/routes/`, `src/services/`, `src/repositories/`, `src/middleware/`, `src/errors.js`, `src/config.js`
- **An `openapi.yaml` or a decent `README.md`** documenting every endpoint, status code, and error
- **A `curl` script or `.http` file** that exercises every endpoint end to end

### Definition of Done
- A malicious client cannot: crash it, read another user's data, traverse the filesystem, exceed rate limits, or send a body that exhausts memory
- Every endpoint has a documented status code for success *and* each failure mode
- Services are testable with plain function calls — no HTTP server required
- `npm ls --prod` shows an empty dependency tree
- You can point at any line and say which architectural layer it belongs to and why

### Self-Check
1. Walk through what happens, layer by layer, for `POST /v1/books` with a valid body.
2. Why is a service layer that takes plain objects better than one that takes `req`?
3. How does your auth middleware distinguish "no credentials" from "bad credentials" from "insufficient permission"?
4. Where exactly do you enforce the JSON body size limit, and what happens to the socket when you exceed it?
5. Why is `Object.create(null)` safer for parsed user input?
6. Why must `timingSafeEqual` be used for secrets?

---

## Phase 7 — Persistence and the Data Layer

**Time:** ~1.5 weeks (10–14 hrs) · **Project:** Migrate the Phase 6 API to SQLite

> **This phase introduces libraries.** That's intentional — you've earned it. But keep them thin: a *driver* is not a framework, and you should still be writing your own repository layer.

### Topics, in order

1. **JSON file stores taken seriously** — what you built in Phase 6, now with: atomic writes on every mutation, a write queue to serialize concurrent writes, in-memory index, and a lock file when multiple processes must share it. Then understand precisely why this doesn't scale.
2. **Embedded databases**
   - **`node:sqlite`** *(v22.5+, no flag needed on v24)* — `DatabaseSync`, prepared statements, transactions. A genuinely core-module database now.
   - Or `better-sqlite3` as an **OPTIONAL** npm alternative
   - SQL fundamentals you must have: `SELECT`/`INSERT`/`UPDATE`/`DELETE`, `WHERE`, `JOIN`, `GROUP BY`, indexes, `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, transactions
   - **Prepared statements and SQL injection** — demonstrate the injection, then show the prepared-statement fix
3. **Client-server databases** *(setup-level knowledge; the driver is the library part)*
   - PostgreSQL/MySQL via `pg` / `mysql2` — **OPTIONAL**
   - Connection pooling: why it exists, pool size vs Node's thread pool, exhaustion symptoms
   - Async database access and why every query is an `await`
   - Migrations: versioned schema files, up/down, and why hand-run SQL in production is a bad time
4. **Data modelling basics** — normalization, indexes, the N+1 query problem, pagination at the database level (`LIMIT`/`OFFSET` vs keyset), and transactions for multi-step writes
5. **Caching**
   - In-memory cache with a `Map` + TTL, and cache invalidation
   - **LRU cache** implemented by hand (a `Map` is already insertion-ordered, which is the trick)
   - Stale-while-revalidate concept, cache stampede, and request coalescing
6. **The repository pattern** — swap file store → SQLite → Postgres without touching a single service or route. If you can't do this cleanly, your layering in Phase 6 was wrong.

### Phase Project — `projects/07-rest-api-sqlite/`
Take the Phase 6 API and:
- Replace the file store with SQLite via `node:sqlite`, using **only prepared statements**
- Add a migrations folder with numbered, re-runnable SQL files and a tiny migration runner
- Add indexes that make your list endpoints fast; prove it with `EXPLAIN QUERY PLAN` before/after
- Wrap multi-step writes in transactions
- Add an LRU + TTL cache in front of the hot read path, with correct invalidation on write
- Add a `repository` interface so the whole data layer can be swapped by changing one import
- Keep every route, middleware, and service file **byte-for-byte identical** except the repository

### Definition of Done
- The service layer never mentions SQL, files, or `req`/`res`
- Swapping the repository requires editing exactly one line
- Concurrent writes can't corrupt data (test with a script firing 100 simultaneous writes)
- You can explain why an ORM is convenient and what it hides from you

### Self-Check
1. Why doesn't a JSON file store survive multiple processes?
2. Show the difference between string-concatenated SQL and a prepared statement, in code.
3. What is N+1 and how do you fix it in SQL?
4. When is a cache worse than no cache?
5. Why is connection-pool exhaustion a classic Node outage?

---

## Phase 8 — Testing, Debugging, Quality

**Time:** ~1.5 weeks (10–14 hrs) · **Project:** Test suite for the Phase 7 API

### Topics, in order

1. **The built-in test runner: `node:test`** *(stable since v20 — no Jest needed)*
   - `node --test`, test file discovery, `describe`/`it`/`test`, `before`/`after`/`beforeEach`/`afterEach`
   - `t.test()` for subtests, `test.skip`/`test.todo`/`test.only`, `{ concurrency: true }`
   - Assertions with `node:assert/strict` — `equal`, `deepStrictEqual`, `throws`, `rejects`, `match`
   - **Mocking** — `t.mock.fn()`, `t.mock.method()`, `t.mock.timers.enable()` (fake timers), `t.mock.module()`
   - **Coverage** — `node --test --experimental-test-coverage` (and the newer `--test-coverage-*` flags); read the report
   - `--test-concurrency`, `--test-name-pattern`, `--test-reporter`/`spec`/`tap`
   - Watch mode: `node --test --watch`
2. **What to test** — the test pyramid; testing the service layer with plain objects; integration-testing the HTTP layer by starting the server on port `0` and using `fetch`; avoiding over-mocking
3. **Test isolation and flakiness** — the module cache as a hidden global; fake timers instead of `setTimeout` in tests; deterministic tests for concurrency; avoiding shared state between test files
4. **Debugging**
   - `--inspect` and `--inspect-brk`, VS Code's built-in Node debugger, breakpoints, conditional breakpoints, watch expressions
   - Debugging a *running* process: `kill -SIGUSR1`, `chrome://inspect`
   - `node --report-on-fatalerror` output on crashes
   - Diagnosing event-loop blockage: `perf_hooks.monitorEventLoopDelay()`, `--prof`
   - Heap snapshots and detecting leaks: take two snapshots, diff them
5. **Static quality tools** *(dev tooling — the one place non-runtime deps are fine)*
   - ESLint with the `n/no-sync`-style rules and `no-floating-promises` (via `typescript-eslint` if you go TS later)
   - Prettier, and `.editorconfig`
   - `npm audit` in CI
6. **Type safety without TypeScript** *(optional, high value)*
   - JSDoc + `// @ts-check` for real type checking with zero build step
   - **Then, optionally:** Node's native TypeScript type-stripping *(v22.6+ flagged, v23.6+ on by default)* — know it exists, don't make it a crutch
7. **CI basics** — a GitHub Actions workflow running lint + test + coverage on push

### Phase Project — `projects/08-tests/`
A real test suite for the Phase 7 API:
- **Unit tests** for validators, services, the LRU cache, the token bucket, and the JWT signer — all with no HTTP involved
- **Integration tests** for every endpoint, spinning the server up on port `0` and using `fetch`
- **Auth failure tests**: missing token, expired session, wrong password, rate-limit lockout, another user's resource
- **Security regression tests**: traversal attempts, `__proto__` in bodies, oversized bodies, malformed JSON
- **Fake-timer tests** for the rate limiter and cache TTL (no real waiting)
- Line coverage above 80% on `src/services/` and `src/middleware/`
- A `npm test` script running `node --test` and a separate `npm run test:coverage`
- At least one deliberate bug found *by* your tests, fixed, and documented in your notes

### Definition of Done
- `npm test` is green, deterministic, and finishes in seconds
- Running it twice in a row gives identical results
- No test touches the network or depends on a real clock
- You found the debugger more useful than `console.log` at least once

### Self-Check
1. What does `t.mock.timers.enable()` let you test that real `setTimeout` won't?
2. Why can the module cache make tests leak state into each other?
3. How do you test an HTTP endpoint without a networking library?
4. What's the difference between `assert.equal` and `assert.deepStrictEqual`?
5. Your test suite passes in isolation and fails as a whole. Where do you look first?

---

## Phase 9 — Production Hardening and Observability

**Time:** ~2 weeks (12–16 hrs) · **Project:** Production-ready version of your API

### Goal
The gap between "it works on my machine" and "it survives a Monday morning". This is what employers actually pay for.

### Topics, in order

1. **Configuration and secrets**
   - Twelve-factor style config from the environment, validated and frozen at startup
   - Fail fast on missing config — collect *all* errors, then exit with a helpful message
   - `NODE_ENV` conventions and their real (small) effect
   - Secrets: never in git, never in logs, rotate-ability, and redacting in log output
2. **Structured logging**
   - Why `console.log` is not logging: no levels, no fields, no timestamps, no machine parseability
   - Build a small structured logger by hand: levels, JSON output, a `requestId` field, redaction
   - `pino` is **OPTIONAL** — and now you'll understand exactly what it does
   - Log levels and what belongs at each: `error` (needs a human), `warn`, `info` (state changes), `debug` (dev only)
   - What never to log: passwords, tokens, full request bodies, PII
3. **Request context propagation**
   - **`AsyncLocalStorage`** from `node:async_hooks` — carry a request id through async calls without threading it through every function
   - This is how real loggers and tracers attach context; learn it here and OpenTelemetry later makes sense
   - The performance caveat: `async_hooks` has overhead; enable deliberately
4. **Graceful shutdown** — **this separates production code from tutorial code**
   - Trap `SIGTERM` and `SIGINT`
   - Stop accepting new connections (`server.close()`), let in-flight requests finish
   - `server.closeIdleConnections()` / `closeAllConnections()` *(v18.2+)*
   - Close the database pool, flush logs, then `process.exit(0)`
   - A hard timeout that force-exits after e.g. 10 s so you can never hang forever
   - Handle `uncaughtException`/`unhandledRejection` by logging, then exiting — and let a supervisor restart you
5. **Process management and deployment**
   - Why a bare `node index.js` in production is not enough
   - `systemd` unit files, `pm2` (**OPTIONAL**), or containers
   - Docker basics: a multi-stage `Dockerfile` with a slim base, `.dockerignore`, non-root user, `HEALTHCHECK`
   - Why `--max-old-space-size` matters and how containers misreport memory to Node *(v20+ has container-aware heap sizing)*
   - Reverse proxies (nginx/Caddy): TLS termination, `X-Forwarded-For` and `trust proxy` implications
   - Zero-downtime deploys and why `SO_REUSEPORT`/`cluster` matters
   - **`--env-file` in production** vs real secret managers
6. **Health checks**
   - `/health/live` (is the process up?) vs `/health/ready` (can it serve traffic?)
   - Shallow vs deep checks; why deep checks in a liveness probe cause restart loops
7. **Performance engineering**
   - **Load testing:** `autocannon` or `ab` _(optional tools)_ — measure throughput and p50/p95/p99 latency under 10/100/1000 concurrent connections
   - `perf_hooks`: `performance.now()`, `monitorEventLoopDelay()`, `PerformanceObserver`
   - CPU profiling: `node --prof`, `--prof-process`, `--cpu-prof` + Chrome DevTools
   - Memory: `process.memoryUsage()`, heap snapshots, finding leaks (unbounded `Map`, listeners never removed, closures holding refs)
   - The usual Node bottlenecks, in order: synchronous work on the loop → unbounded concurrency → N+1 queries → missing indexes → serialization cost → GC pressure
   - Connection pooling and keep-alive agents for outbound calls
8. **Resilience patterns**
   - Timeouts everywhere (every outbound call, no exceptions)
   - Retries with exponential backoff *and jitter*, and only for idempotent operations
   - Circuit breaker concept and a minimal implementation
   - Graceful degradation
9. **Operational hygiene**
   - `process.report` / `--report-on-fatalerror` for crash forensics
   - Feature flags, runbooks, and knowing what to check when pager goes off
   - Dependency hygiene: `npm audit`, lockfile integrity, `--ignore-scripts`, supply-chain awareness

### Phase Project — `projects/09-prod-api/`
Take your Phase 8 API and make it production-grade:
- Config module that validates everything at boot and exits with a clear message on failure
- Structured JSON logger with levels, `requestId`, and PII redaction
- `AsyncLocalStorage`-based request context so every log line carries the request id
- Graceful shutdown: `SIGTERM` → stop accepting → drain up to 10 s → close DB → exit `0`. **Prove it works**: start a slow request, send `SIGTERM`, watch it complete.
- `/health/live` and `/health/ready` endpoints
- All outbound calls have timeouts and retries with backoff + jitter
- A load-test script and a results table you can show (throughput, p95, error rate)
- A `Dockerfile` (multi-stage, non-root) and a `docker-compose.yml` for the database
- A `README` section titled "Operations" documenting: env vars, health endpoints, shutdown behaviour, log format

### Definition of Done
- You can kill the process with `SIGTERM` mid-request and no user sees a dropped connection
- Every log line is valid JSON with a request id
- The load test runs to completion without errors and you have the numbers to prove it
- You can name the single most likely bottleneck in your API and you've fixed it

### Self-Check
1. What exactly happens in your process between `SIGTERM` and exit?
2. Why is exiting after `uncaughtException` the correct behaviour?
3. What problem does `AsyncLocalStorage` solve, and what does it cost?
4. Why do retries need jitter?
5. How would you find a memory leak in a process that's been running for three days?
6. Why is `console.log` not acceptable as production logging?

---

## Phase 10 — Capstone Projects

Pick **two or three**. Each should be built with zero (or near-zero) frameworks. These are the projects that go on your CV and that you can talk about for 20 minutes in an interview.

### Capstone A — Rate-Limited URL Shortener with Analytics
- `POST /shorten` → returns a short code (`crypto.randomBytes` base62)
- `GET /:code` → `302` redirect, increments analytics counters
- Analytics endpoint: hits per day, referrers, user agents
- Token-bucket rate limiting per API key, with `429` and `Retry-After`
- LRU cache in front of the redirect path — it should survive 10k req/s locally
- SQLite persistence with indexes and a migration runner
- Graceful shutdown + structured logs + tests

**Skills proven:** HTTP, routing, persistence, caching, rate limiting, testing.

### Capstone B — Concurrent Web Crawler
- Seeds from a CLI arg; respects `robots.txt` (parse it yourself)
- Configurable concurrency with your Phase 3 `mapLimit`; **never** unbounded
- Per-domain politeness delays and a global request budget
- Streams HTML to a parser instead of buffering, extracts links with a regex or a small hand-rolled tokenizer
- Tracks a visited set with a bounded, disk-backed structure so memory stays flat
- Retries with backoff, timeouts on every fetch, and a circuit breaker per domain
- Writes results as a streaming NDJSON file
- Worker threads for HTML processing

**Skills proven:** event loop mastery, concurrency control, streams, resilience, memory discipline.

### Capstone C — Real-time Chat Server on Raw WebSockets
- Implement the WebSocket handshake by hand (`crypto` + `net`/`http` upgrade)
- Implement frame parsing: FIN/opcode/mask/payload length, masking, and control frames (`ping`/`pong`/`close`)
- Rooms, broadcast, and a connection registry
- **Heartbeat via ping/pong** and detection of dead connections
- Backpressure-aware broadcast — drop or disconnect slow consumers instead of buffering forever
- Auth on connect via a session cookie or a signed token
- Message history in SQLite with pagination

**Skills proven:** protocols, binary data, `Buffer` manipulation, backpressure, connection lifecycle. This one is hard and it shows.

### Capstone D — Job Queue / Background Worker System
- Producer API: `POST /jobs` enqueues with priority and a delay
- Persistent queue in SQLite with atomic claim (`UPDATE … WHERE status='pending' RETURNING …`)
- Worker pool in the same process (configurable size) or separate processes
- Retries with exponential backoff + jitter, dead-letter queue after N attempts
- Idempotent handlers via job keys
- Scheduling/cron-style recurring jobs
- Metrics endpoint: queue depth, throughput, failure rate, oldest pending age
- Graceful shutdown: stop claiming, finish in-flight jobs, then exit
- Tests covering retry, poison messages, and concurrent claims

**Skills proven:** concurrency correctness, transactions, resilience, observability, process lifecycle.

### Capstone E — HTTP Framework of Your Own *(the meta-project)*
Write your own micro-framework — call it `nano` — in ~500 lines:
- Router with params and wildcards, router mounting
- Middleware chain with `(req, res, next)` and 4-arg error handlers
- `req.body` parsing with size limits, `req.query`
- `res.json()`, `res.send()`, `res.status()` helpers
- Async handler support with automatic error forwarding
- A plugin/middleware ecosystem of your own: logger, cors, rate-limit, static
- Published to npm locally with `npm pack` and a README
- **Then rewrite one of your earlier projects using `nano`** and compare line counts

**Skills proven:** total understanding of what every web framework does. This is the ultimate Phase 5 payoff.

---

## 4. The 18-Week Schedule

Assumes **7–10 hrs/week**. Adjust ±2 weeks either way; the *order* matters far more than the dates.

| Week | Phase | Focus | Deliverable |
|:----:|-------|-------|-------------|
| 1 | 0 → 1 | JS checklist + runtime, `process`, timers, signals, `parseArgs` | `01-cli-tool` |
| 2 | 2 | CJS/ESM, resolution, npm, `package.json`, semver, lockfile | Notes + experiments |
| 3 | 2 | `fs/promises`, `path`, atomic writes, config + env validation | `02-todo-cli` |
| 4 | 3 | Event loop phases, microtasks, **the order experiment** | `experiments/event-loop-order.js` |
| 5 | 3 | Promises, `async/await`, cancellation, concurrency limits | `03-task-runner` |
| 6 | 4 | `EventEmitter`, listener leaks, async iteration | `04a-pubsub` |
| 7 | 4 | Streams, backpressure, `pipeline`, transforms | `04b-log-analyzer` |
| 8 | 4 | Worker threads, worker pools, `child_process`, security | `04c-worker-hasher` |
| 9 | 5 | `net`, TCP framing, raw HTTP, HTTP semantics, TLS, CORS | Experiments |
| 10 | 5 | Routing, middleware pattern, static files, traversal defence | `05-static-server` |
| 11 | 6 | Architecture layering, validation, error contract, REST design | `06-rest-api` (core) |
| 12 | 6 | Auth (`scrypt`, sessions, JWT by hand), rate limiting, hardening | `06-rest-api` (complete) |
| 13 | 7 | SQLite, prepared statements, migrations, transactions, caching | `07-rest-api-sqlite` |
| 14 | 8 | `node:test`, mocking, fake timers, coverage, debugger | `08-tests` |
| 15 | 9 | Config, structured logging, `AsyncLocalStorage`, graceful shutdown | `09-prod-api` (part 1) |
| 16 | 9 | Load testing, profiling, memory leaks, resilience, Docker | `09-prod-api` (part 2) |
| 17 | 10 | Capstone #1 | Shipped capstone |
| 18 | 10 | Capstone #2 + portfolio READMEs | Shipped capstone |

**Milestones worth celebrating:**

- **End of Week 5** — you understand the event loop. Half the battle is over.
- **End of Week 8** — you can handle streams and CPU-bound work. You're now more capable than many people shipping Node.
- **End of Week 12** — you have a real API with zero dependencies. This is the moment a framework becomes a *choice* instead of a crutch.
- **End of Week 16** — you can operate code in production, not just write it.

---

## 5. Common Traps and Anti-Patterns

Learn these now so you recognize them in other people's code (and your own).

| Trap | Why it hurts | The fix |
|------|--------------|---------|
| `fs.readFileSync` inside a request handler | Blocks the loop for every client | Use `fs/promises`; sync only at startup |
| `await` in a loop for independent work | Serializes I/O, 10x slower | `Promise.all` / `mapLimit` |
| Unbounded `Promise.all` | Exhausts sockets, FDs, memory | Concurrency limit |
| `pipe()` instead of `pipeline()` | Errors don't propagate; streams leak | Always `stream.pipeline()` |
| Ignoring `write()`'s return value | Unbounded memory from backpressure | Wait for `'drain'`, or use `pipeline` |
| Buffering whole request bodies | One client OOMs your server | Count bytes, enforce a limit, abort |
| `emit('error')` with no listener | Process crashes | Always handle `error` events |
| Fire-and-forget promises | Silent failures, lost errors | `await`, or `.catch()`, or `void` deliberately |
| Building paths from `req.url` | Directory traversal vulnerability | `path.resolve` + containment check |
| `exec()` with interpolated input | Command injection | `spawn` with an argument array |
| `===` for comparing secrets | Timing attack | `crypto.timingSafeEqual` |
| Raw SHA-256 for passwords | Instant cracking | `scrypt`/`bcrypt`/`argon2` |
| Scattered `process.env.X` | Unvalidatable, untestable config | One validated, frozen `config.js` |
| `console.log` in production | Unparseable, no levels, no context | Structured logger with levels |
| No graceful shutdown | Dropped requests on every deploy | `SIGTERM` handler + drain |
| Exiting `0` from a failed CLI | Breaks scripts and CI | Correct exit codes |
| Committing `.env` | Leaked secrets forever | `.gitignore` immediately |
| One giant `index.js` | Untestable, unswappable | Layer: route → service → repo |
| Missing timeouts on outbound calls | Hung requests, cascading failures | `AbortSignal.timeout()` everywhere |
| Retrying without jitter | Thundering herd | Exponential backoff + jitter |
| Ignoring `unhandledRejection` | Silent data loss | Log and exit; let the supervisor restart |
| `JSON.parse` on unbounded input | Memory + CPU DoS | Size limit + `try/catch` |
| Leaking listeners (`on` in a loop) | `MaxListenersExceededWarning`, memory growth | `once`, `off`, or a single listener |

---

## 6. Resources Worth Your Time

**Primary (use these first, they're version-accurate):**
- **Node.js API docs** — `https://nodejs.org/api/` — the single best resource. Read `fs`, `http`, `stream`, `events`, `process`, `test`, `util`, `crypto` end to end at least once.
- **Node.js Learn** — `https://nodejs.org/en/learn` — official guided material: the event loop, async, streams, backpressure
- **MDN** — for `Promise`, `URL`, HTTP, Fetch, Web Streams
- **`node --help` and the CLI docs** — genuinely useful; `node --v8-options` for the deep end

**Books:**
- *Node.js Design Patterns* — Mario Casciaro & Luciano Mammino. **The** book for this roadmap. Covers streams, async patterns, scalability, and messaging in real depth. Get the latest edition.
- *Node Cookbook* — practical recipes across core modules
- *You Don't Know JS Yet* — fill any Phase 0 gaps
- *Designing Data-Intensive Applications* — not Node-specific, but the best book on the data layer

**Articles and repos:**
- Node.js's own **event loop guide** — `https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick`
- **`goldbergyoni/nodebestpractices`** on GitHub — skim it after Phase 9, when each point will land
- **`roadmap.sh/nodejs`** — a good visual index; ignore the framework branches, they're out of scope for you
- The Node.js **release blog** — watch what lands each major version

**Community:**
- The official Node.js Discord
- Node Weekly newsletter
- Read the *changelogs* of core modules you use — it's how you learn what's new instead of finding out via a stale blog post

**Metaskill:** read source. `node:events` and `node:http` are readable. Opening `node_modules` to see what a library actually does is the fastest way to stop being afraid of it.

---

## 7. Graduation Checklist: Are You Ready For A Framework?

You're ready to learn Express/Fastify (in a weekend, honestly) when you can tick all of these **without looking anything up**:

- [ ] I can draw the event loop, name its phases, and explain microtask priority
- [ ] I can explain why `Promise.all` doesn't use multiple cores, and what does
- [ ] I can build a working HTTP server with `node:http` and parse a JSON body safely, with a size limit
- [ ] I can implement a router with path params in under 100 lines
- [ ] I can write a middleware chain with `(req, res, next)` and explain why error handlers take 4 args
- [ ] I can explain backpressure and fix a stream that ignores it
- [ ] I know why `stream.pipeline` beats `.pipe()`
- [ ] I can build a request handler that never blocks the event loop
- [ ] I can cancel an in-flight operation with `AbortController`
- [ ] I can limit concurrency in a map over 10,000 items
- [ ] I can write a prepared-statement data layer with migrations
- [ ] I can structure an app into routes / services / repositories and swap the data store
- [ ] I can hash passwords and compare tokens safely
- [ ] I can defend against path traversal, prototype pollution, oversized bodies, and brute force
- [ ] I can write tests with `node:test`, including fake timers
- [ ] I can debug with a real debugger and read a heap snapshot
- [ ] I can implement graceful shutdown and explain what happens between `SIGTERM` and exit
- [ ] I can produce structured logs with a request id
- [ ] I can load-test my API and interpret the p95
- [ ] I have shipped at least two projects with an empty `dependencies` object

**If you can tick all twenty, you will read Express's source code in an afternoon and understand every line.** That's the goal of this entire roadmap: to make every framework a convenience, never a mystery.

### What to learn *after* this roadmap (in order)
1. **A framework** — Express (to understand the ecosystem's history), then Fastify (for modern performance and schemas)
2. **TypeScript** — you'll want it once your codebase passes ~3,000 lines
3. **A real database** — PostgreSQL deeply: indexes, query planning, transactions, isolation levels
4. **Auth done properly** — OAuth2/OIDC flows, refresh tokens, OpenID Connect providers
5. **Messaging and queues** — Redis, RabbitMQ/Kafka, at-least-once delivery, idempotency
6. **Observability** — OpenTelemetry, metrics, tracing, dashboards
7. **Architecture** — monolith design, service boundaries, and *then* microservices
8. **Infrastructure** — Docker deeply, CI/CD, cloud primitives, Kubernetes (last, not first)

---

## 8. Deliberately Out of Scope (For Now)

You asked for core Node.js only, so these are intentionally excluded. **Don't get distracted by them yet.**

| Skipped | Learn it when |
|---------|---------------|
| Express / Fastify / Koa / Nest | After [Section 7](#7-graduation-checklist-are-you-ready-for-a-framework) is fully ticked |
| Prisma / TypeORM / Sequelize / Mongoose | After you've written raw SQL and prepared statements by hand |
| GraphQL / tRPC | After you know REST and HTTP deeply |
| TypeScript | After Phase 8 — optional, and Node can now strip types natively |
| Redis / Kafka / RabbitMQ | After you understand the data layer, in the "after this roadmap" list |
| Docker / Kubernetes | Docker in Phase 9; Kubernetes much later |
| Microservices | After you can build a good monolith |
| React / any frontend | It's a different job; learn it separately if you want it |
| `nodemon`, `dotenv`, `body-parser`, `helmet`, `cors`, `pino` | You're building all of these by hand. That's the point. |

---

## 9. Core Module Quick Reference

| Module | What it's for |
|--------|---------------|
| `node:process` | The running process: args, env, exit, signals |
| `node:fs` / `node:fs/promises` | Files and directories |
| `node:path` | Cross-platform path manipulation |
| `node:os` | Machine info: CPUs, memory, tmp dir |
| `node:url` | `URL`, `URLSearchParams`, file-URL conversion |
| `node:util` | `parseArgs`, `promisify`, `inspect`, `types` |
| `node:events` | `EventEmitter`, `once`, `on`, `getEventListeners` |
| `node:stream` | Readable, Writable, Transform, `pipeline` |
| `node:stream/web` | Web Streams interop |
| `node:readline` / `readline/promises` | Line-by-line / interactive input |
| `node:timers` / `node:timers/promises` | Timers, promise timers, async intervals |
| `node:buffer` | Binary data |
| `node:crypto` | Hashing, UUIDs, random bytes, HMAC, scrypt, `timingSafeEqual` |
| `node:net` | TCP servers and clients, Unix sockets |
| `node:http` / `node:https` | HTTP servers and clients |
| `node:http2` | HTTP/2 |
| `node:tls` | TLS/SSL |
| `node:zlib` | gzip/deflate/br compression streams |
| `node:dns` | DNS resolution (`lookup` vs `resolve`) |
| `node:worker_threads` | Real threads for CPU work |
| `node:child_process` | Spawning other programs |
| `node:cluster` | Multi-process scaling |
| `node:async_hooks` | `AsyncLocalStorage` request context |
| `node:perf_hooks` | `performance.now`, event-loop delay monitoring |
| `node:test` / `node:assert` | Built-in test runner and assertions |
| `node:v8` | Heap statistics, heap snapshots |
| `node:sqlite` | Embedded SQL database (v22.5+) |

---

*Roadmap version 1.0 — built for Node.js v24.x. The concepts are stable; only the module-level details drift, so check `nodejs.org/api` whenever a snippet here doesn't match what you see.*
