use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use anyhow::Result;
use axum::Server;   

mod logger;
mod routes;
mod service;
mod persistence;
mod models;

#[tokio::main]
async fn main()  -> Result<()> {
    // Carregar variáveis de ambiente
    dotenv().ok();
    
    // Configura o nível de log com base na variável LOG_LEVEL
    let log_level: Option<String> = std::env::var("LOG_LEVEL").ok(); 
    logger::init(log_level.as_deref());

    // Obter URL do banco do arquivo .env
    let database_url = std::env::var("DATABASE_URL")
        .map_err(|_| anyhow::anyhow!("DATABASE_URL não configurado"))?;

    // Criar pool de conexões
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .map_err(|e| {
            tracing::error!("Erro ao conectar no banco de dados: {:?}", e);
            anyhow::anyhow!(e)
        })?;

    // Configurar rotas
    let app = routes::criar_rotas(pool);

    // Inicializar servidor
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    tracing::info!("Servidor rodando em {}", addr);
    Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

    Ok(())
}
