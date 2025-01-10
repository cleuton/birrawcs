use serde::{Deserialize, Serialize};

#[derive(Serialize, sqlx::FromRow)]
pub struct Usuario {
    pub id: i32,
    pub nome: String,
    pub email: String,
    pub ativo: Option<bool>,
}

#[derive(Deserialize)]
pub struct NovoUsuario {
    pub nome: String,
    pub email: String,
}

