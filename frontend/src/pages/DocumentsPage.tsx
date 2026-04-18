import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Download, Trash2, Filter } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DocumentForm } from '@/components/forms/DocumentForm'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/useDocuments'
import { useToast } from '@/components/ui/use-toast'

const documentTypes = ['All', 'Referral', 'Discharge Summary', 'Lab Report', 'Imaging', 'Prescription', 'Insurance', 'Consent', 'Other']

export default function DocumentsPage() {
  const [open, setOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')

  const { data, isLoading } = useDocuments(typeFilter === 'All' ? undefined : typeFilter)
  const upload = useUploadDocument()
  const del = useDeleteDocument()
  const { toast } = useToast()

  const documents = data?.results ?? []

  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setPendingFile(files[0])
      setOpen(true)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  const handleSubmit = async ({ document_name, document_type, notes }: { document_name: string; document_type: string; notes?: string }) => {
    if (!pendingFile) {
      toast({ title: 'No file selected', variant: 'destructive' })
      return
    }
    try {
      await upload.mutateAsync({ file: pendingFile, documentName: document_name, documentType: document_type, notes })
      toast({ title: 'Document uploaded' })
      setOpen(false)
      setPendingFile(null)
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground text-sm">Medical documents and files</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-3 w-3 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Drop file here…' : 'Drag & drop a file here, or click to select'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : documents.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No documents found.</CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-8 w-8 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.document_name}</p>
                    <Badge variant="outline" className="text-xs mt-1">{doc.document_type}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(doc.uploaded_at ?? doc.created_at), 'dd MMM yyyy')}
                    </p>
                    {doc.file_size && (
                      <p className="text-xs text-muted-foreground">{(doc.file_size / 1024).toFixed(1)} KB</p>
                    )}
                    {doc.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-1 mt-3 justify-end">
                  {doc.file && (
                    <a href={doc.file} target="_blank" rel="noopener noreferrer" download>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                    if (!confirm('Delete this document?')) return
                    await del.mutateAsync(doc.id)
                    toast({ title: 'Deleted' })
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { if (!v) setPendingFile(null); setOpen(v) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          {pendingFile && <p className="text-sm text-muted-foreground">File: {pendingFile.name}</p>}
          <DocumentForm
            onSubmit={handleSubmit}
            onCancel={() => { setOpen(false); setPendingFile(null) }}
            isLoading={upload.isPending}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
