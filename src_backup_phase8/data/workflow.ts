export const WORKFLOW_STAGES = [
  {
    stageNumber: 1,
    name: 'Site Visit',
    team: 'TEAM_B',
    defaultStatus: 'NOT_STARTED',
    description: 'Two employees inspect the bridge and upload inspection report.'
  },
  {
    stageNumber: 2,
    name: 'Methodology Preparation',
    team: 'TEAM_B',
    defaultStatus: 'NOT_STARTED',
    description: 'Preparation of the detailed methodology report and AutoCAD sections (Typical duration 7 days).'
  },
  {
    stageNumber: 3,
    name: 'Client Methodology Approval',
    team: 'CLIENT',
    defaultStatus: 'NOT_STARTED',
    description: 'Client reviews and approves the methodology report.'
  },
  {
    stageNumber: 4,
    name: 'Sensor Installation',
    team: 'TEAM_A',
    defaultStatus: 'NOT_STARTED',
    description: 'Physical installation of sensors at the bridge site.'
  },
  {
    stageNumber: 5,
    name: 'Sensor Validation',
    team: 'TEAM_C',
    defaultStatus: 'NOT_STARTED',
    description: 'Validation of sensor data quality (Pass / Fail).'
  },
  {
    stageNumber: 6,
    name: 'Client Train Arrangement',
    team: 'CLIENT',
    defaultStatus: 'NOT_STARTED',
    description: 'Client arranges minimum 55 wagons, preferably iron ore, for load testing.'
  },
  {
    stageNumber: 7,
    name: 'Load Testing',
    team: 'TEAM_A',
    defaultStatus: 'NOT_STARTED',
    description: 'Approximately 2–2.5 hours of load testing.'
  },
  {
    stageNumber: 8,
    name: '72-Hour Fatigue Monitoring',
    team: 'TEAM_A',
    defaultStatus: 'NOT_STARTED',
    description: 'Continuous monitoring of the bridge for 72 hours.'
  },
  {
    stageNumber: 9,
    name: 'Instrumentation Report',
    team: 'TEAM_C',
    defaultStatus: 'NOT_STARTED',
    description: 'Preparation of the detailed instrumentation report (model validation, structural adequacy).'
  },
  {
    stageNumber: 10,
    name: 'Numerical Validation & Sheet',
    team: 'TEAM_B',
    defaultStatus: 'NOT_STARTED',
    description: 'Numerical model validation, higher axle load analysis, and Numerical Sheet.'
  },
  {
    stageNumber: 11,
    name: 'Final Report Preparation',
    team: 'TEAM_C',
    defaultStatus: 'NOT_STARTED',
    description: 'Combines Instrumentation Report and Numerical Sheet.'
  },
  {
    stageNumber: 12,
    name: 'Client Final Review',
    team: 'CLIENT',
    defaultStatus: 'NOT_STARTED',
    description: 'Final submission and approval by the client.'
  }
];
