// shared/database-operations.js
// Shared module for database operations

const { Client } = require('pg');

class DatabaseOperations {
  constructor(connectionString) {
    this.connectionString = connectionString;
    
    // Log connection string details (safely, without exposing password)
    console.log('🔧 Database connection configuration:');
    if (connectionString) {
      // Parse the connection string to show details without password
      try {
        const url = new URL(connectionString);
        console.log(`  → Protocol: ${url.protocol}`);
        console.log(`  → Host: ${url.hostname}`);
        console.log(`  → Port: ${url.port || 'default'}`);
        console.log(`  → Database: ${url.pathname.substring(1)}`);
        console.log(`  → Username: ${url.username}`);
        console.log(`  → Password: ${url.password ? '[REDACTED]' : 'None'}`);
        console.log(`  → SSL Mode: ${url.searchParams.get('sslmode') || 'not specified'}`);
      } catch (error) {
        console.log(`  → Raw connection string format (first 50 chars): ${connectionString.substring(0, 50)}...`);
      }
    } else {
      console.log(`  → ❌ No connection string provided!`);
    }
  }

  // Helper method to truncate strings for database constraints
  truncateString(value, maxLength) {
    if (!value) return value;
    return value.length > maxLength ? value.substring(0, maxLength) : value;
  }

  async getClient() {
    const client = new Client({
      connectionString: this.connectionString,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    
    // Log connection details for debugging
    const result = await client.query('SELECT current_database(), current_user, inet_server_addr(), inet_server_port()');
    console.log('🔗 Database connection established:');
    console.log(`  → Database: ${result.rows[0].current_database}`);
    console.log(`  → User: ${result.rows[0].current_user}`);
    console.log(`  → Server: ${result.rows[0].inet_server_addr}:${result.rows[0].inet_server_port}`);
    
    return client;
  }

  async checkProjectExists(repositoryUrl) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT id, name FROM aisse_projects WHERE repository_url = $1',
        [repositoryUrl]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      await client.end();
    }
  }

  async verifyProject(projectId, repositoryUrl) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT id, name, repository_url FROM aisse_projects WHERE id = $1',
        [projectId]
      );
      
      if (result.rows.length === 0) {
        return { exists: false, error: 'Project ID not found' };
      }
      
      const project = result.rows[0];
      if (project.repository_url !== repositoryUrl) {
        return { 
          exists: false, 
          error: 'Repository URL does not match registered project' 
        };
      }
      
      return { exists: true, project };
    } finally {
      await client.end();
    }
  }

  async insertProject(projectData) {
    const client = await this.getClient();
    try {
      console.log('🗄️ Starting database transaction...');
      await client.query('BEGIN');

      // Verify table exists
      console.log('🔍 Checking if aisse_projects table exists...');
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'aisse_projects'
        )
      `);
      console.log(`  → aisse_projects table exists: ${tableCheck.rows[0].exists}`);
      
      if (!tableCheck.rows[0].exists) {
        throw new Error('aisse_projects table does not exist!');
      }
      
      // Check current table count
      const beforeCount = await client.query('SELECT COUNT(*) as count FROM aisse_projects');
      console.log(`  → Total projects in table before insert: ${beforeCount.rows[0].count}`);

      console.log('🗄️ Inserting main project data...');
      console.log(`  → Project ID: ${projectData.id}`);
      console.log(`  → Project Name: ${projectData.name}`);
      console.log(`  → Repository: ${projectData.repository_url}`);
      console.log(`  → Progress Stage: ${projectData.progress_stage}`);
      console.log(`  → Health Score: ${projectData.health_score}`);
      console.log(`  → Health Status: ${projectData.health_status}`);

      // Insert main project data
      const projectQuery = `
        INSERT INTO aisse_projects 
        (id, name, repository_url, created_at, current_progress_stage, registered_date,
         purpose_codes, environment_code, autonomy_code, self_learning_code, 
         persistence_code, capability_code, data_sources, other_codes, classification_string, current_stage,
         badge_level, threshold_level, aggregate_risk_status, risk_count, risk_breakdown,
         project_details_complete, prioritisation_record_complete, risk_management_plan_complete,
         feature_development_plan_complete, in_life_monitoring_plan_complete,
         health_score, health_status, templates_last_scraped)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, CURRENT_TIMESTAMP)
      `;
      
      await client.query(projectQuery, [
        projectData.id,
        projectData.name, // Keep full name, this field should be longer
        projectData.repository_url,
        this.truncateString(projectData.progress_stage, 20),
        projectData.project_details?.purpose_codes || null,
        this.truncateString(projectData.project_details?.environment_code, 20),
        this.truncateString(projectData.project_details?.autonomy_code, 20),
        this.truncateString(projectData.project_details?.self_learning_code, 20),
        this.truncateString(projectData.project_details?.persistence_code, 20),
        this.truncateString(projectData.project_details?.capability_code, 20),
        projectData.project_details?.data_sources || null,
        projectData.project_details?.other_codes || null,
        projectData.project_details?.classification_string || null,
        this.truncateString(projectData.project_details?.current_stage, 50),
        this.truncateString(projectData.prioritisation_record?.badge_level, 20),
        this.truncateString(projectData.prioritisation_record?.threshold_level, 20),
        this.truncateString(projectData.risk_management_plan?.risk_status, 20),
        projectData.risk_management_plan?.risk_count || null,
        projectData.risk_management_plan?.risk_breakdown || null,
        !!(projectData.project_details?.is_complete),
        !!(projectData.prioritisation_record?.is_complete),
        !!(projectData.risk_management_plan?.is_complete),
        !!(projectData.feature_development_plan?.is_complete),
        !!(projectData.in_life_monitoring_plan?.is_complete),
        projectData.health_score,
        this.truncateString(projectData.health_status, 20)
      ]);

      console.log('✅ Main project data inserted successfully');
      
      // Verify the insert worked
      console.log('🔍 Verifying project was inserted...');
      const verifyResult = await client.query('SELECT COUNT(*) as count FROM aisse_projects WHERE id = $1', [projectData.id]);
      console.log(`  → Project found in database: ${verifyResult.rows[0].count > 0}`);
      console.log(`  → Row count for this project: ${verifyResult.rows[0].count}`);
      
      if (verifyResult.rows[0].count === 0) {
        throw new Error('Project insert appeared to succeed but no row found in database!');
      }

      // Insert related data
      console.log('🗄️ Inserting related data...');
      await this.insertRelatedData(client, projectData);
      
      await client.query('COMMIT');
      
      // Final verification
      console.log('🔍 Final verification after commit...');
      const afterCount = await client.query('SELECT COUNT(*) as count FROM aisse_projects');
      console.log(`  → Total projects in table after commit: ${afterCount.rows[0].count}`);
      console.log(`  → Net change: +${afterCount.rows[0].count - beforeCount.rows[0].count}`);
      
      console.log('✅ Project inserted successfully - transaction committed');
      
    } catch (error) {
      console.error('❌ Database insertion failed:', error.message);
      await client.query('ROLLBACK');
      console.log('🔄 Transaction rolled back');
      throw error;
    } finally {
      await client.end();
    }
  }

  async updateProject(projectId, projectData) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      // Update main project data
      const updateQuery = `
        UPDATE aisse_projects SET
          name = COALESCE($2, name),
          current_progress_stage = $3,
          purpose_codes = $4,
          environment_code = $5,
          autonomy_code = $6,
          self_learning_code = $7,
          persistence_code = $8,
          capability_code = $9,
          data_sources = $10,
          other_codes = $11,
          classification_string = $12,
          current_stage = $13,
          badge_level = $14,
          threshold_level = $15,
          aggregate_risk_status = $16,
          risk_count = $17,
          risk_breakdown = $18,
          project_details_complete = $19,
          prioritisation_record_complete = $20,
          risk_management_plan_complete = $21,
          feature_development_plan_complete = $22,
          in_life_monitoring_plan_complete = $23,
          health_score = $24,
          health_status = $25,
          templates_last_scraped = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await client.query(updateQuery, [
        projectId,
        projectData.name,
        this.truncateString(projectData.progress_stage, 20),
        projectData.project_details?.purpose_codes || null,
        this.truncateString(projectData.project_details?.environment_code, 20),
        this.truncateString(projectData.project_details?.autonomy_code, 20),
        this.truncateString(projectData.project_details?.self_learning_code, 20),
        this.truncateString(projectData.project_details?.persistence_code, 20),
        this.truncateString(projectData.project_details?.capability_code, 20),
        projectData.project_details?.data_sources || null,
        projectData.project_details?.other_codes || null,
        projectData.project_details?.classification_string || null,
        this.truncateString(projectData.project_details?.current_stage, 50),
        this.truncateString(projectData.prioritisation_record?.badge_level, 20),
        this.truncateString(projectData.prioritisation_record?.threshold_level, 20),
        this.truncateString(projectData.risk_management_plan?.risk_status, 20),
        projectData.risk_management_plan?.risk_count || null,
        projectData.risk_management_plan?.risk_breakdown || null,
        !!(projectData.project_details?.is_complete),
        !!(projectData.prioritisation_record?.is_complete),
        !!(projectData.risk_management_plan?.is_complete),
        !!(projectData.feature_development_plan?.is_complete),
        !!(projectData.in_life_monitoring_plan?.is_complete),
        projectData.health_score,
        this.truncateString(projectData.health_status, 20)
      ]);

      // Clear and re-insert related data
      await this.clearRelatedData(client, projectId);
      await this.insertRelatedData(client, { ...projectData, id: projectId });
      
      await client.query('COMMIT');
      console.log('Project updated successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      await client.end();
    }
  }

  async clearRelatedData(client, projectId) {
    // UPDATED: Table names changed as per user request
    const tables = [
      'footprint_impact_areas',
      'footprint_risks',
      'rmp_impact_areas',
      'rmp_risks',
      'ops_risks',
      'dev_impact_areas_addressed',
      'dev_user_stories',
      'ops_monitoring_activities',
      'ops_response_procedures'
    ];

    for (const table of tables) {
      try {
        console.log(`  → Clearing table: ${table} for project ${projectId}`);
        await client.query(`DELETE FROM ${table} WHERE project_id = $1`, [projectId]);
      } catch (error) {
        // It's okay if a table doesn't exist, just log it.
        console.log(`    ⚠️  Could not clear table ${table}. It might not exist: ${error.message}`);
      }
    }
  }

  async insertRelatedData(client, projectData) {
    const projectId = projectData.id;
    console.log(`  → Inserting related data for project: ${projectId}`);

    // Insert footprint impact areas (from prioritisation_record.md)
    if (projectData.prioritisation_record?.impact_areas) {
      console.log(`  → Inserting ${projectData.prioritisation_record.impact_areas.length} footprint impact areas...`);
      for (const area of projectData.prioritisation_record.impact_areas) {
        try {
          const areaName = this.truncateString(area['Impact Area'] || area['Name'] || '', 50);
          console.log(`    • Impact area: ${areaName}`);
          await client.query(`
            INSERT INTO footprint_impact_areas 
            (project_id, impact_area_name, description, stakeholder_priority, project_priority, priority_rationale)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (project_id, impact_area_name) DO UPDATE SET
              description = EXCLUDED.description,
              stakeholder_priority = EXCLUDED.stakeholder_priority,
              project_priority = EXCLUDED.project_priority,
              priority_rationale = EXCLUDED.priority_rationale,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            areaName,
            this.truncateString(area['Description'] || '', 500),
            this.truncateString(area['Stakeholder Priority'] || null, 20),
            this.truncateString(area['MoSCoW'] || area['Project Priority'] || null, 20),
            this.truncateString(area['Rationale'] || '', 500)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting footprint impact area: ${error.message}`);
        }
      }
    } else {
      console.log(`  → No footprint impact areas to insert`);
    }

    // UPDATED: Insert footprint risks (from prioritisation_record.md)
    if (projectData.prioritisation_record?.risk_areas) {
      console.log(`  → Inserting ${projectData.prioritisation_record.risk_areas.length} footprint risks...`);
      for (const area of projectData.prioritisation_record.risk_areas) {
        try {
          const riskName = this.truncateString(area['Risk'] || area['Risk Area'] || area['Name'] || '', 50);
          console.log(`    • Footprint risk: ${riskName}`);
          await client.query(`
            INSERT INTO footprint_risks 
            (project_id, risk_area_name, description, stakeholder_priority, project_priority, priority_rationale)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (project_id, risk_area_name) DO UPDATE SET
              description = EXCLUDED.description,
              stakeholder_priority = EXCLUDED.stakeholder_priority,
              project_priority = EXCLUDED.project_priority,
              priority_rationale = EXCLUDED.priority_rationale,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            riskName,
            this.truncateString(area['Description'] || '', 500),
            this.truncateString(area['Stakeholder Priority'] || null, 20),
            this.truncateString(area['MoSCoW'] || area['Project Priority'] || null, 20),
            this.truncateString(area['Rationale'] || '', 500)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting footprint risk: ${error.message}`);
        }
      }
    } else {
      console.log(`  → No footprint risks to insert`);
    }

    // Insert RMP development risks (from risk_management_plan.md)
    if (projectData.risk_management_plan?.development_risks) {
      console.log(`  → Inserting ${projectData.risk_management_plan.development_risks.length} development risks (RMP)...`);
      for (const risk of projectData.risk_management_plan.development_risks) {
        try {
          const riskName = this.truncateString(risk['Risk ID'] || risk['Risk Name'] || '', 255);
          console.log(`    • Development risk: ${riskName}`);
          await client.query(`
            INSERT INTO rmp_risks 
            (project_id, risk_name, description, impact_score, likelihood_score, risk_score, risk_zone, mitigation_strategy)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (project_id, risk_name) DO UPDATE SET
              description = EXCLUDED.description,
              impact_score = EXCLUDED.impact_score,
              likelihood_score = EXCLUDED.likelihood_score,
              risk_score = EXCLUDED.risk_score,
              risk_zone = EXCLUDED.risk_zone,
              mitigation_strategy = EXCLUDED.mitigation_strategy,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            riskName,
            this.truncateString(risk['Risk Description'] || risk['Description'] || '', 500),
            risk['Impact'] || risk['Impact (1-5)'] ? parseInt(risk['Impact'] || risk['Impact (1-5)']) : null,
            risk['Likelihood'] || risk['Likelihood (1-5)'] ? parseInt(risk['Likelihood'] || risk['Likelihood (1-5)']) : null,
            risk['Risk Score'] ? parseInt(risk['Risk Score']) : null,
            this.truncateString(risk['Zone'] || risk['Risk Zone'] || '', 20),
            this.truncateString(risk['Mitigation Strategy'] || '', 500)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting development risk: ${error.message}`);
        }
      }
    } else {
      console.log(`  → No RMP development risks to insert`);
    }
    
    // ADDED: Insert RMP managed impact areas (from risk_management_plan.md)
    if (projectData.risk_management_plan?.impact_areas_managed) {
      console.log(`  → Inserting ${projectData.risk_management_plan.impact_areas_managed.length} managed impact areas (RMP)...`);
      for (const area of projectData.risk_management_plan.impact_areas_managed) {
        try {
          await client.query(`
            INSERT INTO rmp_impact_areas
            (project_id, impact_area_name, description, key_focus)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (project_id, impact_area_name) DO UPDATE SET
              description = EXCLUDED.description,
              key_focus = EXCLUDED.key_focus,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            this.truncateString(area['Impact Area'] || '', 255),
            this.truncateString(area['Description'] || '', 500),
            this.truncateString(area['Key Focus'] || '', 500)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting managed impact area: ${error.message}`);
        }
      }
    } else {
        console.log(`  → No RMP managed impact areas to insert`);
    }

    // Insert addressed impact areas (from feature_development_plan.md)
    if (projectData.feature_development_plan?.impacts) {
      console.log(`  → Inserting ${projectData.feature_development_plan.impacts.length} addressed impact areas (Dev)...`);
      for (const impact of projectData.feature_development_plan.impacts) {
        try {
          await client.query(`
            INSERT INTO dev_impact_areas_addressed 
            (project_id, impact_area_name, description, key_focus, implementation_status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (project_id, impact_area_name) DO UPDATE SET
              description = EXCLUDED.description,
              key_focus = EXCLUDED.key_focus,
              implementation_status = EXCLUDED.implementation_status,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            this.truncateString(impact['Impact Area'] || impact['Name'] || '', 255),
            this.truncateString(impact['Description'] || '', 500),
            this.truncateString(impact['Key Focus'] || '', 500),
            this.truncateString(impact['Implementation Status'] || '', 50)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting addressed impact area: ${error.message}`);
        }
      }
    }

    // Insert user stories (from feature_development_plan.md)
    if (projectData.feature_development_plan?.user_stories) {
      console.log(`  → Inserting ${projectData.feature_development_plan.user_stories.length} user stories...`);
      for (const story of projectData.feature_development_plan.user_stories) {
        try {
          await client.query(`
            INSERT INTO dev_user_stories 
            (project_id, impact_area_name, user_story, acceptance_criteria, status)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            projectId,
            this.truncateString(story['Impact Area'] || '', 255),
            this.truncateString(story['User Story'] || '', 500),
            this.truncateString(story['Acceptance Criteria'] || '', 1000),
            this.truncateString(story['Status'] || '', 50)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting user story: ${error.message}`);
        }
      }
    }

    // Insert operational risks (from in_life_monitoring_plan.md)
    if (projectData.in_life_monitoring_plan?.operational_risks) {
      console.log(`  → Inserting ${projectData.in_life_monitoring_plan.operational_risks.length} operational risks...`);
      for (const risk of projectData.in_life_monitoring_plan.operational_risks) {
        try {
          await client.query(`
            INSERT INTO ops_risks 
            (project_id, risk_name, description, risk_score, risk_zone, mitigation_strategy, response_actions)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (project_id, risk_name) DO UPDATE SET
              description = EXCLUDED.description,
              risk_score = EXCLUDED.risk_score,
              risk_zone = EXCLUDED.risk_zone,
              mitigation_strategy = EXCLUDED.mitigation_strategy,
              response_actions = EXCLUDED.response_actions,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            this.truncateString(risk['Risk ID'] || risk['Risk Name'] || '', 255),
            this.truncateString(risk['Risk Description'] || risk['Description'] || '', 500),
            risk['Current Score'] ? parseInt(risk['Current Score']) : null,
            this.truncateString(risk['Status'] || '', 50),
            this.truncateString(risk['Monitoring Method'] || '', 500),
            this.truncateString(risk['Response Actions'] || '', 1000)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting operational risk: ${error.message}`);
        }
      }
    }

    // Insert monitoring activities (from in_life_monitoring_plan.md)
    if (projectData.in_life_monitoring_plan?.monitoring_activities) {
      console.log(`  → Inserting ${projectData.in_life_monitoring_plan.monitoring_activities.length} monitoring activities...`);
      for (const activity of projectData.in_life_monitoring_plan.monitoring_activities) {
        try {
          await client.query(`
            INSERT INTO ops_monitoring_activities 
            (project_id, metric_indicator, monitoring_method, frequency, responsible, target_baseline)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (project_id, metric_indicator) DO UPDATE SET
              monitoring_method = EXCLUDED.monitoring_method,
              frequency = EXCLUDED.frequency,
              responsible = EXCLUDED.responsible,
              target_baseline = EXCLUDED.target_baseline,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            this.truncateString(activity['Metric/Indicator'] || activity['Metric'] || '', 255),
            this.truncateString(activity['Monitoring Method'] || '', 255),
            this.truncateString(activity['Frequency'] || '', 100),
            this.truncateString(activity['Responsible'] || '', 100),
            this.truncateString(activity['Target/Baseline'] || '', 255)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting monitoring activity: ${error.message}`);
        }
      }
    }

    // Insert response procedures (from in_life_monitoring_plan.md)
    if (projectData.in_life_monitoring_plan?.response_procedures) {
      console.log(`  → Inserting ${projectData.in_life_monitoring_plan.response_procedures.length} response procedures...`);
      for (const procedure of projectData.in_life_monitoring_plan.response_procedures) {
        try {
          await client.query(`
            INSERT INTO ops_response_procedures 
            (project_id, trigger_condition, response_level, immediate_actions, escalation, timeline)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (project_id, trigger_condition) DO UPDATE SET
              response_level = EXCLUDED.response_level,
              immediate_actions = EXCLUDED.immediate_actions,
              escalation = EXCLUDED.escalation,
              timeline = EXCLUDED.timeline,
              last_scraped = CURRENT_TIMESTAMP
          `, [
            projectId,
            this.truncateString(procedure['Trigger'] || procedure['Trigger Condition'] || '', 255),
            this.truncateString(procedure['Response Level'] || '', 100),
            this.truncateString(procedure['Immediate Actions'] || '', 1000),
            this.truncateString(procedure['Escalation'] || '', 255),
            this.truncateString(procedure['Timeline'] || '', 100)
          ]);
        } catch (error) {
          console.log(`    ❌ Error inserting response procedure: ${error.message}`);
        }
      }
    }
  }
}

module.exports = DatabaseOperations;