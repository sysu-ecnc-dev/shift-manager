/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AuthImport } from './routes/auth'
import { Route as DashboardImport } from './routes/_dashboard'
import { Route as DashboardIndexImport } from './routes/_dashboard/index'
import { Route as AuthLoginImport } from './routes/auth/login'
import { Route as AuthForgetPasswordImport } from './routes/auth/forget-password'
import { Route as DashboardSettingsImport } from './routes/_dashboard/settings'
import { Route as DashboardManagementImport } from './routes/_dashboard/management'
import { Route as DashboardEngageSchedulePlanImport } from './routes/_dashboard/engage-schedule-plan'
import { Route as DashboardSettingsIndexImport } from './routes/_dashboard/settings/index'
import { Route as DashboardSettingsUpdatePasswordImport } from './routes/_dashboard/settings/update-password'
import { Route as DashboardManagementUsersImport } from './routes/_dashboard/management/users'
import { Route as DashboardManagementScheduleTemplatesImport } from './routes/_dashboard/management/schedule-templates'
import { Route as DashboardManagementSchedulePlansIndexImport } from './routes/_dashboard/management/schedule-plans/index'
import { Route as DashboardManagementSchedulePlansIdSchedulingImport } from './routes/_dashboard/management/schedule-plans/$id.scheduling'

// Create/Update Routes

const AuthRoute = AuthImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRoute,
} as any)

const DashboardRoute = DashboardImport.update({
  id: '/_dashboard',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DashboardRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => AuthRoute,
} as any)

const AuthForgetPasswordRoute = AuthForgetPasswordImport.update({
  id: '/forget-password',
  path: '/forget-password',
  getParentRoute: () => AuthRoute,
} as any)

const DashboardSettingsRoute = DashboardSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardManagementRoute = DashboardManagementImport.update({
  id: '/management',
  path: '/management',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardEngageSchedulePlanRoute =
  DashboardEngageSchedulePlanImport.update({
    id: '/engage-schedule-plan',
    path: '/engage-schedule-plan',
    getParentRoute: () => DashboardRoute,
  } as any)

const DashboardSettingsIndexRoute = DashboardSettingsIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DashboardSettingsRoute,
} as any)

const DashboardSettingsUpdatePasswordRoute =
  DashboardSettingsUpdatePasswordImport.update({
    id: '/update-password',
    path: '/update-password',
    getParentRoute: () => DashboardSettingsRoute,
  } as any)

const DashboardManagementUsersRoute = DashboardManagementUsersImport.update({
  id: '/users',
  path: '/users',
  getParentRoute: () => DashboardManagementRoute,
} as any)

const DashboardManagementScheduleTemplatesRoute =
  DashboardManagementScheduleTemplatesImport.update({
    id: '/schedule-templates',
    path: '/schedule-templates',
    getParentRoute: () => DashboardManagementRoute,
  } as any)

const DashboardManagementSchedulePlansIndexRoute =
  DashboardManagementSchedulePlansIndexImport.update({
    id: '/schedule-plans/',
    path: '/schedule-plans/',
    getParentRoute: () => DashboardManagementRoute,
  } as any)

const DashboardManagementSchedulePlansIdSchedulingRoute =
  DashboardManagementSchedulePlansIdSchedulingImport.update({
    id: '/schedule-plans/$id/scheduling',
    path: '/schedule-plans/$id/scheduling',
    getParentRoute: () => DashboardManagementRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_dashboard': {
      id: '/_dashboard'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof DashboardImport
      parentRoute: typeof rootRoute
    }
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard/engage-schedule-plan': {
      id: '/_dashboard/engage-schedule-plan'
      path: '/engage-schedule-plan'
      fullPath: '/engage-schedule-plan'
      preLoaderRoute: typeof DashboardEngageSchedulePlanImport
      parentRoute: typeof DashboardImport
    }
    '/_dashboard/management': {
      id: '/_dashboard/management'
      path: '/management'
      fullPath: '/management'
      preLoaderRoute: typeof DashboardManagementImport
      parentRoute: typeof DashboardImport
    }
    '/_dashboard/settings': {
      id: '/_dashboard/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof DashboardSettingsImport
      parentRoute: typeof DashboardImport
    }
    '/auth/forget-password': {
      id: '/auth/forget-password'
      path: '/forget-password'
      fullPath: '/auth/forget-password'
      preLoaderRoute: typeof AuthForgetPasswordImport
      parentRoute: typeof AuthImport
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof AuthImport
    }
    '/_dashboard/': {
      id: '/_dashboard/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof DashboardImport
    }
    '/_dashboard/management/schedule-templates': {
      id: '/_dashboard/management/schedule-templates'
      path: '/schedule-templates'
      fullPath: '/management/schedule-templates'
      preLoaderRoute: typeof DashboardManagementScheduleTemplatesImport
      parentRoute: typeof DashboardManagementImport
    }
    '/_dashboard/management/users': {
      id: '/_dashboard/management/users'
      path: '/users'
      fullPath: '/management/users'
      preLoaderRoute: typeof DashboardManagementUsersImport
      parentRoute: typeof DashboardManagementImport
    }
    '/_dashboard/settings/update-password': {
      id: '/_dashboard/settings/update-password'
      path: '/update-password'
      fullPath: '/settings/update-password'
      preLoaderRoute: typeof DashboardSettingsUpdatePasswordImport
      parentRoute: typeof DashboardSettingsImport
    }
    '/_dashboard/settings/': {
      id: '/_dashboard/settings/'
      path: '/'
      fullPath: '/settings/'
      preLoaderRoute: typeof DashboardSettingsIndexImport
      parentRoute: typeof DashboardSettingsImport
    }
    '/_dashboard/management/schedule-plans/': {
      id: '/_dashboard/management/schedule-plans/'
      path: '/schedule-plans'
      fullPath: '/management/schedule-plans'
      preLoaderRoute: typeof DashboardManagementSchedulePlansIndexImport
      parentRoute: typeof DashboardManagementImport
    }
    '/_dashboard/management/schedule-plans/$id/scheduling': {
      id: '/_dashboard/management/schedule-plans/$id/scheduling'
      path: '/schedule-plans/$id/scheduling'
      fullPath: '/management/schedule-plans/$id/scheduling'
      preLoaderRoute: typeof DashboardManagementSchedulePlansIdSchedulingImport
      parentRoute: typeof DashboardManagementImport
    }
  }
}

// Create and export the route tree

interface DashboardManagementRouteChildren {
  DashboardManagementScheduleTemplatesRoute: typeof DashboardManagementScheduleTemplatesRoute
  DashboardManagementUsersRoute: typeof DashboardManagementUsersRoute
  DashboardManagementSchedulePlansIndexRoute: typeof DashboardManagementSchedulePlansIndexRoute
  DashboardManagementSchedulePlansIdSchedulingRoute: typeof DashboardManagementSchedulePlansIdSchedulingRoute
}

const DashboardManagementRouteChildren: DashboardManagementRouteChildren = {
  DashboardManagementScheduleTemplatesRoute:
    DashboardManagementScheduleTemplatesRoute,
  DashboardManagementUsersRoute: DashboardManagementUsersRoute,
  DashboardManagementSchedulePlansIndexRoute:
    DashboardManagementSchedulePlansIndexRoute,
  DashboardManagementSchedulePlansIdSchedulingRoute:
    DashboardManagementSchedulePlansIdSchedulingRoute,
}

const DashboardManagementRouteWithChildren =
  DashboardManagementRoute._addFileChildren(DashboardManagementRouteChildren)

interface DashboardSettingsRouteChildren {
  DashboardSettingsUpdatePasswordRoute: typeof DashboardSettingsUpdatePasswordRoute
  DashboardSettingsIndexRoute: typeof DashboardSettingsIndexRoute
}

const DashboardSettingsRouteChildren: DashboardSettingsRouteChildren = {
  DashboardSettingsUpdatePasswordRoute: DashboardSettingsUpdatePasswordRoute,
  DashboardSettingsIndexRoute: DashboardSettingsIndexRoute,
}

const DashboardSettingsRouteWithChildren =
  DashboardSettingsRoute._addFileChildren(DashboardSettingsRouteChildren)

interface DashboardRouteChildren {
  DashboardEngageSchedulePlanRoute: typeof DashboardEngageSchedulePlanRoute
  DashboardManagementRoute: typeof DashboardManagementRouteWithChildren
  DashboardSettingsRoute: typeof DashboardSettingsRouteWithChildren
  DashboardIndexRoute: typeof DashboardIndexRoute
}

const DashboardRouteChildren: DashboardRouteChildren = {
  DashboardEngageSchedulePlanRoute: DashboardEngageSchedulePlanRoute,
  DashboardManagementRoute: DashboardManagementRouteWithChildren,
  DashboardSettingsRoute: DashboardSettingsRouteWithChildren,
  DashboardIndexRoute: DashboardIndexRoute,
}

const DashboardRouteWithChildren = DashboardRoute._addFileChildren(
  DashboardRouteChildren,
)

interface AuthRouteChildren {
  AuthForgetPasswordRoute: typeof AuthForgetPasswordRoute
  AuthLoginRoute: typeof AuthLoginRoute
}

const AuthRouteChildren: AuthRouteChildren = {
  AuthForgetPasswordRoute: AuthForgetPasswordRoute,
  AuthLoginRoute: AuthLoginRoute,
}

const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof DashboardRouteWithChildren
  '/auth': typeof AuthRouteWithChildren
  '/engage-schedule-plan': typeof DashboardEngageSchedulePlanRoute
  '/management': typeof DashboardManagementRouteWithChildren
  '/settings': typeof DashboardSettingsRouteWithChildren
  '/auth/forget-password': typeof AuthForgetPasswordRoute
  '/auth/login': typeof AuthLoginRoute
  '/': typeof DashboardIndexRoute
  '/management/schedule-templates': typeof DashboardManagementScheduleTemplatesRoute
  '/management/users': typeof DashboardManagementUsersRoute
  '/settings/update-password': typeof DashboardSettingsUpdatePasswordRoute
  '/settings/': typeof DashboardSettingsIndexRoute
  '/management/schedule-plans': typeof DashboardManagementSchedulePlansIndexRoute
  '/management/schedule-plans/$id/scheduling': typeof DashboardManagementSchedulePlansIdSchedulingRoute
}

export interface FileRoutesByTo {
  '/auth': typeof AuthRouteWithChildren
  '/engage-schedule-plan': typeof DashboardEngageSchedulePlanRoute
  '/management': typeof DashboardManagementRouteWithChildren
  '/auth/forget-password': typeof AuthForgetPasswordRoute
  '/auth/login': typeof AuthLoginRoute
  '/': typeof DashboardIndexRoute
  '/management/schedule-templates': typeof DashboardManagementScheduleTemplatesRoute
  '/management/users': typeof DashboardManagementUsersRoute
  '/settings/update-password': typeof DashboardSettingsUpdatePasswordRoute
  '/settings': typeof DashboardSettingsIndexRoute
  '/management/schedule-plans': typeof DashboardManagementSchedulePlansIndexRoute
  '/management/schedule-plans/$id/scheduling': typeof DashboardManagementSchedulePlansIdSchedulingRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_dashboard': typeof DashboardRouteWithChildren
  '/auth': typeof AuthRouteWithChildren
  '/_dashboard/engage-schedule-plan': typeof DashboardEngageSchedulePlanRoute
  '/_dashboard/management': typeof DashboardManagementRouteWithChildren
  '/_dashboard/settings': typeof DashboardSettingsRouteWithChildren
  '/auth/forget-password': typeof AuthForgetPasswordRoute
  '/auth/login': typeof AuthLoginRoute
  '/_dashboard/': typeof DashboardIndexRoute
  '/_dashboard/management/schedule-templates': typeof DashboardManagementScheduleTemplatesRoute
  '/_dashboard/management/users': typeof DashboardManagementUsersRoute
  '/_dashboard/settings/update-password': typeof DashboardSettingsUpdatePasswordRoute
  '/_dashboard/settings/': typeof DashboardSettingsIndexRoute
  '/_dashboard/management/schedule-plans/': typeof DashboardManagementSchedulePlansIndexRoute
  '/_dashboard/management/schedule-plans/$id/scheduling': typeof DashboardManagementSchedulePlansIdSchedulingRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/auth'
    | '/engage-schedule-plan'
    | '/management'
    | '/settings'
    | '/auth/forget-password'
    | '/auth/login'
    | '/'
    | '/management/schedule-templates'
    | '/management/users'
    | '/settings/update-password'
    | '/settings/'
    | '/management/schedule-plans'
    | '/management/schedule-plans/$id/scheduling'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/auth'
    | '/engage-schedule-plan'
    | '/management'
    | '/auth/forget-password'
    | '/auth/login'
    | '/'
    | '/management/schedule-templates'
    | '/management/users'
    | '/settings/update-password'
    | '/settings'
    | '/management/schedule-plans'
    | '/management/schedule-plans/$id/scheduling'
  id:
    | '__root__'
    | '/_dashboard'
    | '/auth'
    | '/_dashboard/engage-schedule-plan'
    | '/_dashboard/management'
    | '/_dashboard/settings'
    | '/auth/forget-password'
    | '/auth/login'
    | '/_dashboard/'
    | '/_dashboard/management/schedule-templates'
    | '/_dashboard/management/users'
    | '/_dashboard/settings/update-password'
    | '/_dashboard/settings/'
    | '/_dashboard/management/schedule-plans/'
    | '/_dashboard/management/schedule-plans/$id/scheduling'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  DashboardRoute: typeof DashboardRouteWithChildren
  AuthRoute: typeof AuthRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  DashboardRoute: DashboardRouteWithChildren,
  AuthRoute: AuthRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_dashboard",
        "/auth"
      ]
    },
    "/_dashboard": {
      "filePath": "_dashboard.tsx",
      "children": [
        "/_dashboard/engage-schedule-plan",
        "/_dashboard/management",
        "/_dashboard/settings",
        "/_dashboard/"
      ]
    },
    "/auth": {
      "filePath": "auth.tsx",
      "children": [
        "/auth/forget-password",
        "/auth/login"
      ]
    },
    "/_dashboard/engage-schedule-plan": {
      "filePath": "_dashboard/engage-schedule-plan.tsx",
      "parent": "/_dashboard"
    },
    "/_dashboard/management": {
      "filePath": "_dashboard/management.tsx",
      "parent": "/_dashboard",
      "children": [
        "/_dashboard/management/schedule-templates",
        "/_dashboard/management/users",
        "/_dashboard/management/schedule-plans/",
        "/_dashboard/management/schedule-plans/$id/scheduling"
      ]
    },
    "/_dashboard/settings": {
      "filePath": "_dashboard/settings.tsx",
      "parent": "/_dashboard",
      "children": [
        "/_dashboard/settings/update-password",
        "/_dashboard/settings/"
      ]
    },
    "/auth/forget-password": {
      "filePath": "auth/forget-password.tsx",
      "parent": "/auth"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx",
      "parent": "/auth"
    },
    "/_dashboard/": {
      "filePath": "_dashboard/index.tsx",
      "parent": "/_dashboard"
    },
    "/_dashboard/management/schedule-templates": {
      "filePath": "_dashboard/management/schedule-templates.tsx",
      "parent": "/_dashboard/management"
    },
    "/_dashboard/management/users": {
      "filePath": "_dashboard/management/users.tsx",
      "parent": "/_dashboard/management"
    },
    "/_dashboard/settings/update-password": {
      "filePath": "_dashboard/settings/update-password.tsx",
      "parent": "/_dashboard/settings"
    },
    "/_dashboard/settings/": {
      "filePath": "_dashboard/settings/index.tsx",
      "parent": "/_dashboard/settings"
    },
    "/_dashboard/management/schedule-plans/": {
      "filePath": "_dashboard/management/schedule-plans/index.tsx",
      "parent": "/_dashboard/management"
    },
    "/_dashboard/management/schedule-plans/$id/scheduling": {
      "filePath": "_dashboard/management/schedule-plans/$id.scheduling.tsx",
      "parent": "/_dashboard/management"
    }
  }
}
ROUTE_MANIFEST_END */
