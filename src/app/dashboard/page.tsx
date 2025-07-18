
"use client";

import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/kanban-board';
import { Header } from '@/components/header';
import { AddLeadDialog, type AddLeadFormValues } from '@/components/add-lead-dialog';
import { ImportLeadsDialog } from '@/components/import-leads-dialog';
import { LeadDetailsSheet } from '@/components/lead-details-sheet';
import type { Lead } from '@/lib/types';
import { getLeads, addLead, updateLead, deleteLead, addLeadsBatch } from '@/lib/notion';
import { useToast } from '@/hooks/use-toast';
import { parseLeadsFromCsv } from '@/ai/flows/parse-leads-csv';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddLeadOpen, setAddLeadOpen] = useState(false);
  const [isImportLeadOpen, setImportLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      router.push('/login');
    } else {
      const user = JSON.parse(userString);
      setUserEmail(user.email);
    }
  }, [router]);

  useEffect(() => {
    if (userEmail) {
      fetchLeads(userEmail);
    }
  }, [userEmail]);

  const fetchLeads = async (email: string) => {
    try {
      setIsLoading(true);
      const notionLeads = await getLeads(email);
      setLeads(notionLeads);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads from Notion. Please check your connection and API keys.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddLead = async (newLeadData: AddLeadFormValues) => {
    if (!userEmail) {
        toast({ title: "Error", description: "You must be logged in to add a lead.", variant: "destructive" });
        return;
    }
    try {
      const newLead = await addLead(newLeadData, userEmail);
      if (newLead) {
        setLeads(prev => [newLead, ...prev]);
        toast({
          title: "Success",
          description: "New lead has been added to Notion.",
        });
      } else {
        throw new Error("Failed to create lead in Notion.");
      }
    } catch (error) {
      console.error("Failed to add lead:", error);
      toast({
        title: "Error",
        description: "Could not add lead to Notion. Please try again.",
        variant: "destructive",
      });
      if (userEmail) await fetchLeads(userEmail);
    }
  };

  const handleImportLeads = async (file: File): Promise<{ success: boolean; message: string }> => {
    if (!userEmail) {
        toast({ title: "Error", description: "You must be logged in to import leads.", variant: "destructive" });
        return { success: false, message: "User not logged in." };
    }
    try {
        const fileContent = await file.text();
        const parsedLeads = await parseLeadsFromCsv({ csvData: fileContent });

        if (!parsedLeads || parsedLeads.length === 0) {
            return { success: false, message: "AI could not find any leads in the file." };
        }

        const addedLeads = await addLeadsBatch(parsedLeads, userEmail);
        
        if (addedLeads.length > 0) {
            if (userEmail) await fetchLeads(userEmail); // Refresh the entire list
            toast({
                title: "Import Successful",
                description: `${addedLeads.length} new leads have been imported.`,
            });
            return { success: true, message: `${addedLeads.length} leads imported successfully.` };
        } else {
            return { success: false, message: "Failed to save the parsed leads to Notion." };
        }

    } catch (error: any) {
        console.error("Failed to import leads:", error);
        
        let errorMessage = "An unexpected error occurred during the import process.";
        if (typeof error.message === 'string') {
            if (error.message.includes('503') || error.message.toLowerCase().includes('overloaded')) {
                errorMessage = "The AI model is currently overloaded. Please try again in a few moments.";
            } else if (error.message.toLowerCase().includes('api key')) {
                errorMessage = "Invalid or missing API key. Please check your configuration.";
            }
        }

        toast({
            title: "Import Error",
            description: errorMessage,
            variant: "destructive",
        });
        return { success: false, message: errorMessage };
    }
  };

  const handleUpdateLead = async (leadId: string, updatedData: Partial<Lead>) => {
    // Optimistic UI update
    const originalLeads = [...leads];
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updatedData } : l));

    try {
      const updatedLead = await updateLead(leadId, updatedData);
      if (updatedLead) {
        // Final update with data from server
        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      } else {
        throw new Error("Failed to update lead in Notion.");
      }
    } catch (error) {
      console.error("Failed to update lead:", error);
      // Rollback on error
      setLeads(originalLeads);
      toast({
        title: "Error",
        description: "Could not update lead in Notion. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    const originalLeads = [...leads];
    // Optimistic UI update
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setSelectedLead(null); // Close the details sheet

    try {
      const deletedLeadId = await deleteLead(leadId);
      if (deletedLeadId) {
        toast({
          title: "Success",
          description: "Lead has been deleted.",
        });
      } else {
        throw new Error("Failed to delete lead in Notion.");
      }
    } catch (error) {
      console.error("Failed to delete lead:", error);
      // Rollback on error
      setLeads(originalLeads);
      toast({
        title: "Error",
        description: "Could not delete lead. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDownloadCsv = () => {
    const headers = ["Name", "Contact", "Status", "Priority", "Source", "Follow-up Date", "Date Added", "Notes"];
    const csvRows = [
        headers.join(','),
        ...leads.map(lead => [
            `"${lead.name.replace(/"/g, '""')}"`,
            `"${lead.contact.replace(/"/g, '""')}"`,
            lead.status,
            lead.priority,
            lead.source,
            lead.followUpDate.toISOString().split('T')[0],
            lead.dateAdded.toISOString().split('T')[0],
            `"${(lead.notes || '').replace(/"/g, '""')}"`
        ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
    }
    router.push('/login');
  }

  return (
    <div className="flex flex-col h-screen bg-secondary">
      <Header 
        onAddLead={() => setAddLeadOpen(true)}
        onImport={() => setImportLeadOpen(true)}
        onExport={handleDownloadCsv}
        onLogout={handleLogout}
        showLogout
      />
      <main className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading leads...</p>
          </div>
        ) : (
          <KanbanBoard leads={leads} setLeads={setLeads} onSelectLead={setSelectedLead} onUpdateLead={handleUpdateLead} />
        )}
      </main>
      <AddLeadDialog
        isOpen={isAddLeadOpen}
        onOpenChange={setAddLeadOpen}
        onAddLead={handleAddLead}
      />
      <ImportLeadsDialog
        isOpen={isImportLeadOpen}
        onOpenChange={setImportLeadOpen}
        onImport={handleImportLeads}
      />
      <LeadDetailsSheet
        lead={selectedLead}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
        isOpen={!!selectedLead}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedLead(null);
          }
        }}
      />
    </div>
  );
}
