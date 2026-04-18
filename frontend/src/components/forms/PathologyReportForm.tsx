import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  report_date: z.string().min(1, 'Required'),
  lab_name: z.string().optional(),
  requesting_provider: z.string().optional(),
  report_type: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PathologyReportForm({ onSubmit, onCancel, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { report_date: new Date().toISOString().slice(0, 10) },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="report_date" render={({ field }) => (
          <FormItem><FormLabel>Report Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="lab_name" render={({ field }) => (
          <FormItem><FormLabel>Lab / Laboratory</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="requesting_provider" render={({ field }) => (
          <FormItem><FormLabel>Requesting Provider</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="report_type" render={({ field }) => (
          <FormItem><FormLabel>Report Type</FormLabel><FormControl><Input placeholder="e.g. Full Blood Count, LFTs" {...field} /></FormControl><FormMessage /></FormItem>
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
