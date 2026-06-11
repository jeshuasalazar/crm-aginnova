'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { revalidatePath } from 'next/cache'

export interface SKU {
  id: string
  sku: string
  name: string
  category: string
  unit_cost: number
  unit_price: number
  reorder_point: number
  supplier_id?: string
  margin_percent: number
  supplier_name?: string
}

export interface Batch {
  id: string
  sku_id: string
  quantity: number
  received_at: string
  expiry_date?: string
  status: string
  dias_hasta_caducidad?: number
  alert_60_pct?: boolean
  sku_name?: string
  sku?: string
}

export interface Supplier {
  id: string
  name: string
  contact?: string
  lead_time_days: number
  reliability_score: number
  last_order_date?: string
  average_delivery_time?: number
}

/**
 * Obtiene todos los datos relativos al inventario, lotes y proveedores para el tenant actual.
 * Realiza cálculos dinámicos de vida útil de lotes, márgenes y Pareto 80/20.
 */
export async function getInventoryData() {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Usuario no autenticado')

  const supabase = await createClient()
  const tenantId = profile.tenant_id

  // 1. Obtener SKUs
  const { data: skus, error: skusError } = await supabase
    .from('inventory_skus')
    .select('*, supplier:suppliers(name)')
    .eq('tenant_id', tenantId)

  if (skusError) throw skusError

  const formattedSkus: SKU[] = (skus || []).map((s: any) => ({
    id: s.id,
    sku: s.sku,
    name: s.name,
    category: s.category || 'General',
    unit_cost: Number(s.unit_cost),
    unit_price: Number(s.unit_price),
    reorder_point: Number(s.reorder_point),
    supplier_id: s.supplier_id || undefined,
    margin_percent: Number(s.unit_price) > 0 ? ((Number(s.unit_price) - Number(s.unit_cost)) / Number(s.unit_price)) * 100 : 0,
    supplier_name: s.supplier?.name || 'Sin Proveedor'
  }))

  // 2. Obtener Lotes y calcular días para caducidad y alertas
  const { data: batches, error: batchesError } = await supabase
    .from('inventory_batches')
    .select('*, sku:inventory_skus(sku, name, tenant_id)')

  if (batchesError) throw batchesError

  const tenantBatches = (batches || []).filter((b: any) => b.sku?.tenant_id === tenantId)

  const formattedBatches: Batch[] = tenantBatches.map((b: any) => {
    const received = new Date(b.received_at)
    const expiry = b.expiry_date ? new Date(b.expiry_date) : null
    let dias_hasta_caducidad = undefined
    let alert_60_pct = false

    if (expiry) {
      const diffTime = expiry.getTime() - Date.now()
      dias_hasta_caducidad = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const totalLife = expiry.getTime() - received.getTime()
      const elapsedLife = Date.now() - received.getTime()
      
      // Alerta si ya se consumió más del 60% de la vida útil
      if (totalLife > 0 && elapsedLife / totalLife >= 0.6) {
        alert_60_pct = true
      }
    }

    return {
      id: b.id,
      sku_id: b.sku_id,
      quantity: Number(b.quantity),
      received_at: b.received_at,
      expiry_date: b.expiry_date || undefined,
      status: b.status,
      dias_hasta_caducidad,
      alert_60_pct,
      sku_name: b.sku?.name || '',
      sku: b.sku?.sku || ''
    }
  })

  // 3. Obtener Proveedores
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('*')
    .eq('tenant_id', tenantId)

  if (suppliersError) throw suppliersError

  // 4. Calcular Pareto Básico 80/20 (Concentración de Ingresos por SKU)
  const pareto: Array<{ sku: string; name: string; share: number }> = []
  if (formattedSkus.length > 0) {
    const totalRev = formattedSkus.reduce((sum, s) => sum + (s.unit_price * 25), 0) // simulación de ventas base
    let cumulative = 0
    formattedSkus
      .map(s => ({ sku: s.sku, name: s.name, rev: s.unit_price * 25 }))
      .sort((a, b) => b.rev - a.rev)
      .forEach(s => {
        cumulative += s.rev
        pareto.push({
          sku: s.sku,
          name: s.name,
          share: totalRev > 0 ? (s.rev / totalRev) * 100 : 0
        })
      })
  }

  return {
    skus: formattedSkus,
    batches: formattedBatches,
    suppliers: (suppliers || []) as Supplier[],
    pareto
  }
}

/**
 * Registra un nuevo SKU en el catálogo de productos.
 */
export async function createSKURecord(data: {
  sku: string
  name: string
  category: string
  unit_cost: number
  unit_price: number
  reorder_point: number
  supplier_id?: string
}) {
  try {
    const profile = await getCurrentUserProfile()
    if (!profile) throw new Error('Usuario no autenticado')

    const supabase = await createClient()
    const { data: sku, error } = await supabase
      .from('inventory_skus')
      .insert({
        tenant_id: profile.tenant_id,
        sku: data.sku.toUpperCase().trim(),
        name: data.name.trim(),
        category: data.category.trim(),
        unit_cost: data.unit_cost,
        unit_price: data.unit_price,
        reorder_point: data.reorder_point,
        supplier_id: data.supplier_id || null
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/inventario')
    return { success: true, sku }
  } catch (error: any) {
    console.error('Error al crear SKU:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Agrega un nuevo lote recibido de mercancía.
 */
export async function createBatchRecord(data: {
  sku_id: string
  quantity: number
  expiry_date?: string
}) {
  try {
    const supabase = await createClient()
    const { data: batch, error } = await supabase
      .from('inventory_batches')
      .insert({
        sku_id: data.sku_id,
        quantity: data.quantity,
        expiry_date: data.expiry_date || null,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/inventario')
    return { success: true, batch }
  } catch (error: any) {
    console.error('Error al agregar lote:', error)
    return { success: false, error: error.message }
  }
}
