import {
  Params,
  RouteChildren,
  RouteComponentProps,
  RouterProps,
} from "@/types";
import { ComponentType, ReactNode } from "react";
import { removeTrailingSlashes } from "../utils";
import LocationProvider from "./LocationProvider";
import NavigateProvider from "./NavigateProvider";
import Route from "./Route";

export default function Router({
  url: inputUrl,
  children,
}: RouterProps): ReactNode {
  const url = removeTrailingSlashes(inputUrl);

  const route = matchRoute(url.pathname, children);

  if (!route) return null;

  const { component: Component, params } = route;

  return (
    <NavigateProvider trailingSlashes="remove">
      <LocationProvider url={url.href} params={params}>
        <Component
          params={params}
          pathname={url.pathname}
          search={url.search}
          url={url.href}
        />
      </LocationProvider>
    </NavigateProvider>
  );
}

function matchRoute(path: string, children: RouteChildren) {
  for (const { paths, component } of flatRouteChildren(children)) {
    const { regexp, groups } = parsePaths(paths);
    const result = regexp.exec(path);
    if (result) return { component, params: extractParams(result, groups) };
  }

  return null;
}

interface AggregateRoute {
  paths: string[];
  component: ComponentType<RouteComponentProps>;
}

function* flatRouteChildren(
  route: RouteChildren,
  parent?: AggregateRoute,
): Generator<AggregateRoute> {
  if (route === undefined && parent) yield parent;

  const children = isIterable(route) ? route : [route];

  for (const child of children) {
    if (typeof child === "boolean" || child === null || child === undefined)
      continue;

    if (isIterable(child)) {
      yield* flatRouteChildren(child, parent);
      continue;
    }

    if (child.type !== Route)
      throw new Error(
        `Router can only accept \`Route\` components as children. Received \`${child.type.name}\``,
      );

    const {
      path: routePath,
      component: RouteComponent,
      children: routeChildren,
    } = child.props;

    const isIndexRoute = routePath === "/" || routePath === "";
    if (routeChildren && isIndexRoute)
      throw new Error("Index routes can't have children");

    if (parent) {
      const { paths: parentPaths, component: ParentComponent } = parent;
      yield* flatRouteChildren(routeChildren, {
        paths: [...parentPaths, routePath],
        component: (props) => (
          <ParentComponent {...props}>
            <RouteComponent {...props} />
          </ParentComponent>
        ),
      });
    } else {
      yield* flatRouteChildren(routeChildren, {
        paths: [routePath],
        component: RouteComponent,
      });
    }
  }
}

function isIterable(obj: unknown): obj is Iterable<unknown> {
  return typeof obj === "object" && obj !== null && Symbol.iterator in obj;
}

function parsePaths(paths: string[]) {
  let segmentsRegexpStr: string[] = [];
  let groups: GroupsType = {};

  for (const path of paths) {
    const parsedPath = parsePath(path);

    segmentsRegexpStr.push(...parsedPath.segmentsRegexpStr);

    for (const [key, value] of Object.entries(parsedPath.groups)) {
      if (groups[key]) throw new Error(`Duplicate path param name: "${key}"`);
      groups[key] = value;
    }
  }

  return {
    regexp: new RegExp(`^${segmentsRegexpStr.join("")}$`),
    groups,
  };
}

function parsePath(path: string) {
  const groups: GroupsType = {};
  const segmentsRegexpStr: string[] = [];

  path = removeLeadingSlash(path);

  // Index route. There is no path to match.
  if (path === "") return { groups, segmentsRegexpStr };

  // We don't support strict trailing slash matching
  if (path.endsWith("/"))
    throw new Error(`Invalid path: paths can't end with a "/" ("${path}")`);

  for (let segmentStr of path.split("/")) {
    let isOptional = segmentStr.endsWith("?");
    if (isOptional) segmentStr = segmentStr.slice(0, -1);

    if (!segmentStr)
      throw new Error(
        `Invalid path: empty segments aren't supported ("${path}")`,
      );

    let segmentRegexpStr: string;

    if (segmentStr.startsWith(":")) {
      const pathName = segmentStr.slice(1);
      if (!isValidParamName(pathName))
        throw new Error(`Invalid path param name: "${pathName}"`);

      segmentRegexpStr = `/(?<${pathName}>[^/]+)`;

      groups[pathName] = "path";
    } else if (segmentStr.startsWith("*")) {
      const wildcardName = segmentStr.slice(1);
      if (!isValidParamName(wildcardName))
        throw new Error(`Invalid path wildcard name: "${wildcardName}"`);

      segmentRegexpStr = `/(?<${wildcardName}>[^]+)`;

      groups[wildcardName] = "wildcard";
    } else {
      if (!isValidStaticSegment(segmentStr))
        throw new Error(`Invalid path segment: "${segmentStr}"`);

      segmentRegexpStr = "/" + escape(segmentStr);
    }

    if (isOptional) segmentRegexpStr = `(${segmentRegexpStr})?`;

    segmentsRegexpStr.push(segmentRegexpStr);
  }

  return { groups, segmentsRegexpStr };
}

type GroupsType = Record<string, "path" | "wildcard">;

function removeLeadingSlash(path: string) {
  return path.replace(/^\//g, "");
}

function isValidParamName(name: string) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

function isValidStaticSegment(str: string) {
  return /^[^?:*]*$/.test(str);
}

function escape(str: string) {
  return str.replace(/[.+*?^${}()[\]|/\\]/g, "\\$&");
}

function extractParams(result: RegExpExecArray, groupsType: GroupsType) {
  const params: Params = {};
  const groups = result.groups || {};

  for (const [name, type] of Object.entries(groupsType)) {
    if (type === "path") {
      params[name] = decodeURIComponent(groups[name]);
    } else {
      params[name] = groups[name].split("/").map(decodeURIComponent);
    }
  }

  return params;
}
