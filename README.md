This is my simple homelab dashboard, that just shows a simple static site from the `serve` folder.

Any user who may be visiting this site, needs to be authenticated from OIDC or they will just be redirected there.

Any user who is successfully authenticated will have their username from OIDC and their IP of where they are visiting from added to a Traefik configuration.

If the username of the user already exists, but is a different IP address it will be changed to the new IP.

I made this project public, cause I know someone will have as aftermarket braincells as me and want something like this. For whatever reason it may be. I think it's nice... =)

Example configuration files can be found in [/examples](/examples)