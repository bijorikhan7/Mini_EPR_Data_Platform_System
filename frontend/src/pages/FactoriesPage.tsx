import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { createFactory, deleteFactory, fetchFactoriesPage, updateFactory } from '@/api/factories.api'
import type { Factory } from '@/api/types'
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
import { getErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/format'

export default function FactoriesPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Factory | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [code, setCode] = useState('')

  const list = usePaginatedList<Factory>({
    queryKey: queryKeys.factories,
    fetchPage: fetchFactoriesPage,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !location.trim() || !code.trim()) throw new Error('All fields are required.')
      if (editing) {
        return updateFactory(editing.id, { name: name.trim(), location: location.trim(), code: code.trim() })
      }
      return createFactory({ name: name.trim(), location: location.trim(), code: code.trim() })
    },
    onMutate: () => setFormError(null),
    onSuccess: async () => {
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: queryKeys.factories })
    },
    onError: (e: unknown) => setFormError(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFactory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.factories })
    },
  })

  function openCreate() {
    setEditing(null)
    setName('')
    setLocation('')
    setCode('')
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row: Factory) {
    setEditing(row)
    setName(row.name)
    setLocation(row.location)
    setCode(row.code)
    setFormError(null)
    setModalOpen(true)
  }

  const columns: Column<Factory>[] = useMemo(
    () => [
      { id: 'name', header: 'Name', cell: (r) => r.name },
      { id: 'code', header: 'Code', cell: (r) => r.code },
      { id: 'location', header: 'Location', cell: (r) => r.location },
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
                if (window.confirm('Delete this factory?')) deleteMutation.mutate(r.id)
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
        title="Factories"
        description="Manage factory master data (code, name, location)."
        actions={
          <Button type="button" onClick={openCreate}>
            New factory
          </Button>
        }
      />
      <Card>
        <ListToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Name, code or location…" />
        {list.query.isError ? (
          <div className="mb-4">
            <ErrorAlert message={getErrorMessage(list.query.error)} />
          </div>
        ) : null}
        <Table columns={columns} rows={rows} getRowId={(r) => r.id} isLoading={list.query.isFetching} emptyText="No factories." />
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
        title={editing ? 'Edit factory' : 'New factory'}
        onClose={() => !saveMutation.isPending && setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="factory-form" disabled={saveMutation.isPending}>
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
          id="factory-form"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <Input label="Factory name" value={name} onChange={(e) => setName(e.target.value)} required name="name" />
          <Input label="Factory code" value={code} onChange={(e) => setCode(e.target.value)} required name="code" />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required name="location" />
        </Form>
      </Modal>
    </div>
  )
}
