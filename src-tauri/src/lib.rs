use std::sync::Arc;

use tauri::Manager;

mod db;
mod error;
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // On Windows, app_config_dir() resolves to %APPDATA%
            // (C:\Users\<user>\AppData\Roaming), so the database is stored
            // in the requested Roaming directory.
            let dir = app
                .path()
                .app_config_dir()
                .expect("failed to resolve app config dir");
            std::fs::create_dir_all(&dir).expect("failed to create app data dir");
            let db_path = dir.join("app.db");

            let pool = tauri::async_runtime::block_on(db::init(&db_path))
                .expect("failed to initialize database");
            app.manage(Arc::new(pool));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_customer,
            commands::create_clothes_measurement,
            commands::create_waistcoat_measurement,
            commands::create_order,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
