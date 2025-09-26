export interface MockTeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  assignedUser: string;
  assignedUserName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface MockAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: 'status_change' | 'field_update' | 'task_update' | 'comment' | 'approval';
}

export const mockTeamMembers: MockTeamMember[] = [
  { id: '1', name: 'Sarah Johnson', role: 'QA Manager', department: 'Quality Assurance' },
  { id: '2', name: 'Mike Chen', role: 'Quality Engineer', department: 'Quality Assurance' },
  { id: '3', name: 'Emily Davis', role: 'Process Specialist', department: 'Operations' },
  { id: '4', name: 'James Wilson', role: 'QA Technician', department: 'Quality Assurance' },
  { id: '5', name: 'Lisa Rodriguez', role: 'Compliance Officer', department: 'Regulatory Affairs' },
  { id: '6', name: 'David Kim', role: 'Manufacturing Engineer', department: 'Manufacturing' },
  { id: '7', name: 'Anna Thompson', role: 'Documentation Specialist', department: 'Quality Assurance' }
];

export function generateMockTasks(recordId: string): MockTask[] {
  const taskTemplates = [
    {
      title: 'Root Cause Investigation',
      description: 'Conduct thorough investigation to identify the root cause of the quality issue using 5-Why analysis and fishbone diagram.',
      priority: 'high' as const,
      assignedUser: '2',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      title: 'Immediate Containment Actions',
      description: 'Implement immediate containment measures to prevent further occurrence and isolate affected materials.',
      priority: 'high' as const,
      assignedUser: '4',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      title: 'Process Documentation Review',
      description: 'Review and update relevant SOPs and work instructions to prevent recurrence.',
      priority: 'medium' as const,
      assignedUser: '7',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      title: 'Training Assessment',
      description: 'Evaluate training needs and implement additional training if required.',
      priority: 'medium' as const,
      assignedUser: '1',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      title: 'Effectiveness Verification',
      description: 'Monitor and verify the effectiveness of implemented corrective actions.',
      priority: 'low' as const,
      assignedUser: '3',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];

  return taskTemplates.map((template, index) => {
    const assignedMember = mockTeamMembers.find(m => m.id === template.assignedUser);
    return {
      id: `${recordId}-task-${index}`,
      ...template,
      assignedUserName: assignedMember?.name || 'Unknown',
      status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.4 ? 'in_progress' : 'pending'
    };
  });
}

export function generateMockAuditTrail(recordId: string): MockAuditEntry[] {
  const now = new Date();
  const auditEntries: MockAuditEntry[] = [
    {
      id: `${recordId}-audit-1`,
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Sarah Johnson',
      action: 'Record Created',
      details: 'CAPA record was created and entered into the workflow',
      type: 'status_change'
    },
    {
      id: `${recordId}-audit-2`,
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Mike Chen',
      action: 'Field Updated',
      details: 'Updated Root Cause Analysis field with preliminary findings',
      type: 'field_update'
    },
    {
      id: `${recordId}-audit-3`,
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Emily Davis',
      action: 'Task Assigned',
      details: 'Assigned "Root Cause Investigation" task to Mike Chen',
      type: 'task_update'
    },
    {
      id: `${recordId}-audit-4`,
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'James Wilson',
      action: 'Comment Added',
      details: 'Added comment: "Initial containment actions have been implemented successfully"',
      type: 'comment'
    },
    {
      id: `${recordId}-audit-5`,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Lisa Rodriguez',
      action: 'Status Changed',
      details: 'Status changed from "Draft" to "In Progress"',
      type: 'status_change'
    },
    {
      id: `${recordId}-audit-6`,
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      user: 'Sarah Johnson',
      action: 'Approval Requested',
      details: 'Submitted corrective action plan for manager approval',
      type: 'approval'
    }
  ];

  return auditEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function prefilCAPAFormFromDiscovery(discoveryAnswers?: any): Record<string, string> {
  if (!discoveryAnswers) return {};

  const prefilled: Record<string, string> = {};

  // Generate title based on situation type
  if (discoveryAnswers.situation_type) {
    const situationMap: Record<string, string> = {
      'quality_issue': 'Quality Issue Investigation',
      'customer_complaint': 'Customer Complaint Resolution',
      'audit_finding': 'Audit Finding Correction',
      'improvement_opportunity': 'Process Improvement Initiative',
      'risk_assessment': 'Risk Mitigation Action'
    };
    prefilled['title'] = situationMap[discoveryAnswers.situation_type] || 'Quality Management Action';
  }

  // Generate description based on discovery context
  if (discoveryAnswers.situation_type && discoveryAnswers.impact_severity) {
    const descriptions: Record<string, string> = {
      'quality_issue': 'A quality deviation has been identified that requires systematic investigation and corrective action.',
      'customer_complaint': 'Customer feedback has highlighted an issue that needs immediate attention and resolution.',
      'audit_finding': 'An internal audit has identified a non-conformance that requires corrective action.',
      'improvement_opportunity': 'An opportunity for process improvement has been identified to enhance quality and efficiency.',
      'risk_assessment': 'Risk analysis has identified a potential issue requiring preventive action.'
    };
    prefilled['description'] = descriptions[discoveryAnswers.situation_type] || 'Quality management action required.';
  }

  // Map impact severity to severity level
  if (discoveryAnswers.impact_severity) {
    const severityMap: Record<string, string> = {
      'product_safety': 'Critical',
      'customer_satisfaction': 'High',
      'regulatory_compliance': 'High',
      'process_efficiency': 'Medium',
      'cost_impact': 'Medium',
      'minor_impact': 'Low'
    };
    prefilled['severity_level'] = severityMap[discoveryAnswers.impact_severity] || 'Medium';
  }

  return prefilled;
}