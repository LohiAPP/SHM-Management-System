export type DocumentStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Revision Required' | 'Final';
export type DocumentType = 'Inspection Report' | 'Methodology Draft' | 'AutoCAD File' | 'Numerical Model' | 'Sensor Mapping' | 'Final Methodology' | 'Instrumentation Data' | 'Instrumentation Report' | 'Numerical Sheet' | 'Final SHM Report' | 'Site Photo' | 'Site Video' | 'Other';

export interface Document {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  projectId?: string;
  bridgeId?: string;
  workflowStageId?: string;
  taskId?: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: DocumentStatus;
  description?: string;
}
