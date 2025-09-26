import { ComponentType, ReactElement, ReactNode } from "react";

export interface Navigate {
  (href: string, options?: NavigateOptions): void;
  (delta: number, options?: never): void;
}

export interface NavigateOptions {
  replace?: boolean;
}

export type Params = Record<string, string | string[]>;

export function Link(props: LinkProps): ReactElement;

export interface LinkProps extends React.DOMAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
}

export interface RouteProps {
  children?: RouteChildren;
  component: ComponentType<RouteComponentProps>;
  path: string;
}

export function Route(props: RouteProps): never;

export interface RouterProps {
  children?: RouteChildren;
  url: URL;
}

export function Router(props: RouterProps): ReactNode;

export type RouteChildren =
  | Iterable<RouteChildren>
  | ReactElement<RouteProps, typeof Route>
  | boolean
  | null
  | undefined;

export interface RouteComponentProps<T extends Params = {}> {
  children?: ReactNode;
  params: T;
  pathname: string;
  search: string;
  url: string;
}

export function useNavigate(): Navigate;

export function useParams<T extends Params = {}>(): T;

export function usePathname(): string;

export function useSearchParams(): URLSearchParams;
