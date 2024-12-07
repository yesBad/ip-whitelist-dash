This is my simple homelab dashboard, that just shows a simple static site from the `serve` folder.

Any user who may be visiting this site, needs to be **authenticated** from OIDC.

Any user who is successfully authenticated will have their username from OIDC and their IP of where they are visiting from added to my Traefik configuration.

If the username of the user already exists, but is a different IP address it will be changed to the new IP.
