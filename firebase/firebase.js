import app from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import firebaseConfig from './config';

class Firebase {

    constructor() {

        if ( !app.apps.length ) {
            app.initializeApp(firebaseConfig);
        }

        this.auth = app.auth();     // habilita la autenticación
        this.db = app.firestore();
        this.storage = app.storage();
    }

    // registra un usuario
    async registrar(nombre, email, password) {

        const nuevoUsuario = await this.auth.createUserWithEmailAndPassword(email, password);

        return await nuevoUsuario.user.updateProfile({
            displayName: nombre
        });
    }

    // iniciar sesión del usuario
    async login(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password);
    }

    // cierra la sesión del usuario
    async cerrarSesion() {
        await this.auth.signOut();
    }
}

const firebase = new Firebase();
export default firebase;