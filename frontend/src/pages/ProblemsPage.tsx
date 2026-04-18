import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ProblemForm } from '@/components/forms/ProblemForm'
import { useProblems, useCreateProblem, useUpdateProblem, useDeleteProblem } from '@/hooks/useProblems'
import { useToast } from '@/components/ui/use-toast'
import type { Problem } from '@/types'

const severityVariant: Record<string, 'danger' | 'warning' | 'success'> = {
  severe: 'danger',
  moderate: 'warning',
  mild: 'success',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  resolved: 'secondary',
  inactive: 'outline',
}

export default function ProblemsPage() {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Problem | null>(null)

  const { data, isLoading } = useProblems(filter === 'all' ? undefined : filter)
  const create = useCreateProblem()
  const update = useUpdateProblem()
  const del = useDeleteProblem()
  const { toast } = useToast()

  const problems = data?.results ?? []

  const handleSubmit = async (values: Partial<Problem>) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...values })
        toast({ title: 'Problem updated' })
      } else {
        await create.mutateAsync(values)
        toast({ title: 'Problem added' })
      }
      setOpen(false)
      setEditing(null)
    } catch {
      toast({ title: 'Error', description: 'Could not save problem.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this problem?')) return
    await del.mutateAsync(id)
    toast({ title: 'Deleted' })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Problems</h1>
          <p className="text-muted-foreground text-sm">Medical problems and diagnoses</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setOpen(true) }} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Problem
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : problems.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No problems found. Add one to get started.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {problems.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{p.problem_name}</span>
                    <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                    <Badge variant={severityVariant[p.severity]}>{p.severity}</Badge>
                  </div>
                  {p.icd10 && <p className="text-xs text-muted-foreground mt-0.5">ICD-10: {p.icd10}</p>}
                  {p.onset_date && (
                    <p className="text-xs text-muted-foreground">Onset: {format(parseISO(p.onset_date), 'dd MMM yyyy')}</p>
                  )}
                  {p.clinical_notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.clinical_notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Problem' : 'Add Problem'}</DialogTitle>
          </DialogHeader>
          <ProblemForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoading={create.isPending || update.isPending}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
