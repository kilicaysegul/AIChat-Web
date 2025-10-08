# Çalışma zamanı imajı (.NET 9)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Derleme imajı (.NET 9 SDK)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Build context backend/AIChat.API olduğu için sadece csproj kopyalamak yeterli
COPY ./AIChat.API.csproj ./
RUN dotnet restore

# Tüm kaynakları kopyala ve publish et
COPY . .
RUN dotnet publish -c Release -o /app/out

# Final imaj
FROM base AS final
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "AIChat.API.dll"]
