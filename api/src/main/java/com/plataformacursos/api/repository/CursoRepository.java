package com.plataformacursos.api.repository;

import com.plataformacursos.api.model.Curso;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/*Acceso a la coleccion cursos. Los metodos se convierten en consultas a partir de su nombre.*/

public interface CursoRepository extends MongoRepository<Curso, String>{
    List<Curso> findByCategoriaIgnoreCase(String categoria);

    List<Curso> findByNivelIgnoreCase(String nivel);

    List<Curso> findByCategoriaIgnoreCaseAndNivelIgnoreCase(String categoria, String nivel);
}
