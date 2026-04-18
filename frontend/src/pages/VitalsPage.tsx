import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { VitalsTrendChart } from '@/components/charts/VitalsTrendChart'
import { VitalSignForm } from '@/components/forms/VitalSignForm'
import { useVitals, useCreateVital } from '@/hooks/useVitals'
import { useToast } from '@/components/ui/use-toast'
import type { VitalType } from '@/types'

const vitalTabs: { value: VitalType; label: string; unit: string }[] = [
  { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'temperature', label: 'Temperature', unit: '°C' },
  { value: 'oxygen_saturation', label: 'O₂ Sat', unit: '%' },
  { value: 'blood_glucose', label: 'Blood Glucose', unit: 'mmol/L' },
]

export default function VitalsPage() {
  const [activeTab, setActiveTab] = useState<VitalType>('blood_pressure')
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useVitals()
  const create = useCreateVital()
  const { toast } = useToast()

  const allVitals = data?.results ?? []
  const tabVitals = allVitals
    .filter((v) => v.vital_type === activeTab)
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())

  const handleSubmit = async (values: Parameters<typeof create.mutateAsync>[0]) => {
    try {
      await create.mutateAsync(values)
      toast({ title: 'Vital recorded' })
      setOpen(false)
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vital Signs</h1>
          <p className="text-muted-foreground text-sm">Track your health metrics over time</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Record Vital
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VitalType)}>
        <TabsList className="flex-wrap h-auto gap-1">
          {vitalTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {vitalTabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.label} Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : tabVitals.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No {t.label} data yet. Record your first reading.
                  </div>
                ) : (
                  <VitalsTrendChart data={tabVitals} vitalType={t.value} />
                )}
              </CardContent>
            </Card>

            {tabVitals.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Readings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date &amp; Time</TableHead>
                        <TableHead>Value</TableHead>
                        {t.value === 'blood_pressure' && <TableHead>Diastolic</TableHead>}
                        <TableHead>Unit</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabVitals.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>{format(parseISO(v.recorded_at), 'dd MMM yyyy HH:mm')}</TableCell>
                          <TableCell className="font-medium">{v.value}</TableCell>
                          {t.value === 'blood_pressure' && <TableCell>{v.value2 ?? '–'}</TableCell>}
                          <TableCell>{v.unit}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{v.notes || '–'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Vital Sign</DialogTitle>
          </DialogHeader>
          <VitalSignForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoading={create.isPending}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
