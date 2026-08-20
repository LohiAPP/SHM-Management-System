const fs = require('fs');
const path = require('path');

const seeder = `
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const deptId = uuidv4();
    const teamAId = uuidv4();
    const teamBId = uuidv4();
    const teamCId = uuidv4();
    const adminEmpId = uuidv4();
    const hodEmpId = uuidv4();
    const empEmpId = uuidv4();
    
    // Departments
    await queryInterface.bulkInsert('departments', [{
      id: deptId,
      code: 'SHM',
      name: 'Structural Health Monitoring',
      description: 'Main department for bridge monitoring',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Teams
    await queryInterface.bulkInsert('teams', [
      { id: teamAId, department_id: deptId, code: 'TM_A', name: 'Team A — Instrumentation', created_at: new Date(), updated_at: new Date() },
      { id: teamBId, department_id: deptId, code: 'TM_B', name: 'Team B — Numerical Analysis', created_at: new Date(), updated_at: new Date() },
      { id: teamCId, department_id: deptId, code: 'TM_C', name: 'Team C — Data Analysis', created_at: new Date(), updated_at: new Date() }
    ]);

    // Employees
    await queryInterface.bulkInsert('employees', [
      { id: adminEmpId, department_id: deptId, employee_code: 'EMP-001', first_name: 'Admin', last_name: 'User', display_name: 'Admin User', email: 'admin@shm.com', employee_type: 'OFFICE', joined_date: '2026-01-01', created_at: new Date(), updated_at: new Date() },
      { id: hodEmpId, department_id: deptId, employee_code: 'EMP-002', first_name: 'HOD', last_name: 'Manager', display_name: 'HOD Manager', email: 'hod@shm.com', employee_type: 'OFFICE', joined_date: '2026-01-01', created_at: new Date(), updated_at: new Date() },
      { id: empEmpId, department_id: deptId, employee_code: 'EMP-003', first_name: 'Site', last_name: 'Worker', display_name: 'Site Worker', email: 'worker@shm.com', employee_type: 'SITE', joined_date: '2026-01-01', created_at: new Date(), updated_at: new Date() }
    ]);

    // Users
    await queryInterface.bulkInsert('users', [
      { id: uuidv4(), employee_id: adminEmpId, email: 'admin@shm.com', password_hash: 'hashedpassword', role: 'ADMIN', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), employee_id: hodEmpId, email: 'hod@shm.com', password_hash: 'hashedpassword', role: 'HOD_MANAGER', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), employee_id: empEmpId, email: 'worker@shm.com', password_hash: 'hashedpassword', role: 'EMPLOYEE', created_at: new Date(), updated_at: new Date() }
    ]);

    // Workflow Stages (12 Stages)
    const stages = [
      { num: 1, name: 'Site Visit', code: 'STG_01', team: teamBId, desc: 'Two employees inspect the bridge and upload inspection report.' },
      { num: 2, name: 'Methodology Preparation', code: 'STG_02', team: teamBId, desc: 'Preparation of the detailed methodology report and AutoCAD sections.' },
      { num: 3, name: 'Client Methodology Approval', code: 'STG_03', team: null, desc: 'Client reviews and approves the methodology report.' },
      { num: 4, name: 'Sensor Installation', code: 'STG_04', team: teamAId, desc: 'Physical installation of sensors at the bridge site.' },
      { num: 5, name: 'Sensor Validation', code: 'STG_05', team: teamCId, desc: 'Validation of sensor data quality (Pass / Fail).' },
      { num: 6, name: 'Client Train Arrangement', code: 'STG_06', team: null, desc: 'Client arranges minimum 55 wagons, preferably iron ore, for load testing.' },
      { num: 7, name: 'Load Testing', code: 'STG_07', team: teamAId, desc: 'Approximately 2–2.5 hours of load testing.' },
      { num: 8, name: '72-Hour Fatigue Monitoring', code: 'STG_08', team: teamAId, desc: 'Continuous monitoring of the bridge for 72 hours.' },
      { num: 9, name: 'Instrumentation Report', code: 'STG_09', team: teamCId, desc: 'Preparation of the detailed instrumentation report.' },
      { num: 10, name: 'Numerical Validation & Sheet', code: 'STG_10', team: teamBId, desc: 'Numerical model validation and Sheet.' },
      { num: 11, name: 'Final Report Preparation', code: 'STG_11', team: teamCId, desc: 'Combines Instrumentation Report and Numerical Sheet.' },
      { num: 12, name: 'Client Final Review', code: 'STG_12', team: null, desc: 'Final submission and approval by the client.' }
    ];

    const stageInserts = stages.map(s => ({
      id: uuidv4(),
      department_id: deptId,
      stage_number: s.num,
      stage_code: s.code,
      stage_name: s.name,
      description: s.desc,
      responsible_team_id: s.team,
      created_at: new Date(),
      updated_at: new Date()
    }));
    await queryInterface.bulkInsert('workflow_stages', stageInserts);

    // Project & Bridge
    const projId = uuidv4();
    await queryInterface.bulkInsert('projects', [{
      id: projId,
      department_id: deptId,
      project_code: 'PRJ-001',
      project_name: 'Northern Railway SHM',
      client_name: 'Northern Railways',
      status: 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    const bridgeId = uuidv4();
    await queryInterface.bulkInsert('bridges', [{
      id: bridgeId,
      project_id: projId,
      bridge_code: 'BRG-001',
      bridge_name: 'Chenab Rail Bridge',
      status: 'IN_PROGRESS',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Bridge Workflow Stages (up to stage 8)
    const bwsInserts = stageInserts.map(s => {
      let status = 'NOT_STARTED';
      let progress = 0;
      if (s.stage_number < 8) {
        status = 'COMPLETED';
        progress = 100;
      } else if (s.stage_number === 8) {
        status = 'IN_PROGRESS';
        progress = 45;
      }
      return {
        id: uuidv4(),
        bridge_id: bridgeId,
        workflow_stage_id: s.id,
        status,
        progress,
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    await queryInterface.bulkInsert('bridge_workflow_stages', bwsInserts);

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('bridge_workflow_stages', null, {});
    await queryInterface.bulkDelete('bridges', null, {});
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('workflow_stages', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('teams', null, {});
    await queryInterface.bulkDelete('departments', null, {});
  }
};
`;
fs.writeFileSync(path.join(__dirname, 'seeders', '20260820000000-demo-seed.js'), seeder);
console.log('Seeder generated.');
