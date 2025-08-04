# Update Workflow

```yaml
# .github/workflows/update-project.yml
name: Update AISaE Project

on:
  issues:
    types: [opened]

permissions:
  issues: write
  contents: write

jobs:
  update-project:
    if: contains(github.event.issue.title, '[UPDATE]')
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: |
        npm init -y
        npm install @octokit/rest uuid yaml-front-matter pg

    - name: Extract project info from issue
      id: extract-info
      run: |
        echo "Extracting project information from issue body"
        PROJECT_ID=$(echo "${{ github.event.issue.body }}" | grep -oP 'Project ID.*?\K[a-f0-9-]{36}')
        REPO_URL=$(echo "${{ github.event.issue.body }}" | grep -oP 'https://github\.com/[^\s\)]+')
        
        if [ -z "$PROJECT_ID" ]; then
          echo "::error::No valid Project ID found in issue body"
          exit 1
        fi
        
        if [ -z "$REPO_URL" ]; then
          echo "::error::No valid GitHub repository URL found in issue body"
          exit 1
        fi
        
        echo "project_id=$PROJECT_ID" >> $GITHUB_OUTPUT
        echo "repo_url=$REPO_URL" >> $GITHUB_OUTPUT
        echo "Found Project ID: $PROJECT_ID"
        echo "Found repository: $REPO_URL"

    - name: Verify project exists
      id: verify-project
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        PROJECT_ID: ${{ steps.extract-info.outputs.project_id }}
        REPO_URL: ${{ steps.extract-info.outputs.repo_url }}
      run: |
        node << 'EOF'
        const { Client } = require('pg');
        
        async function verifyProject() {
          const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
          });
          
          try {
            await client.connect();
            
            const result = await client.query(
              'SELECT id, name, repository_url FROM aisae_projects WHERE id = $1',
              [process.env.PROJECT_ID]
            );
            
            if (result.rows.length === 0) {
              console.log('Project ID not found in database');
              const fs = require('fs');
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `exists=false\n`);
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `error=Project ID not found\n`);
              return;
            }
            
            const project = result.rows[0];
            
            // Verify repository URL matches
            if (project.repository_url !== process.env.REPO_URL) {
              console.log(`Repository URL mismatch. Expected: ${project.repository_url}, Got: ${process.env.REPO_URL}`);
              const fs = require('fs');
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `exists=false\n`);
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `error=Repository URL does not match registered project\n`);
              return;
            }
            
            console.log(`Project verified: ${project.name} (ID: ${project.id})`);
            const fs = require('fs');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `exists=true\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `project_name=${project.name}\n`);
            
          } catch (error) {
            console.error('Database verification failed:', error);
            throw error;
          } finally {
            await client.end();
          }
        }
        
        verifyProject().catch(error => {
          console.error('Verification failed:', error);
          process.exit(1);
        });
        EOF

    - name: Comment if project not found
      if: steps.verify-project.outputs.exists == 'false'
      uses: actions/github-script@v7
      with:
        script: |
          const projectId = '${{ steps.extract-info.outputs.project_id }}';
          const error = '${{ steps.verify-project.outputs.error }}';
          
          const errorMessage = `
          ❌ **Project Update Failed**
          
          **Error:** ${error}
          
          **Project ID:** \`${projectId}\`
          **Repository:** ${{ steps.extract-info.outputs.repo_url }}
          
          Please check that:
          1. Your Project ID is correct (from your registration confirmation)
          2. Your repository URL matches the one you registered with
          3. The project was successfully registered
          
          If you need to register a new project, use the **[REGISTER]** issue template instead.
          `;
          
          await github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: errorMessage
          });
          
          await github.rest.issues.update({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            state: 'closed',
            labels: ['update-failed', 'project-not-found']
          });

    - name: Create shared update script
      if: steps.verify-project.outputs.exists == 'true'
      run: |
        # Use the same update script as registration
        cat > update-project-data.js << 'EOF'
        const fs = require('fs');
        const https = require('https');
        const yaml = require('yaml-front-matter');
        const { Client } = require('pg');
        
        function fetchUrl(url) {
          return new Promise((resolve, reject) => {
            https.get(url, (res) => {
              let data = '';
              res.on('data', (chunk) => data += chunk);
              res.on('end', () => {
                if (res.statusCode === 200) {
                  resolve(data);
                } else {
                  reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
              });
            }).on('error', reject);
          });
        }
        
        async function scrapeAllTemplates(repoUrl) {
          const baseUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com');
          
          const templateFiles = {
            'project-details': '/main/aisae_project_documents/project_details_template.md',
            'implementation-approach': '/main/aisae_project_documents/implementation_approach_selection.md',
            'risk-threshold': '/main/aisae_project_documents/risk_threshold_setting_worksheet.md',
            'risk-register': '/main/aisae_project_documents/risk_register.csv'
          };
          
          const scrapedData = {
            files_found: [],
            classification: null,
            approach: null,
            risk_thresholds: null,
            risks: null
          };
          
          for (const [type, file] of Object.entries(templateFiles)) {
            try {
              const url = baseUrl + file;
              console.log(`Attempting to fetch: ${url}`);
              
              let content;
              try {
                content = await fetchUrl(url);
              } catch (error) {
                const masterUrl = url.replace('/main/', '/master/');
                console.log(`Main branch failed, trying: ${masterUrl}`);
                content = await fetchUrl(masterUrl);
              }
              
              scrapedData.files_found.push(type);
              
              if (type === 'project-details') {
                scrapedData.classification = parseProjectClassification(content);
              } else if (type === 'implementation-approach') {
                scrapedData.approach = parseImplementationApproach(content);
              } else if (type === 'risk-threshold') {
                scrapedData.risk_thresholds = parseRiskThresholds(content);
              } else if (type === 'risk-register') {
                scrapedData.risks = parseRiskRegister(content);
              }
              
            } catch (error) {
              console.log(`Could not fetch ${type}: ${error.message}`);
            }
          }
          
          return scrapedData;
        }
        
        function parseProjectClassification(content) {
          const stageMatch = content.match(/<!--%CURRENT_STAGE-->([^<\n(]+)/);
          const currentStage = stageMatch ? stageMatch[1].trim() : null;
          
          const purposeSection = extractSectionAfterMarker(content, '<!--%PURPOSE_CODES-->');
          const environmentSection = extractSectionAfterMarker(content, '<!--%ENVIRONMENT_CODE-->');
          const controlSection = extractSectionAfterMarker(content, '<!--%CONTROL_CODE-->');
          const capabilitySection = extractSectionAfterMarker(content, '<!--%CAPABILITY_CODE-->');
          
          const purposeCodes = extractCheckedCodes(purposeSection, /- \[x\] \*\*[^(]*\(([CDFPHMA?])\)/g);
          const environmentCode = extractCheckedCode(environmentSection, /- \[x\] \*\*[^(]*\(([LSHG?])\)/);
          const controlCode = extractCheckedCode(controlSection, /- \[x\] \*\*[^(]*\(([CGI?])\)/);
          const capabilityCode = extractCheckedCode(capabilitySection, /- \[x\] \*\*[^(]*\(([BAE?])\)/);
          
          let classificationString = null;
          if (purposeCodes.length > 0 || environmentCode !== '?' || controlCode !== '?' || capabilityCode !== '?') {
            classificationString = purposeCodes.join('') + '-' + environmentCode + '-' + controlCode + '-' + capabilityCode;
          }
          
          return {
            purpose_codes: purposeCodes.length > 0 ? purposeCodes : null,
            environment_code: environmentCode !== '?' ? environmentCode : null,
            control_code: controlCode !== '?' ? controlCode : null,
            capability_code: capabilityCode !== '?' ? capabilityCode : null,
            classification_string: classificationString,
            current_stage: currentStage
          };
        }
        
        function parseImplementationApproach(content) {
          const rationaleMatch = content.match(/<!--%APPROACH_RATIONALE-->([^<\n]+)/);
          const approachRationale = rationaleMatch ? rationaleMatch[1].trim() : null;
          
          let approachNumber = null;
          if (content.includes('- [x] Approach 1:')) approachNumber = 1;
          else if (content.includes('- [x] Approach 2:')) approachNumber = 2;
          else if (content.includes('- [x] Approach 3:')) approachNumber = 3;
          
          let prioritiesComplete = null;
          if (content.includes('- [x] Complete')) prioritiesComplete = 'Complete';
          else if (content.includes('- [x] In Progress')) prioritiesComplete = 'In Progress';
          else if (content.includes('- [x] Not Started')) prioritiesComplete = 'Not Started';
          
          return {
            approach_number: approachNumber,
            approach_rationale: approachRationale,
            priorities_complete: prioritiesComplete
          };
        }
        
        function parseRiskThresholds(content) {
          let thresholdOption = null;
          if (content.includes('- [x] A (Conservative)')) thresholdOption = 'A';
          else if (content.includes('- [x] B (Moderate)')) thresholdOption = 'B';
          else if (content.includes('- [x] C (Risk-Tolerant)')) thresholdOption = 'C';
          else if (content.includes('- [x] D (Custom)')) thresholdOption = 'D';
          
          const familiaritySection = extractSectionAfterMarker(content, '<!--%FAMILIARITY_SCALING-->');
          const stageSection = extractSectionAfterMarker(content, '<!--%STAGE_SCALING-->');
          
          const familiarityScaling = familiaritySection.includes('- [x] Yes') ? true : null;
          const stageScaling = stageSection.includes('- [x] Yes') ? true : null;
          
          return {
            threshold_option: thresholdOption,
            familiarity_scaling: familiarityScaling,
            stage_scaling: stageScaling
          };
        }
        
        function parseRiskRegister(csvContent) {
          const lines = csvContent.split('\n').filter(line => line.trim());
          
          let headerIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Risk Name,') && lines[i].includes('Risk Zone')) {
              headerIndex = i;
              break;
            }
          }
          
          if (headerIndex === -1) {
            return { risks: [] };
          }
          
          const headers = lines[headerIndex].split(',').map(h => h.trim());
          const risks = [];
          
          for (let i = headerIndex + 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const risk = {};
            
            headers.forEach((header, index) => {
              risk[header] = values[index] || '';
            });
            
            if (risk['Risk Name'] && 
                !risk['Risk Name'].toLowerCase().includes('example') &&
                risk['Risk Name'] !== 'Risk Name' &&
                risk['Risk Name'].trim() !== '') {
              risks.push(risk);
            }
          }
          
          return { risks };
        }
        
        function extractSectionAfterMarker(content, marker) {
          const markerIndex = content.indexOf(marker);
          if (markerIndex === -1) return '';
          
          const afterMarker = content.substring(markerIndex + marker.length);
          const nextMarkerIndex = afterMarker.search(/<!--%\w+%-->/);
          
          return nextMarkerIndex === -1 ? afterMarker : afterMarker.substring(0, nextMarkerIndex);
        }
        
        function extractCheckedCodes(section, regex) {
          const codes = [];
          let match;
          while ((match = regex.exec(section)) !== null) {
            codes.push(match[1]);
          }
          return codes;
        }
        
        function extractCheckedCode(section, regex) {
          const match = regex.exec(section);
          return match ? match[1] : '?';
        }
        
        function calculateHealthScore(classification, approach, risks) {
          let score = 0;
          
          if (classification && (classification.purpose_codes || classification.environment_code || 
                               classification.control_code || classification.capability_code)) {
            score += 30;
          }
          
          if (approach && approach.approach_number) {
            score += 30;
          }
          
          if (risks && risks.risks.length > 0) {
            score += 40;
          }
          
          return Math.max(0, Math.min(100, score));
        }
        
        function getHealthStatus(score) {
          if (score >= 80) return 'healthy';
          if (score >= 50) return 'attention';
          if (score > 0) return 'unknown';
          return null;
        }
        
        function getCompletionSummary(classification, approach, risks) {
          const items = [];
          
          if (classification && (classification.purpose_codes || classification.environment_code || 
                               classification.control_code || classification.capability_code)) {
            items.push('✅ Classified');
          } else {
            items.push('❌ Classification needed');
          }
          
          if (approach && approach.approach_number) {
            items.push('✅ Approach chosen');
          } else {
            items.push('❌ Approach needed');
          }
          
          if (risks && risks.risks.length > 0) {
            items.push('✅ Risks assessed');
          } else {
            items.push('❌ Risk assessment needed');
          }
          
          return items.join(' ');
        }
        
        async function updateProjectData() {
          try {
            const projectId = process.env.PROJECT_ID;
            const repoUrl = process.env.REPO_URL;
            
            console.log('Scraping template files for updates...');
            const scrapedData = await scrapeAllTemplates(repoUrl);
            
            const healthScore = calculateHealthScore(
              scrapedData.classification, 
              scrapedData.approach, 
              scrapedData.risks
            );
            
            const healthStatus = getHealthStatus(healthScore);
            const completionSummary = getCompletionSummary(
              scrapedData.classification,
              scrapedData.approach,
              scrapedData.risks
            );
            
            // Update database
            const client = new Client({
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false }
            });
            
            await client.connect();
            console.log('Database connected for update');
            
            // Update main project data
            const updateQuery = `
              UPDATE aisae_projects SET
                purpose_codes = $2,
                environment_code = $3,
                control_code = $4,
                capability_code = $5,
                classification_string = $6,
                current_stage = $7,
                approach_number = $8,
                approach_rationale = $9,
                priorities_complete = $10,
                threshold_option = $11,
                familiarity_scaling = $12,
                stage_scaling = $13,
                health_score = $14,
                health_status = $15,
                completion_summary = $16,
                templates_last_scraped = CURRENT_TIMESTAMP
              WHERE id = $1
            `;
            
            await client.query(updateQuery, [
              projectId,
              scrapedData.classification?.purpose_codes || null,
              scrapedData.classification?.environment_code || null,
              scrapedData.classification?.control_code || null,
              scrapedData.classification?.capability_code || null,
              scrapedData.classification?.classification_string || null,
              scrapedData.classification?.current_stage || null,
              scrapedData.approach?.approach_number || null,
              scrapedData.approach?.approach_rationale || null,
              scrapedData.approach?.priorities_complete || null,
              scrapedData.risk_thresholds?.threshold_option || null,
              scrapedData.risk_thresholds?.familiarity_scaling || null,
              scrapedData.risk_thresholds?.stage_scaling || null,
              healthScore,
              healthStatus,
              completionSummary
            ]);
            
            console.log('Project data updated successfully');
            
            // Clear existing risks and insert new ones
            if (scrapedData.risks && scrapedData.risks.risks.length > 0) {
              await client.query('DELETE FROM project_risks WHERE project_id = $1', [projectId]);
              
              for (const risk of scrapedData.risks.risks) {
                const riskQuery = `
                  INSERT INTO project_risks 
                  (project_id, risk_name, description, risk_familiarity, impact_score, 
                   likelihood_score, risk_score, risk_zone, mitigation_strategy, owner, status, due_date)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `;
                
                await client.query(riskQuery, [
                  projectId,
                  risk['Risk Name'] || '',
                  risk['Description'] || '',
                  risk['Risk Familiarity'] || '',
                  risk['Impact Score'] ? parseInt(risk['Impact Score']) : null,
                  risk['Likelihood Score'] ? parseInt(risk['Likelihood Score']) : null,
                  risk['Risk Score'] ? parseInt(risk['Risk Score']) : null,
                  risk['Risk Zone'] || '',
                  risk['Mitigation Strategy'] || '',
                  risk['Owner'] || '',
                  risk['Status'] || '',
                  risk['Due Date'] ? new Date(risk['Due Date']) : null
                ]);
              }
              console.log(`${scrapedData.risks.risks.length} risks updated successfully`);
            }
            
            await client.end();
            
            console.log(`Update completed - Health Score: ${healthScore}/100 (${healthStatus || 'not set'})`);
            console.log(`Files processed: ${scrapedData.files_found.join(', ')}`);
            
            // Save results for GitHub Actions
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `update_success=true\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `health_score=${healthScore}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `health_status=${healthStatus || 'unknown'}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `files_found=${scrapedData.files_found.join(',')}\n`);
            
          } catch (error) {
            console.error('Update failed:', error);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `update_success=false\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `update_error=${error.message}\n`);
          }
        }
        
        updateProjectData();
        EOF

    - name: Update project data
      if: steps.verify-project.outputs.exists == 'true'
      id: update-data
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        PROJECT_ID: ${{ steps.extract-info.outputs.project_id }}
        REPO_URL: ${{ steps.extract-info.outputs.repo_url }}
      run: |
        node update-project-data.js

    - name: Comment on successful update
      if: steps.update-data.outputs.update_success == 'true'
      uses: actions/github-script@v7
      with:
        script: |
          const projectId = '${{ steps.extract-info.outputs.project_id }}';
          const projectName = '${{ steps.verify-project.outputs.project_name }}';
          const healthScore = '${{ steps.update-data.outputs.health_score || '0' }}';
          const healthStatus = '${{ steps.update-data.outputs.health_status || 'unknown' }}';
          const filesFound = '${{ steps.update-data.outputs.files_found || 'none' }}';
          
          const healthEmoji = {
            'healthy': '🟢',
            'attention': '🟡', 
            'critical': '🔴',
            'unknown': '⚪'
          }[healthStatus] || '⚪';
          
          const successMessage = `
          ✅ **Project Update Successful**
          
          **Project ID:** \`${projectId}\`
          **Project Name:** ${projectName}
          **Repository:** ${{ steps.extract-info.outputs.repo_url }}
          **Health Status:** ${healthEmoji} ${healthScore}/100 (${healthStatus})
          
          Your project data has been successfully updated!
          
          **Template Files Processed:** ${filesFound === 'none' ? 'No template files found' : filesFound.split(',').join(', ')}
          
          **Dashboard Status:**
          ${healthStatus === 'healthy' ? '🎉 Your project is looking great! All major components are complete.' :
            healthStatus === 'attention' ? '⚠️ Your project is making good progress. Consider completing remaining templates.' :
            healthStatus === 'unknown' ? '📝 Your project is getting started. Fill out more templates to improve your health score.' :
            '⚪ Keep working on your templates to track your progress.'}
          
          **Next Steps:**
          - Visit the AISaE dashboard to see your updated status
          - Complete any remaining template sections
          - Use this UPDATE workflow whenever you make changes to your templates
          `;
          
          await github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: successMessage
          });
          
          await github.rest.issues.update({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            state: 'closed',
            labels: ['updated', 'aisae-project', `health-${healthStatus}`]
          });

    - name: Comment on failed update
      if: steps.update-data.outputs.update_success == 'false'
      uses: actions/github-script@v7
      with:
        script: |
          const projectId = '${{ steps.extract-info.outputs.project_id }}';
          const error = '${{ steps.update-data.outputs.update_error || 'Unknown error' }}';
          
          const errorMessage = `
          ❌ **Project Update Failed**
          
          **Project ID:** \`${projectId}\`
          **Repository:** ${{ steps.extract-info.outputs.repo_url }}
          **Error:** ${error}
          
          Please check that:
          1. Your repository is public
          2. You have an \`aisae_project_documents\` folder in your repository root
          3. Your template files contain properly filled markers
          4. The repository URL is accessible
          
          If you continue to have issues, please contact the maintainers.
          `;
          
          await github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: errorMessage
          });
          
          await github.rest.issues.addLabels({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            labels: ['update-failed', 'needs-attention']
          });

    - name: Update project registry entry
      if: steps.update-data.outputs.update_success == 'true'
      run: |
        mkdir -p registry
        echo '{
          "id": "${{ steps.extract-info.outputs.project_id }}",
          "name": "${{ steps.verify-project.outputs.project_name }}",
          "repository_url": "${{ steps.extract-info.outputs.repo_url }}",
          "last_updated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
          "health_score": ${{ steps.update-data.outputs.health_score || 0 }},
          "health_status": "${{ steps.update-data.outputs.health_status || 'unknown' }}",
          "files_processed": ["${{ steps.update-data.outputs.files_found }}"]
        }' > "registry/${{ steps.extract-info.outputs.project_id }}.json"
        
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add registry/
        git commit -m "Update project data: ${{ steps.verify-project.outputs.project_name }}"
        git push
```

## What This Workflow Does

1. **Project Verification**: Confirms Project ID exists and matches repository
2. **Template Scanning**: Re-parses all template files for changes
3. **Data Update**: Updates database with new information
4. **Health Recalculation**: Updates health score based on current data
5. **User Feedback**: Reports success/failure and new health status

## Key Features

- Requires valid Project ID
- Verifies repository matches
- Idempotent operation (safe to run multiple times)
- Comprehensive template parsing
- Detailed update reporting
