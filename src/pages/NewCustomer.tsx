"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useForm, type Control, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  User,
  Phone,
  MapPin,
  Ruler,
  Scissors,
  ShoppingBag,
  Receipt,
  StickyNote,
  ClipboardList,
  X,
  Save,
  Plus,
  CalendarDays,
  BadgeCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  createCustomer,
  createClothesMeasurement,
  createWaistcoatMeasurement,
  createOrder,
} from "@/lib/api"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

const CURRENCY = "AFN"

const ORDER_STATUSES = [
  "Pending",
  "In Progress",
  "Ready",
  "Delivered",
  "Cancelled",
] as const

const MEASUREMENT_TYPES = ["clothes", "waistcoat"] as const

type StatusVariant = "default" | "warning" | "success" | "secondary" | "destructive"

const STATUS_VARIANT: Record<(typeof ORDER_STATUSES)[number], StatusVariant> = {
  Pending: "warning",
  "In Progress": "default",
  Ready: "secondary",
  Delivered: "success",
  Cancelled: "destructive",
}

const numberField = (required = false, label = "Value") =>
  z
    .string()
    .optional()
    .refine((val) => !required || (val !== undefined && val.trim() !== ""), {
      message: required ? `${label} is required` : undefined,
    })
    .refine(
      (val) =>
        val === undefined || val.trim() === "" || !Number.isNaN(Number(val)),
      { message: "Enter a valid number" }
    )

const clothesSchema = z.object({
  name: z.string().min(1, "Measurement name is required"),
  length: numberField(),
  sleeve: numberField(),
  shoulder: numberField(),
  armhole: numberField(),
  chest: numberField(),
  side: numberField(),
  skirt: numberField(),
  trousers: numberField(),
  legOpening: numberField(),
  cuff: numberField(),
  bottom: numberField(),
  neck: numberField(),
  sleeveDesign: z.string().optional(),
  pocketTop: z.string().optional(),
  pocketSide: z.string().optional(),
  skirtDesign: z.string().optional(),
  trousersDesign: z.string().optional(),
  trousersPocket: z.string().optional(),
  button: z.string().optional(),
  stitching: z.string().optional(),
})

const waistcoatSchema = z.object({
  name: z.string().min(1, "Measurement name is required"),
  length: numberField(),
  shoulder: numberField(),
  side: numberField(),
  waist: numberField(),
  tureen: numberField(),
  armhole: numberField(),
  neck: z.string().optional(),
})

const formSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().optional(),
  }),
  clothes: clothesSchema,
  waistcoat: waistcoatSchema,
  order: z.object({
    orderNumber: z.string().optional(),
    orderDate: z.date({ error: "Order date is required" }),
    deliveryDate: z.date().optional(),
    status: z.enum(ORDER_STATUSES),
    measurementType: z.enum(MEASUREMENT_TYPES),
    totalCost: numberField(true, "Total cost"),
    advancePayment: numberField(false, "Advance payment"),
  }),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const CLOTHES_NUMERIC: { name: keyof z.infer<typeof clothesSchema>; label: string }[] = [
  { name: "length", label: "Length" },
  { name: "sleeve", label: "Sleeve" },
  { name: "shoulder", label: "Shoulder" },
  { name: "armhole", label: "Armhole" },
  { name: "chest", label: "Chest" },
  { name: "side", label: "Side" },
  { name: "skirt", label: "Skirt" },
  { name: "trousers", label: "Trousers" },
  { name: "legOpening", label: "Leg Opening" },
  { name: "cuff", label: "Cuff" },
  { name: "bottom", label: "Bottom" },
  { name: "neck", label: "Neck" },
]

const CLOTHES_DESIGN: { name: keyof z.infer<typeof clothesSchema>; label: string }[] = [
  { name: "sleeveDesign", label: "Sleeve Design" },
  { name: "pocketTop", label: "Pocket Top" },
  { name: "pocketSide", label: "Pocket Side" },
  { name: "skirtDesign", label: "Skirt Design" },
  { name: "trousersDesign", label: "Trousers Design" },
  { name: "trousersPocket", label: "Trousers Pocket" },
  { name: "button", label: "Button" },
  { name: "stitching", label: "Stitching" },
]

const WAISTCOAT_NUMERIC: { name: keyof z.infer<typeof waistcoatSchema>; label: string }[] = [
  { name: "length", label: "Length" },
  { name: "shoulder", label: "Shoulder" },
  { name: "side", label: "Side" },
  { name: "waist", label: "Waist" },
  { name: "tureen", label: "Tureen" },
  { name: "armhole", label: "Armhole" },
]

const WAISTCOAT_DESIGN: { name: keyof z.infer<typeof waistcoatSchema>; label: string }[] = [
  { name: "neck", label: "Neck" },
]

function SectionLabel({
  icon: Icon,
  children,
  required,
}: {
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <span className="text-sm font-medium">{children}</span>
      {required && <span className="text-destructive">*</span>}
    </div>
  )
}

function NumberInput<N extends FieldPath<FormValues>>({
  control,
  name,
  label,
}: {
  control: Control<FormValues>
  name: N
  label: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <SectionLabel>{label}</SectionLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="0"
              aria-label={label}
              value={field.value == null ? "" : (field.value as string)}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function TextInput<N extends FieldPath<FormValues>>({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<FormValues>
  name: N
  label: string
  placeholder?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <SectionLabel>{label}</SectionLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              aria-label={label}
              value={field.value == null ? "" : (field.value as string)}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default function NewCustomer() {
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      customer: { name: "", phone: "", address: "" },
      clothes: {
        name: "",
        length: "",
        sleeve: "",
        shoulder: "",
        armhole: "",
        chest: "",
        side: "",
        skirt: "",
        trousers: "",
        legOpening: "",
        cuff: "",
        bottom: "",
        neck: "",
        sleeveDesign: "",
        pocketTop: "",
        pocketSide: "",
        skirtDesign: "",
        trousersDesign: "",
        trousersPocket: "",
        button: "",
        stitching: "",
      },
      waistcoat: {
        name: "",
        length: "",
        shoulder: "",
        side: "",
        waist: "",
        tureen: "",
        armhole: "",
        neck: "",
      },
      order: {
        orderNumber: "",
        orderDate: new Date(),
        deliveryDate: undefined,
        status: "Pending",
        measurementType: "clothes",
        totalCost: "",
        advancePayment: "",
      },
      notes: "",
    },
  })

  const { control, handleSubmit, watch, reset } = form

  const values = watch()

  const totalCost = Number(values.order.totalCost) || 0
  const advancePayment = Number(values.order.advancePayment) || 0
  const balanceDue = Math.max(totalCost - advancePayment, 0)

  const onSubmit = async (data: FormValues) => {
    const toOptNumber = (value: string | undefined) => {
      const trimmed = (value ?? "").trim()
      if (trimmed === "") return undefined
      const parsed = Number(trimmed)
      return Number.isNaN(parsed) ? undefined : parsed
    }

    try {
      const customerId = await createCustomer({
        name: data.customer.name,
        phone: data.customer.phone,
        address: data.customer.address?.trim() || undefined,
      })

      let clothesMeasurementId: string | undefined
      if (data.clothes.name.trim()) {
        clothesMeasurementId = await createClothesMeasurement({
          customer_id: customerId,
          name: data.clothes.name,
          length: toOptNumber(data.clothes.length),
          sleeve: toOptNumber(data.clothes.sleeve),
          shoulder: toOptNumber(data.clothes.shoulder),
          armhole: toOptNumber(data.clothes.armhole),
          chest: toOptNumber(data.clothes.chest),
          side: toOptNumber(data.clothes.side),
          skirt: toOptNumber(data.clothes.skirt),
          trousers: toOptNumber(data.clothes.trousers),
          leg_opening: toOptNumber(data.clothes.legOpening),
          cuff: toOptNumber(data.clothes.cuff),
          sleeve_design: data.clothes.sleeveDesign?.trim() || undefined,
          bottom: toOptNumber(data.clothes.bottom),
          neck: toOptNumber(data.clothes.neck),
          pocket_top: data.clothes.pocketTop?.trim() || undefined,
          pocket_side: data.clothes.pocketSide?.trim() || undefined,
          skirt_design: data.clothes.skirtDesign?.trim() || undefined,
          trousers_design: data.clothes.trousersDesign?.trim() || undefined,
          trousers_pocket: data.clothes.trousersPocket?.trim() || undefined,
          button: data.clothes.button?.trim() || undefined,
          stitching: data.clothes.stitching?.trim() || undefined,
        })
      }

      let waistcoatMeasurementId: string | undefined
      if (data.waistcoat.name.trim()) {
        waistcoatMeasurementId = await createWaistcoatMeasurement({
          customer_id: customerId,
          name: data.waistcoat.name,
          length: toOptNumber(data.waistcoat.length),
          shoulder: toOptNumber(data.waistcoat.shoulder),
          side: toOptNumber(data.waistcoat.side),
          waist: toOptNumber(data.waistcoat.waist),
          tureen: toOptNumber(data.waistcoat.tureen),
          armhole: toOptNumber(data.waistcoat.armhole),
          neck: data.waistcoat.neck?.trim() || undefined,
        })
      }

      await createOrder({
        customer_id: customerId,
        clothes_measurement_id: clothesMeasurementId,
        waistcoat_measurement_id: waistcoatMeasurementId,
        order_number: data.order.orderNumber?.trim() || undefined,
        order_date: data.order.orderDate.toISOString(),
        delivery_date: data.order.deliveryDate?.toISOString(),
        status: data.order.status,
        advance_payment: Number(data.order.advancePayment) || 0,
        total_cost: Number(data.order.totalCost) || 0,
        notes: data.notes?.trim() || undefined,
      })

      toast.success("Customer registered", {
        description: `${data.customer.name} and their first order have been saved.`,
      })
      navigate("/customers")
    } catch (error) {
      toast.error("Could not save customer", {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const onError = () => {
    toast.error("Please fix the highlighted fields", {
      description: "Some required information is missing or invalid.",
    })
  }

  const handleCancel = () => {
    reset()
    navigate("/customers")
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New Customer
        </h1>
        <p className="text-sm text-muted-foreground">
          Register customer and create first order
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="grid gap-6 lg:grid-cols-[1fr_340px]"
        >
          <div className="flex flex-col gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>
                      Basic contact details for the new customer.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="customer.name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <SectionLabel icon={User} required>
                          Customer Name
                        </SectionLabel>
                        <FormControl>
                          <Input
                            autoFocus
                            aria-label="Customer name"
                            placeholder="e.g. Ahmad Khan"
                            value={field.value == null ? "" : (field.value as string)}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="customer.phone"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <SectionLabel icon={Phone} required>
                          Phone Number
                        </SectionLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            aria-label="Phone number"
                            placeholder="e.g. 0700 123 456"
                            value={field.value == null ? "" : (field.value as string)}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="customer.address"
                  render={({ field }) => (
                    <FormItem>
                      <SectionLabel icon={MapPin}>Address</SectionLabel>
                      <FormControl>
                        <Input
                          aria-label="Address"
                          placeholder="e.g. District 3, Kabul"
                          value={field.value == null ? "" : (field.value as string)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Ruler className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle>Measurements</CardTitle>
                    <CardDescription>
                      Record body measurements for this customer.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="clothes" className="flex flex-col gap-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="clothes">
                      <Scissors className="h-4 w-4" />
                      Clothes
                    </TabsTrigger>
                    <TabsTrigger value="waistcoat">
                      <Scissors className="h-4 w-4" />
                      Waistcoat
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="clothes" className="grid gap-4">
                    <FormField
                      control={control}
                      name="clothes.name"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <SectionLabel icon={Plus} required>
                            Measurement Name
                          </SectionLabel>
                          <FormControl>
                            <Input
                              aria-label="Clothes measurement name"
                              placeholder="e.g. Wedding outfit 2026"
                              value={field.value == null ? "" : (field.value as string)}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {CLOTHES_NUMERIC.map((f) => (
                        <NumberInput
                          key={f.name}
                          control={control}
                          name={`clothes.${f.name}`}
                          label={f.label}
                        />
                      ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {CLOTHES_DESIGN.map((f) => (
                        <TextInput
                          key={f.name}
                          control={control}
                          name={`clothes.${f.name}`}
                          label={f.label}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="waistcoat" className="grid gap-4">
                    <FormField
                      control={control}
                      name="waistcoat.name"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <SectionLabel icon={Plus} required>
                            Measurement Name
                          </SectionLabel>
                          <FormControl>
                            <Input
                              aria-label="Waistcoat measurement name"
                              placeholder="e.g. Wedding waistcoat 2026"
                              value={field.value == null ? "" : (field.value as string)}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {WAISTCOAT_NUMERIC.map((f) => (
                        <NumberInput
                          key={f.name}
                          control={control}
                          name={`waistcoat.${f.name}`}
                          label={f.label}
                        />
                      ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {WAISTCOAT_DESIGN.map((f) => (
                        <TextInput
                          key={f.name}
                          control={control}
                          name={`waistcoat.${f.name}`}
                          label={f.label}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Order & Billing */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle>Order &amp; Billing</CardTitle>
                    <CardDescription>
                      Configure the first order and its billing details.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="order.orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel icon={ClipboardList}>
                          Order Number
                        </SectionLabel>
                        <FormControl>
                          <Input
                            aria-label="Order number"
                            placeholder="Auto-generated if empty"
                            value={field.value == null ? "" : (field.value as string)}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="order.measurementType"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel icon={Ruler}>
                          Measurement Type
                        </SectionLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full" aria-label="Measurement type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clothes">Clothes</SelectItem>
                            <SelectItem value="waistcoat">Waistcoat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="order.orderDate"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <SectionLabel icon={CalendarDays} required>
                          Order Date
                        </SectionLabel>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pick order date"
                          id={field.name}
                          aria-invalid={!!fieldState.error}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="order.deliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <SectionLabel icon={CalendarDays}>
                          Delivery Date
                        </SectionLabel>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pick delivery date"
                          id={field.name}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="order.status"
                  render={({ field }) => (
                    <FormItem>
                      <SectionLabel icon={BadgeCheck}>Status</SectionLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full" aria-label="Order status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="order.totalCost"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <SectionLabel icon={Receipt} required>
                          Total Cost
                        </SectionLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              aria-label="Total cost"
                              placeholder="0"
                              className="pe-14"
                              value={field.value == null ? "" : (field.value as string)}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              aria-invalid={!!fieldState.error}
                            />
                            <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground">
                              {CURRENCY}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="order.advancePayment"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <SectionLabel icon={Receipt}>
                          Advance Payment
                        </SectionLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              aria-label="Advance payment"
                              placeholder="0"
                              className="pe-14"
                              value={field.value == null ? "" : (field.value as string)}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              aria-invalid={!!fieldState.error}
                            />
                            <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground">
                              {CURRENCY}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <StickyNote className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle>Order Notes</CardTitle>
                    <CardDescription>
                      Any extra details for this order.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          rows={4}
                          aria-label="Order notes"
                          placeholder="Special instructions, design notes, delivery notes..."
                          value={field.value == null ? "" : (field.value as string)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/40">
                <CardTitle className="text-base">Customer Summary</CardTitle>
                <CardDescription>Live preview of the new record.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {values.customer.name || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {values.customer.phone || "—"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-medium">
                      {values.order.orderNumber || "Auto"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={STATUS_VARIANT[values.order.status]}>
                      {values.order.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-medium">
                      {totalCost.toLocaleString()} {CURRENCY}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Advance</span>
                    <span className="font-medium">
                      {advancePayment.toLocaleString()} {CURRENCY}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Balance Due</span>
                    <span className="font-semibold text-primary">
                      {balanceDue.toLocaleString()} {CURRENCY}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Delivery Date</span>
                  <span className="font-medium">
                    {values.order.deliveryDate
                      ? format(values.order.deliveryDate, "PP")
                      : "—"}
                  </span>
                </div>
              </CardContent>
              <div className="flex items-center gap-2 border-t border-border p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4" />
                  Save Customer
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
