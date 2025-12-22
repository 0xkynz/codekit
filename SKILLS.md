# Agent Skills

Agent Skills are modular capabilities that extend Claude's functionality. Each Skill packages instructions, metadata, and optional resources (scripts, templates) that Claude uses automatically when relevant.

## Why Use Skills?

Skills are reusable, filesystem-based resources that provide Claude with domain-specific expertise. Unlike prompts (conversation-level instructions for one-off tasks), Skills load on-demand and eliminate the need to repeatedly provide the same guidance across multiple conversations.

**Key benefits:**

- **Specialize Claude** - Tailor capabilities for domain-specific tasks
- **Reduce repetition** - Create once, use automatically
- **Compose capabilities** - Combine Skills to build complex workflows
- **Context efficient** - Progressive disclosure loads content only when needed

## How Skills Work

Skills leverage Claude's execution environment to provide capabilities beyond what's possible with prompts alone. Claude operates with filesystem access, allowing Skills to exist as directories containing instructions, executable code, and reference materials.

### Progressive Disclosure

This filesystem-based architecture enables **progressive disclosure**: Claude loads information in stages as needed, rather than consuming context upfront.

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: Metadata (Always Loaded)                           │
│ ~100 tokens per skill                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ name: pdf-processing                                    │ │
│ │ description: Extract text and tables from PDF files...  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (triggered by request)
┌─────────────────────────────────────────────────────────────┐
│ Level 2: Instructions (Loaded When Triggered)               │
│ Under 5k tokens                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SKILL.md body with workflows and guidance               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (as needed)
┌─────────────────────────────────────────────────────────────┐
│ Level 3: Resources (Loaded As Needed)                       │
│ Effectively unlimited                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Additional markdown files, scripts, reference materials │ │
│ │ Scripts execute via bash - only output enters context   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Three Levels of Loading

| Level | When Loaded | Token Cost | Content |
|-------|------------|------------|---------|
| **Level 1: Metadata** | Always (at startup) | ~100 tokens per Skill | `name` and `description` from YAML frontmatter |
| **Level 2: Instructions** | When Skill is triggered | Under 5k tokens | SKILL.md body with instructions and guidance |
| **Level 3: Resources** | As needed | Effectively unlimited | Bundled files executed via bash without loading into context |

This means you can install many Skills without context penalty - Claude only knows each Skill exists and when to use it until actually triggered.

## Skill Structure

Every Skill is a directory containing a required `SKILL.md` file:

```
my-skill/
├── SKILL.md              # Required: frontmatter + instructions
├── FORMS.md              # Optional: specialized guides
├── REFERENCE.md          # Optional: detailed API docs
└── scripts/              # Optional: executable helper scripts
    └── validate.py
```

### SKILL.md Format

```yaml
---
name: my-skill-name
description: Brief description of what this Skill does and when to use it
---

# My Skill Name

## Quick Start
[How to use this skill for common tasks]

## Instructions
[Clear, step-by-step guidance for Claude to follow]

## Examples
[Concrete examples of using this Skill]

## Additional Resources
For advanced form filling, see [FORMS.md](FORMS.md).
```

### Required Fields

**`name`**
- Maximum 64 characters
- Must contain only lowercase letters, numbers, and hyphens
- Cannot contain XML tags
- Cannot contain reserved words: "anthropic", "claude"

**`description`**
- Must be non-empty
- Maximum 1024 characters
- Cannot contain XML tags
- Should include both what the Skill does AND when Claude should use it

### Example Frontmatter

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
```

## Content Types

Skills can contain three types of content:

### Instructions (Markdown Files)

Additional markdown files containing specialized guidance and workflows. These are read by Claude when referenced in SKILL.md.

```markdown
<!-- FORMS.md -->
# Form Filling Guide

## Filling Text Fields
1. Identify field locations using coordinates
2. Use pdfplumber to read existing values
3. Write new values with reportlab overlay
...
```

### Code (Scripts)

Executable scripts that Claude runs via bash. The script code never enters context - only the output does.

```python
# scripts/validate.py
import sys
import json

data = json.loads(sys.stdin.read())
errors = []

if not data.get('name'):
    errors.append('Name is required')

if errors:
    print(json.dumps({'valid': False, 'errors': errors}))
    sys.exit(1)

print(json.dumps({'valid': True}))
```

**Why scripts are efficient:** When Claude runs `validate.py`, the script's code never loads into context. Only the output (like "Validation passed" or error messages) consumes tokens.

### Resources

Reference materials like database schemas, API documentation, templates, or examples that Claude reads on-demand.

## Managing Skills with codekit

### List Available Skills

```bash
codekit skills list
```

Shows bundled skills, global skills (`~/.claude/skills/`), and project skills (`./.claude/skills/`).

### Install a Skill

```bash
# Install to project
codekit skills add pdf-processing

# Install globally
codekit skills add memory-bank --global

# Preview before installing
codekit skills add data-visualization --dry-run
```

### Remove a Skill

```bash
codekit skills remove pdf-processing
codekit skills remove memory-bank --global
```

## Bundled Skills

codekit includes these ready-to-use skills:

| Skill | Description |
|-------|-------------|
| **memory-bank** | Persistent project context across sessions. Maintains documentation about project requirements, technical context, and progress. |
| **python-fastapi** | Python FastAPI project patterns, structure, and best practices for building async APIs. |
| **pdf-processing** | Extract text and tables from PDF files, fill forms, and merge documents. |
| **data-visualization** | Create charts, graphs, and visualizations from data using Python libraries. |

## Creating Custom Skills

### Step 1: Create the Directory

```bash
mkdir -p .claude/skills/my-custom-skill
```

### Step 2: Create SKILL.md

```markdown
---
name: my-custom-skill
description: What this skill does and when Claude should use it. Be specific about triggers.
---

# My Custom Skill

## Overview
Brief explanation of what this skill provides.

## Quick Start
Most common usage pattern:

\`\`\`python
# Example code
\`\`\`

## Detailed Instructions

### Workflow 1: Common Task
1. Step one
2. Step two
3. Step three

### Workflow 2: Advanced Task
...

## Examples

### Example 1: Basic Usage
[Concrete example with input and output]

### Example 2: Complex Scenario
[More sophisticated example]
```

### Step 3: Add Supporting Files (Optional)

```bash
# Add detailed reference documentation
touch .claude/skills/my-custom-skill/REFERENCE.md

# Add helper scripts
mkdir .claude/skills/my-custom-skill/scripts
touch .claude/skills/my-custom-skill/scripts/helper.py
```

## Best Practices

### Writing Effective Descriptions

The description field is critical - it determines when Claude uses your skill.

**Good descriptions:**
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Poor descriptions:**
```yaml
description: PDF stuff
```

### Structuring Instructions

1. **Start with Quick Start** - Common patterns first
2. **Be procedural** - Step-by-step workflows
3. **Include examples** - Concrete, runnable examples
4. **Reference files explicitly** - Tell Claude where to find more info

### Script Design

- Scripts should be deterministic and reliable
- Output structured data (JSON) for easy parsing
- Handle errors gracefully with clear messages
- Keep scripts focused - one task per script

### Context Management

- Keep SKILL.md under 5k tokens
- Move detailed reference material to separate files
- Use scripts for complex logic to avoid loading code into context

## Where Skills Work

Skills are available across Claude's products:

| Product | Pre-built Skills | Custom Skills |
|---------|------------------|---------------|
| **Claude API** | Yes | Yes (via Skills API) |
| **Claude Code** | No | Yes (filesystem-based) |
| **Claude Agent SDK** | No | Yes (filesystem-based) |
| **Claude.ai** | Yes | Yes (zip upload) |

### Scope and Sharing

- **Claude.ai**: Individual user only
- **Claude API**: Organization-wide
- **Claude Code**: Personal (`~/.claude/skills/`) or project-based (`.claude/skills/`)

## Security Considerations

Skills are powerful - they can direct Claude to invoke tools and execute code.

**Only use Skills from trusted sources.** A malicious Skill can direct Claude to invoke tools or execute code in ways that don't match the Skill's stated purpose.

**Before using third-party Skills:**
- Audit all files: SKILL.md, scripts, and resources
- Look for unusual patterns: unexpected network calls, file access, or operations that don't match the stated purpose
- Be especially careful with Skills that fetch external data

**Treat Skills like installing software** - only install from sources you trust.

## Runtime Environment

The runtime environment depends on where the Skill runs:

| Product | Network Access | Package Installation |
|---------|---------------|---------------------|
| **Claude.ai** | Varies by settings | Pre-configured only |
| **Claude API** | None | Pre-configured only |
| **Claude Code** | Full access | Local installation only |

Plan your Skills to work within these constraints.

## Example: Complete Skill

Here's a complete example of a data validation skill:

```
data-validation/
├── SKILL.md
├── SCHEMAS.md
└── scripts/
    └── validate.py
```

**SKILL.md:**
```markdown
---
name: data-validation
description: Validate JSON and CSV data against schemas. Use when validating data files, checking data quality, or ensuring data conforms to expected formats.
---

# Data Validation

## Quick Start

Validate JSON data:
\`\`\`bash
cat data.json | python scripts/validate.py --schema user
\`\`\`

## Supported Schemas

See [SCHEMAS.md](SCHEMAS.md) for all available schemas.

## Instructions

### Validating JSON Files
1. Identify the appropriate schema from SCHEMAS.md
2. Run the validation script with the schema name
3. Review any validation errors
4. Fix data issues and re-validate

### Validating CSV Files
1. Convert CSV to JSON format first
2. Follow JSON validation steps

## Examples

### Valid User Data
Input:
\`\`\`json
{"name": "John", "email": "john@example.com", "age": 30}
\`\`\`

Output:
\`\`\`json
{"valid": true}
\`\`\`

### Invalid User Data
Input:
\`\`\`json
{"name": "", "email": "invalid"}
\`\`\`

Output:
\`\`\`json
{"valid": false, "errors": ["name is required", "email format invalid"]}
\`\`\`
```

**SCHEMAS.md:**
```markdown
# Available Schemas

## User Schema
- name: string (required)
- email: string, email format (required)
- age: number, 0-150 (optional)

## Product Schema
- id: string (required)
- price: number, positive (required)
- name: string (required)
```

**scripts/validate.py:**
```python
#!/usr/bin/env python3
import sys
import json
import argparse

SCHEMAS = {
    'user': {
        'required': ['name', 'email'],
        'fields': {
            'name': {'type': str, 'min_length': 1},
            'email': {'type': str, 'pattern': r'.+@.+\..+'},
            'age': {'type': int, 'min': 0, 'max': 150}
        }
    }
}

def validate(data, schema_name):
    schema = SCHEMAS.get(schema_name)
    if not schema:
        return {'valid': False, 'errors': [f'Unknown schema: {schema_name}']}

    errors = []
    for field in schema['required']:
        if not data.get(field):
            errors.append(f'{field} is required')

    return {'valid': len(errors) == 0, 'errors': errors}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--schema', required=True)
    args = parser.parse_args()

    data = json.loads(sys.stdin.read())
    result = validate(data, args.schema)
    print(json.dumps(result))
    sys.exit(0 if result['valid'] else 1)
```

## Further Reading

- [Anthropic Engineering Blog: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Agent Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
