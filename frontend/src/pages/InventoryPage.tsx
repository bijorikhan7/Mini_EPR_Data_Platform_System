import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createInventoryItem, deleteInventoryItem, fetchInventoryPage, updateInventoryItem } from '@/api/inventory.api'
import type { InventoryItem } from '@/api/types'
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
import { formatDate, formatFactoryRef } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'
import { queryKeys } from '@/lib/queryKeys'
import { useState } from 'react'

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const list = usePaginatedList<InventoryItem>({
    queryKey: ['inventory', 'list'] as const,
    fetchPage: fetchInventoryPage,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('0')

  const saveMutation = useMutation({
    mutationFn: async () => {
      const q = Number(quantity)
      if (!product.trim() || Number.isNaN(q) || q < 0) throw new Error('Invalid product or quantity.')
      if (editing) {
        return updateInventoryItem(editing.id, { product: product.trim(), quantity: q })
      }
      return createInventoryItem({ product: product.trim(), quantity: q })
    },
    onMutate: () => setFormError(null),
    onSuccess: async () => {
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
    onError: (e: unknown) => setFormError(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })

  function openCreate() {
    setEditing(null)
    setProduct('')
    setQuantity('0')
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row: InventoryItem) {
    setEditing(row)
    setProduct(row.product)
    setQuantity(String(row.quantity))
    setFormError(null)
    setModalOpen(true)
  }

  const columns: Column<InventoryItem>[] = useMemo(
    () => [
      { id: 'product', header: 'Product', cell: (r) => r.product },
      { id: 'quantity', header: 'Quantity', cell: (r) => r.quantity },
      { id: 'factory', header: 'Factory', cell: (r) => formatFactoryRef(r.factory) },
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
                if (window.confirm('Delete this inventory item?')) deleteMutation.mutate(r.id)
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
        title="Inventory"
        description="Stock positions for products in your factory scope. Use search to find SKUs quickly."
        actions={
          <Button type="button" onClick={openCreate}>
            New item
          </Button>
        }
      />
      <Card>
        <ListToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Search product…" />
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
          emptyText="No inventory rows."
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
        title={editing ? 'Edit inventory item' : 'New inventory item'}
        onClose={() => !saveMutation.isPending && setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="inventory-item-form" disabled={saveMutation.isPending}>
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
          id="inventory-item-form"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <Input label="Product" value={product} onChange={(e) => setProduct(e.target.value)} required name="product" />
          <Input
            label="Quantity"
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            name="quantity"
          />
        </Form>
      </Modal>
    </div>
  )
}
