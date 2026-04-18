import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { MedicationForm } from '@/components/forms/MedicationForm'
import { MedicationGanttChart } from '@/components/charts/MedicationGanttChart'
import { useMedications, useCreateMedication, useUpdateMedication, useDeleteMedication } from '@/hooks/useMedications'
import { useToast } from '@/components/ui/use-toast'
import type { Medication } from '@/types'

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  stopped: 'bg-gray-100 text-gray-600',
  'on-hold': 'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
}

export default function MedicationsPage() {
  const [tab, setTab] = useState('active')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)

  const { data, isLoading } = useMedications(tab === 'all' ? undefined : tab)
  const { data: allData } = useMedications()
  const create = useCreateMedication()
  const update = useUpdateMedication()
  const del = useDeleteMedication()
  const { toast } = useToast()

  const meds = data?.results ?? []
  const allMeds = allData?.results ?? []

  const handleSubmit = async (values: Partial<Medication>) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...values })
        toast({ title: 'Medication updated' })
      } else {
        await create.mutateAsync(values)
        toast({ title: 'Medication added' })
      }
      setOpen(false)
      setEditing(null)
    } catch {
      toast({ title: 'Error', description: 'Could not save medication.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this medication?')) return
    await del.mutateAsync(id)
    toast({ title: 'Deleted' })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medications</h1>
          <p className="text-muted-foreground text-sm">Prescription and over-the-counter medications</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true) }} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Medication
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="stopped">Stopped</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value={tab === 'timeline' ? '' : tab}>
          {isLoading ? (
            <div className="space-y-3 mt-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : meds.length === 0 ? (
            <Card className="mt-4"><CardContent className="py-12 text-center text-muted-foreground">No medications found.</CardContent></Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {meds.map((m) => (
                <Card key={m.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{m.medication_name}</p>
                        {m.generic_name && <p className="text-xs text-muted-foreground">{m.generic_name}</p>}
                        <p className="text-xs mt-1">{m.dose} · {m.frequency}</p>
                        {m.route && <p className="text-xs text-muted-foreground">Route: {m.route}</p>}
                        {m.start_date && (
                          <p className="text-xs text-muted-foreground">
                            Since {format(parseISO(m.start_date), 'dd MMM yyyy')}
                          </p>
                        )}
                        {m.indication && <p className="text-xs text-muted-foreground mt-0.5">For: {m.indication}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[m.status]}`}>{m.status}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(m); setOpen(true) }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Medication Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <MedicationGanttChart medications={allMeds} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
          </DialogHeader>
          <MedicationForm
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
