# ==============================
# Etapa 1: Build Backend + Frontend
# ==============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# ---- Restaurar dependencias del backend ----
COPY ctp-docente-portal.Server/*.csproj ./ctp-docente-portal.Server/
WORKDIR /src/ctp-docente-portal.Server
RUN dotnet restore

# Copiar todo el backend
COPY ctp-docente-portal.Server/. .

# ---- Build frontend React ----
WORKDIR /src/ctp-docente-portal.client

# Copiar solo package.json primero para cache de npm
COPY ctp-docente-portal.client/package*.json ./
RUN npm install

# Copiar resto y compilar React
COPY ctp-docente-portal.client/. ./
RUN npm run build

# ---- Publicar backend ----
WORKDIR /src/ctp-docente-portal.Server
RUN dotnet publish -c Release -o /app/publish

# Copiar build de React al wwwroot del backend
RUN cp -r /src/ctp-docente-portal.client/build/* /app/publish/wwwroot/


# ==============================
# Etapa 2: Runtime
# ==============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Render asigna dinámicamente el puerto
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE $PORT

ENTRYPOINT ["dotnet", "ctp-docente-portal.Server.dll"]
