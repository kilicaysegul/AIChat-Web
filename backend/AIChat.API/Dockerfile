# ---- build stage ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/out

# ---- runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/out .

# Render sana PORT env var'ını veriyor. Kestrel'i ona bağla.
# Shell ile çalıştırıp $PORT'u runtime'da dolduruyoruz.
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:$PORT dotnet AIChat.API.dll"]