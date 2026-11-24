package com.plataformacursos.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "cursos")
public class Curso {
    /** Lo asigna Mongo al crear; el servicio ignora cualquier id que envíe el cliente. */
    @Id
    private String id;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 120, message = "El título no debe exceder 120 caracteres")
    private String titulo;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    @NotBlank(message = "El nivel es obligatorio")
    @Pattern(regexp = "Principiante|Intermedio|Avanzado",
            message = "El nivel debe ser Principiante, Intermedio o Avanzado")
    private String nivel;

    @NotNull(message = "La duración es obligatoria")
    @Positive(message = "La duración debe ser mayor a 0")
    @Field("duracion_horas")
    @JsonProperty("duracion_horas")
    private Integer duracionHoras;

    @NotNull(message = "El precio es obligatorio")
    @PositiveOrZero(message = "El precio no puede ser negativo")
    @Field("precio_mxn")
    @JsonProperty("precio_mxn")
    private Double precioMxn;

    @NotNull(message = "La calificación es obligatoria")
    @DecimalMin(value = "0.0", message = "La calificación mínima es 0")
    @DecimalMax(value = "5.0", message = "La calificación máxima es 5")
    private Double calificacion;

    @NotNull(message = "Los estudiantes inscritos son obligatorios")
    @PositiveOrZero(message = "Los estudiantes inscritos no pueden ser negativos")
    @Field("estudiantes_inscritos")
    @JsonProperty("estudiantes_inscritos")
    private Integer estudiantesInscritos;

    @NotNull(message = "El campo activo es obligatorio")
    private Boolean activo;

    @NotNull(message = "El instructor es obligatorio")
    @Valid
    private Instructor instructor;

    private List<String> etiquetas = new ArrayList<>();
}
