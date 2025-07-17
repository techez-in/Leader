"use client";

import React, { useState } from "react";
import { LeadCard } from "./lead-card";
import type { Lead, LeadStatus } from "@/lib/types";

interface LeadColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: LeadStatus) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, lead: Lead) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onSelectLead: (lead: Lead) => void;
}

const statusColors: Record<LeadStatus, string> = {
    "New Lead": "bg-blue-500",
    "In Progress": "bg-yellow-500",
    "Converted": "bg-green-500",
    "Dropped": "bg-red-500"
}

export function LeadColumn({ status, leads, onDrop, onDragOver, onDragStart, onDragEnd, onSelectLead }: LeadColumnProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    onDrop(e, status);
    setIsDraggingOver(false);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={onDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`flex flex-col w-full shrink-0 rounded-lg transition-colors duration-200 bg-card ${isDraggingOver ? 'drag-over-column' : ''}`}
    >
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`}></span>
                <h2 className="font-semibold text-foreground">{status}</h2>
            </div>
            <span className="text-sm font-medium text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{leads.length}</span>
        </div>
      <div className="p-2 h-full overflow-y-auto">
        {leads.length > 0 ? leads.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onSelectLead={onSelectLead}
            />
        )) : (
            <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-md text-muted-foreground m-2">
                <p>No leads yet</p>
            </div>
        )}
      </div>
    </div>
  );
}
