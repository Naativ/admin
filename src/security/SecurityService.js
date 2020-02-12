export const KEYS = {
  ADMIN: 'admin',
  ADMIN_FULL: 'admin:full',
  IMPERSONATE: 'admin:impersonate',
  MEMBERS_MERGE: 'admin:members:merge',
  MEMBERS_SPONSOR_CHANGE: 'members:sponsor:write',
  MEMBERS_READ: 'admin:members:read',
  MEMBERS_WRITE: 'admin:members:write',
  PERMISSIONS_READ: 'admin:permissions:read',
  PERMISSIONS_WRITE: 'admin:permissions:write',
  CONTACTS_READ: 'admin:contacts:read',
  CONTACTS_WRITE: 'admin:contacts:write',
  SALES_READ: 'admin:sales:read',
  SALES_WRITE: 'admin:sales:write',
  TEAM_READ: 'admin:team:read',
  TEAM_WRITE: 'admin:team:write',
  REPORTING_READ: 'admin:reporting:read',
  REPORTING_WRITE: 'admin:reporting:write',
  APPOINTMENTS_READ: 'admin:appointments:read',
  APPOINTMENTS_WRITE: 'admin:appointments:write',
  SURVEYS_READ: 'admin:surveys:read',
  SURVEYS_WRITE: 'admin:surveys:write',
  ASSETS_READ: 'admin:assets:read',
  ASSETS_WRITE: 'admin:assets:write',
  EMAILS_READ: 'admin:emails:read',
  DASHBOARD_READ: 'admin:dashboard:read'
}

export const CODES = {
  [KEYS.ADMIN]: 10,
  [KEYS.ADMIN_FULL]: 11,
  [KEYS.IMPERSONATE]: 12,
  [KEYS.MEMBERS_MERGE]: 13,
  [KEYS.PAYOUTS_READ]: 14,
  [KEYS.MEMBERS_SPONSOR_CHANGE]: 99,
  [KEYS.MEMBERS_READ]: 100,
  [KEYS.MEMBERS_WRITE]: 101,
  [KEYS.PERMISSIONS_READ]: 116,
  [KEYS.PERMISSIONS_WRITE]: 117,
  [KEYS.CONTACTS_READ]: 102,
  [KEYS.CONTACTS_WRITE]: 103,
  [KEYS.SALES_READ]: 104,
  [KEYS.SALES_WRITE]: 105,
  [KEYS.TEAM_READ]: 106,
  [KEYS.TEAM_WRITE]: 107,
  [KEYS.REPORTING_READ]: 108,
  [KEYS.REPORTING_WRITE]: 109,
  [KEYS.APPOINTMENTS_READ]: 110,
  [KEYS.APPOINTMENTS_WRITE]: 111,
  [KEYS.SURVEYS_READ]: 112,
  [KEYS.SURVEYS_WRITE]: 113,
  [KEYS.ASSETS_READ]: 114,
  [KEYS.ASSETS_WRITE]: 115,
  [KEYS.DASHBOARD_READ]: 150
}
const convert = e => CODES[e]

const hasAccess = (principal, req = {}) => {
  if (!principal) {
    return false
  }
  const { permissions = [], strict = false } = principal
  if (!strict && permissions.find(e => e.id === CODES[KEYS.ADMIN_FULL])) {
    return true
  }

  // console.log('check', {
  //   principal,
  //   permissions,
  //   req
  // })

  let valid = true

  valid =
    !req.hasAny ||
    req.hasAny.filter(e => {
      const id = convert(e)
      return permissions.findIndex(e => e.id === id) >= 0
    }).length > 0
  return valid
}

const modelAccess = principal => {
  const hasPayouts = hasAccess(principal, {
    hasAny: [KEYS.PAYOUTS_READ]
  })

  const hasMembers = hasAccess(principal, {
    hasAny: [KEYS.MEMBERS_READ, KEYS.MEMBERS_WRITE]
  })

  const hasPermissions = hasAccess(principal, {
    hasAny: [KEYS.PERMISSIONS_READ, KEYS.PERMISSIONS_WRITE]
  })

  const hasSales = hasAccess(principal, {
    hasAny: [KEYS.SALES_READ, KEYS.SALES_WRITE]
  })

  const hasDashboard = hasAccess(principal, {
    hasAny: [KEYS.DASHBOARD_READ]
  })

  const hasTeam = hasAccess(principal, {
    hasAny: [KEYS.TEAM_READ, KEYS.TEAM_WRITE]
  })

  const hasReporting = hasAccess(principal, {
    hasAny: [KEYS.REPORTING_READ, KEYS.REPORTING_WRITE]
  })

  const hasAppointments = hasAccess(principal, {
    hasAny: [KEYS.APPOINTMENTS_READ, KEYS.APPOINTMENTS_WRITE]
  })

  const hasSurveys = hasAccess(principal, {
    hasAny: [KEYS.SURVEYS_READ, KEYS.SURVEYS_WRITE]
  })

  const hasAssets = hasAccess(principal, {
    hasAny: [KEYS.ASSETS_READ, KEYS.ASSETS_WRITE]
  })

  const hasEmails = hasAccess(principal, {
    hasAny: [KEYS.EMAILS_READ]
  })

  const hasImpersonate = hasAccess(principal, {
    hasAny: [KEYS.IMPERSONATE],
    strict: true
  })

  const hasMerge = hasAccess(principal, {
    hasAny: [KEYS.MEMBERS_MERGE],
    strict: true
  })

  const hasSponsorChange = hasAccess(principal, {
    hasAny: [KEYS.MEMBERS_SPONSOR_CHANGE],
    strict: true
  })

  const result = {
    hasPayouts,
    hasMembers,
    hasSales,
    hasDashboard,
    hasTeam,
    hasReporting,
    hasAppointments,
    hasSurveys,
    hasAssets,
    hasEmails,
    hasMerge,
    hasImpersonate,
    hasSponsorChange,
    hasPermissions
  }

  return result
}

export const SecurityService = {
  hasAccess,
  modelAccess
}
