
"use client";

import { LeadColumn } from "./lead-column";
import type { Lead, LeadStatus } from "@/lib/types";
import { LEAD_STATUSES } from "@/lib/types";

interface KanbanBoardProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (leadId: string, updatedData: Partial<Lead>) => void;
}

export function KanbanBoard({ leads, setLeads, onSelectLead, onUpdateLead }: KanbanBoardProps) {
    
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lead: Lead) => {
    e.dataTransfer.setData("leadId", lead.id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const leadToUpdate = leads.find(lead => lead.id === leadId);

    if (leadToUpdate && leadToUpdate.status !== newStatus) {
        onUpdateLead(leadId, { status: newStatus });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 md:p-6 h-full overflow-x-auto">
      {LEAD_STATUSES.map(status => (
        <LeadColumn
          key={status}
          status={status}
          leads={leads.filter(lead => lead.status === status)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onSelectLead={onSelectLead}
        />
      ))}
    </div>
  );
}
