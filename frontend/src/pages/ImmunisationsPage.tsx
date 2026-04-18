import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Syringe } from 'lucide-react'
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ImmunisationForm } from '@/components/forms/ImmunisationForm'
import { useImmunisations, useCreateImmunisation } from '@/hooks/useImmunisations'
import { useToast } from '@/components/ui/use-toast'

export default function ImmunisationsPage() {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useImmunisations()
  const create = useCreateImmunisation()
  const { toast } = useToast()

  const immunisations = (data?.results ?? []).sort(
    (a, b) => new Date(b.administration_date).getTime() - new Date(a.administration_date).getTime()
  )

  const getDueStatus = (nextDue?: string | null) => {
    if (!nextDue) return 'none'
    const date = parseISO(nextDue)
    if (isPast(date)) return 'overdue'
    if (isWithinInterval(date, { start: new Date(), end: addDays(new Date(), 30) })) return 'due-soon'
    return 'upcoming'
  }

  const handleSubmit = async (values: Parameters<typeof create.mutateAsync>[0]) => {
    try {
      await create.mutateAsync(values)
      toast({ title: 'Immunisation added' })
      setOpen(false)
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Immunisations</h1>
          <p className="text-muted-foreground text-sm">Vaccination history and upcoming doses</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Immunisation
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : immunisations.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No immunisations recorded.</CardContent></Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="space-y-3">
            {immunisations.map((imm) => {
              const dueStatus = getDueStatus(imm.next_due_date)
              return (
                <div key={imm.id} className="md:pl-14 relative">
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-3.5 top-5 w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Syringe className="h-3 w-3 text-white" />
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{imm.vaccine_name}</span>
                            {imm.disease_targeted && <Badge variant="outline" className="text-xs">{imm.disease_targeted}</Badge>}
                            {dueStatus === 'overdue' && <Badge variant="danger" className="text-xs">Overdue</Badge>}
                            {dueStatus === 'due-soon' && <Badge variant="warning" className="text-xs">Due Soon</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Given: {format(parseISO(imm.administration_date), 'dd MMM yyyy')}
                            {imm.dose_number && ` · Dose ${imm.dose_number}`}
                          </p>
                          {imm.batch_number && <p className="text-xs text-muted-foreground">Batch: {imm.batch_number}</p>}
                          {imm.administered_by && <p className="text-xs text-muted-foreground">By: {imm.administered_by}</p>}
                          {imm.next_due_date && (
                            <p className={`text-xs mt-1 font-medium ${dueStatus === 'overdue' ? 'text-red-600' : dueStatus === 'due-soon' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              Next due: {format(parseISO(imm.next_due_date), 'dd MMM yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Immunisation</DialogTitle></DialogHeader>
          <ImmunisationForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoading={create.isPending}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
