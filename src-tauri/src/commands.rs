use chrono::{DateTime, Utc};
use tauri::State;
use uuid::Uuid;

use crate::db::Db;
use crate::error::AppError;

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

fn parse_datetime(value: &str) -> Result<DateTime<Utc>, AppError> {
    DateTime::parse_from_rfc3339(value)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(|e| AppError::Parse(e.to_string()))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_customer(
    db: State<'_, Db>,
    name: String,
    phone: String,
    address: Option<String>,
) -> Result<String, AppError> {
    let id = new_id();
    sqlx::query(
        "INSERT INTO customers (id, name, phone, address) VALUES (?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&name)
    .bind(&phone)
    .bind(&address)
    .execute(&*db)
    .await?;
    Ok(id)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_clothes_measurement(
    db: State<'_, Db>,
    customer_id: String,
    name: String,
    length: Option<f64>,
    sleeve: Option<f64>,
    shoulder: Option<f64>,
    armhole: Option<f64>,
    chest: Option<f64>,
    side: Option<f64>,
    skirt: Option<f64>,
    trousers: Option<f64>,
    leg_opening: Option<f64>,
    cuff: Option<f64>,
    sleeve_design: Option<String>,
    bottom: Option<f64>,
    neck: Option<f64>,
    pocket_top: Option<String>,
    pocket_side: Option<String>,
    skirt_design: Option<String>,
    trousers_design: Option<String>,
    trousers_pocket: Option<String>,
    button: Option<String>,
    stitching: Option<String>,
) -> Result<String, AppError> {
    let id = new_id();
    sqlx::query(
        "INSERT INTO clothes_measurements (
            id, customer_id, name, length, sleeve, shoulder, armhole, chest,
            side, skirt, trousers, leg_opening, cuff, sleeve_design, bottom,
            neck, pocket_top, pocket_side, skirt_design, trousers_design,
            trousers_pocket, button, stitching
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&customer_id)
    .bind(&name)
    .bind(length)
    .bind(sleeve)
    .bind(shoulder)
    .bind(armhole)
    .bind(chest)
    .bind(side)
    .bind(skirt)
    .bind(trousers)
    .bind(leg_opening)
    .bind(cuff)
    .bind(sleeve_design)
    .bind(bottom)
    .bind(neck)
    .bind(pocket_top)
    .bind(pocket_side)
    .bind(skirt_design)
    .bind(trousers_design)
    .bind(trousers_pocket)
    .bind(button)
    .bind(stitching)
    .execute(&*db)
    .await?;
    Ok(id)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_waistcoat_measurement(
    db: State<'_, Db>,
    customer_id: String,
    name: String,
    length: Option<f64>,
    shoulder: Option<f64>,
    side: Option<f64>,
    waist: Option<f64>,
    tureen: Option<f64>,
    armhole: Option<f64>,
    neck: Option<String>,
) -> Result<String, AppError> {
    let id = new_id();
    sqlx::query(
        "INSERT INTO waistcoat_measurements (
            id, customer_id, name, length, shoulder, side, waist, tureen,
            armhole, neck
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&customer_id)
    .bind(&name)
    .bind(length)
    .bind(shoulder)
    .bind(side)
    .bind(waist)
    .bind(tureen)
    .bind(armhole)
    .bind(neck)
    .execute(&*db)
    .await?;
    Ok(id)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_order(
    db: State<'_, Db>,
    customer_id: String,
    clothes_measurement_id: Option<String>,
    waistcoat_measurement_id: Option<String>,
    order_number: Option<String>,
    order_date: Option<String>,
    delivery_date: Option<String>,
    status: Option<String>,
    quantity: i64,
    total_cost: f64,
    notes: Option<String>,
) -> Result<String, AppError> {
    let id = new_id();
    let order_number = order_number
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| format!("ORD-{}", &id[..8]));

    let parsed_order_date = match order_date {
        Some(d) if !d.trim().is_empty() => Some(parse_datetime(&d)?),
        _ => None,
    };
    let parsed_delivery_date = match delivery_date {
        Some(d) if !d.trim().is_empty() => Some(parse_datetime(&d)?),
        _ => None,
    };

    let paid = 0.0;
    let unpaid = total_cost;

    sqlx::query(
        "INSERT INTO orders (
            id, customer_id, clothes_measurement_id, waistcoat_measurement_id,
            order_number, order_date, delivery_date, status,
            total_cost, paid, unpaid, quantity, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&customer_id)
    .bind(&clothes_measurement_id)
    .bind(&waistcoat_measurement_id)
    .bind(&order_number)
    .bind(parsed_order_date.map(|d| d.to_rfc3339()))
    .bind(parsed_delivery_date.map(|d| d.to_rfc3339()))
    .bind(&status)
    .bind(total_cost)
    .bind(paid)
    .bind(unpaid)
    .bind(quantity)
    .bind(&notes)
    .execute(&*db)
    .await?;

    Ok(id)
}
