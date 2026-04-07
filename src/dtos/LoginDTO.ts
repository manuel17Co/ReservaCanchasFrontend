export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginResponse {
    token: string;
    mensaje: string;
    nombre: string; // Agregado
    correo: string; // Agregado
}