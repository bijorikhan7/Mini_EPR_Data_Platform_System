import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  createProcurementOrder,
  deleteProcurementOrder,
  fetchProcurementPage,
  updateProcurementOrder,
} from '@/api/procurement.api'
import type { ProcurementOrder } from '@/api/types'
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
import { formatCurrency, formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

export default function ProcurementPage() {
  const queryClient = useQueryClient()
  const list = usePaginatedList<ProcurementOrder>({
    queryKey: ['procurement', 'list'] as const,
    fetchPage: fetchProcurementPage,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProcurementOrder | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [supplier, setSupplier] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [cost, setCost] = useState('0')

  const saveMutation = useMutation({
    mutationFn: async () => {
      const q = Number(quantity)
      const c = Number(cost)
      if (!supplier.trim() || !product.trim() || Number.isNaN(q) || q <= 0 || Number.isNaN(c) || c < 0) {
        throw new Error('Invalid form data.')
      }
      if (editing) {
        return updateProcurementOrder(editing.id, {
          supplier: supplier.trim(),
          product: product.trim(),
          quantity: q,
          cost: String(c),
        })
      }
      return createProcurementOrder({
        supplier: supplier.trim(),
        product: product.trim(),
        quantity: q,
        cost: c,
      })
    },
    onMutate: () => setFormError(null),
    onSuccess: async () => {
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['procurement'] })
    },
    onError: (e: unknown) => setFormError(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProcurementOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['procurement'] })
    },
  })

  function openCreate() {
    setEditing(null)
    setSupplier('')
    setProduct('')
    setQuantity('1')
    setCost('0')
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row: ProcurementOrder) {
    setEditing(row)
    setSupplier(row.supplier)
    setProduct(row.product)
    setQuantity(String(row.quantity))
    setCost(row.cost)
    setFormError(null)
    setModalOpen(true)
  }

  const columns: Column<ProcurementOrder>[] = useMemo(
    () => [
      { id: 'supplier', header: 'Supplier', cell: (r) => r.supplier },
      { id: 'product', header: 'Product', cell: (r) => r.product },
      { id: 'qty', header: 'Qty', cell: (r) => r.quantity },
      { id: 'cost', header: 'Cost', cell: (r) => formatCurrency(r.cost) },
      { id: 'created', header: 'Created', cell: (r) => formatDate(r.created_at) },
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
                if (window.confirm('Delete this procurement order?')) deleteMutation.mutate(r.id)
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
        title="Procurement"
        description="Purchase orders and inbound supply lines with full CRUD management."
        actions={
          <Button type="button" onClick={openCreate}>
            New order
          </Button>
        }
      />
      <Card>
        <ListToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Supplier or product…" />
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
          emptyText="No procurement orders."
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
        title={editing ? 'Edit procurement order' : 'New procurement order'}
        onClose={() => !saveMutation.isPending && setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="procurement-order-form" disabled={saveMutation.isPending}>
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
          id="procurement-order-form"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <Input label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} required name="supplier" />
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
          <Input label="Cost" type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} required name="cost" />
        </Form>
      </Modal>
    </div>
  )
}
