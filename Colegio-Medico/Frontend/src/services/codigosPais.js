// ============================================================
//  Códigos de área/país para el teléfono (E.164 sin el "+")
// ============================================================

// Lista de países con su código telefónico. El primero es el predeterminado.
export const CODIGOS_PAIS = [
  { codigo: '58',  pais: 'Venezuela' },
  { codigo: '1',   pais: 'Estados Unidos / Canadá' },
  { codigo: '52',  pais: 'México' },
  { codigo: '57',  pais: 'Colombia' },
  { codigo: '1',   pais: 'República Dominicana' },
  { codigo: '34',  pais: 'España' },
  { codigo: '51',  pais: 'Perú' },
  { codigo: '54',  pais: 'Argentina' },
  { codigo: '56',  pais: 'Chile' },
  { codigo: '55',  pais: 'Brasil' },
  { codigo: '593', pais: 'Ecuador' },
  { codigo: '591', pais: 'Bolivia' },
  { codigo: '595', pais: 'Paraguay' },
  { codigo: '598', pais: 'Uruguay' },
  { codigo: '507', pais: 'Panamá' },
  { codigo: '506', pais: 'Costa Rica' },
  { codigo: '504', pais: 'Honduras' },
  { codigo: '503', pais: 'El Salvador' },
  { codigo: '502', pais: 'Guatemala' },
  { codigo: '505', pais: 'Nicaragua' },
  { codigo: '509', pais: 'Haití' },
  { codigo: '537', pais: 'Cuba' },
  { codigo: '33',  pais: 'Francia' },
  { codigo: '39',  pais: 'Italia' },
  { codigo: '49',  pais: 'Alemania' },
  { codigo: '44',  pais: 'Reino Unido' },
  { codigo: '351', pais: 'Portugal' },
  { codigo: '31',  pais: 'Países Bajos' },
  { codigo: '32',  pais: 'Bélgica' },
  { codigo: '41',  pais: 'Suiza' },
  { codigo: '43',  pais: 'Austria' },
  { codigo: '46',  pais: 'Suecia' },
  { codigo: '47',  pais: 'Noruega' },
  { codigo: '45',  pais: 'Dinamarca' },
  { codigo: '358', pais: 'Finlandia' },
  { codigo: '48',  pais: 'Polonia' },
  { codigo: '380', pais: 'Ucrania' },
  { codigo: '7',   pais: 'Rusia' },
  { codigo: '86',  pais: 'China' },
  { codigo: '81',  pais: 'Japón' },
  { codigo: '82',  pais: 'Corea del Sur' },
  { codigo: '91',  pais: 'India' },
  { codigo: '61',  pais: 'Australia' },
  { codigo: '64',  pais: 'Nueva Zelanda' },
  { codigo: '27',  pais: 'Sudáfrica' },
  { codigo: '20',  pais: 'Egipto' },
  { codigo: '212', pais: 'Marruecos' },
  { codigo: '234', pais: 'Nigeria' },
  { codigo: '971', pais: 'Emiratos Árabes Unidos' },
  { codigo: '966', pais: 'Arabia Saudita' },
  { codigo: '90',  pais: 'Turquía' },
  { codigo: '30',  pais: 'Grecia' },
  { codigo: '420', pais: 'República Checa' },
  { codigo: '36',  pais: 'Hungría' },
  { codigo: '40',  pais: 'Rumania' },
  { codigo: '359', pais: 'Bulgaria' },
  { codigo: '385', pais: 'Croacia' },
  { codigo: '381', pais: 'Serbia' },
];

// Máximo de dígitos del número SIN contar el código de país (estándar E.164)
export const MAX_DIGITOS_TELEFONO = 15;

/**
 * Construye el teléfono completo a partir del código y el número nacional.
 * Ej: ('58', '4141234567') -> '+584141234567'
 */
export const telefonoCompleto = (codigoPais, numero) =>
  `+${codigoPais}${numero}`;

/**
 * Separa un teléfono guardado (ej: '+584141234567') en código y número
 * buscando coincidencia con los códigos conocidos. Devuelve {codigo, numero}.
 */
export const separarTelefono = (telefono) => {
  if (!telefono) return { codigo: '58', numero: '' };
  let t = String(telefono).trim().replace(/^\+/, '').replace(/\D/g, '');
  // Probar prefijos de 1 a 3 dígitos contra la lista
  for (let len = 3; len >= 1; len--) {
    const candidato = t.slice(0, len);
    const encontrado = CODIGOS_PAIS.some((c) => c.codigo === candidato);
    if (encontrado && t.length > len) {
      return { codigo: candidato, numero: t.slice(len) };
    }
  }
  return { codigo: '58', numero: t };
};
