# Registration Workflow


```yaml
# .github/workflows/register-project.yml
name: Register AISaE Project

on:
  issues:
    types: [opened]

permissions:
  issues: write
  contents: write

jobs:
  register-project:
    if: contains(github.event.issue.title, '[REGISTER]')
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

    - name: Extract repository URL from issue
      id: extract-url
      run: |
        echo "Extracting repository URL from issue body"
        REPO_URL=$(echo "${{ github.event.issue.body }}" | grep -oP 'https://github\.com/[^\s\)]+')
        if [ -z "$REPO_URL" ]; then
          echo "::error::No valid GitHub repository URL found in issue body"
          exit 1
        fi
        echo "repo_url=$REPO_URL" >> $GITHUB_OUTPUT
        echo "Found repository: $REPO_URL"

    - name: Check if project already registered
      id: check-existing
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        REPO_URL: ${{ steps.extract-url.outputs.repo_url }}
      run: |
        node << 'EOF'
        const { Client } = require('pg');
        
        async function checkExisting() {
          const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
          });
          
          try {
            await client.connect();
            
            const result = await client.query(
              'SELECT id, name FROM aisae_projects WHERE repository_url = $1',
              [process.env.REPO_URL]
            );
            
            if (result.rows.length > 0) {
              const existing = result.rows[0];
              console.log(`Project already exists: ${existing.name} (ID: ${existing.id})`);
              console.log(`existing=true`);
              console.log(`existing_id=${existing.id}`);
              console.log(`existing_name=${existing.name}`);
              
              const fs = require('fs');
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `existing=true\n`);
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `existing_id=${existing.id}\n`);
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `existing_name=${existing.name}\n`);
            } else {
              console.log('Repository not found - proceeding with registration');
              const fs = require('fs');
              fs.appendFileSync(process.env.GITHUB_OUTPUT, `existing=false\n`);
            }
            
          } catch (error) {
            console.error('Database check failed:', error);
            throw error;
          } finally {
            await client.end();
          }
        }
        
        checkExisting().catch(error => {
          console.error('Check existing failed:', error);
          process.exit(1);
        });
        EOF

    - name: Comment if already registered
      if: steps.check-existing.outputs.existing == 'true'
      uses: actions/github-script@v7
      with:
        script: |
          const existingId = '${{ steps.check-existing.outputs.existing_id }}';
          const existingName = '${{ steps.check-existing.outputs.existing_name }}';
          
          const errorMessage = `
          ❌ **Project Already Registered**
          
          This repository is already registered in the AISaE directory:
          
          **Project Name:** ${existingName}
          **Project ID:** \`${existingId}\`
          **Repository:** ${{ steps.extract-url.outputs.repo_url }}
          
          If you want to update your project data, please use the **[UPDATE]** issue template instead.
          
          If this is a mistake, please contact the maintainers.
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
            labels: ['registration-failed', 'already-exists']
          });

    - name: Generate unique project ID
      if: steps.check-existing.outputs.existing == 'false'
      id: generate-id
      run: |
        PROJECT_ID=$(node -e "console.log(require('crypto').randomUUID())")
        echo "project_id=$PROJECT_ID" >> $GITHUB_OUTPUT
        echo "Generated project ID: $PROJECT_ID"

    - name: Get basic project info
      if: steps.check-existing.outputs.existing == 'false'
      id: get-basic-info
      env:
        REPO_URL: ${{ steps.extract-url.outputs.repo_url }}
      run: |
        node << 'EOF'
        const https = require('https');
        const yaml = require('yaml-front-matter');
        
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
        
        async function getBasicInfo() {
          try {
            const repoUrl = process.env.REPO_URL;
            const baseUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com');
            
            // Try to get basic project info from project-definition.md
            let projectName = 'Unknown Project';
            let definitionUrl = null;
            
            try {
              const mainUrl = `${baseUrl}/main/aisae_project_documents/project-definition.md`;
              const content = await fetchUrl(mainUrl);
              definitionUrl = mainUrl;
              
              // Try to extract project name from marker
              const nameMatch = content.match(/<!--%PROJ_NAME-->([^<\n]+)/);
              if (nameMatch && nameMatch[1].trim() !== 'Full project title') {
                projectName = nameMatch[1].trim();
              } else {
                // Try YAML frontmatter
                const parsed = yaml.loadFront(content);
                projectName = parsed.project_name || parsed.name || parsed.title || projectName;
                
                // Try first heading
                if (projectName === 'Unknown Project') {
                  const headingMatch = content.match(/^#\s+(.+)$/m);
                  if (headingMatch) {
                    projectName = headingMatch[1].trim();
                  }
                }
              }
            } catch (error) {
              // Try master branch
              try {
                const masterUrl = `${baseUrl}/master/aisae_project_documents/project-definition.md`;
                const content = await fetchUrl(masterUrl);
                definitionUrl = masterUrl;
                
                const nameMatch = content.match(/<!--%PROJ_NAME-->([^<\n]+)/);
                if (nameMatch && nameMatch[1].trim() !== 'Full project title') {
                  projectName = nameMatch[1].trim();
                }
              } catch (masterError) {
                console.log('Could not fetch project definition from main or master branch');
                // Extract project name from repository URL as fallback
                const urlParts = repoUrl.split('/');
                projectName = urlParts[urlParts.length - 1] || 'Unknown Project';
              }
            }
            
            const basicInfo = {
              name: projectName,
              repository_url: repoUrl,
              definition_url: definitionUrl
            };
            
            console.log(`Basic project info: ${JSON.stringify(basicInfo)}`);
            
            const fs = require('fs');
            fs.writeFileSync('basic-project-info.json', JSON.stringify(basicInfo, null, 2));
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `project_name=${projectName}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `success=true\n`);
            
          } catch (error) {
            console.error('Failed to get basic project info:', error);
            const fs = require('fs');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `success=false\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `error=${error.message}\n`);
            process.exit(1);
          }
        }
        
        getBasicInfo();
        EOF

    - name: Register project in database
      if: steps.check-existing.outputs.existing == 'false' && steps.get-basic-info.outputs.success == 'true'
      id: register-project
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        PROJECT_ID: ${{ steps.generate-id.outputs.project_id }}
      run: |
        node << 'EOF'
        const fs = require('fs');
        const { Client } = require('pg');
        
        async function registerProject() {
          const basicInfo = JSON.parse(fs.readFileSync('basic-project-info.json', 'utf8'));
          
          const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
          });
          
          try {
            await client.connect();
            console.log('Database connected successfully');
            
            // Insert basic project record
            const registerQuery = `
              INSERT INTO aisae_projects (id, name, repository_url, definition_url, created_at)
              VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            `;
            
            await client.query(registerQuery, [
              process.env.PROJECT_ID,
              basicInfo.name,
              basicInfo.repository_url,
              basicInfo.definition_url
            ]);
            
            console.log('Project registered successfully');
            const fs = require('fs');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `success=true\n`);
            
          } catch (error) {
            console.error('Registration failed:', error);
            const fs = require('fs');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `success=false\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `error=${error.message}\n`);
            throw error;
          } finally {
            await client.end();
          }
        }
        
        registerProject().catch(error => {
          console.error('Registration operation failed:', error);
          process.exit(1);
        });
        EOF

    - name: Auto-update with template data
      if: steps.register-project.outputs.success == 'true'
      id: auto-update
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        PROJECT_ID: ${{ steps.generate-id.outputs.project_id }}
        REPO_URL: ${{ steps.extract-url.outputs.repo_url }}
      run: |
        # Call the shared update script
        node update-project-data.js

    - name: Create shared update script
      if: steps.register-project.outputs.success == 'true'
      run: |
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

    - name: Comment on successful registration
      if: steps.register-project.outputs.success == 'true'
      uses: actions/github-script@v7
      with:
        script: |
          const projectId = '${{ steps.generate-id.outputs.project_id }}';
          const projectName = '${{ steps.get-basic-info.outputs.project_name }}';
          const healthScore = '${{ steps.auto-update.outputs.health_score || '0' }}';
          const healthStatus = '${{ steps.auto-update.outputs.health_status || 'unknown' }}';
          const filesFound = '${{ steps.auto-update.outputs.files_found || 'none' }}';
          
          const healthEmoji = {
            'healthy': '🟢',
            'attention': '🟡', 
            'critical': '🔴',
            'unknown': '⚪'
          }[healthStatus] || '⚪';
          
          const successMessage = `
          ✅ **Project Registration Successful**
          
          **Project ID:** \`${projectId}\`
          **Project Name:** ${projectName}
          **Repository:** ${{ steps.extract-url.outputs.repo_url }}
          **Health Status:** ${healthEmoji} ${healthScore}/100 (${healthStatus})
          
          Your project has been successfully registered in the AISaE directory!
          
          **Template Files Found:** ${filesFound === 'none' ? 'No template files detected' : filesFound.split(',').join(', ')}
          
          **Next Steps:**
          ${filesFound === 'none' ? 
            '- Add the AISaE template files to your `aisae_project_documents` folder\n- Fill out the template markers\n- Use the [UPDATE] issue template to refresh your data' :
            '- Complete any remaining template sections\n- Fill out empty markers in your templates\n- Use the [UPDATE] issue template when you make changes'
          }
          
          **Your Project ID:** \`${projectId}\`
          
          Keep this ID safe - you'll need it for future updates!
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
            labels: ['registered', 'aisae-project', `health-${healthStatus}`]
          });

    - name: Create project registry entry
      if: steps.register-project.outputs.success == 'true'
      run: |
        mkdir -p registry
        echo '{
          "id": "${{ steps.generate-id.outputs.project_id }}",
          "name": "${{ steps.get-basic-info.outputs.project_name }}",
          "repository_url": "${{ steps.extract-url.outputs.repo_url }}",
          "registered_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
          "health_score": ${{ steps.auto-update.outputs.health_score || 0 }},
          "health_status": "${{ steps.auto-update.outputs.health_status || 'unknown' }}"
        }' > "registry/${{ steps.generate-id.outputs.project_id }}.json"
        
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add registry/
        git commit -m "Add project registration: ${{ steps.get-basic-info.outputs.project_name }}"
        git push# .github/workflows/register-project.yml
name: Register AISaE Project

on:
  issues:
    types: [opened]

permissions:
  issues: write
  contents: write

jobs:
  register-project:
    if: contains(github.event.issue.title, '[REGISTER]')
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

    - name: Extract repository URL from issue
      id: extract-url
      run: |
        echo "Extracting repository URL from issue body"
        REPO_URL=$(echo "${{ github.event.issue.body }}" | grep -oP 'https://github\.com/[^\s\)]+')
        if [ -z "$REPO_URL" ]; then
          echo "::error::No valid GitHub repository URL found in issue body"
          exit 1
        fi
        echo "repo_url=$REPO_URL" >> $GITHUB_OUTPUT
        echo "Found repository: $REPO_URL"

    - name: Generate unique project ID
      id: generate-id
      run: |
        PROJECT_ID=$(node -e "console.log(require('crypto').randomUUID())")
        echo "project_id=$PROJECT_ID" >> $GITHUB_OUTPUT
        echo "Generated project ID: $PROJECT_ID"

    - name: Scrape project data and templates
      id: scrape-project
      env:
        REPO_URL: ${{ steps.extract-url.outputs.repo_url }}
        PROJECT_ID: ${{ steps.generate-id.outputs.project_id }}
      run: |
        node << 'EOF'
        const fs = require('fs');
        const https = require('https');
        const yaml = require('yaml-front-matter');
        
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
          const baseUrl = repoUrl
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/tree/', '/');
          
          const templateFiles = {
            'project-definition': '/main/aisae_project_documents/project-definition.md',
            'project-details': '/main/aisae_project_documents/project_details_template.md',
            'implementation-approach': '/main/aisae_project_documents/implementation_approach_selection.md',
            'risk-threshold': '/main/aisae_project_documents/risk_threshold_setting_worksheet.md',
            'risk-register': '/main/aisae_project_documents/risk_register.csv'
          };
          
          const scrapedData = {
            files_found: [],
            project_definition: null,
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
                // Try master branch if main doesn't exist
                const masterUrl = url.replace('/main/', '/master/');
                console.log(`Main branch failed, trying: ${masterUrl}`);
                content = await fetchUrl(masterUrl);
              }
              
              scrapedData.files_found.push(type);
              
              if (type === 'project-definition') {
                scrapedData.project_definition = parseProjectDefinition(content);
              } else if (type === 'project-details') {
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
        
        function parseProjectDefinition(content) {
          const parsed = yaml.loadFront(content);
          
          // Try to extract project name from marker
          const nameMatch = content.match(/<!--%PROJ_NAME-->([^<\n]+)/);
          const projectName = nameMatch ? nameMatch[1].trim() : 
                             parsed.project_name || parsed.name || parsed.title;
          
          if (!projectName || projectName === 'Full project title') {
            const headingMatch = content.match(/^#\s+(.+)$/m);
            return {
              name: headingMatch ? headingMatch[1].trim() : 'Unknown Project',
              frontmatter: parsed
            };
          }
          
          return {
            name: projectName,
            frontmatter: parsed
          };
        }
        
        function parseProjectClassification(content) {
          // Extract current stage from marker
          const stageMatch = content.match(/<!--%CURRENT_STAGE-->([^<\n(]+)/);
          const currentStage = stageMatch ? stageMatch[1].trim() : 'Unknown';
          
          // Find checked boxes after each marker
          const purposeSection = extractSectionAfterMarker(content, '<!--%PURPOSE_CODES-->');
          const environmentSection = extractSectionAfterMarker(content, '<!--%ENVIRONMENT_CODE-->');
          const controlSection = extractSectionAfterMarker(content, '<!--%CONTROL_CODE-->');
          const capabilitySection = extractSectionAfterMarker(content, '<!--%CAPABILITY_CODE-->');
          
          const purposeCodes = extractCheckedCodes(purposeSection, /- \[x\] \*\*[^(]*\(([CDFPHMA?])\)/g);
          const environmentCode = extractCheckedCode(environmentSection, /- \[x\] \*\*[^(]*\(([LSHG?])\)/);
          const controlCode = extractCheckedCode(controlSection, /- \[x\] \*\*[^(]*\(([CGI?])\)/);
          const capabilityCode = extractCheckedCode(capabilitySection, /- \[x\] \*\*[^(]*\(([BAE?])\)/);
          
          const classificationString = purposeCodes.join('') + '-' + 
            environmentCode + '-' + controlCode + '-' + capabilityCode;
          
          const isClassified = purposeCodes.length > 0 && 
            environmentCode !== '?' && controlCode !== '?' && capabilityCode !== '?';
          
          return {
            purpose_codes: purposeCodes,
            environment_code: environmentCode,
            control_code: controlCode,
            capability_code: capabilityCode,
            classification_string: classificationString,
            current_stage: currentStage,
            is_classified: isClassified
          };
        }
        
        function parseImplementationApproach(content) {
          // Extract approach rationale from marker
          const rationaleMatch = content.match(/<!--%APPROACH_RATIONALE-->([^<\n]+)/);
          const approachRationale = rationaleMatch ? rationaleMatch[1].trim() : '';
          
          // Find checked approach
          let approachNumber = null;
          if (content.includes('- [x] Approach 1:')) approachNumber = 1;
          else if (content.includes('- [x] Approach 2:')) approachNumber = 2;
          else if (content.includes('- [x] Approach 3:')) approachNumber = 3;
          
          // Find priorities status
          let prioritiesComplete = 'Not Started';
          if (content.includes('- [x] Complete')) prioritiesComplete = 'Complete';
          else if (content.includes('- [x] In Progress')) prioritiesComplete = 'In Progress';
          
          return {
            approach_number: approachNumber,
            approach_rationale: approachRationale,
            priorities_complete: prioritiesComplete,
            is_approach_chosen: approachNumber !== null
          };
        }
        
        function parseRiskThresholds(content) {
          // Find checked threshold option
          let thresholdOption = null;
          if (content.includes('- [x] A (Conservative)')) thresholdOption = 'A';
          else if (content.includes('- [x] B (Moderate)')) thresholdOption = 'B';
          else if (content.includes('- [x] C (Risk-Tolerant)')) thresholdOption = 'C';
          else if (content.includes('- [x] D (Custom)')) thresholdOption = 'D';
          
          // Find scaling options
          const familiaritySection = extractSectionAfterMarker(content, '<!--%FAMILIARITY_SCALING-->');
          const stageSection = extractSectionAfterMarker(content, '<!--%STAGE_SCALING-->');
          
          const familiarityScaling = familiaritySection.includes('- [x] Yes');
          const stageScaling = stageSection.includes('- [x] Yes');
          
          return {
            threshold_option: thresholdOption,
            familiarity_scaling: familiarityScaling,
            stage_scaling: stageScaling,
            thresholds_set: thresholdOption !== null
          };
        }
        
        function parseRiskRegister(csvContent) {
          const lines = csvContent.split('\n').filter(line => line.trim());
          
          // Find the header line
          let headerIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Risk Name,') && lines[i].includes('Risk Zone')) {
              headerIndex = i;
              break;
            }
          }
          
          if (headerIndex === -1) {
            return { risks: [], summary: { total_risks: 0, has_risk_assessment: false } };
          }
          
          const headers = lines[headerIndex].split(',').map(h => h.trim());
          const risks = [];
          
          for (let i = headerIndex + 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const risk = {};
            
            headers.forEach((header, index) => {
              risk[header] = values[index] || '';
            });
            
            // Skip example/placeholder rows
            if (risk['Risk Name'] && 
                !risk['Risk Name'].toLowerCase().includes('example') &&
                risk['Risk Name'] !== 'Risk Name' &&
                risk['Risk Name'].trim() !== '') {
              risks.push(risk);
            }
          }
          
          return { risks, summary: { total_risks: risks.length, has_risk_assessment: risks.length > 0 } };
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
          
          // Classification complete: 30 points
          if (classification && classification.is_classified) {
            score += 30;
          }
          
          // Approach chosen: 30 points
          if (approach && approach.is_approach_chosen) {
            score += 30;
          }
          
          // Risk assessment done: 40 points
          if (risks && risks.summary.has_risk_assessment) {
            score += 40;
          }
          
          return Math.max(0, Math.min(100, score));
        }
        
        function getHealthStatus(score, hasRedRisks = false) {
          if (hasRedRisks) return 'critical';
          if (score >= 80) return 'healthy';
          if (score >= 50) return 'attention';
          return 'unknown';
        }
        
        function getCompletionSummary(classification, approach, risks) {
          const items = [];
          
          if (classification && classification.is_classified) {
            items.push('✅ Classified');
          } else {
            items.push('❌ Classification needed');
          }
          
          if (approach && approach.is_approach_chosen) {
            items.push('✅ Approach chosen');
          } else {
            items.push('❌ Approach needed');
          }
          
          if (risks && risks.summary.has_risk_assessment) {
            items.push('✅ Risks assessed');
          } else {
            items.push('❌ Risk assessment needed');
          }
          
          return items.join(' ');
        }
        
        async function main() {
          try {
            const repoUrl = process.env.REPO_URL;
            const projectId = process.env.PROJECT_ID;
            
            console.log('Scraping all template files...');
            const scrapedData = await scrapeAllTemplates(repoUrl);
            
            const projectData = {
              // Basic project info
              id: projectId,
              name: scrapedData.project_definition?.name || 'Unknown Project',
              repository_url: repoUrl,
              definition_url: `${repoUrl.replace('github.com', 'raw.githubusercontent.com')}/main/aisae_project_documents/project-definition.md`,
              scraped_at: new Date().toISOString(),
              frontmatter: scrapedData.project_definition?.frontmatter || {},
              content_preview: scrapedData.project_definition ? 
                JSON.stringify(scrapedData.project_definition).substring(0, 500) : '',
              
              // Dashboard data
              classification: scrapedData.classification,
              approach: scrapedData.approach,
              risk_thresholds: scrapedData.risk_thresholds,
              risks: scrapedData.risks
            };
            
            // Calculate health metrics
            const healthScore = calculateHealthScore(
              projectData.classification, 
              projectData.approach, 
              projectData.risks
            );
            
            const healthStatus = getHealthStatus(healthScore);
            const completionSummary = getCompletionSummary(
              projectData.classification,
              projectData.approach,
              projectData.risks
            );
            
            projectData.health_score = healthScore;
            projectData.health_status = healthStatus;
            projectData.completion_summary = completionSummary;
            
            // Save to file for database insertion
            fs.writeFileSync('project-data.json', JSON.stringify(projectData, null, 2));
            
            console.log(`Project registered: ${projectData.name} (ID: ${projectId})`);
            console.log(`Health Score: ${healthScore}/100 (${healthStatus})`);
            console.log(`Completion: ${completionSummary}`);
            console.log(`Files found: ${scrapedData.files_found.join(', ')}`);
            
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `project_name=${projectData.name}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `success=true\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `health_score=${healthScore}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `health_status=${healthStatus}\n`);
            
            return projectData;
            
          } catch (error) {
            console.error('Failed to scrape project data:', error);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `success=false\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `error=${error.message}\n`);
            process.exit(1);
          }
        }
        
        main();
        EOF

    - name: Insert into database
      if: steps.scrape-project.outputs.success == 'true'
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
      run: |
        node << 'EOF'
        const fs = require('fs');
        const { Client } = require('pg');
        
        async function insertProjectData() {
          const projectData = JSON.parse(fs.readFileSync('project-data.json', 'utf8'));
          
          const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
          });
          
          try {
            await client.connect();
            console.log('Database connected successfully');
            
            // Insert main project data
            const projectQuery = `
              INSERT INTO aisae_projects 
              (id, name, repository_url, definition_url, scraped_at, frontmatter, content_preview,
               purpose_codes, environment_code, control_code, capability_code, classification_string, current_stage,
               approach_number, approach_rationale, priorities_complete,
               threshold_option, familiarity_scaling, stage_scaling,
               health_score, health_status, completion_summary, templates_last_scraped)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            `;
            
            await client.query(projectQuery, [
              projectData.id,
              projectData.name,
              projectData.repository_url,
              projectData.definition_url,
              projectData.scraped_at,
              JSON.stringify(projectData.frontmatter),
              projectData.content_preview,
              projectData.classification?.purpose_codes || null,
              projectData.classification?.environment_code || null,
              projectData.classification?.control_code || null,
              projectData.classification?.capability_code || null,
              projectData.classification?.classification_string || null,
              projectData.classification?.current_stage || null,
              projectData.approach?.approach_number || null,
              projectData.approach?.approach_rationale || null,
              projectData.approach?.priorities_complete || null,
              projectData.risk_thresholds?.threshold_option || null,
              projectData.risk_thresholds?.familiarity_scaling || false,
              projectData.risk_thresholds?.stage_scaling || false,
              projectData.health_score,
              projectData.health_status,
              projectData.completion_summary,
              new Date().toISOString()
            ]);
            
            console.log('Main project data inserted successfully');
            
            // Insert individual risks
            if (projectData.risks && projectData.risks.risks.length > 0) {
              for (const risk of projectData.risks.risks) {
                const riskQuery = `
                  INSERT INTO project_risks 
                  (project_id, risk_name, description, risk_familiarity, impact_score, 
                   likelihood_score, risk_score, risk_zone, mitigation_strategy, owner, status, due_date)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                  ON CONFLICT (project_id, risk_name) DO UPDATE SET
                    description = EXCLUDED.description,
                    risk_familiarity = EXCLUDED.risk_familiarity,
                    impact_score = EXCLUDED.impact_score,
                    likelihood_score = EXCLUDED.likelihood_score,
                    risk_score = EXCLUDED.risk_score,
                    risk_zone = EXCLUDED.risk_zone,
                    mitigation_strategy = EXCLUDED.mitigation_strategy,
                    owner = EXCLUDED.owner,
                    status = EXCLUDED.status,
                    due_date = EXCLUDED.due_date,
                    last_scraped = CURRENT_TIMESTAMP
                `;
                
                await client.query(riskQuery, [
                  projectData.id,
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
              console.log(`${projectData.risks.risks.length} risks inserted successfully`);
            }
            
            console.log('All project data inserted successfully');
            
          } catch (error) {
            console.error('Database insertion failed:', error);
            throw error;
          } finally {
            await client.end();
          }
        }
        
        insertProjectData().catch(error => {
          console.error('Database operation failed:', error);
          process.exit(1);
        });
        EOF

    - name: Comment on issue with result
      uses: actions/github-script@v7
      with:
        script: |
          const projectId = '${{ steps.generate-id.outputs.project_id }}';
          const projectName = '${{ steps.scrape-project.outputs.project_name }}';
          const success = '${{ steps.scrape-project.outputs.success }}';
          const healthScore = '${{ steps.scrape-project.outputs.health_score }}';
          const healthStatus = '${{ steps.scrape-project.outputs.health_status }}';
          const error = '${{ steps.scrape-project.outputs.error }}';
          
          if (success === 'true') {
            const healthEmoji = {
              'healthy': '🟢',
              'attention': '🟡', 
              'critical': '🔴',
              'unknown': '⚪'
            }[healthStatus] || '⚪';
            
            const successMessage = `
            ✅ **Project Registration Successful**
            
            **Project ID:** \`${projectId}\`
            **Project Name:** ${projectName}
            **Repository:** ${{ steps.extract-url.outputs.repo_url }}
            **Health Status:** ${healthEmoji} ${healthScore}/100 (${healthStatus})
            
            Your project has been successfully registered in the AISaE directory and added to the dashboard.
            
            **Next Steps:**
            - Complete your project classification if not done
            - Choose your implementation approach (1, 2, or 3)
            - Fill out your risk register with actual risks
            - Set your risk thresholds
            - Visit the dashboard to track your progress
            
            You can now use this Project ID for future updates and submissions.
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
              labels: ['registered', 'aisae-project', `health-${healthStatus}`]
            });
          } else {
            const errorMessage = `
            ❌ **Project Registration Failed**
            
            **Error:** ${error || 'Unknown error occurred'}
            
            Please check that:
            1. Your repository is public
            2. You have an \`aisae_project_documents\` folder in your repository root
            3. You have the required template files with filled markers
            4. The repository URL is correctly formatted
            
            For assistance, please update this issue with the correct information.
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
              labels: ['registration-failed', 'needs-attention']
            });
          }

    - name: Create project registry entry
      if: steps.scrape-project.outputs.success == 'true'
      run: |
        mkdir -p registry
        cat project-data.json > "registry/${{ steps.generate-id.outputs.project_id }}.json"
        
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add registry/
        git commit -m "Add project registration: ${{ steps.scrape-project.outputs.project_name }}"
        git push
```

## What This Workflow Does

1. **Duplicate Check**: Verifies repository not already registered
2. **Basic Registration**: Creates project record with minimal data
3. **Auto-Update**: Immediately scans for existing template data
4. **Health Calculation**: Scores project based on template completion
5. **User Feedback**: Comments on issue with Project ID and status

## Key Features

- Prevents duplicate registrations
- Works with incomplete templates
- Auto-scans existing work
- Provides immediate Project ID
- Detailed error handling
