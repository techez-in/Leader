
"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Lead, LeadStatus, LeadPriority, LeadSource } from '@/lib/types';
import { LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES } from '@/lib/types';
import { scoreLead, ScoreLeadInput, ScoreLeadOutput } from '@/ai/flows/score-lead';
import { format } from "date-fns";
import { BrainCircuit, CheckCircle, XCircle, Hourglass, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LeadDetailsSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateLead: (leadId: string, updatedData: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
}

const statusIcons: Record<LeadStatus, React.ReactElement> = {
    "New Lead": <Hourglass className="h-4 w-4 text-blue-500" />,
    "In Progress": <BrainCircuit className="h-4 w-4 text-yellow-500" />,
    "Converted": <CheckCircle className="h-4 w-4 text-green-500" />,
    "Dropped": <XCircle className="h-4 w-4 text-red-500" />,
};

const RadialProgress = ({ progress, size = 120 }: { progress: number, size?: number }) => {
    const stroke = 10;
    const radius = (size / 2) - (stroke * 2);
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
  
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            className="text-secondary"
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-primary"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <span className="absolute text-3xl font-bold text-primary">{Math.round(progress)}</span>
      </div>
    );
  };

export function LeadDetailsSheet({ lead, isOpen, onOpenChange, onUpdateLead, onDeleteLead }: LeadDetailsSheetProps) {
  const [scoreData, setScoreData] = useState<ScoreLeadOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(lead?.followUpDate);
  const [contact, setContact] = useState(lead?.contact || '');
  const [notes, setNotes] = useState(lead?.notes || '');
  const { toast } = useToast();

  useEffect(() => {
    if (lead) {
      setFollowUpDate(lead.followUpDate);
      setContact(lead.contact || '');
      setNotes(lead.notes || '');
      setIsLoading(true);
      setScoreData(null);
      const input: ScoreLeadInput = {
        timeSinceAdded: format(lead.dateAdded, 'PPP'),
        priority: lead.priority,
        followUpActivity: lead.notes || 'No follow up activity specified.',
        notes: lead.notes,
      };

      scoreLead(input)
        .then(setScoreData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [lead]);

  const handleFollowUpDateChange = (date: Date | undefined) => {
      if(lead && date) {
        setFollowUpDate(date);
        onUpdateLead(lead.id, { followUpDate: date });
      }
  }

  const handleContactBlur = () => {
    if (lead && contact !== lead.contact) {
        onUpdateLead(lead.id, { contact });
    }
  }

  const handleContactKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleContactBlur();
        e.currentTarget.blur();
    }
  }

  const handleNotesBlur = () => {
    if (lead && notes !== lead.notes) {
        onUpdateLead(lead.id, { notes });
    }
  }
  
  if (!lead) {
      return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6">
                <div className="flex justify-between items-start">
                    <SheetTitle className="text-2xl">{lead.name}</SheetTitle>
                </div>
              <SheetDescription>
                Added on {format(lead.dateAdded, 'PPP')}
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" /> AI Lead Score
                    </h3>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <Skeleton className="h-6 w-48 mt-4" />
                            <Skeleton className="h-4 w-full mt-2" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </div>
                    ) : scoreData ? (
                        <div className="p-6 bg-secondary rounded-lg text-center space-y-4">
                            <div className="flex justify-center">
                                <RadialProgress progress={scoreData.score} />
                            </div>
                            <p className="text-muted-foreground italic">&quot;{scoreData.reasoning}&quot;</p>
                        </div>
                    ) : <p className="text-muted-foreground">Could not load AI score.</p>}
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">Details</h3>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contact">Contact Email</Label>
                            <Input
                                id="contact"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                onBlur={handleContactBlur}
                                onKeyDown={handleContactKeyDown}
                                placeholder="Enter contact email"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select 
                                value={lead.status}
                                onValueChange={(value) => onUpdateLead(lead.id, { status: value as LeadStatus })}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEAD_STATUSES.map(status => (
                                        <SelectItem key={status} value={status}>
                                            <div className="flex items-center gap-2">
                                                {statusIcons[status]}
                                                <span>{status}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select 
                                value={lead.priority}
                                onValueChange={(value) => onUpdateLead(lead.id, { priority: value as LeadPriority })}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEAD_PRIORITIES.map(priority => (
                                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="source">Source</Label>
                            <Select 
                                value={lead.source}
                                onValueChange={(value) => onUpdateLead(lead.id, { source: value as LeadSource })}
                            >
                                <SelectTrigger id="source">
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEAD_SOURCES.map(source => (
                                        <SelectItem key={source} value={source}>{source}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Follow-up Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !followUpDate && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {followUpDate ? format(followUpDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={followUpDate}
                                    onSelect={handleFollowUpDateChange}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={handleNotesBlur}
                                placeholder="Add notes..."
                                className="resize-none h-24"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <SheetFooter className="p-6 border-t bg-background">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Lead
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this
                            lead and remove their data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteLead(lead.id)}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </SheetFooter>
          </div>
      </SheetContent>
    </Sheet>
  );
}
