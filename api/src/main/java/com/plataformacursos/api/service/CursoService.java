package com.plataformacursos.api.service;

import com.plataformacursos.api.exception.CursoException;
import com.plataformacursos.api.model.Curso;
import com.plataformacursos.api.repository.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/** Lógica del CRUD de cursos: apoya en los métodos de Spring Data y agrega solo las reglas necesarias. */
@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository repository;

    /** Consulta general. */
    public List<Curso> listar() {
        return repository.findAll();
    }

    /** Consulta específica. Lanza CursoException si no existe. */
    public Curso buscarPorId(String id) {
        return repository.findById(id).orElseThrow(() -> new CursoException(id));
    }

    /** Consulta filtrada por categoría y/o nivel (ambos opcionales). Sin filtros devuelve todo. */
    public List<Curso> filtrar(String categoria, String nivel) {
        boolean porCategoria = StringUtils.hasText(categoria);
        boolean porNivel = StringUtils.hasText(nivel);

        if (porCategoria && porNivel) {
            return repository.findByCategoriaIgnoreCaseAndNivelIgnoreCase(categoria.trim(), nivel.trim());
        }
        if (porCategoria) {
            return repository.findByCategoriaIgnoreCase(categoria.trim());
        }
        if (porNivel) {
            return repository.findByNivelIgnoreCase(nivel.trim());
        }
        return repository.findAll();
    }

    /** Registro. Se descarta cualquier id recibido para que Mongo genere uno nuevo. */
    public Curso crear(Curso curso) {
        curso.setId(null);
        return repository.save(normalizar(curso));
    }

    /**
     * Update. Se verifica antes que exista
     * save() insertaría un documento nuevo si el id no se encuentra. Manda el id de la URL.
     */
    public Curso actualizar(String id, Curso curso) {
        verificarExistencia(id);
        curso.setId(id);
        return repository.save(normalizar(curso));
    }

    /** Delete. deleteById no falla si el id no existe, por eso se verifica antes. */
    public void eliminar(String id) {
        verificarExistencia(id);
        repository.deleteById(id);
    }

    private void verificarExistencia(String id) {
        if (!repository.existsById(id)) {
            throw new CursoException(id);
        }
    }

    /**
     * Limpia espacios y evita etiquetas nulas.
     */
    private Curso normalizar(Curso curso) {
        curso.setTitulo(curso.getTitulo().trim());
        curso.setCategoria(curso.getCategoria().trim());
        if (curso.getEtiquetas() == null) {
            curso.setEtiquetas(new ArrayList<>());
        }
        return curso;
    }
}