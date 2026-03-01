# DOC-P0-002: API Contracts — OpenAPI 3.1

## Overview

All APIs are documented via Swagger/OpenAPI 3.1 and accessible at `/api/docs` when the server is running.

## Endpoint Summary

### K1 Auth Gateway

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /auth/login | Authenticate and issue JWT | Public |
| POST | /auth/validate | Validate a JWT token | Public |
| POST | /auth/token | Refresh access token | Public |
| GET | /.well-known/jwks | Get JWKS for verification | Public |

### K3 Audit

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /audit | Query audit logs with filters | Bearer |

### K4 Configuration

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /config | List all configs for tenant | Bearer |
| GET | /config/:key | Get config by key | Bearer |
| PUT | /config/:key | Set config value | Bearer |
| DELETE | /config/:key | Delete config | Bearer |

### K5 Event Bus

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /events/publish | Publish an event | Bearer |
| GET | /events/:eventId | Get event by ID | Bearer |
| GET | /events/correlation/:id | Get events by correlation | Bearer |
| GET | /events/type/:type | Get events by type | Bearer |
| GET | /events/dlq/list | List DLQ entries | Bearer |

### M1 Auth Users

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /users | Create user | Bearer |
| GET | /users | List users | Bearer |
| GET | /users/:id | Get user by ID | Bearer |
| PUT | /users/:id | Update user | Bearer |
| DELETE | /users/:id | Delete user | Bearer |
| POST | /users/:id/roles | Assign role | Bearer |

### M2 Tenants

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /tenants | Create tenant | Bearer |
| GET | /tenants | List tenants | Bearer |
| GET | /tenants/:id | Get tenant by ID | Bearer |
| PUT | /tenants/:id | Update tenant | Bearer |
| DELETE | /tenants/:id | Delete tenant | Bearer |

### M3 Roles

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /roles | Create role | Bearer |
| GET | /roles | List roles | Bearer |
| GET | /roles/:id | Get role by ID | Bearer |
| PUT | /roles/:id | Update role | Bearer |
| DELETE | /roles/:id | Delete role | Bearer |

### M4 Permissions

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /permissions | Create permission | Bearer |
| GET | /permissions | List permissions | Bearer |
| GET | /permissions/:id | Get permission by ID | Bearer |
| GET | /permissions/check/:code | Check permission | Bearer |
| DELETE | /permissions/:id | Delete permission | Bearer |

### M30 Action Registry

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /actions | Register action | Bearer |
| GET | /actions | List actions | Bearer |
| GET | /actions/module/:module | List by module | Bearer |
| GET | /actions/:code | Get by code | Bearer |
| POST | /actions/:code/validate | Validate action | Bearer |
| DELETE | /actions/:id | Deactivate action | Bearer |

### Health

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /health | Liveness probe | Public |
| GET | /health/ready | Readiness probe | Public |

**Total Phase 0 Endpoints: 32**
