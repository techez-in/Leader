
"use client";
import Link from 'next/link';

import { Layers, Plus, Upload, Download, LogOut, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onAddLead: () => void;
  onImport: () => void;
  onExport: () => void;
  onLogout?: () => void;
  showLogout?: boolean;
}

export function Header({ onAddLead, onImport, onExport, onLogout, showLogout = false }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
          <Link href="/" className="mr-6 flex items-center space-x-2"> <img src='/images/TechezLogo.png' width={40}></img>
            <span className="minecraftFont pt-2 text-2xl font-medium">TECHEZ</span>
          </Link>
      </div>
      <div className="flex items-center gap-2">
         {/* Desktop Buttons */}
         <Button onClick={onImport} variant="outline" className="hidden sm:inline-flex">
            <Upload className="mr-2 h-4 w-4" />
            Import
        </Button>
         <Button onClick={onExport} variant="outline" className="hidden sm:inline-flex">
            <Download className="mr-2 h-4 w-4" />
            Export
        </Button>
        <Button onClick={onAddLead}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
        </Button>

        {/* Mobile Dropdown */}
        <div className="sm:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                        <span className="sr-only">More options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onImport}>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Import</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExport}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Export</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {showLogout && onLogout && (
          <Button onClick={onLogout} variant="ghost" size="icon" aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
