'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Order {
  id: string
  tenant_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  shipping_address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  source: 'ecommerce' | 'manual' | 'whatsapp' | 'instagram'
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
}

export interface Shipment {
  id: string
  tenant_id: string
  order_id: string
  skydropx_shipment_id: string
  rate_id?: string
  tracking_number?: string
  label_url?: string
  carrier?: string
  status: 'draft' | 'rates_retrieved' | 'labeled' | 'in_transit' | 'delivered' | 'cancelled'
  created_at: string
  order?: Order
}

/**
 * Obtiene todas las órdenes de un tenant específico.
 */
export async function getOrders(tenantId: string): Promise<Order[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

/**
 * Crea una órden manual.
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status'>) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          ...orderData,
          status: 'pending'
        }
      ])
      .select()

    if (error) throw error
    revalidatePath('/orders')
    return { success: true, order: data?.[0] }
  } catch (error: any) {
    console.error('Error creating order:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene los envíos realizados para un tenant.
 */
export async function getShipments(tenantId: string): Promise<Shipment[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('shipments')
      .select('*, order:orders(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching shipments:', error)
    return []
  }
}

/**
 * Crea un registro inicial de envío en estado Borrador/RatesRetrieved.
 */
export async function createShipmentRecord(shipmentData: {
  tenant_id: string
  order_id: string
  skydropx_shipment_id: string
  status: 'draft' | 'rates_retrieved'
}) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipmentData])
      .select()

    if (error) throw error
    return { success: true, shipment: data?.[0] }
  } catch (error: any) {
    console.error('Error creating shipment record:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Completa el proceso de etiquetado de un envío.
 * Actualiza el estado de la órden a 'shipped' y los datos del envío a 'labeled'.
 */
export async function completeShipment(
  orderId: string,
  skydropxShipmentId: string,
  rateId: string,
  trackingNumber: string,
  labelUrl: string,
  carrier: string
) {
  try {
    const supabase = await createClient()

    // 1. Actualizar el registro del envío
    const { error: shipmentError } = await supabase
      .from('shipments')
      .update({
        rate_id: rateId,
        tracking_number: trackingNumber,
        label_url: labelUrl,
        carrier: carrier,
        status: 'labeled'
      })
      .eq('skydropx_shipment_id', skydropxShipmentId)

    if (shipmentError) throw shipmentError

    // 2. Actualizar el estado de la órden vinculada
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', orderId)

    if (orderError) throw orderError

    revalidatePath('/orders')
    revalidatePath('/shipments')
    return { success: true }
  } catch (error: any) {
    console.error('Error completing shipment:', error)
    return { success: false, error: error.message }
  }
}
