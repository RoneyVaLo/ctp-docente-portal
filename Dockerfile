# Imagen base para compilar
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar sln y csproj
COPY ctp-docente-portal.sln .
COPY ctp-docente-portal.Server/ctp-docente-portal.Server.csproj ./ctp-docente-portal.Server/
COPY ctp-docente-portal.client/ctp-docente-portal.client.csproj ./ctp-docente-portal.client/
COPY ctp-docente-portal.Tests/ctp-docente-portal.Tests.csproj ./ctp-docente-portal.Tests/

# Restaurar dependencias
RUN dotnet restore ctp-docente-portal.sln

# Copiar todo el código
COPY . .

# Publicar en Release
WORKDIR /src/ctp-docente-portal.Server
RUN dotnet publish -c Release -o /app/publish

# Imagen base para ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render usa la variable PORT -> configurar Kestrel
ENV ASPNETCORE_URLS=http://+:$PORT

ENTRYPOINT ["dotnet", "ctp-docente-portal.Server.dll"]
