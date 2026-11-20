import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSalesOrder, deleteSalesOrder, fetchSalesPage, updateSalesOrder } from '@/api/sales.api'
import type { SalesOrder } from '@/api/types'
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
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'
import { queryKeys } from '@/lib/queryKeys'

export default function SalesPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const extra = useMemo(() => ({ status: status || undefined }), [status])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SalesOrder | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [customer, setCustomer] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [formStatus, setFormStatus] = useState('pending')

  const list = usePaginatedList<SalesOrder>({
    queryKey: ['sales', 'list'] as const,
    fetchPage: fetchSalesPage,
    extraParams: extra,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const q = Number(quantity)
      if (!customer.trim() || !product.trim() || Number.isNaN(q) || q <= 0) {
        throw new Error('Invalid form data.')
      }
      if (editing) {
        return updateSalesOrder(editing.id, {
          customer: customer.trim(),
          product: product.trim(),
          quantity: q,
          status: formStatus,
        })
      }
      return createSalesOrder({
        customer: customer.trim(),
        product: product.trim(),
        quantity: q,
        status: formStatus,
      })
    },
    onMutate: () => setFormError(null),
    onSuccess: async () => {
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['sales'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
    onError: (e: unknown) => setFormError(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSalesOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sales'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })

  function openCreate() {
    setEditing(null)
    setCustomer('')
    setProduct('')
    setQuantity('1')
    setFormStatus('pending')
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row: SalesOrder) {
    setEditing(row)
    setCustomer(row.customer)
    setProduct(row.product)
    setQuantity(String(row.quantity))
    setFormStatus(row.status)
    setFormError(null)
    setModalOpen(true)
  }

  const columns: Column<SalesOrder>[] = useMemo(
    () => [
      { id: 'customer', header: 'Customer', cell: (r) => r.customer },
      { id: 'product', header: 'Product', cell: (r) => r.product },
      { id: 'qty', header: 'Qty', cell: (r) => r.quantity },
      { id: 'status', header: 'Status', cell: (r) => <span className="capitalize">{r.status}</span> },
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
                if (window.confirm('Delete this sales order?')) deleteMutation.mutate(r.id)
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
        title="Sales"
        description="Sales orders with status filter, search, and full CRUD operations."
        actions={
          <Button type="button" onClick={openCreate}>
            New order
          </Button>
        }
      />
      <Card>
        <ListToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Customer or product…">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} name="status">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
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
          emptyText="No sales orders."
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
        title={editing ? 'Edit sales order' : 'New sales order'}
        onClose={() => !saveMutation.isPending && setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="sales-order-form" disabled={saveMutation.isPending}>
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
          id="sales-order-form"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <Input label="Customer" value={customer} onChange={(e) => setCustomer(e.target.value)} required name="customer" />
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
          <Select label="Status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)} name="form-status">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Form>
      </Modal>
    </div>
  )
}
