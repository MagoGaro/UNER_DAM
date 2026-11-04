import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AvisoBanner } from '@/src/componentes/estados/AvisoBanner';
import { Boton } from '@/src/componentes/estados/Boton';
import { COLORES } from '@/src/configuracion/tema';
import { sesion, useSesion } from '@/src/sesion';
import { validarIngreso, validarRegistro } from '@/src/sesion/validaciones';

type Modo = 'ingresar' | 'crear';

/** Ingresar o crear cuenta con email y contraseña. Campos grandes, una sola pantalla. */
export function FormularioCuenta() {
  const { ocupado, error } = useSesion();
  const [modo, setModo] = useState<Modo>('ingresar');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const enviar = async () => {
    const problema =
      modo === 'crear' ? validarRegistro({ nombre, email, password }) : validarIngreso({ email, password });
    setErrorLocal(problema);
    if (problema) return;
    if (modo === 'crear') await sesion.registrar({ nombre: nombre.trim(), email: email.trim(), password });
    else await sesion.iniciarSesion({ email: email.trim(), password });
  };

  const mensaje = errorLocal ?? error;

  return (
    <View style={styles.contenedor}>
      <View style={styles.pestanias}>
        {(['ingresar', 'crear'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.pestania, modo === m && styles.pestaniaActiva]}
            onPress={() => {
              setModo(m);
              setErrorLocal(null);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: modo === m }}>
            <Text style={[styles.textoPestania, modo === m && styles.textoPestaniaActiva]}>
              {m === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {modo === 'crear' && (
        <TextInput
          style={styles.campo}
          placeholder="Nombre"
          placeholderTextColor={COLORES.textoTenue}
          value={nombre}
          onChangeText={setNombre}
          autoComplete="name"
          textContentType="name"
          accessibilityLabel="Nombre"
        />
      )}
      <TextInput
        style={styles.campo}
        placeholder="Email"
        placeholderTextColor={COLORES.textoTenue}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        accessibilityLabel="Email"
      />
      <View style={styles.campoContrasena}>
        <TextInput
          style={styles.campoContrasenaInput}
          placeholder="Contraseña"
          placeholderTextColor={COLORES.textoTenue}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!verContrasena}
          autoCapitalize="none"
          autoComplete={modo === 'crear' ? 'new-password' : 'current-password'}
          textContentType={modo === 'crear' ? 'newPassword' : 'password'}
          accessibilityLabel="Contraseña"
          onSubmitEditing={enviar}
        />
        <TouchableOpacity
          style={styles.ojo}
          onPress={() => setVerContrasena((visible) => !visible)}
          accessibilityRole="button"
          accessibilityLabel={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          hitSlop={8}>
          <Ionicons name={verContrasena ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORES.textoTenue} />
        </TouchableOpacity>
      </View>

      {mensaje ? <AvisoBanner texto={mensaje} tono="peligro" /> : null}

      <Boton
        texto={modo === 'crear' ? 'Crear mi cuenta' : 'Ingresar'}
        icono={modo === 'crear' ? 'person-add-outline' : 'log-in-outline'}
        onPress={enviar}
        cargando={ocupado}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 12 },
  pestanias: { flexDirection: 'row', gap: 8 },
  pestania: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.superficie,
  },
  pestaniaActiva: { borderColor: COLORES.primario, backgroundColor: COLORES.primarioClaro },
  textoPestania: { fontSize: 16, fontWeight: '700', color: COLORES.textoSecundario },
  textoPestaniaActiva: { color: COLORES.primario },
  campo: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.superficie,
    fontSize: 17,
    color: COLORES.texto,
  },
  campoContrasena: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.superficie,
  },
  campoContrasenaInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 14,
    fontSize: 17,
    color: COLORES.texto,
  },
  ojo: {
    minWidth: 44,
    minHeight: 44,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
