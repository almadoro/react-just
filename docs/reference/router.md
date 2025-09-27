# Router (`@react-just/router`)

## Components

<div :class="$style.grid">
  <Card href="/reference/router/link" title="Link" details="Wrapper around anchor element that enables client-side navigation without full page reloads." />
  <Card href="/reference/router/route" title="Route" details="Specifies which component to render for a given route path." />
  <Card href="/reference/router/router" title="Router" details="The root component that handles routing for your application." />
</div>

## Hooks

<div :class="$style.grid">
  <Card href="/reference/router/use-navigate" title="useNavigate" details="Programmatically controls navigation. A wrapper around the History API." />
  <Card href="/reference/router/use-params" title="useParams" details="Access the parameters of the current matched route." />
  <Card href="/reference/router/use-pathname" title="usePathname" details="Access the current location pathname." />
  <Card href="/reference/router/use-search-params" title="useSearchParams" details="Access the search parameters of the current location as a URLSearchParams object." />
</div>

## Utilities

<div :class="$style.grid">
  <Card href="/reference/router/route-component-props" title="RouteComponentProps" details="Type definition for the props passed to components rendered by a Route." />
</div>

<style module>
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin: 16px 0;
}
@media (min-width: 640px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}
</style>
