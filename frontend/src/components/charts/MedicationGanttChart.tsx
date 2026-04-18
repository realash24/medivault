import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, parseISO, differenceInDays } from 'date-fns'
import type { Medication } from '@/types'

interface Props {
  medications: Medication[]
}

const statusColors: Record<string, string> = {
  active: '#0F6E56',
  stopped: '#9CA3AF',
  'on-hold': '#F59E0B',
  completed: '#6366F1',
}

export function MedicationGanttChart({ medications }: Props) {
  const today = new Date()

  const data = medications
    .filter((m) => m.start_date)
    .map((m) => {
      const start = parseISO(m.start_date!)
      const end = m.end_date ? parseISO(m.end_date) : today
      const duration = Math.max(differenceInDays(end, start), 1)
      const offset = Math.max(differenceInDays(start, new Date('2020-01-01')), 0)
      return {
        name: m.medication_name,
        dose: `${m.dose} ${m.frequency}`,
        offset,
        duration,
        status: m.status,
        startLabel: format(start, 'dd MMM yy'),
        endLabel: m.end_date ? format(parseISO(m.end_date), 'dd MMM yy') : 'Ongoing',
      }
    })

  return (
    <div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No medications with start dates to display.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 40 + 60, 200)}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `Day ${v}`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
            <Tooltip
              formatter={(_val, _name, props) => {
                const { startLabel, endLabel, dose } = props.payload as typeof data[0]
                return [`${startLabel} → ${endLabel}`, dose]
              }}
            />
            {/* Transparent offset bar */}
            <Bar dataKey="offset" stackId="a" fill="transparent" />
            <Bar dataKey="duration" stackId="a" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={statusColors[entry.status] ?? '#9CA3AF'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
