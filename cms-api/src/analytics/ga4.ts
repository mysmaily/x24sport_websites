import { GoogleAuth } from 'google-auth-library'

type Ga4MetricValue = {
  value?: string
}

type Ga4ReportResponse = {
  rows?: Array<{
    metricValues?: Ga4MetricValue[]
  }>
}

type ServiceAccountCredentials = {
  client_email?: string
  private_key?: string
  project_id?: string
}

export function getGa4Timezone() {
  return process.env.GA4_REPORT_TIMEZONE || 'Asia/Ho_Chi_Minh'
}

function getServiceAccountCredentials(): { credentials?: ServiceAccountCredentials; keyFilename?: string } {
  const rawJson = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON?.trim()
  const keyFilename = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_PATH?.trim()

  if (rawJson) {
    return {
      credentials: JSON.parse(rawJson) as ServiceAccountCredentials,
    }
  }

  if (keyFilename) {
    return { keyFilename }
  }

  throw new Error(
    'Missing Google Analytics credentials. Set GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON or GOOGLE_ANALYTICS_SERVICE_ACCOUNT_PATH.',
  )
}

async function getAccessToken() {
  const auth = new GoogleAuth({
    ...getServiceAccountCredentials(),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  })
  const client = await auth.getClient()
  const accessToken = await client.getAccessToken()

  if (!accessToken.token) {
    throw new Error('Google Analytics access token was not returned.')
  }

  return accessToken.token
}

export async function fetchGa4SessionsForDate({
  propertyId,
  date,
}: {
  propertyId: string
  date: string
}) {
  const accessToken = await getAccessToken()
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: date, endDate: date }],
      metrics: [{ name: 'sessions' }],
      keepEmptyRows: true,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GA4 Data API returned ${response.status} for property ${propertyId}: ${body}`)
  }

  const data = (await response.json()) as Ga4ReportResponse
  const value = data.rows?.[0]?.metricValues?.[0]?.value
  return Number.parseInt(value || '0', 10) || 0
}
