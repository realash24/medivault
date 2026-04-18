import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  substance: z.string().min(1, 'Required'),
  substance_type: z.string().optional(),
  reaction_type: z.string().optional(),
  manifestation: z.string().optional(),
  severity: z.string().optional(),
  criticality: z.enum(['high', 'low', 'unable-to-assess']),
  verification_status: z.enum(['confirmed', 'unconfirmed', 'refuted', 'entered-in-error']),
  onset_date: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ReactionForm({ onSubmit, onCancel, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { criticality: 'unable-to-assess', verification_status: 'unconfirmed' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="substance" render={({ field }) => (
          <FormItem><FormLabel>Substance *</FormLabel><FormControl><Input placeholder="e.g. Penicillin" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="substance_type" render={({ field }) => (
            <FormItem><FormLabel>Substance Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Medication', 'Food', 'Environment', 'Biologic', 'Other'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="reaction_type" render={({ field }) => (
            <FormItem><FormLabel>Reaction Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Allergy', 'Intolerance', 'Side Effect'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="manifestation" render={({ field }) => (
          <FormItem><FormLabel>Manifestation</FormLabel><FormControl><Input placeholder="e.g. Rash, Anaphylaxis" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="severity" render={({ field }) => (
            <FormItem><FormLabel>Severity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Mild', 'Moderate', 'Severe', 'Life-threatening'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="criticality" render={({ field }) => (
            <FormItem><FormLabel>Criticality</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="unable-to-assess">Unable to Assess</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="verification_status" render={({ field }) => (
          <FormItem><FormLabel>Verification Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                <SelectItem value="refuted">Refuted</SelectItem>
                <SelectItem value="entered-in-error">Entered in Error</SelectItem>
              </SelectContent>
            </Select><FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="onset_date" render={({ field }) => (
          <FormItem><FormLabel>Onset Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
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
