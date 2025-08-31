# ------------------------------
# Stage 1 - Node: build frontend (Vite)
# ------------------------------
FROM node:18 AS node-build
WORKDIR /src/ctp-docente-portal.client

# Copiar package.json y lock para cache de dependencias
COPY ctp-docente-portal.client/package*.json ./

# Instalar dependencias (prefiere npm ci si existe lockfile)
RUN npm ci --silent || npm install --silent

# Copiar el resto del frontend
COPY ctp-docente-portal.client/. .

# Pasar args de build (ej. VITE_API_URL), opcional
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

# Ejecutar build (Vite genera dist/)
RUN npm run build

# ------------------------------
# Stage 2 - .NET SDK: build & publish backend
# ------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar sólo el csproj del backend para restaurar sin intentar el esproj del client
COPY ctp-docente-portal.Server/*.csproj ./ctp-docente-portal.Server/
WORKDIR /src/ctp-docente-portal.Server
RUN dotnet restore

# Copiar el código del backend
COPY ctp-docente-portal.Server/. .

# Traer el dist/ del frontend generado en node-build
COPY --from=node-build /src/ctp-docente-portal.client/dist /tmp/ctp-client-dist

# Publicar la app .NET
RUN dotnet publish -c Release -o /app/publish

# Copiar archivos estáticos (dist) al wwwroot de la app publicada
RUN mkdir -p /app/publish/wwwroot \
 && cp -r /tmp/ctp-client-dist/* /app/publish/wwwroot/

# ------------------------------
# Stage 3 - Runtime: imagen final
# ------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Render asigna dinámicamente el puerto con la variable PORT
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE $PORT

ENTRYPOINT ["dotnet", "ctp-docente-portal.Server.dll"]
