# X24Sport Websites

Source and operational workspace for the X24Sport `mayao*.vn` websites.

## Websites

- `mayaocaulong.vn`
- `mayaobongchuyen.vn`
- `mayaopickleball.vn`
- `mayaobongro.vn`
- `mayaochaybo.vn`
- `mayaobongda.vn`

The shared Payload CMS is in `cms-api/`. The Next.js tenants can be run together
with it through `docker-compose.yml`.

## Website registry

Refresh one website profile at a time so this repository remains scoped to the
X24Sport websites:

```bash
ruby scripts/website_registry.rb sync domain=mayaobongda.vn
```
