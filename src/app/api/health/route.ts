import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'Lets Train',
    timestamp: new Date().toISOString(),
  })
}
