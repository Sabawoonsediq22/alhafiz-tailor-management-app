use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use std::path::Path;

pub type Db = SqlitePool;

pub async fn init(db_path: &Path) -> anyhow::Result<Db> {
    let opts = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true)
        // PRAGMA foreign_keys must be set per-connection and cannot be
        // changed inside a transaction, so it is enabled here rather than
        // in a migration file.
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new().connect_with(opts).await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}
