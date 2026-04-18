import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Save, X } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePerson, useUpdatePerson } from '@/hooks/usePerson'
import { useToast } from '@/components/ui/use-toast'
import type { Person } from '@/types'

const schema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  blood_type: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const { data: person, isLoading } = usePerson()
  const update = useUpdatePerson()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: person ? {
      first_name: person.first_name ?? '',
      last_name: person.last_name ?? '',
      date_of_birth: person.date_of_birth ?? '',
      gender: person.gender ?? '',
      phone: person.phone ?? '',
      address: person.address ?? '',
      emergency_contact_name: person.emergency_contact_name ?? '',
      emergency_contact_phone: person.emergency_contact_phone ?? '',
      blood_type: person.blood_type ?? '',
    } : undefined,
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      await update.mutateAsync(values as Partial<Person>)
      toast({ title: 'Profile updated' })
      setEditing(false)
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return <div className="p-6 space-y-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm">Personal and medical information</p>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setEditing(false); form.reset() }}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={form.handleSubmit(handleSubmit)} disabled={update.isPending}>
              <Save className="h-4 w-4 mr-1" /> {update.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <Form {...form}>
        <form className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="first_name" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel>
                    <FormControl>{editing ? <Input {...field} /> : <p className="text-sm py-2">{field.value || '–'}</p>}</FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="last_name" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel>
                    <FormControl>{editing ? <Input {...field} /> : <p className="text-sm py-2">{field.value || '–'}</p>}</FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel>
                    <FormControl>{editing ? <Input type="date" {...field} /> : <p className="text-sm py-2">{field.value || '–'}</p>}</FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender</FormLabel>
                    {editing ? (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                        <SelectContent>{genderOptions.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : <p className="text-sm py-2">{field.value || '–'}</p>}
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel>
                  <FormControl>{editing ? <Input {...field} /> : <p className="text-sm py-2">{field.value || '–'}</p>}</FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel>
                  <FormControl>{editing ? <Input {...field} /> : <p className="text-sm py-2">{field.value || '–'}</p>}</FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="emergency_contact_name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel>
                    <FormControl>{editing ? <Input {...field} /> : <p className="text-sm py-2">{field.value || '–'}</p>}</FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="emergency_contact_phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel>
                    <FormControl>{editing ? <Input {...field} /> : <p className="text-sm py-2">{field.value || '–'}</p>}</FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Medical Information</CardTitle></CardHeader>
            <CardContent>
              <FormField control={form.control} name="blood_type" render={({ field }) => (
                <FormItem><FormLabel>Blood Type</FormLabel>
                  {editing ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="w-32"><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                      <SelectContent>{bloodTypes.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : <p className="text-sm py-2">{field.value || '–'}</p>}
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </form>
      </Form>
    </motion.div>
  )
}
