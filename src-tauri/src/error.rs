use thiserror::Error;

/// Errors surfaced from Tauri commands to the frontend.
///
/// Implements `serde::Serialize` manually so the error message is returned
/// as a plain JSON string that the frontend can display.
#[derive(Debug, Error)]
pub enum AppError {
    #[error("database error: {0}")]
    Db(#[from] sqlx::Error),

    #[error("invalid date: {0}")]
    Parse(String),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
