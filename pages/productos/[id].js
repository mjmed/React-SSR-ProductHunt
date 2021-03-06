import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { FirebaseContext } from '../../firebase';

import Error404 from '../../components/layout/404';
import Layout from '../../components/layout/Layout';
import { Campo, InputSubmit } from '../../components/ui/Formulario';
import Boton from '../../components/ui/Boton';


const ContenedorProducto = styled.div`
    @media (min-width:768px) {
        display: grid;
        grid-template-columns: 2fr 1fr;
        column-gap: 2rem;
    }
`;

const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: #DA552F;
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center;
`;

const Producto = () => {

    // state del componente
    const [ producto, guardarProducto ] = useState({});
    const [ error, guardarError ] = useState(false);
    const [ comentario, guardarComentario ] = useState({});
    const [ consultarBD, guardarConsultarBD ] = useState(true);
    
    // routing para obtener el id actual
    const router = useRouter();
    const { query: {id} } = router;

    const { firebase, usuario } = useContext( FirebaseContext );

    useEffect(() => {
        
        if ( id && consultarBD ) {

            const obtenerProducto = async () => {
                const productoQuery = await firebase.db.collection('productos').doc(id);
                const producto = await productoQuery.get();

                if ( producto.exists ) {
                    
                    guardarProducto(producto.data());
                    guardarConsultarBD( false );

                } else {

                    guardarError( true );
                    guardarConsultarBD( false );
                }
            }

            obtenerProducto();
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if ( Object.keys(producto).length === 0 && !error ) return 'Cargando...';

    const { comentarios,
        creado,
        nombre,
        empresa,
        urlImagen,
        url,
        descripcion,
        votos,
        creador,
        haVotado } = producto;

    // administrar y validar los votos
    const votarProducto = () => {
        
        if ( !usuario ) {
            return router.push('/login')
        }

        // obtener y sumar un nuevo voto
        const nuevoTotal = votos + 1;

        // verificar si el usuario actual ha votado
        if ( haVotado.includes(usuario.uid) ) return;

        // guardar el ID del usuario que ha votado
        const nuevoHaVotado = [...haVotado, usuario.uid];

        // actualizar en la BD
        firebase.db.collection('productos').doc(id).update({
            votos: nuevoTotal,
            haVotado: nuevoHaVotado
        });

        // actualizar en el state
        guardarProducto({
            ...producto,
            votos: nuevoTotal
        });

        // hay un voto, por lo tanto se debe consultar a la BD
        guardarConsultarBD( true );

    }

    // Funciones para crear comentarios
    const comentarioChange = ({ target }) => {

        guardarComentario({
            ...comentario,
            [target.name]: target.value
        });
    }

    // identifica si el comentario es del creador del producto
    const esCreador = id => {
        if ( creador.id == id ) {
            return true;
        }
    }

    const agregarComentario = e => {

        e.preventDefault();

        if ( !usuario ) {
            return router.push('/login');
        }

        // informaci??n extra al comentario
        comentario.usuarioId = usuario.uid;
        comentario.usuarioNombre = usuario.displayName;

        // tomar copia de comentarios y agregarlos al arreglo
        const nuevosComentarios = [ ...comentarios, comentario ];

        // actualizar la BD
        firebase.db.collection('productos').doc(id).update({
            comentarios: nuevosComentarios
        });

        // actualizar el state
        guardarProducto({
            ...producto,
            comentarios: nuevosComentarios
        });

        // hay un comentario, por lo tanto se vuelve a consultar a la BD
        guardarConsultarBD( true );
    }

    // funci??n que revisa que el creador del producto sea el mismo que esta autenticado
    const puedeBorrar = () => {
        if ( !usuario ) return false;

        if ( creador.id === usuario.uid ) {
            return true;
        }
    }

    const eliminarProducto = async() => {

        if ( !usuario ) {
            return router.push('/login');
        }

        if ( creador.id !== usuario.uid ) {
            return router.push('/');
        }

        try {

            await firebase.db.collection('productos').doc(id).delete();
            router.push('/');
            
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Layout>
            <>
                { error ? <Error404 /> : (

                    <div className="contenedor">
                        <h1 css={css`
                            text-align: center;
                            margin-top: 5rem;
                        `}>
                            { nombre }
                        </h1>

                        <ContenedorProducto>
                            <div>
                                <p>Publicado hace: { formatDistanceToNow(new Date(creado), {locale: es}) }</p>

                                <img src={ urlImagen } />

                                <p>{ descripcion }</p>

                                {
                                    usuario && (
                                        <>
                                            <h2>Agrega tu comentario</h2>
                                            <form onSubmit={ agregarComentario }>
                                                <Campo>
                                                    <input
                                                        type="text"
                                                        name="mensaje"
                                                        onChange={ comentarioChange }
                                                    />
                                                </Campo>
                                                <InputSubmit
                                                    type="submit"
                                                    value="Agregar comentario"
                                                />
                                            </form>
                                        </>
                                    )
                                }

                                <h2 css={css`margin: 2rem 0;`}>Comentarios</h2>
                                
                                {
                                    (comentarios.length === 0)
                                        ? "A??n no hay comentarios"
                                        : (
                                            <ul>
                                                {
                                                    comentarios.map((comentario, i) => (
                                                        <li
                                                            key={ `${comentario.usuarioId}-${i}` }
                                                            css={css`
                                                                border: 1px solid #e1e1e1;
                                                                padding: 2rem;
                                                            `}
                                                        >
                                                            <p>{ comentario.mensaje }</p>
                                                            <p>
                                                                Escrito por:
                                                                <span
                                                                    css={css`
                                                                        font-weight: bold;
                                                                    `}
                                                                >
                                                                {''} { comentario.usuarioNombre }
                                                                </span>
                                                            </p>

                                                            { esCreador( comentario.usuarioId )
                                                                && <CreadorProducto>Es Creador</CreadorProducto> }

                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        )
                                }
                                
                            </div>

                            <aside>
                                <Boton
                                    target="_blank"
                                    bgColor="true"
                                    href={ url }
                                >
                                    Visitar URL
                                </Boton>

                                <p>Publicado por: { creador.nombre } de: { empresa }</p>

                                <div css={css`margin-top: 5rem;`}>
                                    <p css={css`text-align: center;`}>{votos} Votos</p>

                                    {
                                        usuario &&
                                            <Boton
                                                onClick={ votarProducto }
                                            >
                                                Votar
                                            </Boton>
                                    }
                                </div>

                            </aside>
                        </ContenedorProducto>

                        {
                            puedeBorrar() &&
                                <Boton
                                    onClick={ eliminarProducto }
                                >Eliminar producto</Boton>
                        }
                    </div>
                ) }

                
            </>
        </Layout>
    )
}

export default Producto;
