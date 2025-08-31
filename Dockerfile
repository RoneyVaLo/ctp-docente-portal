# ==============================
# Etapa 1: Build Backend + Frontend
# ==============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de solución y proyectos
COPY ctp-docente-portal.sln ./
COPY ctp-docente-portal.Server/*.csproj ./ctp-docente-portal.Server/
COPY ctp-docente-portal.Tests/*.csproj ./ctp-docente-portal.Tests/
RUN dotnet restore

# Copiar resto de archivos
COPY . .

# ---- Build frontend React ----
WORKDIR /src/ctp-docente-portal.client

# Copiar solo package.json primero para cache
COPY ctp-docente-portal.client/package*.json ./
RUN npm install

# Copiar resto y compilar React
COPY ctp-docente-portal.client/. ./
RUN npm run build

# ---- Build backend ----
WORKDIR /src/ctp-docente-portal.Server
RUN dotnet publish -c Release -o /app/publish

# Copiar React build al wwwroot del backend
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
