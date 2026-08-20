import React, { useState } from 'react';
import type { Document } from '../../types';
import { FileText, Download, Eye, File, Trash, RefreshCw } from 'lucide-react';
import { DataService } from '../../services/mock/dataService';
import { useRole } from '../../context/RoleContext';

interface DocumentListProps {
  documents: Document[];
  onRefresh: () => void;
  entityContext?: { projectId?: string; bridgeId?: string; taskId?: string };
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onRefresh, entityContext }) => {
  const { currentEmployeeId } = useRole();
  const [isUploading, setIsUploading] = useState(false);

  const handleMockUpload = async () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(async () => {
      await DataService.createDocument({
        name: `New_Report_${Date.now()}.pdf`,
        fileName: `New_Report_${Date.now()}.pdf`,
        fileType: 'application/pdf',
        fileSize: Math.floor(Math.random() * 5000000) + 1000000,
        documentType: 'Inspection Report',
        uploadedBy: currentEmployeeId,
        status: 'Submitted',
        ...entityContext
      });
      setIsUploading(false);
      onRefresh();
    }, 1000);
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await DataService.deleteDocument(docId);
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText size={18} /> Documents</h3>
        <button 
          onClick={handleMockUpload}
          disabled={isUploading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isUploading ? <RefreshCw className="animate-spin" size={14} /> : null}
          Upload File
        </button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Version</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.length > 0 ? documents.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <File size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-900">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{doc.documentType}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">v{doc.version}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    doc.status === 'Approved' || doc.status === 'Final' ? 'bg-emerald-100 text-emerald-700' :
                    doc.status === 'Rejected' || doc.status === 'Revision Required' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{doc.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Preview">
                    <Eye size={16} />
                  </button>
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Download Mock">
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Delete">
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500 bg-slate-50/50">
                  <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                  <p>No documents found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
