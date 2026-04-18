import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PathologyReport } from '@/types'

interface Props {
  reports: PathologyReport[]
}

export function PathologyTrendChart({ reports }: Props) {
  const analyteNames = Array.from(
    new Set(reports.flatMap((r) => r.analytes.map((a) => a.analyte_name)))
  ).sort()

  const [selectedAnalyte, setSelectedAnalyte] = useState(analyteNames[0] ?? '')

  const chartData = reports
    .filter((r) => r.analytes.some((a) => a.analyte_name === selectedAnalyte))
    .sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime())
    .map((r) => {
      const analyte = r.analytes.find((a) => a.analyte_name === selectedAnalyte)
      return {
        date: format(parseISO(r.report_date), 'dd MMM yy'),
        value: analyte ? parseFloat(analyte.value) : null,
        low: analyte?.reference_range_low,
        high: analyte?.reference_range_high,
        unit: analyte?.unit ?? '',
      }
    })
    .filter((d) => d.value !== null)

  const refLow = chartData[0]?.low
  const refHigh = chartData[0]?.high
  const unit = chartData[0]?.unit ?? ''

  return (
    <div className="space-y-3">
      <Select value={selectedAnalyte} onValueChange={setSelectedAnalyte}>
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Select analyte" />
        </SelectTrigger>
        <SelectContent>
          {analyteNames.map((n) => (
            <SelectItem key={n} value={n}>{n}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data for selected analyte</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit={` ${unit}`} width={70} />
            <Tooltip formatter={(v: number) => [`${v} ${unit}`, selectedAnalyte]} />
            {refLow != null && <ReferenceLine y={refLow} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Low', fontSize: 10 }} />}
            {refHigh != null && <ReferenceLine y={refHigh} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'High', fontSize: 10 }} />}
            <Line type="monotone" dataKey="value" stroke="#0F6E56" strokeWidth={2} dot={{ r: 4 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
