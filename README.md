A secure "homelab dashboard" that automatically manages IP whitelisting through Traefik & uses OpenID Connect (OIDC) authentication. I made this to use with Jellyfin and alike where a VPN setup may not work in all instances (i.e smart TV and alike) and some family members just find such a bit too complicated... :)

## Features

- OIDC authentication integration
- Automatic IP whitelist management in Traefik configuration
- Separate whitelisting for regular users and administrators
- Static content serving
- Docker support
- Automatic IP updates when users' addresses change

## How It Works

The dashboard serves as an authentication gateway that:

1. Requires users to authenticate through OIDC
2. Captures the authenticated user's IP address and username
3. Updates Traefik configuration files to maintain whitelists
4. Redirects users to the appropriate dashboard after successful authentication
5. Manages separate whitelists for regular users and administrators

## Prerequisites

- Node.js (optional if using Docker)
- Docker and Docker Compose (optional)
- Traefik reverse proxy
- OIDC provider (e.g., Authelia, Auth0, Keycloak)

## Configuration

### Basic Setup

1. Copy `config.example.js` to `config.js` and update the values found in it.

2. Create the necessary Traefik configuration files:
   - `dyn-whitelist.toml` for regular users [example](/examples/dyn-whitelist.toml)
   - `special-whitelist.toml` for administrators [example](/examples/special-whitelist.toml)

### Docker Setup

1. Ensure your `compose.yml` mounts the correct volumes:
   - Static content directory
   - Configuration files
   - Traefik whitelist files

```yaml
volumes:
  - ./serve:/app/serve
  - ./config.js:/app/config.js
  - ../traefik/dyn-whitelist.toml:/traefik/dyn-whitelist.toml
  - ../traefik/special-whitelist.toml:/traefik/special-whitelist.toml
```
*Note: Don't modify the part after the `:`*

## Installation

### Docker Installation

1. Build and run using Docker Compose:
```bash
docker compose up -d
```

### Manual Installation

1. Add a static site at `./serve`

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node index.js
```

## Usage

1. Users visit the dashboard URL
2. They are redirected to the OIDC provider for authentication
3. Upon successful authentication:
   - Their IP is automatically added to the appropriate whitelist
   - Regular users are added to `dyn-whitelist.toml`
   - Users with the "dash_admin" group are also added to `special-whitelist.toml`
4. Users are redirected to the configured dashboard page

## Traefik Integration

Check the [/examples](/examples) for example Traefik configurations.

## Error Handling

The dashboard includes a `/403` endpoint that handles unauthorized access attempts:
- Unauthenticated users are redirected to login
- Authenticated users are redirected to the dashboard
