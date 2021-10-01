import React, { useEffect, useState } from 'react';

import firebase from '../firebase';


function useAutenticacion() {

    const [ usuarioAutenticado, guardarUsuarioAutenticado ] = useState( null );

    // detecta si alguien inicio sesión, entonces guarda la sesion en firebase
    useEffect(() => {
        
        const unsuscribe = firebase.auth.onAuthStateChanged(usuario => {

            if ( usuario ) {
                guardarUsuarioAutenticado( usuario );

            } else {
                guardarUsuarioAutenticado(null);
            }
        });

        return () => unsuscribe();

    }, []);

    return usuarioAutenticado;
}

export default useAutenticacion;