"use client";

import {
    Mail,
    Calendar,
    CalendarClock
  } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Lead } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, lead: Lead) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onSelectLead: (lead: Lead) => void;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
}

export function LeadCard({ lead, onDragStart, onDragEnd, onSelectLead }: LeadCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      onClick={() => onSelectLead(lead)}
      className="mb-4 cursor-grab active:cursor-grabbing hover:bg-secondary transition-all duration-200 ease-in-out transform hover:-translate-y-1 shadow-sm"
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://i.pravatar.cc/40?u=${lead.id}`} alt={lead.name} />
            <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-base font-medium">{lead.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-muted-foreground space-y-2">
             <div className="flex items-center gap-2 text-xs truncate">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{lead.contact}</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                    <CalendarClock className="h-4 w-4" />
                    <span>
                    Follow-up: {format(lead.followUpDate, 'MMM d')}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-4 w-4" />
                    <span>
                    {formatDistanceToNow(lead.dateAdded, { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
