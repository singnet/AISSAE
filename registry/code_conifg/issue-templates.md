# Issue Templates

## Registration Template

```yaml
# .github/ISSUE_TEMPLATE/register-project.yml
name: Register New AISaE Project
description: Register a new project in the AISaE directory
title: "[REGISTER] New Project Registration"
labels: ["registration", "new-project"]
body:
  - type: markdown
    attributes:
      value: |
        ## Register New AISaE Project
        Use this form to register a new project in the AISaE directory.

  - type: input
    id: repository
    attributes:
      label: Repository URL
      description: The public GitHub repository URL for your project
      placeholder: https://github.com/username/project-name
    validations:
      required: true

  - type: checkboxes
    id: requirements
    attributes:
      label: Registration Requirements
      description: Please confirm you meet the following requirements
      options:
        - label: My repository is public
          required: true
        - label: I have created an `aisae_project_documents` folder in my repository
          required: true
        - label: I understand this registration will create a public entry in the AISaE directory
          required: true

  - type: markdown
    attributes:
      value: |
        ---
        
        **What happens next?**
        
        1. Our automated system will check if your repository is already registered
        2. If not, you'll receive a unique Project ID immediately
        3. The system will scan your `aisae_project_documents` folder for any existing template files
        4. Your project will be added to the public AISaE directory
        5. You can use your Project ID for future updates
        
        **Repository Format:**
        Please ensure your repository URL is in the format: `https://github.com/username/repository-name`
```

## Update Template

```yaml
# .github/ISSUE_TEMPLATE/update-project.yml
name: Update Existing AISaE Project
description: Update an existing project's data in the dashboard
title: "[UPDATE] Project Data Update"
labels: ["update", "existing-project"]
body:
  - type: markdown
    attributes:
      value: |
        ## Update Existing AISaE Project
        
        Use this form to update your project's data in the dashboard after making changes to your template files.

  - type: input
    id: project-id
    attributes:
      label: Project ID
      description: Your unique project ID from registration
      placeholder: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    validations:
      required: true

  - type: input
    id: repository
    attributes:
      label: Repository URL
      description: Confirm your repository URL
      placeholder: https://github.com/username/project-name
    validations:
      required: true

  - type: textarea
    id: changes
    attributes:
      label: What has changed?
      description: Briefly describe what you've updated in your templates
      placeholder: "Updated risk assessment, changed development stage, completed classification, etc."

  - type: checkboxes
    id: update-areas
    attributes:
      label: Areas Updated (Optional)
      description: Check which template areas you've modified
      options:
        - label: Project classification (purpose, environment, control, capability)
        - label: Implementation approach selection
        - label: Risk assessment and register
        - label: Risk threshold settings
        - label: Development stage
        - label: Other template content

  - type: markdown
    attributes:
      value: |
        ---
        
        **What happens next?**
        
        1. We'll verify your Project ID matches your repository
        2. Our system will re-scan all your template files
        3. Your dashboard data will be updated with any changes
        4. You'll receive a confirmation with your updated health score
        
        **Note:** Make sure your template files have properly filled markers (like `<!--%PROJ_NAME-->Your Project Name`) for the system to detect your updates.
```

## Template Features

### Registration Template
- Simple repository URL input
- Basic validation checkboxes
- Clear instructions on requirements

### Update Template
- Project ID and repository verification
- Optional change description
- Areas updated checklist for reference
