import { invoke } from "@tauri-apps/api/core"

export interface CreateCustomerInput {
  name: string
  phone: string
  address?: string
}

export async function createCustomer(
  input: CreateCustomerInput
): Promise<string> {
  return invoke<string>("create_customer", input as unknown as Record<string, unknown>)
}

export interface ClothesMeasurementInput {
  customer_id: string
  name: string
  length?: number
  sleeve?: number
  shoulder?: number
  armhole?: number
  chest?: number
  side?: number
  skirt?: number
  trousers?: number
  leg_opening?: number
  cuff?: number
  sleeve_design?: string
  bottom?: number
  neck?: number
  pocket_top?: string
  pocket_side?: string
  skirt_design?: string
  trousers_design?: string
  trousers_pocket?: string
  button?: string
  stitching?: string
}

export function createClothesMeasurement(
  input: ClothesMeasurementInput
): Promise<string> {
  return invoke<string>(
    "create_clothes_measurement",
    input as unknown as Record<string, unknown>
  )
}

export interface WaistcoatMeasurementInput {
  customer_id: string
  name: string
  length?: number
  shoulder?: number
  side?: number
  waist?: number
  tureen?: number
  armhole?: number
  neck?: string
}

export function createWaistcoatMeasurement(
  input: WaistcoatMeasurementInput
): Promise<string> {
  return invoke<string>(
    "create_waistcoat_measurement",
    input as unknown as Record<string, unknown>
  )
}

export interface CreateOrderInput {
  customer_id: string
  clothes_measurement_id?: string
  waistcoat_measurement_id?: string
  order_number?: string
  order_date?: string
  delivery_date?: string
  status?: string
  quantity?: number
  unit_price?: number
  paid?: number
  total_cost: number
  notes?: string
}

export function createOrder(input: CreateOrderInput): Promise<string> {
  return invoke<string>("create_order", input as unknown as Record<string, unknown>)
}
