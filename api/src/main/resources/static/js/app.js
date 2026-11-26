import {cursosApi} from "./api.js";

/* ---------- Referencias al DOM ---------- */
const $ = (id) => document.getElementById(id);

const tabla = $("tabla-cursos");
const contador = $("contador");
const mensaje = $("mensaje");
const formFiltros = $("form-filtros");
const filtroTitulo = $("filtro-titulo");
const filtroCategoria = $("filtro-categoria");
const filtroNivel = $("filtro-nivel");
const listaCategorias = $("lista-categorias");
const dialogo = $("dialogo-curso");
const formCurso = $("form-curso");
const tituloDialogo = $("titulo-dialogo");
const erroresForm = $("errores-form");
const btnGuardar = $("btn-guardar");

const campos = {
    titulo: $("campo-titulo"),
    categoria: $("campo-categoria"),
    nivel: $("campo-nivel"),
    duracion: $("campo-duracion"),
    precio: $("campo-precio"),
    calificacion: $("campo-calificacion"),
    inscritos: $("campo-inscritos"),
    activo: $("campo-activo"),
    instructorNombre: $("campo-instructor-nombre"),
    instructorCorreo: $("campo-instructor-correo"),
    etiquetas: $("campo-etiquetas"),
};

// La API devuelve los errores con el nombre Java del campo; aquí se traducen a texto legible
const nombresCampos = {
    titulo: "Título",
    categoria: "Categoría",
    nivel: "Nivel",
    duracionHoras: "Duración",
    precioMxn: "Precio",
    calificacion: "Calificación",
    estudiantesInscritos: "Estudiantes inscritos",
    activo: "Activo",
    instructor: "Instructor",
    "instructor.nombre": "Nombre del instructor",
    "instructor.correo": "Correo del instructor",
};

const formatoMoneda = new Intl.NumberFormat("es-MX", {style: "currency", currency: "MXN"});

let cursoEditandoId = null; // null = creando; con valor = editando ese curso
let temporizadorMensaje = null;

/* ---------- Mensajes ---------- */
function mostrarMensaje(texto, tipo = "exito") {
    clearTimeout(temporizadorMensaje);
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.hidden = false;
    temporizadorMensaje = setTimeout(() => (mensaje.hidden = true), 5000);
}

function esIdMongoDB(texto) {
    return /^[a-f\d]{24}$/i.test(texto);
}

/* ---------- Carga de datos ---------- */
async function cargarCursos() {
    const categoria = filtroCategoria.value;
    const nivel = filtroNivel.value;
    const busqueda = filtroTitulo.value.trim();

    try {
        // Si tiene 24 caracteres hexadecimales, se consulta directamente por ID.
        if (esIdMongoDB(busqueda)) {
            const curso = await cursosApi.buscarPorId(busqueda);
            renderizarTabla([curso]);
            return;
        }

        const cursos = categoria || nivel
            ? await cursosApi.filtrar(categoria, nivel)
            : await cursosApi.listar();

        const tituloBuscado = busqueda
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("es-MX");

        const cursosFiltrados = tituloBuscado
            ? cursos.filter((curso) => {
                const titulo = (curso.titulo ?? "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLocaleLowerCase("es-MX");

                return titulo.includes(tituloBuscado);
            })
            : cursos;

        renderizarTabla(cursosFiltrados);
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

/** Llena el filtro (y sugerencias) con las categorías que existen en los datos. */
async function cargarCategorias() {
    try {
        const cursos = await cursosApi.listar();
        const categorias = [...new Set(cursos.map((curso) => curso.categoria))]
            .sort((a, b) => a.localeCompare(b, "es"));
        const seleccionada = filtroCategoria.value;

        filtroCategoria.replaceChildren(new Option("Todas", ""));
        listaCategorias.replaceChildren();
        categorias.forEach((nombre) => {
            filtroCategoria.append(new Option(nombre, nombre));
            listaCategorias.append(new Option(nombre));
        });

        // Si la categoría seleccionada ya no existe, se limpia
        filtroCategoria.value = categorias.includes(seleccionada) ? seleccionada : "";
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

async function refrescar() {
    await cargarCategorias();
    await cargarCursos();
}

/* ---------- Tabla ---------- */
function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function crearBoton(texto, clases, alHacerClic) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = clases;
    boton.textContent = texto;
    boton.addEventListener("click", alHacerClic);
    return boton;
}

function crearFila(curso) {
    const fila = document.createElement("tr");

    // Título con sus etiquetas debajo
    const celdaTitulo = document.createElement("td");
    const titulo = document.createElement("strong");
    titulo.textContent = curso.titulo;
    celdaTitulo.append(titulo);
    if (curso.etiquetas?.length) {
        const contenedor = document.createElement("div");
        contenedor.className = "etiquetas";
        curso.etiquetas.forEach((texto) => {
            const etiqueta = document.createElement("span");
            etiqueta.className = "etiqueta";
            etiqueta.textContent = texto;
            contenedor.append(etiqueta);
        });
        celdaTitulo.append(contenedor);
    }

    const estado = document.createElement("span");
    estado.className = curso.activo ? "badge badge-activo" : "badge badge-inactivo";
    estado.textContent = curso.activo ? "Activo" : "Inactivo";
    const celdaEstado = document.createElement("td");
    celdaEstado.append(estado);

    const celdaInstructor = document.createElement("td");
    const nombre = document.createElement("div");
    nombre.textContent = curso.instructor?.nombre ?? "";
    const correo = document.createElement("small");
    correo.textContent = curso.instructor?.correo ?? "";
    celdaInstructor.append(nombre, correo);

    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "acciones";
    celdaAcciones.append(
        crearBoton("Editar", "btn btn-pequeno", () => abrirFormulario(curso)),
        crearBoton("Eliminar", "btn btn-pequeno btn-peligro", () => eliminarCurso(curso)),
    );

    fila.append(
        celdaTitulo,
        celda(curso.categoria),
        celda(curso.nivel),
        celda(`${curso.duracion_horas ?? 0} h`),
        celda(formatoMoneda.format(curso.precio_mxn ?? 0)),
        celda(Number(curso.calificacion ?? 0).toFixed(1)),
        celda((curso.estudiantes_inscritos ?? 0).toLocaleString("es-MX")),
        celdaEstado,
        celdaInstructor,
        celdaAcciones,
    );
    return fila;
}

function renderizarTabla(cursos) {
    tabla.replaceChildren();
    contador.textContent = cursos.length === 1 ? "1 curso encontrado" : `${cursos.length} cursos encontrados`;

    if (cursos.length === 0) {
        const fila = document.createElement("tr");
        const vacio = document.createElement("td");
        vacio.colSpan = 10;
        vacio.className = "vacio";
        vacio.textContent = "No hay cursos que mostrar con los filtros actuales.";
        fila.append(vacio);
        tabla.append(fila);
        return;
    }
    cursos.forEach((curso) => tabla.append(crearFila(curso)));
}

/* ---------- Formulario (alta y edición) ---------- */
function ocultarErrores() {
    erroresForm.hidden = true;
    erroresForm.replaceChildren();
}

function mostrarErrores(error) {
    erroresForm.replaceChildren();
    const titulo = document.createElement("strong");
    titulo.textContent = error.message;
    erroresForm.append(titulo);

    if (error.errores) {
        const lista = document.createElement("ul");
        Object.entries(error.errores).forEach(([campo, texto]) => {
            const item = document.createElement("li");
            item.textContent = `${nombresCampos[campo] ?? campo}: ${texto}`;
            lista.append(item);
        });
        erroresForm.append(lista);
    }
    erroresForm.hidden = false;
}

function abrirFormulario(curso = null) {
    cursoEditandoId = curso?.id ?? null;
    formCurso.reset();
    ocultarErrores();
    tituloDialogo.textContent = curso ? "Editar curso" : "Nuevo curso";

    if (curso) {
        campos.titulo.value = curso.titulo ?? "";
        campos.categoria.value = curso.categoria ?? "";
        campos.nivel.value = curso.nivel ?? "";
        campos.duracion.value = curso.duracion_horas ?? "";
        campos.precio.value = curso.precio_mxn ?? "";
        campos.calificacion.value = curso.calificacion ?? "";
        campos.inscritos.value = curso.estudiantes_inscritos ?? "";
        campos.activo.checked = Boolean(curso.activo);
        campos.instructorNombre.value = curso.instructor?.nombre ?? "";
        campos.instructorCorreo.value = curso.instructor?.correo ?? "";
        campos.etiquetas.value = (curso.etiquetas ?? []).join(", ");
    }
    dialogo.showModal();
}

// Un campo numérico vacío se envía como null para que la API responda "es obligatorio"
const numero = (valor) => (valor.trim() === "" ? null : Number(valor));

/** Arma el JSON que espera la API (con los nombres de campo en guion bajo). */
function leerFormulario() {
    return {
        titulo: campos.titulo.value,
        categoria: campos.categoria.value,
        nivel: campos.nivel.value,
        duracion_horas: numero(campos.duracion.value),
        precio_mxn: numero(campos.precio.value),
        calificacion: numero(campos.calificacion.value),
        estudiantes_inscritos: numero(campos.inscritos.value),
        activo: campos.activo.checked,
        instructor: {
            nombre: campos.instructorNombre.value,
            correo: campos.instructorCorreo.value,
        },
        etiquetas: campos.etiquetas.value
            .split(",")
            .map((texto) => texto.trim())
            .filter((texto) => texto !== ""),
    };
}

async function guardarCurso(evento) {
    evento.preventDefault();
    ocultarErrores();

    const esEdicion = cursoEditandoId !== null;
    btnGuardar.disabled = true; // evita enviar dos veces con un doble clic

    try {
        const curso = leerFormulario();
        if (esEdicion) {
            await cursosApi.actualizar(cursoEditandoId, curso);
        } else {
            await cursosApi.crear(curso);
        }
        dialogo.close();
        mostrarMensaje(esEdicion ? "Curso actualizado correctamente." : "Curso creado correctamente.");
        await refrescar();
    } catch (error) {
        mostrarErrores(error);
    } finally {
        btnGuardar.disabled = false;
    }
}

/* ---------- Eliminar ---------- */
async function eliminarCurso(curso) {
    if (!confirm(`¿Eliminar el curso "${curso.titulo}"? Esta acción no se puede deshacer.`)) {
        return;
    }
    try {
        await cursosApi.eliminar(curso.id);
        mostrarMensaje("Curso eliminado correctamente.");
        await refrescar();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

/* ---------- Eventos e inicio ---------- */
$("btn-nuevo").addEventListener("click", () => abrirFormulario());
$("btn-cancelar").addEventListener("click", () => dialogo.close());
$("btn-limpiar").addEventListener("click", () => {
    filtroTitulo.value = "";
    filtroCategoria.value = "";
    filtroNivel.value = "";
    cargarCursos();
});
formFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();
    cargarCursos();
});
formCurso.addEventListener("submit", guardarCurso);

refrescar();