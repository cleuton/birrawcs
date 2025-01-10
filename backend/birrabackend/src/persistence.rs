use sqlx::{query_as, PgPool};
use crate::models::{NovoUsuario, Usuario};

pub async fn inserir_usuario(pool: &PgPool, novo_usuario: NovoUsuario) -> Result<Usuario, sqlx::Error> {
    let usuario = sqlx::query_as!(
        Usuario,
        r#"
        INSERT INTO usuario (nome, email)
        VALUES ($1, $2)
        RETURNING id, nome, email, ativo as "ativo: bool"
        "#,
        novo_usuario.nome,
        novo_usuario.email
    )
    .fetch_one(pool)
    .await?;

    Ok(usuario)
}

pub async fn ler_usuarios(pool: &PgPool) -> Result<Vec<Usuario>, sqlx::Error> {
    let usuarios = query_as!(
        Usuario,
        r#"
        SELECT id, nome, email, ativo
        FROM usuario
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(usuarios)
}

pub async fn ler_usuario_por_id(pool: &PgPool, id_usuario: i32) -> Result<Usuario, sqlx::Error> {
    let usuario = query_as!(
        Usuario,
        r#"
        SELECT id, nome, email, ativo
        FROM usuario
        WHERE id = $1
        "#,
        id_usuario
    )
    .fetch_one(pool)
    .await?;

    Ok(usuario)
}
