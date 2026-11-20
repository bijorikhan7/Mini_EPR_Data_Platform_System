import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { createReportExport, deleteReportExport, fetchReportsPage, updateReportExport } from '@/api/reports.api'
import type { ReportExport } from '@/api/types'
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
import { formatDate, formatFactoryRef } from '@/utils/format'

export default function ReportsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ReportExport | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [reportName, setReportName] = useState('')
  const [filePath, setFilePath] = useState('')

  const list = usePaginatedList<ReportExport>({
    queryKey: queryKeys.reports.all,
    fetchPage: fetchReportsPage,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!reportName.trim() || !filePath.trim()) throw new Error('Report name and file path are required.')
      if (editing) {
        return updateReportExport(editing.id, { report_name: reportName.trim(), file_path: filePath.trim() })
      }
      return createReportExport({ report_name: reportName.trim(), file_path: filePath.trim() })
    },
    onMutate: () => setFormError(null),
    onSuccess: async () => {
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
    onError: (e: unknown) => setFormError(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReportExport(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })

  function openCreate() {
    setEditing(null)
    setReportName('')
    setFilePath('')
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row: ReportExport) {
    setEditing(row)
    setReportName(row.report_name)
    setFilePath(row.file_path)
    setFormError(null)
    setModalOpen(true)
  }

  const columns: Column<ReportExport>[] = useMemo(
    () => [
      { id: 'name', header: 'Report', cell: (r) => r.report_name },
      { id: 'path', header: 'File path', cell: (r) => <span className="font-mono text-xs">{r.file_path}</span> },
      { id: 'factory', header: 'Factory', cell: (r) => formatFactoryRef(r.factory) },
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
                if (window.confirm('Delete this report export record?')) deleteMutation.mutate(r.id)
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
        title="Reports"
        description="Manage report export records and file references."
        actions={
          <Button type="button" onClick={openCreate}>
            New export
          </Button>
        }
      />
      <Card>
        <ListToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Search report name…" />
        {list.query.isError ? (
          <div className="mb-4">
            <ErrorAlert message={getErrorMessage(list.query.error)} />
          </div>
        ) : null}
        <Table columns={columns} rows={rows} getRowId={(r) => r.id} isLoading={list.query.isFetching} emptyText="No exports found." />
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
        title={editing ? 'Edit export record' : 'New export record'}
        onClose={() => !saveMutation.isPending && setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="report-export-form" disabled={saveMutation.isPending}>
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
          id="report-export-form"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <Input
            label="Report name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            required
            name="report-name"
          />
          <Input label="File path" value={filePath} onChange={(e) => setFilePath(e.target.value)} required name="file-path" />
        </Form>
      </Modal>
    </div>
  )
}
