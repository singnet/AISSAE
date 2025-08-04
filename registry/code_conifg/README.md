# AISaE Project Registration & Dashboard System

## Overview

This system allows AI projects to register in the AISaE directory and track their progress through the AISaE framework via an automated dashboard.

## Architecture

- **Registration**: Projects submit GitHub repository URL, get unique Project ID
- **Auto-Update**: System scrapes template files from `aisae_project_documents` directory
- **Dashboard**: Displays project health scores, completion status, and risk assessments
- **Templates**: Projects fill HTML comment markers in template files
- **Database**: Supabase PostgreSQL with two main entities (projects + risks)

## How It Works

1. **Register**: Project opens GitHub issue with `[REGISTER]` title + repository URL
2. **Validation**: System checks repository not already registered
3. **Create Record**: Basic project entry created, Project ID assigned
4. **Auto-Scan**: System immediately scans for existing template data
5. **Update**: Project uses `[UPDATE]` issues to refresh data when templates change

## Template Markers

Projects fill markers in template files:
- `<!--%PROJ_NAME-->My Project Name`
- `<!--%CURRENT_STAGE-->Development`
- `<!--%APPROACH_NUMBER-->` + checkbox selections
- `- [x] Approach 2: "Do It Properly"`

## Health Scoring

- **30 points**: Classification complete (purpose/environment/control/capability)
- **30 points**: Implementation approach chosen (1, 2, or 3)
- **40 points**: Risk assessment done (risks in CSV register)
- **Status**: Healthy (80+), Attention (50-79), Unknown (<50)

## Database Schema

Two main tables:
- `aisae_projects`: All project data with nullable template fields
- `project_risks`: Individual risks from CSV register
- Lookup tables: `approach_types`, `threshold_types`

## Components

### GitHub Workflows
- `.github/workflows/register-project.yml`
- `.github/workflows/update-project.yml`

### Issue Templates
- `.github/ISSUE_TEMPLATE/register-project.yml`
- `.github/ISSUE_TEMPLATE/update-project.yml`

### Database
- Supabase PostgreSQL database
- Views for calculated risk statistics
- Foreign key relationships for data integrity
