# Database Schema

```sql
-- MVP Dashboard Database Schema - Register + Update Architecture

-- Approach lookup table (populate once)
CREATE TABLE approach_types (
    approach_number INTEGER PRIMARY KEY,
    approach_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Populate the approach lookup table
INSERT INTO approach_types (approach_number, approach_name, description) VALUES
(1, 'Keep It Simple', '5-10% of development time, focus on most important items'),
(2, 'Do It Properly', '10-15% of development time, comprehensive implementation'),
(3, 'Set the Standard', '15-20% of development time, full implementation with community engagement');

-- Risk threshold lookup table (populate once)  
CREATE TABLE threshold_types (
    threshold_option VARCHAR(10) PRIMARY KEY,
    threshold_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Populate the threshold lookup table
INSERT INTO threshold_types (threshold_option, threshold_name, description) VALUES
('A', 'Conservative', 'Better safe than sorry - stricter thresholds'),
('B', 'Moderate', 'Balanced approach - standard thresholds'),
('C', 'Risk-Tolerant', 'Move fast, manage actively - relaxed thresholds'),
('D', 'Custom', 'Project-specific custom thresholds');

-- Main projects table with nullable template fields
CREATE TABLE aisae_projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    repository_url VARCHAR(500) NOT NULL UNIQUE,
    definition_url VARCHAR(500),
    frontmatter JSONB,
    content_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Classification data (nullable until updated from templates)
    purpose_codes TEXT[],
    environment_code VARCHAR(10),
    control_code VARCHAR(10), 
    capability_code VARCHAR(10),
    classification_string VARCHAR(50),
    current_stage VARCHAR(50),
    
    -- Approach data (nullable until updated from templates)
    approach_number INTEGER REFERENCES approach_types(approach_number),
    approach_rationale TEXT,
    priorities_complete VARCHAR(20),
    
    -- Risk threshold data (nullable until updated from templates)
    threshold_option VARCHAR(10) REFERENCES threshold_types(threshold_option),
    familiarity_scaling BOOLEAN,
    stage_scaling BOOLEAN,
    
    -- Calculated fields (updated when templates are parsed)
    health_score INTEGER,
    health_status VARCHAR(20),
    completion_summary VARCHAR(255),
    templates_last_scraped TIMESTAMP WITH TIME ZONE
);

-- Individual risks table (populated from risk_register.csv)
CREATE TABLE project_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES aisae_projects(id) ON DELETE CASCADE,
    risk_name VARCHAR(255) NOT NULL,
    description TEXT,
    risk_familiarity VARCHAR(20), -- Known, Foreseeable, Emergent
    impact_score INTEGER,
    likelihood_score INTEGER,
    risk_score INTEGER,
    risk_zone VARCHAR(10), -- Green, Yellow, Red
    mitigation_strategy TEXT,
    owner VARCHAR(100),
    status VARCHAR(50),
    due_date DATE,
    last_scraped TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, risk_name)
);

-- Create indexes for performance
CREATE INDEX idx_aisae_projects_health_status ON aisae_projects(health_status);
CREATE INDEX idx_aisae_projects_current_stage ON aisae_projects(current_stage);
CREATE INDEX idx_aisae_projects_approach_number ON aisae_projects(approach_number);
CREATE INDEX idx_aisae_projects_threshold_option ON aisae_projects(threshold_option);
CREATE INDEX idx_aisae_projects_repository_url ON aisae_projects(repository_url);
CREATE INDEX idx_project_risks_project_id ON project_risks(project_id);
CREATE INDEX idx_project_risks_zone ON project_risks(risk_zone);
CREATE INDEX idx_project_risks_familiarity ON project_risks(risk_familiarity);

-- View for risk summary statistics (calculated on demand)
CREATE VIEW project_risk_summary AS
SELECT 
    project_id,
    COUNT(*) as total_risks,
    COUNT(*) FILTER (WHERE LOWER(risk_zone) LIKE '%red%') as red_zone_risks,
    COUNT(*) FILTER (WHERE LOWER(risk_zone) LIKE '%yellow%' OR LOWER(risk_zone) LIKE '%amber%') as yellow_zone_risks,
    COUNT(*) FILTER (WHERE LOWER(risk_zone) LIKE '%green%') as green_zone_risks,
    COUNT(*) FILTER (WHERE LOWER(risk_familiarity) LIKE '%known%') as known_risks,
    COUNT(*) FILTER (WHERE LOWER(risk_familiarity) LIKE '%foreseeable%') as foreseeable_risks,
    COUNT(*) FILTER (WHERE LOWER(risk_familiarity) LIKE '%emergent%') as emergent_risks,
    BOOL_OR(risk_score IS NOT NULL AND risk_score > 0) as has_risk_assessment
FROM project_risks 
WHERE risk_name IS NOT NULL 
  AND risk_name != '' 
  AND LOWER(risk_name) NOT LIKE '%example%'
GROUP BY project_id;

-- Dashboard view combining everything with lookups
CREATE VIEW dashboard_projects AS
SELECT 
    p.id,
    p.name,
    p.repository_url,
    p.created_at,
    p.templates_last_scraped,
    
    -- Classification
    p.purpose_codes,
    p.environment_code,
    p.control_code,
    p.capability_code,
    p.classification_string,
    p.current_stage,
    
    -- Approach (with lookup)
    p.approach_number,
    at.approach_name,
    p.priorities_complete,
    
    -- Risk Management (with lookup)
    p.threshold_option,
    tt.threshold_name,
    p.familiarity_scaling,
    p.stage_scaling,
    
    -- Risk Statistics (from view)
    COALESCE(prs.total_risks, 0) as total_risks,
    COALESCE(prs.red_zone_risks, 0) as red_zone_risks,
    COALESCE(prs.yellow_zone_risks, 0) as yellow_zone_risks,
    COALESCE(prs.green_zone_risks, 0) as green_zone_risks,
    COALESCE(prs.has_risk_assessment, false) as has_risk_assessment,
    
    -- Health
    p.health_score,
    p.health_status,
    p.completion_summary
    
FROM aisae_projects p
LEFT JOIN approach_types at ON p.approach_number = at.approach_number
LEFT JOIN threshold_types tt ON p.threshold_option = tt.threshold_option
LEFT JOIN project_risk_summary prs ON p.id = prs.project_id;
```

## Tables Created

- `approach_types` - Lookup table for approach names
- `threshold_types` - Lookup table for threshold names  
- `aisae_projects` - Main project data (nullable template fields)
- `project_risks` - Individual risks from CSV files
- `project_risk_summary` - View for calculated risk statistics
- `dashboard_projects` - Main dashboard view with all data

## Key Features

- Nullable template fields (filled during updates)
- Foreign key relationships for data integrity
- Calculated views for risk statistics
- Lookup tables prevent string duplication
