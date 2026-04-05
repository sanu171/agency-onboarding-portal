FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["AgencyOnboarding.API.csproj", "./"]
RUN dotnet restore "AgencyOnboarding.API.csproj"

COPY . .
RUN dotnet publish "AgencyOnboarding.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Environment variables
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "AgencyOnboarding.API.dll"]
