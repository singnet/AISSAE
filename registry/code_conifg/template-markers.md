# Template Markers Guide

## Purpose

Projects fill HTML comment markers in their template files. The system parses these markers to extract project data.

## Marker Format

```html
<!--%MARKER_NAME-->Value to extract
```

## Required Markers

### project_details_template.md
- `<!--%PROJ_NAME-->` - Project name
- `<!--%CURRENT_STAGE-->` - Development stage (Concept/Prototype/Development/Operations)
- `<!--%PURPOSE_CODES-->` - Before purpose checkboxes
- `<!--%ENVIRONMENT_CODE-->` - Before environment checkboxes  
- `<!--%CONTROL_CODE-->` - Before control checkboxes
- `<!--%CAPABILITY_CODE-->` - Before capability checkboxes

### implementation_approach_selection.md
- `<!--%APPROACH_RATIONALE-->` - Why they chose their approach
- Checkbox patterns: `- [x] Approach 2: "Do It Properly"`
- Priority status: `- [x] Complete`

### risk_threshold_setting_worksheet.md
- `<!--%THRESHOLD_OPTION-->` - Before threshold checkboxes
- `<!--%FAMILIARITY_SCALING-->` - Before scaling checkboxes
- `<!--%STAGE_SCALING-->` - Before scaling checkboxes

### risk_register.csv
- No markers needed
- System calculates statistics from actual risk data
- Skips rows containing "example" or empty risk names

## Parsing Logic

- **Checkboxes**: Looks for `- [x]` patterns after markers
- **Text Values**: Extracts content immediately following markers
- **Code Extraction**: Finds letter codes in parentheses like `(C)`, `(H)`
- **Calculations**: Derives health scores from completion status

## Example

```markdown
<!--%PROJ_NAME-->AI Safety Monitor
<!--%CURRENT_STAGE-->Development

<!--%PURPOSE_CODES-->
- [x] **Creates (C)** - Makes things for users
- [x] **Decides (D)** - Chooses for users
- [ ] **Finds (F)** - Finds things for users
```

This extracts:
- Project name: "AI Safety Monitor"
- Current stage: "Development"  
- Purpose codes: ["C", "D"]
