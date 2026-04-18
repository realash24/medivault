import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  vital_type: z.enum(['blood_pressure', 'heart_rate', 'weight', 'height', 'temperature', 'oxygen_saturation', 'blood_glucose', 'respiratory_rate']),
  value: z.coerce.number({ required_error: 'Required' }),
  value2: z.coerce.number().optional(),
  unit: z.string().min(1, 'Required'),
  recorded_at: z.string().min(1, 'Required'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const vitalTypes = [
  { value: 'blood_pressure', label: 'Blood Pressure (Systolic / Diastolic)', unit: 'mmHg' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'height', label: 'Height', unit: 'cm' },
  { value: 'temperature', label: 'Temperature', unit: '°C' },
  { value: 'oxygen_saturation', label: 'O₂ Saturation', unit: '%' },
  { value: 'blood_glucose', label: 'Blood Glucose', unit: 'mmol/L' },
  { value: 'respiratory_rate', label: 'Respiratory Rate', unit: 'br/min' },
]

interface Props {
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function VitalSignForm({ onSubmit, onCancel, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vital_type: 'blood_pressure',
      unit: 'mmHg',
      recorded_at: new Date().toISOString().slice(0, 16),
    },
  })

  const vitalType = form.watch('vital_type')
  const isBP = vitalType === 'blood_pressure'

  const handleTypeChange = (v: string) => {
    form.setValue('vital_type', v as FormValues['vital_type'])
    const cfg = vitalTypes.find((t) => t.value === v)
    if (cfg) form.setValue('unit', cfg.unit)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="vital_type" render={({ field }) => (
          <FormItem><FormLabel>Vital Type *</FormLabel>
            <Select onValueChange={(v) => handleTypeChange(v)} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                {vitalTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select><FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="value" render={({ field }) => (
            <FormItem><FormLabel>{isBP ? 'Systolic (mmHg) *' : 'Value *'}</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          {isBP ? (
            <FormField control={form.control} name="value2" render={({ field }) => (
              <FormItem><FormLabel>Diastolic (mmHg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          ) : (
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem><FormLabel>Unit *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          )}
        </div>
        <FormField control={form.control} name="recorded_at" render={({ field }) => (
          <FormItem><FormLabel>Date &amp; Time *</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Form>
  )
}
