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
import { Route as DashboardSettingsImport } from './routes/_dashboard/settings'
import { Route as DashboardSettingsIndexImport } from './routes/_dashboard/settings/index'
import { Route as DashboardSettingsUpdatePasswordImport } from './routes/_dashboard/settings/update-password'

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

const DashboardSettingsRoute = DashboardSettingsImport.update({
  id: '/settings',
  path: '/settings',
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
    '/_dashboard/settings': {
      id: '/_dashboard/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof DashboardSettingsImport
      parentRoute: typeof DashboardImport
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
  }
}

// Create and export the route tree

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
  DashboardSettingsRoute: typeof DashboardSettingsRouteWithChildren
  DashboardIndexRoute: typeof DashboardIndexRoute
}

const DashboardRouteChildren: DashboardRouteChildren = {
  DashboardSettingsRoute: DashboardSettingsRouteWithChildren,
  DashboardIndexRoute: DashboardIndexRoute,
}

const DashboardRouteWithChildren = DashboardRoute._addFileChildren(
  DashboardRouteChildren,
)

interface AuthRouteChildren {
  AuthLoginRoute: typeof AuthLoginRoute
}

const AuthRouteChildren: AuthRouteChildren = {
  AuthLoginRoute: AuthLoginRoute,
}

const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof DashboardRouteWithChildren
  '/auth': typeof AuthRouteWithChildren
  '/settings': typeof DashboardSettingsRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/': typeof DashboardIndexRoute
  '/settings/update-password': typeof DashboardSettingsUpdatePasswordRoute
  '/settings/': typeof DashboardSettingsIndexRoute
}

export interface FileRoutesByTo {
  '/auth': typeof AuthRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/': typeof DashboardIndexRoute
  '/settings/update-password': typeof DashboardSettingsUpdatePasswordRoute
  '/settings': typeof DashboardSettingsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_dashboard': typeof DashboardRouteWithChildren
  '/auth': typeof AuthRouteWithChildren
  '/_dashboard/settings': typeof DashboardSettingsRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/_dashboard/': typeof DashboardIndexRoute
  '/_dashboard/settings/update-password': typeof DashboardSettingsUpdatePasswordRoute
  '/_dashboard/settings/': typeof DashboardSettingsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/auth'
    | '/settings'
    | '/auth/login'
    | '/'
    | '/settings/update-password'
    | '/settings/'
  fileRoutesByTo: FileRoutesByTo
  to: '/auth' | '/auth/login' | '/' | '/settings/update-password' | '/settings'
  id:
    | '__root__'
    | '/_dashboard'
    | '/auth'
    | '/_dashboard/settings'
    | '/auth/login'
    | '/_dashboard/'
    | '/_dashboard/settings/update-password'
    | '/_dashboard/settings/'
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
        "/_dashboard/settings",
        "/_dashboard/"
      ]
    },
    "/auth": {
      "filePath": "auth.tsx",
      "children": [
        "/auth/login"
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
    "/auth/login": {
      "filePath": "auth/login.tsx",
      "parent": "/auth"
    },
    "/_dashboard/": {
      "filePath": "_dashboard/index.tsx",
      "parent": "/_dashboard"
    },
    "/_dashboard/settings/update-password": {
      "filePath": "_dashboard/settings/update-password.tsx",
      "parent": "/_dashboard/settings"
    },
    "/_dashboard/settings/": {
      "filePath": "_dashboard/settings/index.tsx",
      "parent": "/_dashboard/settings"
    }
  }
}
ROUTE_MANIFEST_END */
