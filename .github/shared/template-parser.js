// shared/template-parser.js
// Shared module for parsing AISSE template files

const https = require('https');

class TemplateParser {
  constructor() {
    this.templateFiles = {
      'project-details': '/main/aisse_project_documents/project_details.md',
      'prioritisation-record': '/main/aisse_project_documents/prioritisation_record.md',
      'risk-management-plan': '/main/aisse_project_documents/risk_management_plan.md',
      'feature-development-plan': '/main/aisse_project_documents/feature_development_plan.md',
      'in-life-monitoring-plan': '/main/aisse_project_documents/in_life_monitoring_plan.md'
    };
  }

  async fetchUrl(url) {
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

  async scrapeAllTemplates(repoUrl) {
    const baseUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com');
    
    const scrapedData = {
      files_found: [],
      project_details: null,
      prioritisation_record: null,
      risk_management_plan: null,
      feature_development_plan: null,
      in_life_monitoring_plan: null
    };

    for (const [type, file] of Object.entries(this.templateFiles)) {
      try {
        const url = baseUrl + file;
        console.log(`Fetching: ${url}`);
        
        let content;
        try {
          content = await this.fetchUrl(url);
        } catch (error) {
          // Try master branch if main doesn't exist
          const masterUrl = url.replace('/main/', '/master/');
          console.log(`Main branch failed, trying: ${masterUrl}`);
          content = await this.fetchUrl(masterUrl);
        }

        scrapedData.files_found.push(type);
        
        switch (type) {
          case 'project-details':
            scrapedData.project_details = this.parseProjectDetails(content);
            break;
          case 'prioritisation-record':
            scrapedData.prioritisation_record = this.parsePrioritisationRecord(content);
            break;
          case 'risk-management-plan':
            scrapedData.risk_management_plan = this.parseRiskManagementPlan(content);
            break;
          case 'feature-development-plan':
            scrapedData.feature_development_plan = this.parseFeatureDevelopmentPlan(content);
            break;
          case 'in-life-monitoring-plan':
            scrapedData.in_life_monitoring_plan = this.parseInLifeMonitoringPlan(content);
            break;
        }
        
      } catch (error) {
        console.log(`Could not fetch ${type}: ${error.message}`);
      }
    }

    return scrapedData;
  }

  parseProjectDetails(content) {
    console.log('Parsing project details...');
    
    // Extract project name
    const projectName = this.extractMarkerValue(content, 'PROJ_NAME', [
      'Full project title',
      '*[Your project name here]*',
      '[Your project name here]'
    ]);
    console.log(`  → Project name: "${projectName}"`);

    // Extract current stage
    const currentStage = this.extractMarkerValue(content, 'CURRENT_STAGE', [
      '*[Replace with your current stage]*',
      '[Replace with your current stage]'
    ]);
    console.log(`  → Current stage: "${currentStage}"`);

    // Extract classification codes
    const purposeCodes = this.extractCheckedCodes(content, 'PURPOSE_CODE', /[-*]\s*\[x\][^(]*\(([CDFPHATEU?])\)/gi);
    console.log(`  → Purpose codes: [${purposeCodes.join(', ')}]`);
    
    const environmentCode = this.extractCheckedCode(content, 'ENVIRONMENT_CODE', /[-*]\s*\[x\][^(]*\(([LSHG?])\)/i);
    console.log(`  → Environment code: "${environmentCode}"`);
    
    const autonomyCode = this.extractCheckedCode(content, 'AUTONOMY_CODE', /[-*]\s*\[x\][^(]*\(([SMI?])\)/i);
    console.log(`  → Autonomy code: "${autonomyCode}"`);
    
    const selfLearningCode = this.extractCheckedCode(content, 'SELF_LEARNING_CODE', /[-*]\s*\[x\][^(]*\(([SMI?])\)/i);
    console.log(`  → Self learning code: "${selfLearningCode}"`);
    
    const persistenceCode = this.extractCheckedCode(content, 'PERSISTENCE_CODE', /[-*]\s*\[x\][^(]*\(([TSP?])\)/i);
    console.log(`  → Persistence code: "${persistenceCode}"`);
    
    const capabilityCode = this.extractCheckedCode(content, 'CAPABILITY_CODE', /[-*]\s*\[x\][^(]*\(([BAE?])\)/i);
    console.log(`  → Capability code: "${capabilityCode}"`);
    
    const dataSources = this.extractCheckedCodes(content, 'DATA_CODE', /[-*]\s*\[x\][^(]*\(([IUVWT])\)/gi);
    console.log(`  → Data sources: [${dataSources.join(', ')}]`);
    
    const otherCodes = this.extractCheckedCodes(content, 'OTHER_SYS_CODE', /[-*]\s*\[x\][^(]*\(([AUD])\)/gi);
    console.log(`  → Other codes: [${otherCodes.join(', ')}]`);

    // Build classification string
    const classificationParts = [
      purposeCodes.join(''),
      environmentCode,
      autonomyCode + selfLearningCode + persistenceCode,
      capabilityCode,
      otherCodes.join('')
    ].filter(part => part && part !== '?');

    const classificationString = classificationParts.length > 0 ? 
      classificationParts.join('-') : null;
    console.log(`  → Classification string: "${classificationString}"`);

    const isComplete = projectName && purposeCodes.length > 0 && 
      environmentCode !== '?' && autonomyCode !== '?' && 
      selfLearningCode !== '?' && persistenceCode !== '?' &&
      capabilityCode !== '?';

    console.log(`  → Project details complete: ${isComplete}`);
    console.log(`  → Completeness check: name=${!!projectName}, purposes=${purposeCodes.length}, env=${environmentCode !== '?'}, auto=${autonomyCode !== '?'}, learn=${selfLearningCode !== '?'}, persist=${persistenceCode !== '?'}, cap=${capabilityCode !== '?'}`);

    return {
      project_name: projectName,
      purpose_codes: purposeCodes.length > 0 ? purposeCodes : null,
      environment_code: environmentCode !== '?' ? environmentCode : null,
      autonomy_code: autonomyCode !== '?' ? autonomyCode : null,
      self_learning_code: selfLearningCode !== '?' ? selfLearningCode : null,
      persistence_code: persistenceCode !== '?' ? persistenceCode : null,
      capability_code: capabilityCode !== '?' ? capabilityCode : null,
      data_sources: dataSources.length > 0 ? dataSources : null,
      other_codes: otherCodes.length > 0 ? otherCodes : null,
      classification_string: classificationString,
      current_stage: currentStage,
      is_complete: isComplete
    };
  }

  parsePrioritisationRecord(content) {
    console.log('Parsing prioritisation record...');
    
    const impactAreas = this.parseTableFromContent(content, ['IMPACT_IN', 'Impact Areas Identified', 'Impact Area']);
    console.log(`  → Found ${impactAreas.length} impact areas:`);
    impactAreas.forEach((area, i) => {
      console.log(`    ${i+1}. ${area['Impact Area'] || area['Name'] || 'Unnamed'}`);
    });
    
    const riskAreas = this.parseTableFromContent(content, ['RISKS_IN', 'Risks Identified', 'Risk']);
    console.log(`  → Found ${riskAreas.length} risk areas:`);
    riskAreas.forEach((area, i) => {
      console.log(`    ${i+1}. ${area['Risk'] || area['Risk Area'] || area['Name'] || 'Unnamed'}`);
    });
    
    const badgeLevel = this.extractMarkerValue(content, 'BADGE_LEVEL', ['*[Your choice here]*']);
    console.log(`  → Badge level: "${badgeLevel}"`);
    
    const thresholdLevel = this.extractMarkerValue(content, 'THRESHOLD_LEVEL', ['*[Your decision here]*']);
    console.log(`  → Threshold level: "${thresholdLevel}"`);

    const isComplete = !!(badgeLevel && thresholdLevel);
    console.log(`  → Prioritisation record complete: ${isComplete}`);
    console.log(`  → Completeness check: badge=${!!badgeLevel}, threshold=${!!thresholdLevel}`);

    return {
      impact_areas: impactAreas,
      risk_areas: riskAreas,
      badge_level: badgeLevel,
      threshold_level: thresholdLevel,
      is_complete: isComplete
    };
  }

  parseRiskManagementPlan(content) {
    console.log('Parsing risk management plan...');
    
    const impactAreasManaged = this.parseTableFromContent(content, ['IMP_RISKS', 'Impact Areas Being Managed']);
    const developmentRisks = this.parseTableFromContent(content, ['RISK_REG', 'Risk Register', 'Risk ID', 'Risk Name']);
    
    const riskStatus = this.extractMarkerValue(content, 'RISK_STATUS', ['*[Green/Yellow/Red]*']);
    const riskCount = this.extractMarkerValue(content, 'RISK_COUNT', ['*[Total count]*']);
    const riskBreakdown = this.extractMarkerValue(content, 'RISK_BREAKDOWN', ['*[X Green, Y Yellow, Z Red]*']);

    console.log(`Found ${developmentRisks.length} development risks`);

    return {
      development_risks: developmentRisks,
      impact_areas_managed: impactAreasManaged,
      risk_status: riskStatus,
      risk_count: riskCount ? parseInt(riskCount) : null,
      risk_breakdown: riskBreakdown,
      is_complete: developmentRisks.length > 0
    };
  }

  parseFeatureDevelopmentPlan(content) {
    console.log('Parsing feature development plan...');
    
    const impacts = this.parseTableFromContent(content, ['IMP_IMP', 'Impact Areas Being Pursued']);
    const userStories = this.parseTableFromContent(content, ['USER_STORIES', 'User Stories']);

    console.log(`Found ${impacts.length} impacts, ${userStories.length} user stories`);

    return {
      impacts: impacts,
      user_stories: userStories,
      is_complete: impacts.length > 0
    };
  }

  parseInLifeMonitoringPlan(content) {
    console.log('Parsing in-life monitoring plan...');
    
    const operationalRisks = this.parseTableFromContent(content, ['OP_RISKS', 'Operational Risk Register']);
    const monitoringActivities = this.parseTableFromContent(content, ['OP_MONITORS', 'Monitoring Activities']);
    const responseProcedures = this.parseTableFromContent(content, ['OPS_RESPONSES', 'Response Procedures']);

    console.log(`Found ${operationalRisks.length} operational risks`);

    return {
      operational_risks: operationalRisks,
      monitoring_activities: monitoringActivities,
      response_procedures: responseProcedures,
      is_complete: operationalRisks.length > 0
    };
  }

  // Helper methods
  extractMarkerValue(content, marker, excludeValues = []) {
    const patterns = [
      new RegExp(`<!--%${marker}-->([^<\\n]+)`, 'i'),
      new RegExp(`${marker}-->([^<\\n]+)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        if (!excludeValues.includes(value)) {
          return value;
        }
      }
    }
    return null;
  }

  extractCheckedCodes(content, marker, regex) {
    const section = this.extractSectionAfterMarker(content, `<!--%${marker}-->`);
    const codes = [];
    let match;
    const globalRegex = new RegExp(regex.source, regex.flags);
    while ((match = globalRegex.exec(section)) !== null) {
      codes.push(match[1].toUpperCase());
    }
    return [...new Set(codes)]; // Remove duplicates
  }

  extractCheckedCode(content, marker, regex) {
    const section = this.extractSectionAfterMarker(content, `<!--%${marker}-->`);
    const match = regex.exec(section);
    return match ? match[1].toUpperCase() : '?';
  }

  extractSectionAfterMarker(content, marker) {
    const markerIndex = content.indexOf(marker);
    if (markerIndex === -1) return '';
    
    const afterMarker = content.substring(markerIndex + marker.length);
    const nextMarkerIndex = afterMarker.search(/<!--%\w+%-->/);
    
    return nextMarkerIndex === -1 ? afterMarker : afterMarker.substring(0, nextMarkerIndex);
  }

  parseTableFromContent(content, identifiers) {
    const lines = content.split('\n');
    let headerIndex = -1;
    let foundIdentifier = '';

    // Look for table by marker or header content
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for HTML comment markers first
      for (const identifier of identifiers) {
        if (line.includes(`<!--%${identifier}-->`)) {
          console.log(`Found marker: <!--%${identifier}-->`);
          // Look for the next table after this marker
          for (let j = i + 1; j < lines.length && j < i + 20; j++) {
            if (lines[j].includes('|') && lines[j].split('|').length > 2) {
              headerIndex = j;
              foundIdentifier = identifier;
              break;
            }
          }
          break;
        }
      }

      if (headerIndex !== -1) break;

      // Check for identifier in table header
      if (line.includes('|')) {
        for (const identifier of identifiers) {
          if (line.toLowerCase().includes(identifier.toLowerCase())) {
            headerIndex = i;
            foundIdentifier = identifier;
            break;
          }
        }
      }

      if (headerIndex !== -1) break;
    }

    if (headerIndex === -1) {
      console.log(`No table found for identifiers: ${identifiers.join(', ')}`);
      return [];
    }

    console.log(`Found table at line ${headerIndex + 1} with identifier: ${foundIdentifier}`);

    // Extract table data
    const headerLine = lines[headerIndex];
    let headers = headerLine.split('|')
      .map(h => h.trim())
      .filter(h => h && !h.match(/^[-\s:]+$/));

    // Skip separator line if present
    let dataStartIndex = headerIndex + 1;
    if (lines[dataStartIndex] && lines[dataStartIndex].includes('---')) {
      dataStartIndex++;
    }

    const tableData = [];
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || !line.includes('|')) break;
      if (line.startsWith('#')) break; // New section
      if (line.match(/^[-\s:|\|]+$/)) continue; // Skip separator lines

      const values = line.split('|').map(v => v.trim());
      
      // Remove empty first/last elements (common in markdown tables)
      if (values[0] === '') values.shift();
      if (values[values.length - 1] === '') values.pop();

      if (values.length >= Math.min(headers.length, 2)) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Skip example rows and empty rows
        const firstValue = values[0] || '';
        if (!this.isExampleRow(firstValue) && firstValue.trim() !== '') {
          tableData.push(row);
          console.log(`Added row: ${firstValue}`);
        }
      }
    }

    console.log(`Parsed ${tableData.length} rows from table`);
    return tableData;
  }

  isExampleRow(value) {
    const lowerValue = value.toLowerCase();
    return lowerValue.includes('example') || 
           lowerValue.includes('[') || 
           lowerValue.startsWith('*[') ||
           lowerValue === 'impact area' ||
           lowerValue === 'risk' ||
           lowerValue === 'risk id';
  }

  // Progress and health calculation methods
  calculateProgressStage(data) {
    console.log('Calculating progress stage...');
    console.log(`  → In-life monitoring complete: ${!!(data.in_life_monitoring_plan?.is_complete)}`);
    console.log(`  → Feature development complete: ${!!(data.feature_development_plan?.is_complete)}`);
    console.log(`  → Risk management complete: ${!!(data.risk_management_plan?.is_complete)}`);
    console.log(`  → Prioritisation complete: ${!!(data.prioritisation_record?.is_complete)}`);
    console.log(`  → Impact areas: ${data.prioritisation_record?.impact_areas?.length || 0}`);
    console.log(`  → Risk areas: ${data.prioritisation_record?.risk_areas?.length || 0}`);
    console.log(`  → Project details complete: ${!!(data.project_details?.is_complete)}`);
    
    let stage;
    if (data.in_life_monitoring_plan?.is_complete) {
      stage = 'in-life';
    } else if (data.feature_development_plan?.is_complete && data.risk_management_plan?.is_complete) {
      // Check if testing is complete (no red risks, impacts complete/dropped)
      const hasRedRisks = data.risk_management_plan.development_risks.some(r => 
        (r['Risk Zone'] || r['Zone'] || '').toLowerCase().includes('red'));
      console.log(`  → Has red risks: ${hasRedRisks}`);
      stage = hasRedRisks ? 'developing' : 'tested';
    } else if (data.prioritisation_record?.is_complete) {
      stage = 'prioritised';
    } else if (data.prioritisation_record?.impact_areas?.length > 0 || data.prioritisation_record?.risk_areas?.length > 0) {
      stage = 'researched';
    } else if (data.project_details?.is_complete) {
      stage = 'registered';
    } else {
      stage = 'registered';
    }
    
    console.log(`  → Calculated progress stage: ${stage}`);
    return stage;
  }

  calculateHealthScore(data) {
    console.log('Calculating health score...');
    let score = 0;
    
    // Classification complete (30 points)
    if (data.project_details?.is_complete) {
      score += 30;
      console.log(`  → +30 points for project details complete (total: ${score})`);
    } else {
      console.log(`  → +0 points for project details (incomplete)`);
    }
    
    // Approach chosen (30 points) - prioritisation complete
    if (data.prioritisation_record?.is_complete) {
      score += 30;
      console.log(`  → +30 points for prioritisation complete (total: ${score})`);
    } else {
      console.log(`  → +0 points for prioritisation (incomplete)`);
    }
    
    // Risk assessment done (40 points)
    if (data.risk_management_plan?.is_complete) {
      score += 40;
      console.log(`  → +40 points for risk management complete (total: ${score})`);
    } else {
      console.log(`  → +0 points for risk management (incomplete)`);
    }
    
    console.log(`  → Final health score: ${score}/100`);
    return Math.max(0, Math.min(100, score));
  }

  getHealthStatus(score, hasRedRisks = false) {
    if (hasRedRisks) return 'Critical';
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Attention';
    return 'Unknown';
  }

  getProgressStageDates(data) {
    const now = new Date().toISOString();
    const dates = {};
    
    if (data.project_details?.is_complete) dates.registered_date = now;
    if (data.prioritisation_record?.impact_areas?.length > 0 || data.prioritisation_record?.risk_areas?.length > 0) {
      dates.researched_date = now;
    }
    if (data.prioritisation_record?.is_complete) dates.prioritised_date = now;
    if (data.feature_development_plan?.is_complete && data.risk_management_plan?.is_complete) {
      dates.developing_date = now;
    }
    if (data.in_life_monitoring_plan?.is_complete) dates.in_life_date = now;
    
    return dates;
  }
}

module.exports = TemplateParser;
