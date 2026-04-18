import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isSameDay, addMonths, subMonths, getDay, parseISO,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useImmunisations } from '@/hooks/useImmunisations'
import { useEncounters } from '@/hooks/useEncounters'
import { useMedications } from '@/hooks/useMedications'

interface CalendarEvent {
  date: string
  label: string
  type: 'encounter' | 'immunisation' | 'medication'
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data: immunisationsData } = useImmunisations()
  const { data: encountersData } = useEncounters()
  const { data: medsData } = useMedications('active')

  const events: CalendarEvent[] = [
    ...(encountersData?.results ?? []).map((e) => ({
      date: e.encounter_date,
      label: e.encounter_type,
      type: 'encounter' as const,
    })),
    ...(immunisationsData?.results ?? []).flatMap((i) => [
      { date: i.administration_date, label: i.vaccine_name, type: 'immunisation' as const },
      ...(i.next_due_date ? [{ date: i.next_due_date, label: `${i.vaccine_name} (due)`, type: 'immunisation' as const }] : []),
    ]),
    ...(medsData?.results ?? []).flatMap((m) => [
      ...(m.start_date ? [{ date: m.start_date, label: `Started: ${m.medication_name}`, type: 'medication' as const }] : []),
      ...(m.end_date ? [{ date: m.end_date, label: `Ended: ${m.medication_name}`, type: 'medication' as const }] : []),
    ]),
  ]

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startPad = getDay(startOfMonth(currentMonth))

  const eventColorClass: Record<string, string> = {
    encounter: 'bg-blue-100 text-blue-800',
    immunisation: 'bg-green-100 text-green-800',
    medication: 'bg-purple-100 text-purple-800',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Health Calendar</h1>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((d) => subMonths(d, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((d) => addMonths(d, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map((day) => {
              const dayEvents = events.filter((e) => {
                try { return isSameDay(parseISO(e.date), day) } catch { return false }
              })
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[60px] rounded-md border p-1 ${isToday ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'} ${!isSameMonth(day, currentMonth) ? 'opacity-40' : ''}`}
                >
                  <p className={`text-xs font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>{format(day, 'd')}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e, i) => (
                      <p key={i} className={`text-[10px] px-1 rounded truncate ${eventColorClass[e.type]}`}>{e.label}</p>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {[['encounter', 'Encounters'], ['immunisation', 'Immunisations'], ['medication', 'Medications']].map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${eventColorClass[type]}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
