/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      }
    ]
  },
  env: {
    TOKEN: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InNNMV95QXhWOEdWNHlOLUI2ajJ4em1pazVBbyIsImtpZCI6InNNMV95QXhWOEdWNHlOLUI2ajJ4em1pazVBbyJ9.eyJhdWQiOiJodHRwczovL2FwaS5idXNpbmVzc2NlbnRyYWwuZHluYW1pY3MuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjM1Y2U5MDYtMDRjNC00ZWU1LWE3MDUtYzkwNGIxZmEzMTY3LyIsImlhdCI6MTc3MTkzMzk4NywibmJmIjoxNzcxOTMzOTg3LCJleHAiOjE3NzE5Mzc4ODcsImFpbyI6ImsyWmdZSGk0S2l1Nk9LZjkzRm1Yc0pmSE1uUW1BZ0E9IiwiYXBwaWQiOiIwMTUxNjhkZi04MTVjLTQyNDYtYWVkMy1hYWNhZjFiOWYyMGEiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yMzVjZTkwNi0wNGM0LTRlZTUtYTcwNS1jOTA0YjFmYTMxNjcvIiwiaWR0eXAiOiJhcHAiLCJvaWQiOiJkOTBhMzVmZC1mZGQ5LTRlNWUtYTVhNS02ZTQzOTEzYjY0YTgiLCJyaCI6IjEuQVJNQkJ1bGNJOFFFNVU2bkJja0VzZm94WnozdmJabHNzMU5CaGdlbV9Ud0J1SjhBQUFBVEFRLiIsInJvbGVzIjpbIkF1dG9tYXRpb24uUmVhZFdyaXRlLkFsbCIsImFwcF9hY2Nlc3MiLCJBZG1pbkNlbnRlci5SZWFkV3JpdGUuQWxsIiwiQVBJLlJlYWRXcml0ZS5BbGwiXSwic3ViIjoiZDkwYTM1ZmQtZmRkOS00ZTVlLWE1YTUtNmU0MzkxM2I2NGE4IiwidGlkIjoiMjM1Y2U5MDYtMDRjNC00ZWU1LWE3MDUtYzkwNGIxZmEzMTY3IiwidXRpIjoiSWJvcWxXZHhQRUc5TWJ6ZGVDSWxBQSIsInZlciI6IjEuMCIsInhtc19hY3RfZmN0IjoiMyA5IiwieG1zX2Z0ZCI6IkZyQnoxdG0xeVA1T1g3R29kMEw0LXVGbHB0cUZ6RktMdUppRUxNSzdSWEFCWlhWeWIzQmxkMlZ6ZEMxa2MyMXoiLCJ4bXNfaWRyZWwiOiI3IDE0IiwieG1zX3JkIjoiMC40MkxqWUJKaW1zd2tKTUxCTGlRUWUzZmx1WWQtWHY2emF2dVUzajk2LXhBb3lpa2s4R0hGbmRfMkZ2TTlPZ08ySEtoaVh4WUtGT1VRRXJCOW56c3paM093WXh2N3NyODJqRHZtQTBXNWhRU1U4dEtMSXNwQ0c5aU9fajBjOHZMclVnQSIsInhtc19zdWJfZmN0IjoiMyA5In0.baBLf1TUXWE3nHJ9E0TJEqx-OWDnMWsc9ZZRmJ1C3_0sOSAGI-eouROJ6fyXaPJIyGvSzCVGaJkM5nOP6Xgq3UitNSCXJcOZzGIRNreK7hMKfs75xgmrKDsLauHUt5duoap1mQXeo1nsKnCNTo7Ar8OqoNWMbIWAGpAQwc56d7tm4Wy6r7AVx-MnOBClNEu2KS01SKXchH2wxp-5z6Jc532ZYLUIJjt6qmplxKhIreBrsxyACg0-38lhGqBHDoD-R_NhMvATyOlC4JUfhRmu_jCkaShTg_z5Z-GkcAchFQUuzxPJVzjaM9ktRhVAX9oPhV725iy2PltNEnwWDaV_Mg',
    NEXT_API_PLEXUS: `https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0`,
    NEXTAUTH_SECRET: 'LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=',
    NEXTAUTH_URL: 'http://localhost:3000/',
    NEXT_APP_GOOGLE_MAPS_API_KEY: 'AIzaSyAXv4RQK39CskcIB8fvM1Q7XCofZcLxUXw',
    NEXT_APP_API_URL: 'https://mock-data-api-nextjs.vercel.app',
    NEXT_APP_JWT_SECRET: 'ikRgjkhi15HJiU78-OLKfjngiu',
    NEXT_APP_JWT_TIMEOUT: '86400',
    NEXTAUTH_SECRET_KEY: 'LlKq6ZtYbr+ hTC073mAmAh9 / h2HwMfsFo4hrfCx5mLg='
  },
  outputFileTracingRoot: path.join(__dirname, './')
};

module.exports = nextConfig;
