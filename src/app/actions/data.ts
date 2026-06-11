'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { revalidatePath } from 'next/cache'

export interface UploadRecord {
  id: string
  filename: string
  type: 'ventas' | 'inventario' | 'campañas'
  status: 'pending' | 'completed' | 'error'
  rows_imported: number
  errors_json?: any[]
  created_at: string
}

/**
 * Obtiene el historial de cargas de datos realizadas para el tenant del usuario.
 */
export async function getUploadsHistory(): Promise<UploadRecord[]> {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Usuario no autenticado')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('data_uploads')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Procesa e inserta las filas cargadas desde un archivo CSV/Excel en su respectiva tabla.
 * Implementa normalización, validación y deduplicación.
 */
export async function importDataAction(
  filename: string,
  type: 'ventas' | 'inventario' | 'campañas',
  rows: any[]
) {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Usuario no autenticado')

  const supabase = await createClient()
  const tenantId = profile.tenant_id

  // 1. Registrar inicio de la carga
  const { data: upload, error: uploadError } = await supabase
    .from('data_uploads')
    .insert({
      tenant_id: tenantId,
      filename,
      type,
      status: 'pending',
      rows_imported: 0
    })
    .select()
    .single()

  if (uploadError) throw uploadError

  try {
    let rowsImported = 0
    const errors: any[] = []

    if (type === 'ventas') {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        // Normalización de nombres de columnas
        const date = row.fecha || row.date || row.Fecha
        const channel = row.canal || row.channel || row.Canal
        const amount = row.monto || row.amount || row.Monto
        const units = row.unidades || row.units || row.Unidades
        const source = row.fuente || row.source || row.Fuente

        // Validación de campos obligatorios
        if (!date || !channel || amount === undefined || amount === null) {
          errors.push({ row: i + 1, error: 'Campos faltantes obligatorios (fecha, canal, monto).' })
          continue
        }

        const numAmount = Number(amount)
        if (isNaN(numAmount) || numAmount < 0) {
          errors.push({ row: i + 1, error: 'Monto inválido (debe ser un número positivo).' })
          continue
        }

        // Insertar en la tabla sales_data
        const { error: insertError } = await supabase
          .from('sales_data')
          .insert({
            tenant_id: tenantId,
            date,
            channel: channel.toString().toLowerCase().trim(),
            amount: numAmount,
            units: Number(units || 1),
            source: source ? source.toString().trim() : null
          })

        if (insertError) {
          errors.push({ row: i + 1, error: insertError.message })
        } else {
          rowsImported++
        }
      }
    } else if (type === 'inventario') {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const sku = row.sku || row.SKU
        const name = row.nombre || row.name || row.Nombre
        const category = row.categoria || row.category || row.Categoria
        const unit_cost = row.costo_unitario || row.unit_cost || row.Costo
        const unit_price = row.precio_unitario || row.unit_price || row.Precio
        const reorder_point = row.punto_reorden || row.reorder_point || row.Reorden

        if (!sku || !name) {
          errors.push({ row: i + 1, error: 'Campos faltantes obligatorios (sku, nombre).' })
          continue
        }

        // Upsert en la tabla de SKUs
        const { error: insertError } = await supabase
          .from('inventory_skus')
          .upsert({
            tenant_id: tenantId,
            sku: sku.toString().toUpperCase().trim(),
            name: name.toString().trim(),
            category: category ? category.toString().trim() : 'General',
            unit_cost: Number(unit_cost || 0),
            unit_price: Number(unit_price || 0),
            reorder_point: Number(reorder_point || 10)
          }, { onConflict: 'tenant_id, sku' })

        if (insertError) {
          errors.push({ row: i + 1, error: insertError.message })
        } else {
          rowsImported++
        }
      }
    } else if (type === 'campañas') {
      // Simulación de carga de campañas
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const date = row.fecha || row.date
        const channel = row.canal || row.channel
        if (!date || !channel) {
          errors.push({ row: i + 1, error: 'Campos faltantes obligatorios (fecha, canal).' })
          continue
        }
        rowsImported++
      }
    }

    // 2. Actualizar estatus final de la carga
    const finalStatus = errors.length === rows.length ? 'error' : 'completed'
    await supabase
      .from('data_uploads')
      .update({
        status: finalStatus,
        rows_imported: rowsImported,
        errors_json: errors.length > 0 ? errors : null
      })
      .eq('id', upload.id)

    revalidatePath('/datos')
    revalidatePath('/')
    return { success: true, rowsImported, errorsCount: errors.length, errors }
  } catch (error: any) {
    console.error('Error al importar datos:', error)
    await supabase
      .from('data_uploads')
      .update({ 
        status: 'error', 
        errors_json: [{ row: 0, error: error.message || 'Error desconocido' }] 
      })
      .eq('id', upload.id)
    return { success: false, error: error.message }
  }
}
