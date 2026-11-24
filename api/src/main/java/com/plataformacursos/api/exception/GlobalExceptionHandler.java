package com.plataformacursos.api.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Convierte las excepciones en respuestas HTTP con el código correcto
 *Evita utilizar trycatch en los endpoints
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Cuerpo de error. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ApiError(LocalDateTime timestamp, int status, String mensaje, Map<String, String> errores) {
    }

    /** Curso inexistente */
    @ExceptionHandler(CursoException.class)
    public ResponseEntity<ApiError> manejarNoEncontrado(CursoException ex) {
        return construir(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    /** Falla de @Valid -> 400 con un mensaje por campo. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errores.merge(error.getField(), error.getDefaultMessage(), (a, b) -> a + "; " + b));
        return construir(HttpStatus.BAD_REQUEST, "Los datos enviados no son válidos", errores);
    }

    /** JSON mal formado o con tipos incorrectos -> 400. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> manejarJsonInvalido(HttpMessageNotReadableException ex) {
        return construir(HttpStatus.BAD_REQUEST,
                "El cuerpo de la petición no es un JSON válido o contiene tipos de datos incorrectos", null);
    }

    private ResponseEntity<ApiError> construir(HttpStatus status, String mensaje, Map<String, String> errores) {
        ApiError cuerpo = new ApiError(LocalDateTime.now(), status.value(), mensaje, errores);
        return ResponseEntity.status(status).body(cuerpo);
    }
}