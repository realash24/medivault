import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Upload, Eye, FileText } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { PathologyReportForm } from '@/components/forms/PathologyReportForm'
import { PathologyTrendChart } from '@/components/charts/PathologyTrendChart'
import { usePathology, useCreatePathology, useUploadPathologyPdf } from '@/hooks/usePathology'
import { useToast } from '@/components/ui/use-toast'
import type { PathologyReport } from '@/types'

const flagColors: Record<string, string> = {
  H: 'bg-red-100 text-red-700',
  HH: 'bg-red-200 text-red-900 font-bold',
  L: 'bg-blue-100 text-blue-700',
  LL: 'bg-blue-200 text-blue-900 font-bold',
  A: 'bg-amber-100 text-amber-800',
  N: 'bg-green-50 text-green-700',
}

export default function PathologyPage() {
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState<PathologyReport | null>(null)

  const { data, isLoading } = usePathology()
  const create = useCreatePathology()
  const uploadPdf = useUploadPathologyPdf()
  const { toast } = useToast()

  const reports = data?.results ?? []

  const handleSubmit = async (values: Parameters<typeof create.mutateAsync>[0]) => {
    try {
      await create.mutateAsync(values)
      toast({ title: 'Report added' })
      setOpen(false)
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0] || !viewing) return
    try {
      await uploadPdf.mutateAsync({ id: viewing.id, file: files[0] })
      toast({ title: 'PDF uploaded' })
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' })
    }
  }, [viewing, uploadPdf, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pathology</h1>
          <p className="text-muted-foreground text-sm">Lab reports and test results</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Report
        </Button>
      </div>

      {reports.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Analyte Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <PathologyTrendChart reports={reports} />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : reports.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No reports yet. Add your first report.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const abnormal = r.analytes.filter((a) => a.flag !== 'N' && a.flag)
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{format(parseISO(r.report_date), 'dd MMM yyyy')}</span>
                        {r.report_type && <Badge variant="outline" className="text-xs">{r.report_type}</Badge>}
                        {abnormal.length > 0 && (
                          <Badge variant="danger" className="text-xs">{abnormal.length} abnormal</Badge>
                        )}
                      </div>
                      {r.lab_name && <p className="text-xs text-muted-foreground mt-0.5">{r.lab_name}</p>}
                      {r.requesting_provider && <p className="text-xs text-muted-foreground">Dr. {r.requesting_provider}</p>}
                      {r.analytes.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {r.analytes.slice(0, 6).map((a) => (
                            <span key={a.id} className={`text-xs px-1.5 py-0.5 rounded ${flagColors[a.flag] ?? 'bg-gray-100'}`}>
                              {a.analyte_name}: {a.value} {a.unit}
                            </span>
                          ))}
                          {r.analytes.length > 6 && <span className="text-xs text-muted-foreground">+{r.analytes.length - 6} more</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {r.pdf_file && (
                        <a href={r.pdf_file} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon"><FileText className="h-4 w-4" /></Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setViewing(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add report dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Pathology Report</DialogTitle></DialogHeader>
          <PathologyReportForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoading={create.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View report dialog */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewing && format(parseISO(viewing.report_date), 'dd MMM yyyy')} — {viewing?.report_type ?? 'Report'}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Analyte</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Flag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewing.analytes.map((a) => (
                    <TableRow key={a.id} className={a.flag !== 'N' && a.flag ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium text-sm">{a.analyte_name}</TableCell>
                      <TableCell className="font-semibold">{a.value}</TableCell>
                      <TableCell>{a.unit}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.reference_range_low} – {a.reference_range_high}
                      </TableCell>
                      <TableCell>
                        {a.flag && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${flagColors[a.flag]}`}>{a.flag}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* PDF upload */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Upload PDF
                </p>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? 'Drop PDF here' : 'Drag & drop a PDF, or click to select'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
