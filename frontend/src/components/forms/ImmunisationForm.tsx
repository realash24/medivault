import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  vaccine_name: z.string().min(1, 'Required'),
  disease_targeted: z.string().optional(),
  administration_date: z.string().min(1, 'Required'),
  batch_number: z.string().optional(),
  dose_number: z.coerce.number().optional(),
  next_due_date: z.string().optional(),
  administered_by: z.string().optional(),
  site: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ImmunisationForm({ onSubmit, onCancel, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { administration_date: new Date().toISOString().slice(0, 10) },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="vaccine_name" render={({ field }) => (
          <FormItem><FormLabel>Vaccine Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="disease_targeted" render={({ field }) => (
          <FormItem><FormLabel>Disease Targeted</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="administration_date" render={({ field }) => (
            <FormItem><FormLabel>Date Given *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="next_due_date" render={({ field }) => (
            <FormItem><FormLabel>Next Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="batch_number" render={({ field }) => (
            <FormItem><FormLabel>Batch Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="dose_number" render={({ field }) => (
            <FormItem><FormLabel>Dose Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="administered_by" render={({ field }) => (
          <FormItem><FormLabel>Administered By</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
