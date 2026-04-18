import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { VitalSign, VitalType } from '@/types'

interface VitalConfig {
  label: string
  unit: string
  normalLow?: number
  normalHigh?: number
  criticalLow?: number
  criticalHigh?: number
  color: string
}

const vitalConfigs: Record<VitalType, VitalConfig> = {
  blood_pressure: { label: 'Blood Pressure', unit: 'mmHg', normalLow: 90, normalHigh: 130, criticalHigh: 180, color: '#0F6E56' },
  heart_rate: { label: 'Heart Rate', unit: 'bpm', normalLow: 60, normalHigh: 100, criticalLow: 40, criticalHigh: 130, color: '#D85A30' },
  weight: { label: 'Weight', unit: 'kg', color: '#7C3AED' },
  height: { label: 'Height', unit: 'cm', color: '#0891B2' },
  temperature: { label: 'Temperature', unit: '°C', normalLow: 36.1, normalHigh: 37.2, criticalHigh: 39.5, color: '#D97706' },
  oxygen_saturation: { label: 'O₂ Saturation', unit: '%', normalLow: 95, criticalLow: 90, normalHigh: 100, color: '#059669' },
  blood_glucose: { label: 'Blood Glucose', unit: 'mmol/L', normalLow: 3.9, normalHigh: 7.8, criticalLow: 2.8, criticalHigh: 14, color: '#DC2626' },
  respiratory_rate: { label: 'Respiratory Rate', unit: 'br/min', normalLow: 12, normalHigh: 20, criticalHigh: 30, color: '#9333EA' },
}

interface Props {
  data: VitalSign[]
  vitalType: VitalType
}

export function VitalsTrendChart({ data, vitalType }: Props) {
  const config = vitalConfigs[vitalType]

  const chartData = data
    .slice()
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((v) => ({
      date: format(parseISO(v.recorded_at), 'dd MMM'),
      value: v.value,
      value2: v.value2,
    }))

  const isBP = vitalType === 'blood_pressure'

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit={` ${config.unit}`} width={70} />
        <Tooltip
          formatter={(value: number, name: string) => [`${value} ${config.unit}`, name === 'value2' ? 'Diastolic' : isBP ? 'Systolic' : config.label]}
        />
        {config.normalLow !== undefined && config.normalHigh !== undefined && (
          <ReferenceArea y1={config.normalLow} y2={config.normalHigh} fill="#22c55e" fillOpacity={0.08} />
        )}
        {config.normalHigh !== undefined && config.criticalHigh !== undefined && (
          <ReferenceArea y1={config.normalHigh} y2={config.criticalHigh} fill="#f59e0b" fillOpacity={0.08} />
        )}
        {config.criticalHigh !== undefined && (
          <ReferenceLine y={config.criticalHigh} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical', fontSize: 10 }} />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={config.color}
          strokeWidth={2}
          dot={{ r: 3, fill: config.color }}
          name={isBP ? 'Systolic' : config.label}
          connectNulls
        />
        {isBP && (
          <Line
            type="monotone"
            dataKey="value2"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6366f1' }}
            name="Diastolic"
            connectNulls
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
