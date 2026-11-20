import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createFinanceTransaction,
  deleteFinanceTransaction,
  fetchFinancePage,
  updateFinanceTransaction,
} from '@/api/finance.api'
import type { FinanceTransaction } from '@/api/types'
import { Card } from '@/components/Card'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Form } from '@/components/Form'
import { ListToolbar } from '@/components/ListToolbar'
import { Modal } from '@/components/Modal'
import { PageHeader } from '@/components/PageHeader'
import { PaginationBar } from '@/components/PaginationBar'
import type { Column } from '@/components/Table'
import { Table } from '@/components/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { queryKeys } from '@/lib/queryKeys'
import { formatCurrency, formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

export default function FinancePage() {
  const queryClient = useQueryClient()
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceTransaction | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formType, setFormType] = useState('income')
  const [amount, setAmount] = useState('0')
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10))
  const extra = useMemo(() => ({ type: type || undefined, date: date || undefined }), [type, date])

  const list = usePaginatedList<FinanceTransaction>({
    queryKey: ['finance', 'list'] as const,
    fetchPage: fetchFinancePage,
    extraParams: extra,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const n = Number(amount)
      if (Number.isNaN(n) || n <= 0 || !txDate) throw new Error('Invalid transaction data.')
      if (editing) {
        return updateFinanceTransaction(editing.id, { type: formType, amount: String(n), date: txDate })
      }
      return createFinanceTransaction({ type: formType, amount: n, date: txDate })
    },
    onMutate: () => setFormError(null),
    onSuccess: async () => {
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['finance'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
    onError: (e: unknown) => setFormError(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFinanceTransaction(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['finance'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })

  function openCreate() {
    setEditing(null)
    setFormType('income')
    setAmount('0')
    setTxDate(new Date().toISOString().slice(0, 10))
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row: FinanceTransaction) {
    setEditing(row)
    setFormType(row.type)
    setAmount(row.amount)
    setTxDate(row.date)
    setFormError(null)
    setModalOpen(true)
  }

  const columns: Column<FinanceTransaction>[] = useMemo(
    () => [
      { id: 'type', header: 'Type', cell: (r) => <span className="capitalize">{r.type}</span> },
      { id: 'amount', header: 'Amount', cell: (r) => formatCurrency(r.amount) },
      { id: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
      { id: 'updated', header: 'Updated', cell: (r) => formatDate(r.updated_at) },
      {
        id: 'actions',
        header: '',
        className: 'w-40 text-right',
        cell: (r) => (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openEdit(r)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              className="!px-2 !py-1 text-xs"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm('Delete this transaction?')) deleteMutation.mutate(r.id)
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending],
  )

  const rows = list.query.data?.results ?? []
  const total = list.query.data?.count ?? 0

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Cash movements and ledger-style transactions with CRUD operations."
        actions={
          <Button type="button" onClick={openCreate}>
            New transaction
          </Button>
        }
      />
      <Card>
        <ListToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Search type…">
          <Input label="Type" value={type} onChange={(e) => setType(e.target.value)} name="type" placeholder="e.g. revenue" />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} name="date" />
        </ListToolbar>
        {list.query.isError ? (
          <div className="mb-4">
            <ErrorAlert message={getErrorMessage(list.query.error)} />
          </div>
        ) : null}
        <Table
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          isLoading={list.query.isFetching}
          emptyText="No finance transactions."
        />
        <div className="mt-4">
          <PaginationBar
            page={list.page}
            pageSize={list.pageSize}
            total={total}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? 'Edit transaction' : 'New transaction'}
        onClose={() => !saveMutation.isPending && setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="finance-transaction-form" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        {formError ? (
          <div className="mb-4">
            <ErrorAlert message={formError} />
          </div>
        ) : null}
        <Form
          id="finance-transaction-form"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              Type
              <select
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <Input label="Amount" type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required name="amount" />
          </div>
          <Input label="Date" type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} required name="tx-date" />
        </Form>
      </Modal>
    </div>
  )
}
