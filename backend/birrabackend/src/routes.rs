use axum::{http::StatusCode, 
    routing::get, 
    routing::post, 
    Router,
    extract::Path,
    extract::State, 
    Json, 
    response::IntoResponse};
use sqlx::PgPool;
use std::sync::Arc;
use crate::models::NovoUsuario;
use crate::service;
use serde::Serialize;

#[derive(Serialize)]
struct ErrorResponse {
    message: String,
}


pub fn criar_rotas(pool: PgPool) -> Router {
    let shared_pool = Arc::new(pool);

    Router::new()
        .route("/usuario", post(novo_usuario).get(get_usuarios))
        .route("/usuario/:id", get(get_usuario))
        .with_state(shared_pool) // Configura o estado compartilhado
}

pub async fn novo_usuario(
    State(pool): State<Arc<PgPool>>,
    Json(payload): Json<NovoUsuario>,
) -> impl IntoResponse {
    match service::criar_usuario(pool, payload).await {
        Ok(usuario) => {
            let response = (StatusCode::CREATED, Json(usuario));
            response.into_response()
        }
        Err(_) => {
            let response = (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    message: "Erro ao criar usuário, talvez já exista".to_string(),
                }),
            );
            response.into_response()
        }
    }
}

async fn get_usuarios(
    State(pool): State<Arc<PgPool>>,
) -> impl IntoResponse {
    match service::obter_usuarios(pool).await {
        Ok(usuarios) => Json(usuarios).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                message: "Erro ao buscar usuários".to_string(),
            }),
        ).into_response(),
    }
}

async fn get_usuario(
    State(pool): State<Arc<PgPool>>,
    Path(id_usuario): Path<i32>,
) -> impl IntoResponse {
    match service::obter_usuario(pool, id_usuario).await {
        Ok(usuario) => Json(usuario).into_response(),
        Err(_) => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                message: "Usuário não encontrado".to_string(),
            }),
            )
            .into_response(),
    }
}
