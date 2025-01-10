use std::sync::Arc;
use sqlx::PgPool;
use crate::models::{NovoUsuario, Usuario};
use crate::persistence::{inserir_usuario, ler_usuarios, ler_usuario_por_id};

pub async fn criar_usuario(pool: Arc<PgPool>, novo_usuario: NovoUsuario) -> Result<Usuario, String> {
    inserir_usuario(&pool, novo_usuario)
        .await
        .map_err(|e| {
            let msg = "Erro ao inserir usuário: ";
            tracing::error!("{}{:?}", msg, e);
            format!("{}{:?}", msg, e)
        })
}

pub async fn obter_usuarios(pool: Arc<PgPool>) -> Result<Vec<Usuario>, String> {
    ler_usuarios(&pool)
        .await
        .map_err(|e| {
            let msg = "Erro ao obter usuários: ";
            tracing::error!("{}{:?}", msg, e);
            format!("{}{:?}", msg, e)
        })
}

pub async fn obter_usuario(pool: Arc<PgPool>, id_usuario: i32) -> Result<Usuario, String> {
    ler_usuario_por_id(&pool, id_usuario)
        .await
        .map_err(|e| {
            let msg = "Erro ao obter usuários: ";
            tracing::debug!("{}{:?}", msg, e);            
            format!("{}{:?}", msg, e)
        })
}
