package com.plataformacursos.api.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Instructor {
    @NotBlank(message = "El nombre del instructor es obligatorio")
    private String nombre;

    @NotBlank(message = "El correo del instructor es obligatorio")
    @Email(message = "El correo del instructor no es válido")
    private String correo;
}
