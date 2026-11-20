import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { fetchAllFactories } from '@/api/factories.api'
import {
  createProduction,
  deleteProduction,
  downloadProductionExport,
  fetchProductionPage,
  importProductionCsv,
  updateProduction,
} from '@/api/production.api'
import type { ProductionListParams, ProductionRecord } from '@/api/types'
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
import { Select } from '@/components/ui/Select'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { queryKeys } from '@/lib/queryKeys'
import { useAuth } from '@/providers/AuthContext'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, formatFactoryRef } from '@/utils/format'

export default function ProductionModule() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [factoryId, setFactoryId] = useState('')

  const extraParams = useMemo(
    () => ({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      factory: factoryId || undefined,
    }),
    [dateFrom, dateTo, factoryId],
  )

  const factoriesQuery = useQuery({
    queryKey: queryKeys.factories,
    queryFn: fetchAllFactories,
  })

  const list = usePaginatedList<ProductionRecord, ProductionListParams>({
    queryKey: queryKeys.production.all,
    fetchPage: fetchProductionPage,
    extraParams,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductionRecord | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedFactoryId, setSelectedFactoryId] = useState('')

  const openCreate = () => {
    setEditing(null)
    setProduct('')
    setQuantity('1')
    setDate(new Date().toISOString().slice(0, 10))
    setSelectedFactoryId('')
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (row: ProductionRecord) => {
    setEditing(row)
    setProduct(row.product)
    setQuantity(String(row.quantity))
    setDate(row.date)
    setSelectedFactoryId(row.factory ?? '')
    setFormError(null)
    setModalOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const q = Number(quantity)
      if (!product.trim() || Number.isNaN(q) || q <= 0) throw new Error('Invalid product or quantity.')
      if (user?.is_superuser && !selectedFactoryId) {
        throw new Error('Factory is required for admin/superuser.')
      }
      if (editing) {
        return updateProduction(editing.id, {
          product: product.trim(),
          quantity: q,
          date,
          ...(user?.is_superuser ? { factory_id: selectedFactoryId } : {}),
        })
      }
      return createProduction({
        product: product.trim(),
        quantity: q,
        date,
        ...(user?.is_superuser ? { factory_id: selectedFactoryId } : {}),
      })
    },
    onMutate: () => setFormError(null),
    onSuccess: async () => {
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: queryKeys.production.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
    onError: (e: unknown) => setFormError(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduction(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.production.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => importProductionCsv(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.production.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })

  const rows = list.query.data?.results ?? []
  const total = list.query.data?.count ?? 0

  const columns: Column<ProductionRecord>[] = useMemo(
    () => [
      { id: 'product', header: 'Product', cell: (r) => r.product },
      { id: 'quantity', header: 'Qty', cell: (r) => r.quantity },
      { id: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
      { id: 'factory', header: 'Factory', cell: (r) => formatFactoryRef(r.factory) },
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
                if (window.confirm('Delete this production record?')) deleteMutation.mutate(r.id)
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

  return (
    <div>
      <PageHeader
        title="Production"
        description="Record output, filter by date and factory, import CSV, and export for audits."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
              Import CSV
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) importMutation.mutate(f)
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                downloadProductionExport({
                  search: list.search || undefined,
                  ...extraParams,
                })
              }
            >
              Export CSV
            </Button>
            <Button type="button" onClick={openCreate}>
              New record
            </Button>
          </>
        }
      />

      {importMutation.isError ? (
        <div className="mb-4">
          <ErrorAlert message={getErrorMessage(importMutation.error)} />
        </div>
      ) : null}
      {importMutation.isSuccess ? (
        <p className="mb-4 text-sm text-emerald-400">
          Imported {importMutation.data.created_records} row(s).
        </p>
      ) : null}

      <Card>
        <ListToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Search product…">
          <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} name="from" />
          <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} name="to" />
          <Select
            label="Factory"
            value={factoryId}
            onChange={(e) => setFactoryId(e.target.value)}
            name="factory"
            disabled={factoriesQuery.isLoading}
          >
            <option value="">All factories</option>
            {(factoriesQuery.data ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </Select>
        </ListToolbar>

        {list.query.isError ? <ErrorAlert message={getErrorMessage(list.query.error)} /> : null}

        <Table
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          isLoading={list.query.isFetching}
          emptyText="No production rows for these filters."
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
        title={editing ? 'Edit production' : 'New production'}
        onClose={() => !saveMutation.isPending && setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="production-record-form" disabled={saveMutation.isPending}>
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
          id="production-record-form"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <Input label="Product" value={product} onChange={(e) => setProduct(e.target.value)} required name="product" />
          <Input
            label="Quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            name="quantity"
          />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required name="date" />
          {user?.is_superuser ? (
            <Select
              label="Factory"
              value={selectedFactoryId}
              onChange={(e) => setSelectedFactoryId(e.target.value)}
              name="factory_id"
              required
              disabled={factoriesQuery.isLoading}
            >
              <option value="">Select factory</option>
              {(factoriesQuery.data ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </Select>
          ) : null}
        </Form>
      </Modal>
    </div>
  )
}
