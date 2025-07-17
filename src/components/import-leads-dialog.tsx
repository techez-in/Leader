
"use client";

import { useState } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ImportLeadsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (file: File) => Promise<{ success: boolean; message: string }>;
}

type ImportStage = 'select' | 'uploading' | 'success' | 'error';

export function ImportLeadsDialog({ isOpen, onOpenChange, onImport }: ImportLeadsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<ImportStage>('select');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });
  
  const resetState = () => {
    setFile(null);
    setStage('select');
    setMessage('');
    setProgress(0);
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  const handleImportClick = async () => {
    if (!file) return;

    setStage('uploading');
    setMessage('Parsing file with AI...');
    setProgress(33);

    const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 5 : p));
    }, 500);

    const result = await onImport(file);
    
    clearInterval(interval);
    setProgress(100);

    if (result.success) {
      setStage('success');
      setMessage(result.message);
    } else {
      setStage('error');
      setMessage(result.message);
    }
  };

  const renderContent = () => {
    switch (stage) {
      case 'uploading':
        return (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h3 className="text-lg font-medium">Importing Leads...</h3>
            <p className="text-muted-foreground">{message}</p>
            <Progress value={progress} className="w-full" />
          </div>
        );
      case 'success':
        return (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-medium">Import Complete</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center space-y-4 py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="text-lg font-medium">Import Failed</h3>
            <p className="text-destructive">{message}</p>
          </div>
        );
      case 'select':
      default:
        return (
          <div className="grid gap-4 py-4">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop a .CSV file here, or click to select'}
              </p>
            </div>
            {file && (
              <div className="flex items-center justify-center p-3 bg-secondary rounded-md">
                <FileText className="h-5 w-5 text-primary" />
                <span className="ml-2 text-sm font-medium">{file.name}</span>
                <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={() => setFile(null)}>
                  <span className="sr-only">Remove file</span>
                  &times;
                </Button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file and our AI will automatically parse and import your leads.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>
          {stage === 'select' && (
            <>
              <Button variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
              <Button onClick={handleImportClick} disabled={!file}>
                Import Leads
              </Button>
            </>
          )}
           {(stage === 'success' || stage === 'error') && (
            <Button onClick={() => handleClose(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
