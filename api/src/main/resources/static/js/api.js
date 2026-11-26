/** Capa de acceso a la API REST: todas las llamadas fetch viven aquí. */
const BASE_URL = "/api/cursos";

async function solicitar(url, opciones = {}) {
    let respuesta;
    try {
        respuesta = await fetch(url, {
            headers: {"Content-Type": "application/json"},
            ...opciones,
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor. Verifica que la API esté en ejecución.");
    }

    // DELETE exitoso: 204 No Content, no hay cuerpo que leer
    if (respuesta.status === 204) {
        return null;
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        // La API devuelve { mensaje, errores } en los casos 400 y 404
        const error = new Error(datos?.mensaje ?? "Error inesperado del servidor");
        error.errores = datos?.errores ?? null;
        throw error;
    }
    return datos;
}

export const cursosApi = {
    /** GET /api/cursos */
    listar: () => solicitar(BASE_URL),

    /** GET /api/cursos/{id} */
    buscarPorId: (id) => solicitar(`${BASE_URL}/${id}`),

    /** GET /api/cursos/filtrar?categoria=&nivel= (solo envía los filtros con valor) */
    filtrar(categoria, nivel) {
        const parametros = new URLSearchParams();
        if (categoria) parametros.set("categoria", categoria);
        if (nivel) parametros.set("nivel", nivel);
        return solicitar(`${BASE_URL}/filtrar?${parametros}`);
    },

    /** POST /api/cursos */
    crear: (curso) => solicitar(BASE_URL, {method: "POST", body: JSON.stringify(curso)}),

    /** PUT /api/cursos/{id} */
    actualizar: (id, curso) => solicitar(`${BASE_URL}/${id}`, {method: "PUT", body: JSON.stringify(curso)}),

    /** DELETE /api/cursos/{id} */
    eliminar: (id) => solicitar(`${BASE_URL}/${id}`, {method: "DELETE"}),
};