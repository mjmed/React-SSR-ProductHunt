export default function validarCrearProducto( valores ) {

    let errores = {};

    if ( !valores.nombre ) {
        errores.nombre = "El nombre es obligatorio"
    }

    if ( !valores.empresa ) {
        errores.empresa = "Nombre de empresa es obligatorio"
    }

    if ( !valores.url ) {
        errores.url = "La URL del producto es obligatorio"
    } else if ( !/^(ftp|http|https):\/\/[^ "]+$/.test(valores.url) ) {
        errores.url = "La URL no es válida"
    }

    if ( !valores.descripcion ) {
        errores.descripcion = "Agrega una descripción de tu producto"
    }

    return errores;
}