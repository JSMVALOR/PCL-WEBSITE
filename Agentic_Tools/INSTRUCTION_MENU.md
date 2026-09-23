# Agentic Tools - Instruction Menu

Welcome to the **Agentic Tools** hub! This document serves as a central guide for the various skills, tools, and configurations that have been installed for your projects.

## 1. Playwright (End-to-End Testing)
**Location:** `Agentic_Tools/e2e_testing/`
**What it is:** A framework for robust end-to-end testing of web apps across all modern browsers.
**How to use:**
- Navigate to the directory: `cd Agentic_Tools/e2e_testing`
- Write your tests in the `tests/` directory.
- Run tests: `npx playwright test`
- View report: `npx playwright show-report`

## 2. Taste Skill (`Leonxlnx/taste-skill`)
**What it is:** A specialized agentic skill meant to help an AI agent evaluate and improve the "taste" or aesthetic quality/design of a UI or project.
**How to use:**
- This skill is available globally via your Antigravity skills.
- To invoke it in a chat, you can refer to "use the taste skill" or check if it provides a specific slash command or prompt prefix.

## 3. Impeccable
**What it is:** A tool or utility for maintaining code quality, formatting, or agentic workflows (depending on the specific package).
**How to use:**
- Run `npx impeccable` from your project to see available commands or lint/format your code.

## 4. Agentic SEO Skill
**What it is:** A specialized AI skill for auditing and improving SEO (Search Engine Optimization) programmatically.
**How to use:**
- This was installed globally using the bash script. 
- You can ask the agent: "Please run an SEO audit on this page" or "Use the Agentic SEO skill to improve my metadata."

## 5. Agentic Awesome Skills
**What it is:** A collection of curated agentic skills like `brainstorming` and `systematic-debugging`.
**How to use:**
- We ran a dry run for `brainstorming` and `systematic-debugging`. Check `Agentic_Tools/agentic_awesome_skills_dry_run.txt` for details.
- To install them for real, you can run: `npx agentic-awesome-skills --antigravity --skills brainstorming,systematic-debugging`

## 6. Antigravity Awesome Skills
**What it is:** The default package for downloading and setting up standard Antigravity skills.
**How to use:**
- Run `npx antigravity-awesome-skills` to update or pull down new default skills to `~/.gemini/antigravity/skills`.

## 7. UI/UX Pro Max CLI
**What it is:** A command-line interface designed to streamline UI/UX processes, generate components, or audit design.
**How to use:**
- This is installed globally!
- You can run it from anywhere in your terminal by typing: `ui-ux-pro-max-cli` (or its designated alias, e.g., `uiux`). Use `--help` to see all commands.

---
*Tip: Since some of these are globally installed agentic skills, you can use them across all your projects by simply referencing them when chatting with your AI assistant.*
