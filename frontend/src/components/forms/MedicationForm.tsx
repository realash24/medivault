import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { Medication } from '@/types'

const schema = z.object({
  medication_name: z.string().min(1, 'Required'),
  generic_name: z.string().optional(),
  route: z.string().optional(),
  dose: z.string().min(1, 'Required'),
  frequency: z.string().min(1, 'Required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['active', 'stopped', 'on-hold', 'completed']),
  prescriber: z.string().optional(),
  indication: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Medication>
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function MedicationForm({ defaultValues, onSubmit, onCancel, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      medication_name: defaultValues?.medication_name ?? '',
      generic_name: defaultValues?.generic_name ?? '',
      route: defaultValues?.route ?? '',
      dose: defaultValues?.dose ?? '',
      frequency: defaultValues?.frequency ?? '',
      start_date: defaultValues?.start_date ?? '',
      end_date: defaultValues?.end_date ?? '',
      status: defaultValues?.status ?? 'active',
      prescriber: defaultValues?.prescriber ?? '',
      indication: defaultValues?.indication ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="medication_name" render={({ field }) => (
            <FormItem><FormLabel>Medication *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="generic_name" render={({ field }) => (
            <FormItem><FormLabel>Generic Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField control={form.control} name="dose" render={({ field }) => (
            <FormItem><FormLabel>Dose *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="frequency" render={({ field }) => (
            <FormItem><FormLabel>Frequency *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="route" render={({ field }) => (
            <FormItem><FormLabel>Route</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="prescriber" render={({ field }) => (
            <FormItem><FormLabel>Prescriber</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="indication" render={({ field }) => (
          <FormItem><FormLabel>Indication</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
