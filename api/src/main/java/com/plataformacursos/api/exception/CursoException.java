package com.plataformacursos.api.exception;

/** Se lanza cuando no existe un curso con el id solicitado La clase global lo convierte en respuesta 404. */
public class CursoException extends RuntimeException {

    public CursoException(String id) {
        super("No existe un curso con el id: " + id);
    }
}