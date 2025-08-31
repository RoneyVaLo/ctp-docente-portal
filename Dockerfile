# ------------------------------
# Stage 1 — Node: build frontend
# ------------------------------
FROM node:18 AS node-build
WORKDIR /src/ctp-docente-portal.client

# Copiar package.json y package-lock para cache
COPY ctp-docente-portal.client/package*.json ./

# Instalar dependencias (si falla npm ci por no existir lock, cae a npm install)
RUN npm ci || npm install

# Copiar resto del frontend y construir
COPY ctp-docente-portal.client/. .
RUN npm run build

# ------------------------------
# Stage 2 — .NET SDK: build & publish backend
# ------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar sólo el csproj del backend y restaurar (evita intentar restaurar el proyecto client.esproj)
COPY ctp-docente-portal.Server/*.csproj ./ctp-docente-portal.Server/
WORKDIR /src/ctp-docente-portal.Server
RUN dotnet restore

# Copiar todo el código del backend
COPY ctp-docente-portal.Server/. .

# Traer el build del frontend desde el stage node-build
COPY --from=node-build /src/ctp-docente-portal.client/build /src/ctp-docente-portal.client/build

# Publicar la app .NET
RUN dotnet publish -c Release -o /app/publish

# Copiar los archivos estáticos (React build) al wwwroot de la app publicada
RUN mkdir -p /app/publish/wwwroot \
 && cp -r /src/ctp-docente-portal.client/build/* /app/publish/wwwroot/

# ------------------------------
# Stage 3 — Runtime: imagen final
# ------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copiamos lo publicado
COPY --from=build /app/publish .

# Puerto dinámico que asigna Render
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE $PORT

ENTRYPOINT ["dotnet", "ctp-docente-portal.Server.dll"]
