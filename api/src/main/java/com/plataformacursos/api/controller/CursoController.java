package com.plataformacursos.api.controller;

import com.plataformacursos.api.model.Curso;
import com.plataformacursos.api.service.CursoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Endpoints REST del recurso Cursos. */
@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService service;

    /** consulta general. */
    @GetMapping
    public List<Curso> listar() {
        return service.listar();
    }

    /** consulta filtrada */
    @GetMapping("/filtrar")
    public List<Curso> filtrar(@RequestParam(required = false) String categoria,
                               @RequestParam(required = false) String nivel) {
        return service.filtrar(categoria, nivel);
    }

    /** consulta específica. */
    @GetMapping("/{id}")
    public Curso buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id);
    }

    /* Insercion */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Curso crear(@Valid @RequestBody Curso curso) {
        return service.crear(curso);
    }

    /**  Update */
    @PutMapping("/{id}")
    public Curso actualizar(@PathVariable String id, @Valid @RequestBody Curso curso) {
        return service.actualizar(id, curso);
    }

    /** Delete por id */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable String id) {
        service.eliminar(id);
    }
}