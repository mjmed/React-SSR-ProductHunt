import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Layout from '../components/layout/Layout';
import useProductos from '../hooks/useProductos';
import DetallesProducto from '../components/layout/DetallesProducto';


const Buscar = () => {

    // leo el query que viene desde otro componente
    const router = useRouter();
    const { query: {q} } = router;

    // obtener todos los productos
    const { productos } = useProductos('creado');
    const [ resultado, guardarResultado ] = useState([]);

    useEffect(() => {
        
        const busqueda = q.toLowerCase();

        const filtro = productos.filter( producto => {
            return producto.nombre.toLowerCase().includes( busqueda ) ||
                producto.descripcion.toLowerCase().includes( busqueda );
        });

        guardarResultado(filtro);

    }, [q, productos]);
    return (
        <div>
            <Layout>
                <div className="listado-productos">
                    <div className="contenedor">
                        <ul className="bg-white">
                            {
                                resultado.map(producto =>(
                                    <DetallesProducto
                                        key={ producto.id }
                                        producto={ producto }
                                    />
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </Layout>
        </div>
    )
}

export default Buscar;