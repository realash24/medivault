import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ReactionForm } from '@/components/forms/ReactionForm'
import { useReactions, useCreateReaction, useUpdateReaction, useDeleteReaction } from '@/hooks/useReactions'
import { useToast } from '@/components/ui/use-toast'
import type { Reaction } from '@/types'

const criticalityStyle: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  low: 'bg-green-100 text-green-800 border-green-200',
  'unable-to-assess': 'bg-amber-100 text-amber-800 border-amber-200',
}

export default function ReactionsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Reaction | null>(null)

  const { data, isLoading } = useReactions()
  const create = useCreateReaction()
  const update = useUpdateReaction()
  const del = useDeleteReaction()
  const { toast } = useToast()

  const reactions = data?.results ?? []

  const handleSubmit = async (values: Partial<Reaction>) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...values })
        toast({ title: 'Reaction updated' })
      } else {
        await create.mutateAsync(values)
        toast({ title: 'Reaction added' })
      }
      setOpen(false)
      setEditing(null)
    } catch {
      toast({ title: 'Error', description: 'Could not save.', variant: 'destructive' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reactions & Allergies</h1>
          <p className="text-muted-foreground text-sm">Adverse reactions and drug allergies</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true) }} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Reaction
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : reactions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No reactions recorded.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reactions.map((r) => (
            <Card key={r.id} className={`border-l-4 ${r.criticality === 'high' ? 'border-l-red-500' : r.criticality === 'low' ? 'border-l-green-500' : 'border-l-amber-400'}`}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.substance}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${criticalityStyle[r.criticality]}`}>
                      {r.criticality}
                    </span>
                    {r.substance_type && <Badge variant="outline" className="text-xs">{r.substance_type}</Badge>}
                    {r.reaction_type && <Badge variant="secondary" className="text-xs">{r.reaction_type}</Badge>}
                  </div>
                  {r.manifestation && <p className="text-xs text-muted-foreground mt-1">Reaction: {r.manifestation}</p>}
                  {r.severity && <p className="text-xs text-muted-foreground">Severity: {r.severity}</p>}
                  <p className="text-xs text-muted-foreground">Status: {r.verification_status}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => {
                    if (!confirm('Delete?')) return
                    await del.mutateAsync(r.id)
                    toast({ title: 'Deleted' })
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Reaction' : 'Add Reaction'}</DialogTitle>
          </DialogHeader>
          <ReactionForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoading={create.isPending || update.isPending}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
