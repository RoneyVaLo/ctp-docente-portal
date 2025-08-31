# Stage 1 - Node: build frontend (con logging)
FROM node:18 AS node-build
WORKDIR /src/ctp-docente-portal.client

# Copiar package.json y lockfile primero para cache
COPY ctp-docente-portal.client/package*.json ./

# Usar npm ci si hay lock, o fallback a npm install
RUN npm ci --silent || npm install --silent

# Copiar resto del frontend
COPY ctp-docente-portal.client/. .

# Exportar vars build-time opcionales (útiles si tu build necesita REACT_APP_*)
ARG REACT_APP_API_URL=""
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=production

# Ejecutar build con salida verbosa y guardar log
# Usamos sh -c y tee para capturar salida en /tmp/npm-build.log
RUN sh -c "npm run build --loglevel verbose 2>&1 | tee /tmp/npm-build.log"

# Stage 2 - .NET SDK: build backend y copiar frontend build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restaurar sólo el csproj del backend para evitar esproj del client
COPY ctp-docente-portal.Server/*.csproj ./ctp-docente-portal.Server/
WORKDIR /src/ctp-docente-portal.Server
RUN dotnet restore

# Copiar código backend
COPY ctp-docente-portal.Server/. .

# Traer el frontend build desde node-build
COPY --from=node-build /src/ctp-docente-portal.client/build /src/ctp-docente-portal.client/build

# Publicar la app .NET
RUN dotnet publish -c Release -o /app/publish

# Copiar archivos estáticos al wwwroot
RUN mkdir -p /app/publish/wwwroot \
 && cp -r /src/ctp-docente-portal.client/build/* /app/publish/wwwroot/

# Stage 3 - Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE $PORT
ENTRYPOINT ["dotnet", "ctp-docente-portal.Server.dll"]
