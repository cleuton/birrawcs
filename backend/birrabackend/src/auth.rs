use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use tracing::{error, info};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // Identificador do usuário
    pub role: String, // Nível de acesso (ex.: "admin", "comum")
    pub exp: usize,   // Timestamp de expiração
}

pub struct JwtConfig {
    pub secret: String,
}

impl JwtConfig {
    pub fn new(secret: String) -> Self {
        info!("JWT Config inicializada com uma chave secreta.");
        Self { secret }
    }

    // Gerar um token JWT com nível de acesso
    pub fn generate_token(&self, user_id: &str, role: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let expiration = Utc::now() + Duration::hours(24);
        let claims = Claims {
            sub: user_id.to_owned(),
            role: role.to_owned(),
            exp: expiration.timestamp() as usize,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.secret.as_ref()),
        )
        .map_err(|e| {
            error!("Erro ao gerar o token JWT: {:?}", e); // Log do erro
            e
        })
    }

    // Validar e decodificar um token JWT
    pub fn validate_token(&self, token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.secret.as_ref()),
            &Validation::default(),
        )
        .map(|data| data.claims)
        .map_err(|e| {
            error!("Erro ao validar o token JWT: {:?}", e); // Log do erro
            e
        })
    }
}
