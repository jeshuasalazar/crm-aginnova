import { redirect, notFound } from 'next/navigation'
import { getClientDetails } from '@/app/actions/clientDetails'
import ClientDetailClient from './components/ClientDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params
  
  const clientData = await getClientDetails(id)
  
  if (!clientData) {
    notFound()
  }

  return (
    <ClientDetailClient clientData={clientData} />
  )
}
