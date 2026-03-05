---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
---

# Skill Creator

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing
specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific
domains or tasks — they transform Claude from a general-purpose agent into a specialized agent
equipped with procedural knowledge that no model can fully possess.

### What Skills Provide

1. Specialized workflows - Multi-step procedures for specific domains
2. Tool integrations - Instructions for working with specific file formats or APIs
3. Domain expertise - Company-specific knowledge, schemas, business logic
4. Bundled resources - Scripts, references, and assets for complex and repetitive tasks

## Core Principles

### Concise is Key

The context window is a public good. Skills share it with everything else Claude needs: system prompt, conversation history, other Skills' metadata, and the actual user request.

**Default assumption: Claude is already very smart.** Only add context Claude doesn't already have. Challenge each piece of information: "Does Claude really need this explanation?" and "Does this paragraph justify its token cost?"

Prefer concise examples over verbose explanations.

### Set Appropriate Degrees of Freedom

Match the level of specificity to the task's fragility and variability:

**High freedom (text-based instructions)**: Use when multiple approaches are valid, decisions depend on context, or heuristics guide the approach.

**Medium freedom (pseudocode or scripts with parameters)**: Use when a preferred pattern exists, some variation is acceptable, or configuration affects behavior.

**Low freedom (specific scripts, few parameters)**: Use when operations are fragile and error-prone, consistency is critical, or a specific sequence must be followed.

Think of Claude as exploring a path: a narrow bridge with cliffs needs specific guardrails (low freedom), while an open field allows many routes (high freedom).

### Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

#### SKILL.md (required)

- **Frontmatter** (YAML): Contains `name` and `description` fields (required). Only `name` and `description` are read by Claude to determine when the skill triggers, so be clear and comprehensive about what the skill is and when it should be used.
- **Body** (Markdown): Instructions and guidance for using the skill. Only loaded AFTER the skill triggers.

#### Bundled Resources (optional)

##### Scripts (`scripts/`)

Executable code for tasks that require deterministic reliability or are repeatedly rewritten.

- **When to include**: When the same code is being rewritten repeatedly or deterministic reliability is needed
- **Benefits**: Token efficient, deterministic, may be executed without loading into context

##### References (`references/`)

Documentation and reference material loaded as needed into context.

- **When to include**: For documentation Claude should reference while working
- **Use cases**: Database schemas, API docs, domain knowledge, company policies, detailed workflow guides
- **Best practice**: If files are large (>10k words), include grep search patterns in SKILL.md
- **Avoid duplication**: Information should live in either SKILL.md or references files, not both

##### Assets (`assets/`)

Files not loaded into context, but used within the output Claude produces.

- **When to include**: When the skill needs files for the final output
- **Use cases**: Templates, images, icons, boilerplate code, fonts, sample documents

#### What Not to Include

Do NOT create extraneous files like README.md, INSTALLATION_GUIDE.md, QUICK_REFERENCE.md, CHANGELOG.md. The skill should only contain information needed for an AI agent to do the job.

### Progressive Disclosure

Skills use a three-level loading system to manage context efficiently:

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed by Claude (unlimited for scripts)

Keep SKILL.md body under 500 lines. Split content into separate files when approaching this limit. When splitting, reference them from SKILL.md and describe clearly when to read them.

**Key principle:** When a skill supports multiple variations, keep only the core workflow and selection guidance in SKILL.md. Move variant-specific details into separate reference files.

**Progressive disclosure patterns:**

- **High-level guide with references**: Quick start in SKILL.md, detailed docs in references/
- **Domain-specific organization**: Overview in SKILL.md, domain files in references/ (e.g., `references/aws.md`, `references/gcp.md`)
- **Conditional details**: Basic content inline, advanced content in separate files

**Important:** Avoid deeply nested references. Keep references one level deep from SKILL.md. For files longer than 100 lines, include a table of contents at the top.

## Skill Creation Process

1. Understand the skill with concrete examples
2. Plan reusable skill contents (scripts, references, assets)
3. Initialize the skill directory
4. Edit the skill (implement resources and write SKILL.md)
5. Iterate based on real usage

### Step 1: Understanding the Skill with Concrete Examples

Skip this step only when the skill's usage patterns are already clearly understood.

To create an effective skill, understand concrete examples of how the skill will be used. Ask the user:

- "What functionality should this skill support?"
- "Can you give examples of how it would be used?"
- "What would a user say that should trigger this skill?"

Avoid asking too many questions in a single message. Start with the most important questions.

### Step 2: Planning the Reusable Skill Contents

Analyze each example by:

1. Considering how to execute on the example from scratch
2. Identifying what scripts, references, and assets would be helpful when executing repeatedly

Example analyses:
- Rotating PDFs → `scripts/rotate_pdf.py` (same code each time)
- Building frontend webapps → `assets/hello-world/` template (same boilerplate)
- Querying BigQuery → `references/schema.md` (re-discovering schemas each time)

### Step 3: Initializing the Skill

Create the skill directory structure:

```
<skill-name>/
├── SKILL.md
├── scripts/      (if needed)
├── references/   (if needed)
└── assets/       (if needed)
```

Use the `scripts/init_skill.py` script to generate a template:

```bash
python scripts/init_skill.py <skill-name> --path <output-directory>
```

The script creates a SKILL.md template with TODO placeholders and example resource directories.

### Step 4: Edit the Skill

When editing, remember the skill is being created for another instance of Claude. Include information that would be beneficial and non-obvious.

#### Learn Proven Design Patterns

Consult these guides based on your skill's needs:

- **Multi-step processes**: See [references/workflows.md](references/workflows.md) for sequential workflows and conditional logic
- **Specific output formats or quality standards**: See [references/output-patterns.md](references/output-patterns.md) for template and example patterns

#### Start with Reusable Contents

Implement scripts/, references/, and assets/ files first. This step may require user input (e.g., brand assets, templates, documentation).

Test added scripts by running them to ensure correctness. Delete any example files not needed.

#### Update SKILL.md

**Writing Guidelines:** Always use imperative/infinitive form.

##### Frontmatter

- `name`: The skill name (kebab-case, max 64 chars)
- `description`: Primary triggering mechanism. Include both what the Skill does and specific triggers/contexts for when to use it. Include all "when to use" information here, not in the body.

##### Body

Write instructions for using the skill and its bundled resources.

### Step 5: Iterate

After testing, identify improvements:

1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or bundled resources should be updated
4. Implement changes and test again
