'use server'

import { createClient } from '@/utils/supabase/server'

interface Address {
  name: string
  phone: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  postal_code: string
  country: string
  email?: string
}

interface Parcel {
  weight: number; // KG
  length: number; // CM
  width: number;  // CM
  height: number; // CM
}

export interface SkydropxRate {
  id: string
  provider: string
  serviceLevel: string
  amount: number
  currency: string
  days: number
}

// Helper to determine if we are in mock mode (e.g. sandbox key)
function isMockToken(apiKey: string) {
  return !apiKey || apiKey.includes('sandbox') || apiKey === 'skydropx_sandbox_token_here'
}

/**
 * Cotiza un envío en Skydropx.
 * Si el token es de sandbox/mock, devuelve tarifas de simulación.
 */
export async function quoteShipment(
  tenantId: string,
  toAddress: Address,
  parcel: Parcel
): Promise<{ shipmentId: string; rates: SkydropxRate[] }> {
  try {
    const supabase = await createClient()

    // 1. Obtener configuración de Skydropx para el tenant
    const { data: config, error: configError } = await supabase
      .from('skydropx_config')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (configError || !config) {
      throw new Error(`No se encontró configuración de Skydropx para el cliente: ${tenantId}`)
    }

    const fromAddress = config.default_origin_address as Address
    const apiKey = config.api_key

    if (isMockToken(apiKey)) {
      console.log(`[Skydropx Mock] Cotizando envío para ${tenantId}...`)
      // Simular retraso de red
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      const mockShipmentId = `mock_ship_uuid_${Math.random().toString(36).substr(2, 9)}`
      const mockRates: SkydropxRate[] = [
        {
          id: `mock_rate_fedex_${Math.random().toString(36).substr(2, 5)}`,
          provider: 'FEDEX',
          serviceLevel: 'Express (1 día)',
          amount: 145.00,
          currency: 'MXN',
          days: 1
        },
        {
          id: `mock_rate_dhl_${Math.random().toString(36).substr(2, 5)}`,
          provider: 'DHL',
          serviceLevel: 'Estándar',
          amount: 125.50,
          currency: 'MXN',
          days: 3
        },
        {
          id: `mock_rate_estafeta_${Math.random().toString(36).substr(2, 5)}`,
          provider: 'ESTAFETA',
          serviceLevel: 'Terrestre',
          amount: 98.00,
          currency: 'MXN',
          days: 5
        }
      ]

      return { shipmentId: mockShipmentId, rates: mockRates }
    }

    // 2. Hacer llamada real a Skydropx
    // Adaptación a formato Skydropx API v1
    const response = await fetch('https://api.skydropx.com/v1/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token token=${apiKey}`
      },
      body: JSON.stringify({
        address_from: {
          province: fromAddress.state,
          zip: fromAddress.postal_code,
          country: fromAddress.country,
          address1: `${fromAddress.street} ${fromAddress.number}, ${fromAddress.neighborhood}`,
          company: fromAddress.name,
          phone: fromAddress.phone,
          email: fromAddress.email || 'contacto@aginnova.mx',
          name: fromAddress.name
        },
        address_to: {
          province: toAddress.state,
          zip: toAddress.postal_code,
          country: toAddress.country,
          address1: `${toAddress.street} ${toAddress.number}, ${toAddress.neighborhood}`,
          company: toAddress.name,
          phone: toAddress.phone,
          email: toAddress.email || 'cliente@mail.com',
          name: toAddress.name
        },
        parcel: {
          weight: parcel.weight,
          distance_unit: 'CM',
          mass_unit: 'KG',
          height: parcel.height,
          width: parcel.width,
          length: parcel.length
        }
      })
    })

    if (!response.ok) {
      const errBody = await response.text()
      throw new Error(`Skydropx API Error: ${response.statusText} - ${errBody}`)
    }

    const result = await response.json()
    const shipmentId = result.data.id

    // Extraer tarifas del payload 'included'
    const rates: SkydropxRate[] = (result.included || [])
      .filter((item: any) => item.type === 'rates')
      .map((rate: any) => ({
        id: rate.id,
        provider: rate.attributes.provider,
        serviceLevel: rate.attributes.service_level,
        amount: parseFloat(rate.attributes.amount),
        currency: rate.attributes.currency,
        days: rate.attributes.delivery_days
      }))

    return { shipmentId, rates }
  } catch (error: any) {
    console.error('Error in quoteShipment:', error)
    throw new Error(error.message || 'Error al cotizar envío en Skydropx')
  }
}

/**
 * Genera la etiqueta/guía de envío en Skydropx.
 */
export async function createLabel(
  tenantId: string,
  shipmentId: string,
  rateId: string
): Promise<{ trackingNumber: string; labelUrl: string; carrier: string }> {
  try {
    const supabase = await createClient()

    const { data: config, error: configError } = await supabase
      .from('skydropx_config')
      .select('api_key')
      .eq('tenant_id', tenantId)
      .single()

    if (configError || !config) {
      throw new Error(`No se encontró configuración de Skydropx para el cliente: ${tenantId}`)
    }

    const apiKey = config.api_key

    if (isMockToken(apiKey)) {
      console.log(`[Skydropx Mock] Generando etiqueta para rate: ${rateId}...`)
      await new Promise((resolve) => setTimeout(resolve, 800))

      const carrier = rateId.includes('fedex') ? 'FEDEX' : rateId.includes('dhl') ? 'DHL' : 'ESTAFETA'
      const trackingNumber = `MOCKTRK${Math.floor(100000000000 + Math.random() * 900000000000)}`
      // Usaremos un PDF de muestra para simular la etiqueta
      const labelUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

      return { trackingNumber, labelUrl, carrier }
    }

    // Llamada real
    const response = await fetch('https://api.skydropx.com/v1/labels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token token=${apiKey}`
      },
      body: JSON.stringify({
        rate_id: parseInt(rateId) // La API real suele esperar un entero o string según versión
      })
    })

    if (!response.ok) {
      const errBody = await response.text()
      throw new Error(`Skydropx Label API Error: ${response.statusText} - ${errBody}`)
    }

    const result = await response.json()
    const labelData = result.data.attributes

    return {
      trackingNumber: labelData.tracking_number,
      labelUrl: labelData.label_url,
      carrier: labelData.carrier
    }
  } catch (error: any) {
    console.error('Error in createLabel:', error)
    throw new Error(error.message || 'Error al generar la guía en Skydropx')
  }
}
