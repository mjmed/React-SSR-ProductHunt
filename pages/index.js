import React, { useContext, useEffect, useState } from 'react';
import DetallesProducto from '../components/layout/DetallesProducto';

import Layout from '../components/layout/Layout';
import { FirebaseContext } from '../firebase';


const Home = () => {

    const [ productos, guardarProductos ] = useState([]);

    const { firebase } = useContext( FirebaseContext );

    useEffect(() => {
        
        const obtenerProductos = () => {
            firebase.db.collection('productos').orderBy('creado', 'desc').onSnapshot(manejarSnapshot)
        }

        obtenerProductos();

        // eslint-disable-next-line
    }, []);

    function manejarSnapshot(snapshot) {
        const productos = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                ...doc.data()
            }
        });

        guardarProductos(productos);
    }

    return (
        <div>
            <Layout>
                <div className="listado-productos">
                    <div className="contenedor">
                        <ul className="bg-white">
                            {
                                productos.map(producto =>(
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

export default Home;
