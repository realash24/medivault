import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { Problem } from '@/types'

const schema = z.object({
  problem_name: z.string().min(1, 'Required'),
  snomed_ct: z.string().optional(),
  icd10: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  status: z.enum(['active', 'resolved', 'inactive']),
  onset_date: z.string().optional(),
  clinical_notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Problem>
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProblemForm({ defaultValues, onSubmit, onCancel, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      problem_name: defaultValues?.problem_name ?? '',
      snomed_ct: defaultValues?.snomed_ct ?? '',
      icd10: defaultValues?.icd10 ?? '',
      severity: defaultValues?.severity ?? 'mild',
      status: defaultValues?.status ?? 'active',
      onset_date: defaultValues?.onset_date ?? '',
      clinical_notes: defaultValues?.clinical_notes ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="problem_name" render={({ field }) => (
          <FormItem><FormLabel>Problem Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="snomed_ct" render={({ field }) => (
            <FormItem><FormLabel>SNOMED CT</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="icd10" render={({ field }) => (
            <FormItem><FormLabel>ICD-10</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="severity" render={({ field }) => (
            <FormItem><FormLabel>Severity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="onset_date" render={({ field }) => (
          <FormItem><FormLabel>Onset Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="clinical_notes" render={({ field }) => (
          <FormItem><FormLabel>Clinical Notes</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Form>
  )
}
