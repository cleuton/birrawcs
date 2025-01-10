use tracing_subscriber::EnvFilter;

pub fn init(log_level: Option<&str>) {
    // Configura o nível de log a partir do argumento ou da variável de ambiente
    let log_level = log_level.unwrap_or("info");
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::new(log_level))
        .init();

    tracing::info!("Logger configurado com nível: {}", log_level);
}
