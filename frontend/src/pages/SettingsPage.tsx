import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

// BMI Calculator
const bmiSchema = z.object({
  weight: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
})
type BmiValues = z.infer<typeof bmiSchema>

function BMICalculator() {
  const [result, setResult] = useState<{ bmi: number; category: string } | null>(null)
  const form = useForm<BmiValues>({ resolver: zodResolver(bmiSchema) })

  const onSubmit = (d: BmiValues) => {
    const heightM = d.height / 100
    const bmi = d.weight / (heightM * heightM)
    let category = 'Normal'
    if (bmi < 18.5) category = 'Underweight'
    else if (bmi < 25) category = 'Normal weight'
    else if (bmi < 30) category = 'Overweight'
    else category = 'Obese'
    setResult({ bmi: Math.round(bmi * 10) / 10, category })
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="weight" render={({ field }) => (
              <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (
              <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" size="sm">Calculate BMI</Button>
        </form>
      </Form>
      {result && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-3xl font-bold">{result.bmi}</p>
            <p className="text-sm text-muted-foreground">kg/m²</p>
            <Badge className="mt-2" variant={
              result.category === 'Normal weight' ? 'success' :
              result.category === 'Overweight' ? 'warning' : 'danger'
            }>{result.category}</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// eGFR (CKD-EPI simplified)
const egfrSchema = z.object({
  creatinine: z.coerce.number().positive(),
  age: z.coerce.number().int().positive(),
  isFemale: z.boolean(),
})
type EgfrValues = z.infer<typeof egfrSchema>

function EGFRCalculator() {
  const [result, setResult] = useState<number | null>(null)
  const form = useForm<EgfrValues>({ resolver: zodResolver(egfrSchema), defaultValues: { isFemale: false } })

  const onSubmit = (d: EgfrValues) => {
    // CKD-EPI approximation
    const kappa = d.isFemale ? 0.7 : 0.9
    const alpha = d.isFemale ? -0.241 : -0.302
    const creatMg = d.creatinine / 88.42
    const ratio = creatMg / kappa
    let gfr = 142 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.200) * Math.pow(0.9938, d.age)
    if (d.isFemale) gfr *= 1.012
    setResult(Math.round(gfr))
  }

  const getStage = (v: number) => {
    if (v >= 90) return { stage: 'G1', label: 'Normal/High', color: 'success' as const }
    if (v >= 60) return { stage: 'G2', label: 'Mildly Decreased', color: 'success' as const }
    if (v >= 45) return { stage: 'G3a', label: 'Mildly-Moderately Decreased', color: 'warning' as const }
    if (v >= 30) return { stage: 'G3b', label: 'Moderately-Severely Decreased', color: 'warning' as const }
    if (v >= 15) return { stage: 'G4', label: 'Severely Decreased', color: 'danger' as const }
    return { stage: 'G5', label: 'Kidney Failure', color: 'danger' as const }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="creatinine" render={({ field }) => (
              <FormItem><FormLabel>Creatinine (µmol/L)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="isFemale" render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 accent-primary" /></FormControl>
              <FormLabel className="!mt-0">Female</FormLabel>
            </FormItem>
          )} />
          <Button type="submit" size="sm">Calculate eGFR</Button>
        </form>
      </Form>
      {result !== null && (() => { const s = getStage(result); return (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-3xl font-bold">{result}</p>
            <p className="text-sm text-muted-foreground">mL/min/1.73m²</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{s.stage}</Badge>
              <Badge variant={s.color}>{s.label}</Badge>
            </div>
          </CardContent>
        </Card>
      )})()}
    </div>
  )
}

// Password change form
const pwSchema = z.object({
  current_password: z.string().min(1, 'Required'),
  new_password: z.string().min(8, 'Minimum 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })
type PwValues = z.infer<typeof pwSchema>

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [exportLoading, setExportLoading] = useState(false)

  const pwForm = useForm<PwValues>({ resolver: zodResolver(pwSchema) })

  const handlePasswordChange = async (d: PwValues) => {
    try {
      await api.post('/api/auth/change-password/', { current_password: d.current_password, new_password: d.new_password })
      toast({ title: 'Password changed' })
      pwForm.reset()
    } catch {
      toast({ title: 'Failed to change password', variant: 'destructive' })
    }
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const data = await api.get<Record<string, unknown>>('/api/export/json/')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `medivault-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' })
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="calculators">Health Calculators</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Account Information</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm"><span className="font-medium">Email:</span> {user?.email}</p>
              <p className="text-sm mt-1"><span className="font-medium">Member since:</span> {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '–'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent>
              <Form {...pwForm}>
                <form onSubmit={pwForm.handleSubmit(handlePasswordChange)} className="space-y-3">
                  <FormField control={pwForm.control} name="current_password" render={({ field }) => (
                    <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={pwForm.control} name="new_password" render={({ field }) => (
                    <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={pwForm.control} name="confirm_password" render={({ field }) => (
                    <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" size="sm">Update Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <Button variant="destructive" size="sm" onClick={logout}>Sign Out of All Sessions</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Export Data</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Download all your health records as a JSON file.</p>
              <Button onClick={handleExport} disabled={exportLoading} variant="outline" size="sm">
                {exportLoading ? 'Exporting…' : 'Export as JSON'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculators" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">BMI Calculator</CardTitle></CardHeader>
            <CardContent><BMICalculator /></CardContent>
          </Card>
          <Separator />
          <Card>
            <CardHeader><CardTitle className="text-base">eGFR Calculator (CKD-EPI)</CardTitle></CardHeader>
            <CardContent><EGFRCalculator /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
