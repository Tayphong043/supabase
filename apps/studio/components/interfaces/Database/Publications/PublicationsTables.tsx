import type { PostgresPublication } from '@supabase/postgres-meta'
import { PermissionAction } from '@supabase/shared-types/out/constants'
import { useState } from 'react'

import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'
import NoSearchResults from 'components/to-be-cleaned/NoSearchResults'
import Table from 'components/to-be-cleaned/Table'
import AlertError from 'components/ui/AlertError'
import InformationBox from 'components/ui/InformationBox'
import SkeletonTableRow from 'components/ui/SkeletonTableRow'
import { useTablesQuery } from 'data/tables/tables-query'
import { useCheckPermissions } from 'hooks/misc/useCheckPermissions'
import { EXCLUDED_SCHEMAS } from 'lib/constants/schemas'
import { Button, Input } from 'ui'
import PublicationsTableItem from './PublicationsTableItem'
import { ChevronLeft, Search, AlertCircle } from 'lucide-react'

interface PublicationsTablesProps {
  selectedPublication: PostgresPublication
  onSelectBack?: () => void
}

const PublicationsTables = ({ selectedPublication, onSelectBack }: PublicationsTablesProps) => {
  const { project } = useProjectContext()
  const [filterString, setFilterString] = useState<string>('')

  const canUpdatePublications = useCheckPermissions(
    PermissionAction.TENANT_SQL_ADMIN_WRITE,
    'publications'
  )

  const {
    data: tables,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useTablesQuery(
    {
      projectRef: project?.ref,
      connectionString: project?.connectionString,
    },
    {
      select(tables) {
        return tables.filter((table) =>
          filterString.length === 0
            ? !EXCLUDED_SCHEMAS.includes(table.schema)
            : !EXCLUDED_SCHEMAS.includes(table.schema) && table.name.includes(filterString)
        )
      },
    }
  )

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onSelectBack && (
              <Button
                type="outline"
                onClick={() => onSelectBack()}
                icon={<ChevronLeft />}
                style={{ padding: '5px' }}
              />
            )}
            <div>
              <Input
                size="small"
                placeholder={'Filter'}
                value={filterString}
                onChange={(e) => setFilterString(e.target.value)}
                icon={<Search size="14" />}
              />
            </div>
          </div>
          {!canUpdatePublications && (
            <div className="w-[500px]">
              <InformationBox
                icon={<AlertCircle className="text-foreground-light" strokeWidth={2} />}
                title="You need additional permissions to update database replications"
              />
            </div>
          )}
        </div>
      </div>

      {isError && <AlertError error={error} subject="Failed to retrieve tables" />}

      {isSuccess && tables.length === 0 && <NoSearchResults />}

      <Table
        head={[
          <Table.th key="header-name">Name</Table.th>,
          <Table.th key="header-schema">Schema</Table.th>,
          <Table.th key="header-desc" className="hidden text-left lg:table-cell">
            Description
          </Table.th>,
          <Table.th key="header-all"></Table.th>,
        ]}
        body={
          isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow
                key={i}
                index={i}
                columns={[
                  { key: 'name', width: '25%' },
                  { key: 'schema', width: '25%' },
                  { key: 'description', width: '35%' },
                  { key: 'toggle', width: '15%', isToggle: true, align: 'end' },
                ]}
              />
            ))
          ) : tables ? (
            tables?.map((table: any) => (
              <PublicationsTableItem
                key={table.id}
                table={table}
                selectedPublication={selectedPublication}
              />
            ))
          ) : (
            <Table.tr>
              <Table.td colSpan={4}>No publications found</Table.td>
            </Table.tr>
          )
        }
      />
    </>
  )
}

export default PublicationsTables
