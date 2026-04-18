import { motion } from 'framer-motion'
import { format, parseISO, differenceInMonths } from 'date-fns'
import {
  Pill, AlertCircle, FlaskConical, AlertTriangle, Syringe, Stethoscope,
  TrendingUp, Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VitalsTrendChart } from '@/components/charts/VitalsTrendChart'
import { PathologyTrendChart } from '@/components/charts/PathologyTrendChart'
import { useDashboardSummary, useTimeline } from '@/hooks/useDashboard'
import { useVitals } from '@/hooks/useVitals'
import { usePathology } from '@/hooks/usePathology'
import { useMedications } from '@/hooks/useMedications'
import { useProblems } from '@/hooks/useProblems'
import type { VitalType } from '@/types'
import { useState } from 'react'

const vitalTabs: { value: VitalType; label: string }[] = [
  { value: 'blood_pressure', label: 'BP' },
  { value: 'weight', label: 'Weight' },
  { value: 'heart_rate', label: 'HR' },
  { value: 'blood_glucose', label: 'Glucose' },
  { value: 'oxygen_saturation', label: 'O₂ Sat' },
  { value: 'temperature', label: 'Temp' },
]

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: timeline } = useTimeline()
  const { data: vitalsData } = useVitals()
  const { data: pathologyData } = usePathology()
  const { data: medicationsData } = useMedications('active')
  const { data: problemsData } = useProblems('active')
  const [vitalTab, setVitalTab] = useState<VitalType>('blood_pressure')

  const vitals = vitalsData?.results ?? []
  const reports = pathologyData?.results ?? []
  const activeMeds = medicationsData?.results ?? []
  const activeProblems = problemsData?.results ?? []

  const filteredVitals = vitals.filter((v) => v.vital_type === vitalTab)

  const lastPathDate = summary?.last_pathology_date
  const pathOld = lastPathDate && differenceInMonths(new Date(), parseISO(lastPathDate)) > 12

  const kpiCards = [
    {
      title: 'Active Medications',
      value: summaryLoading ? '–' : String(summary?.active_medications_count ?? 0),
      icon: Pill,
      sub: activeMeds[0]?.medication_name ?? 'None recorded',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Active Problems',
      value: summaryLoading ? '–' : String(summary?.active_problems_count ?? 0),
      icon: AlertCircle,
      sub: activeProblems[0]?.problem_name ?? 'None recorded',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Last Pathology',
      value: lastPathDate ? format(parseISO(lastPathDate), 'dd MMM yy') : 'None',
      icon: FlaskConical,
      sub: pathOld ? 'Over 12 months ago' : 'Up to date',
      color: pathOld ? 'text-amber-600' : 'text-green-600',
      bg: pathOld ? 'bg-amber-50' : 'bg-green-50',
    },
    {
      title: 'Flagged Results',
      value: summaryLoading ? '–' : String(summary?.flagged_results_count ?? 0),
      icon: AlertTriangle,
      sub: 'H / HH / L / LL',
      color: (summary?.flagged_results_count ?? 0) > 0 ? 'text-red-600' : 'text-green-600',
      bg: (summary?.flagged_results_count ?? 0) > 0 ? 'bg-red-50' : 'bg-green-50',
    },
    {
      title: 'Immunisations Due',
      value: summaryLoading ? '–' : String(summary?.immunisations_due_count ?? 0),
      icon: Syringe,
      sub: (summary?.immunisations_due_count ?? 0) > 0 ? 'Overdue' : 'All up to date',
      color: (summary?.immunisations_due_count ?? 0) > 0 ? 'text-amber-600' : 'text-green-600',
      bg: (summary?.immunisations_due_count ?? 0) > 0 ? 'bg-amber-50' : 'bg-green-50',
    },
    {
      title: 'Last Visit',
      value: summary?.last_encounter_date ? format(parseISO(summary.last_encounter_date), 'dd MMM yy') : 'None',
      icon: Stethoscope,
      sub: summary?.last_encounter_provider ?? '–',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your health overview at a glance</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${kpi.bg} mb-2`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{kpi.title}</p>
              {summaryLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold mt-0.5">{kpi.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vitals Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Vital Signs Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={vitalTab} onValueChange={(v) => setVitalTab(v as VitalType)}>
            <TabsList className="flex-wrap h-auto gap-1 mb-4">
              {vitalTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>
              ))}
            </TabsList>
            {vitalTabs.map((t) => (
              <TabsContent key={t.value} value={t.value}>
                {filteredVitals.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No {t.label} data recorded yet
                  </div>
                ) : (
                  <VitalsTrendChart data={filteredVitals} vitalType={t.value} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Pathology + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Pathology Trends</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No pathology reports yet</p>
            ) : (
              <PathologyTrendChart reports={reports} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Clinical Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {(timeline ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No timeline events yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(timeline ?? []).map((event) => (
                  <div key={event.id} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{format(parseISO(event.date), 'dd MMM yyyy')}</p>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Problems + Current Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Active Problems
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeProblems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active problems</p>
            ) : (
              <div className="space-y-2">
                {activeProblems.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <span className="text-sm font-medium">{p.problem_name}</span>
                    <Badge variant={p.severity === 'severe' ? 'danger' : p.severity === 'moderate' ? 'warning' : 'success'}>
                      {p.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMeds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active medications</p>
            ) : (
              <div className="space-y-2">
                {activeMeds.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div>
                      <span className="text-sm font-medium">{m.medication_name}</span>
                      <p className="text-xs text-muted-foreground">{m.dose} · {m.frequency}</p>
                    </div>
                    <Badge variant="secondary">{m.route || 'Oral'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
