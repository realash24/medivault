import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Stethoscope } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EncounterForm } from '@/components/forms/EncounterForm'
import { useEncounters, useCreateEncounter } from '@/hooks/useEncounters'
import { useToast } from '@/components/ui/use-toast'

export default function EncountersPage() {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useEncounters()
  const create = useCreateEncounter()
  const { toast } = useToast()

  const encounters = (data?.results ?? []).sort(
    (a, b) => new Date(b.encounter_date).getTime() - new Date(a.encounter_date).getTime()
  )

  const handleSubmit = async (values: Parameters<typeof create.mutateAsync>[0]) => {
    try {
      await create.mutateAsync(values)
      toast({ title: 'Encounter added' })
      setOpen(false)
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Encounters</h1>
          <p className="text-muted-foreground text-sm">Clinical visits and consultations</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Encounter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : encounters.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No encounters recorded.</CardContent></Card>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="space-y-3">
            {encounters.map((enc) => (
              <div key={enc.id} className="md:pl-14 relative">
                <div className="hidden md:flex absolute left-3.5 top-5 w-5 h-5 rounded-full bg-blue-500 items-center justify-center">
                  <Stethoscope className="h-3 w-3 text-white" />
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{enc.encounter_type}</span>
                          <Badge variant="outline" className="text-xs">
                            {format(parseISO(enc.encounter_date), 'dd MMM yyyy')}
                          </Badge>
                        </div>
                        {enc.provider_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {enc.provider_name}{enc.provider_specialty && ` · ${enc.provider_specialty}`}
                          </p>
                        )}
                        {enc.facility && <p className="text-xs text-muted-foreground">{enc.facility}</p>}
                        {enc.chief_complaint && (
                          <p className="text-sm mt-2"><span className="font-medium">Complaint:</span> {enc.chief_complaint}</p>
                        )}
                        {enc.assessment && (
                          <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Assessment:</span> {enc.assessment}</p>
                        )}
                        {enc.plan && (
                          <p className="text-xs text-muted-foreground"><span className="font-medium">Plan:</span> {enc.plan}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Encounter</DialogTitle></DialogHeader>
          <EncounterForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoading={create.isPending}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
