#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub struct Certificate {
    pub student_name: String,
    pub course_name: String,
    pub cert_hash: String,
    pub issuer: Address,
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Certificate(String),
}

#[contract]
pub struct EduCertContract;

#[contractimpl]
impl EduCertContract {
    pub fn issue_certificate(
        env: Env,
        issuer: Address,
        cert_id: String,
        student_name: String,
        course_name: String,
        cert_hash: String,
    ) -> Symbol {
        issuer.require_auth();

        let cert = Certificate {
            student_name,
            course_name,
            cert_hash,
            issuer,
            active: true,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Certificate(cert_id), &cert);

        symbol_short!("ISSUED")
    }

    pub fn verify_certificate(env: Env, cert_id: String) -> bool {
        let cert: Option<Certificate> = env
            .storage()
            .persistent()
            .get(&DataKey::Certificate(cert_id));

        match cert {
            Some(c) => c.active,
            None => false,
        }
    }

    pub fn get_certificate(env: Env, cert_id: String) -> Option<Certificate> {
        env.storage()
            .persistent()
            .get(&DataKey::Certificate(cert_id))
    }

    pub fn revoke_certificate(env: Env, issuer: Address, cert_id: String) -> Symbol {
        issuer.require_auth();

        let mut cert: Certificate = env
            .storage()
            .persistent()
            .get(&DataKey::Certificate(cert_id.clone()))
            .unwrap();

        if cert.issuer != issuer {
            panic!("Only issuer can revoke");
        }

        cert.active = false;

        env.storage()
            .persistent()
            .set(&DataKey::Certificate(cert_id), &cert);

        symbol_short!("REVOKED")
    }
}