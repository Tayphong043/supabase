import { useParams } from 'common'
import Link from 'next/link'
import { useMemo } from 'react'

import BranchDropdown from 'components/layouts/AppLayout/BranchDropdown'
import EnableBranchingButton from 'components/layouts/AppLayout/EnableBranchingButton/EnableBranchingButton'
import OrganizationDropdown from 'components/layouts/AppLayout/OrganizationDropdown'
import ProjectDropdown from 'components/layouts/AppLayout/ProjectDropdown'
import { getResourcesExceededLimitsOrg } from 'components/ui/OveragesBanner/OveragesBanner.utils'
import { useOrgSubscriptionQuery } from 'data/subscriptions/org-subscription-query'
import { useOrgUsageQuery } from 'data/usage/org-usage-query'
import { useSelectedOrganization } from 'hooks/misc/useSelectedOrganization'
import { useSelectedProject } from 'hooks/misc/useSelectedProject'
import { IS_PLATFORM } from 'lib/constants'
import { Badge } from 'ui'
import BreadcrumbsView from '../../components/layouts/ProjectLayout/LayoutHeader/BreadcrumbsView'
import { FeedbackDropdown } from '../../components/layouts/ProjectLayout/LayoutHeader/FeedbackDropdown'
import HelpPopover from '../../components/layouts/ProjectLayout/LayoutHeader/HelpPopover'
import NotificationsPopoverV2 from '../../components/layouts/ProjectLayout/LayoutHeader/NotificationsPopoverV2/NotificationsPopover'

const LayoutHeader = ({ customHeaderComponents, breadcrumbs = [], headerBorder = true }: any) => {
  const { ref: projectRef } = useParams()
  const selectedProject = useSelectedProject()
  const selectedOrganization = useSelectedOrganization()
  const isBranchingEnabled = selectedProject?.is_branch_enabled === true

  const { data: subscription } = useOrgSubscriptionQuery({
    orgSlug: selectedOrganization?.slug,
  })

  // We only want to query the org usage and check for possible over-ages for plans without usage billing enabled (free or pro with spend cap)
  const { data: orgUsage } = useOrgUsageQuery(
    { orgSlug: selectedOrganization?.slug },
    { enabled: subscription?.usage_billing_enabled === false }
  )

  const exceedingLimits = useMemo(() => {
    if (orgUsage) {
      return getResourcesExceededLimitsOrg(orgUsage?.usages || []).length > 0
    } else {
      return false
    }
  }, [orgUsage])

  return (
    <div
      className={`flex h-12 max-h-12 min-h-12 items-center justify-between py-2 px-5 bg-dash-sidebar ${
        headerBorder ? 'border-b border-default' : ''
      }`}
    >
      <div className="-ml-2 flex items-center text-sm">
        {/* Organization is selected */}
        {projectRef && (
          <>
            <OrganizationDropdown />

            {projectRef && (
              <>
                <span className="text-border-stronger">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    shapeRendering="geometricPrecision"
                  >
                    <path d="M16 3.549L7.12 20.600"></path>
                  </svg>
                </span>

                <ProjectDropdown />

                {exceedingLimits && (
                  <div className="ml-2">
                    <Link href={`/org/${selectedOrganization?.slug}/usage`}>
                      <Badge variant="destructive">Exceeding usage limits</Badge>
                    </Link>
                  </div>
                )}
              </>
            )}

            {selectedProject && (
              <>
                <span className="text-border-stronger">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    shapeRendering="geometricPrecision"
                  >
                    <path d="M16 3.549L7.12 20.600"></path>
                  </svg>
                </span>
                {isBranchingEnabled ? <BranchDropdown /> : <EnableBranchingButton />}
              </>
            )}
          </>
        )}

        {/* Additional breadcrumbs are supplied */}
        <BreadcrumbsView defaultValue={breadcrumbs} />
      </div>
      <div className="flex items-center gap-x-2">
        {customHeaderComponents && customHeaderComponents}
        {IS_PLATFORM && (
          <>
            <FeedbackDropdown />
            <NotificationsPopoverV2 />
            {/* <HelpPopover /> */}
          </>
        )}
      </div>
    </div>
  )
}
export default LayoutHeader
