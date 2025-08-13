// Costa Rican Location Data - Provinces, Cantons, and Districts
// Generated from official Costa Rican territorial division data

export interface District {
  id: number;
  name: string;
  code: string;
}

export interface Canton {
  id: number;
  name: string;
  code: string;
  districts: District[];
}

export interface Province {
  id: number;
  name: string;
  code: string;
  cantons: Canton[];
}

export const costaRicanLocations: Province[] = [
  {
    id: 1,
    name: "San José",
    code: "san-jose",
    cantons: [
      {
        id: 1,
        name: "San José",
        code: "san-jose",
        districts: [
          { id: 1, name: "Carmen", code: "carmen" },
          { id: 2, name: "Merced", code: "merced" },
          { id: 3, name: "Hospital", code: "hospital" },
          { id: 4, name: "Catedral", code: "catedral" },
          { id: 5, name: "Zapote", code: "zapote" },
          { id: 6, name: "San Francisco De Dos Ríos", code: "san-francisco-de-dos-rios" },
          { id: 7, name: "Uruca", code: "uruca" },
          { id: 8, name: "Mata Redonda", code: "mata-redonda" },
          { id: 9, name: "Pavas", code: "pavas" },
          { id: 10, name: "Hatillo", code: "hatillo" },
          { id: 11, name: "San Sebastián", code: "san-sebastian" }
        ]
      },
      {
        id: 2,
        name: "Escazú",
        code: "escazu",
        districts: [
          { id: 1, name: "Escazú", code: "escazu" },
          { id: 2, name: "San Antonio", code: "san-antonio" },
          { id: 3, name: "San Rafael", code: "san-rafael" }
        ]
      },
      {
        id: 3,
        name: "Desamparados",
        code: "desamparados",
        districts: [
          { id: 1, name: "Desamparados", code: "desamparados" },
          { id: 2, name: "San Miguel", code: "san-miguel" },
          { id: 3, name: "San Juan De Dios", code: "san-juan-de-dios" },
          { id: 4, name: "San Rafael Arriba", code: "san-rafael-arriba" },
          { id: 5, name: "San Antonio", code: "san-antonio" },
          { id: 6, name: "Frailes", code: "frailes" },
          { id: 7, name: "Patarrá", code: "patarra" },
          { id: 8, name: "San Cristóbal", code: "san-cristobal" },
          { id: 9, name: "Rosario", code: "rosario" },
          { id: 10, name: "Damas", code: "damas" },
          { id: 11, name: "San Rafael Abajo", code: "san-rafael-abajo" },
          { id: 12, name: "Gravilias", code: "gravilias" },
          { id: 13, name: "Los Guido", code: "los-guido" }
        ]
      },
      {
        id: 4,
        name: "Puriscal",
        code: "puriscal",
        districts: [
          { id: 1, name: "Santiago", code: "santiago" },
          { id: 2, name: "Mercedes Sur", code: "mercedes-sur" },
          { id: 3, name: "Barbacoas", code: "barbacoas" },
          { id: 4, name: "Grifo Alto", code: "grifo-alto" },
          { id: 5, name: "San Rafael", code: "san-rafael" },
          { id: 6, name: "Candelarita", code: "candelarita" },
          { id: 7, name: "Desamparaditos", code: "desamparaditos" },
          { id: 8, name: "San Antonio", code: "san-antonio" },
          { id: 9, name: "Chires", code: "chires" }
        ]
      },
      {
        id: 5,
        name: "Tarrazú",
        code: "tarrazu",
        districts: [
          { id: 1, name: "San Marcos", code: "san-marcos" },
          { id: 2, name: "San Lorenzo", code: "san-lorenzo" },
          { id: 3, name: "San Carlos", code: "san-carlos" }
        ]
      },
      {
        id: 6,
        name: "Aserrí",
        code: "aserri",
        districts: [
          { id: 1, name: "Aserrí", code: "aserri" },
          { id: 2, name: "Tarbaca", code: "tarbaca" },
          { id: 3, name: "Vuelta De Jorco", code: "vuelta-de-jorco" },
          { id: 4, name: "San Gabriel", code: "san-gabriel" },
          { id: 5, name: "Legua", code: "legua" },
          { id: 6, name: "Monterrey", code: "monterrey" },
          { id: 7, name: "Salitrillos", code: "salitrillos" }
        ]
      },
      {
        id: 7,
        name: "Mora",
        code: "mora",
        districts: [
          { id: 1, name: "Colón", code: "colon" },
          { id: 2, name: "Guayabo", code: "guayabo" },
          { id: 3, name: "Tabarcia", code: "tabarcia" },
          { id: 4, name: "Piedras Negras", code: "piedras-negras" },
          { id: 5, name: "Picagres", code: "picagres" },
          { id: 6, name: "Jaris", code: "jaris" }
        ]
      },
      {
        id: 8,
        name: "Goicoechea",
        code: "goicoechea",
        districts: [
          { id: 1, name: "Guadalupe", code: "guadalupe" },
          { id: 2, name: "San Francisco", code: "san-francisco" },
          { id: 3, name: "Calle Blancos", code: "calle-blancos" },
          { id: 4, name: "Mata De Plátano", code: "mata-de-platano" },
          { id: 5, name: "Ipís", code: "ipis" },
          { id: 6, name: "Rancho Redondo", code: "rancho-redondo" },
          { id: 7, name: "Purral", code: "purral" }
        ]
      },
      {
        id: 9,
        name: "Santa Ana",
        code: "santa-ana",
        districts: [
          { id: 1, name: "Santa Ana", code: "santa-ana" },
          { id: 2, name: "Salitral", code: "salitral" },
          { id: 3, name: "Pozos", code: "pozos" },
          { id: 4, name: "Uruca", code: "uruca" },
          { id: 5, name: "Piedades", code: "piedades" },
          { id: 6, name: "Brasil", code: "brasil" }
        ]
      },
      {
        id: 10,
        name: "Alajuelita",
        code: "alajuelita",
        districts: [
          { id: 1, name: "Alajuelita", code: "alajuelita" },
          { id: 2, name: "San Josecito", code: "san-josecito" },
          { id: 3, name: "San Antonio", code: "san-antonio" },
          { id: 4, name: "Concepción", code: "concepcion" },
          { id: 5, name: "San Felipe", code: "san-felipe" }
        ]
      },
      {
        id: 11,
        name: "Vázquez de Coronado",
        code: "vazquez-de-coronado",
        districts: [
          { id: 1, name: "San Isidro", code: "san-isidro" },
          { id: 2, name: "San Rafael", code: "san-rafael" },
          { id: 3, name: "Dulce Nombre De Jesús", code: "dulce-nombre-de-jesus" },
          { id: 4, name: "Patalillo", code: "patalillo" },
          { id: 5, name: "Cascajal", code: "cascajal" }
        ]
      },
      {
        id: 12,
        name: "Acosta",
        code: "acosta",
        districts: [
          { id: 1, name: "San Ignacio", code: "san-ignacio" },
          { id: 2, name: "Guaitil", code: "guaitil" },
          { id: 3, name: "Palmichal", code: "palmichal" },
          { id: 4, name: "Cangrejal", code: "cangrejal" },
          { id: 5, name: "Sabanillas", code: "sabanillas" }
        ]
      },
      {
        id: 13,
        name: "Tibás",
        code: "tibas",
        districts: [
          { id: 1, name: "San Juan", code: "san-juan" },
          { id: 2, name: "Cinco Esquinas", code: "cinco-esquinas" },
          { id: 3, name: "Anselmo Llorente", code: "anselmo-llorente" },
          { id: 4, name: "León XIII", code: "leon-xiii" },
          { id: 5, name: "Colima", code: "colima" }
        ]
      },
      {
        id: 14,
        name: "Moravia",
        code: "moravia",
        districts: [
          { id: 1, name: "San Vicente", code: "san-vicente" },
          { id: 2, name: "San Jerónimo", code: "san-jeronimo" },
          { id: 3, name: "La Trinidad", code: "la-trinidad" }
        ]
      },
      {
        id: 15,
        name: "Montes de Oca",
        code: "montes-de-oca",
        districts: [
          { id: 1, name: "San Pedro", code: "san-pedro" },
          { id: 2, name: "Sabanilla", code: "sabanilla" },
          { id: 3, name: "Mercedes", code: "mercedes" },
          { id: 4, name: "San Rafael", code: "san-rafael" }
        ]
      },
      {
        id: 16,
        name: "Turrubares",
        code: "turrubares",
        districts: [
          { id: 1, name: "San Pablo", code: "san-pablo" },
          { id: 2, name: "San Pedro", code: "san-pedro" },
          { id: 3, name: "San Juan De Mata", code: "san-juan-de-mata" },
          { id: 4, name: "San Luis", code: "san-luis" },
          { id: 5, name: "Carara", code: "carara" }
        ]
      },
      {
        id: 17,
        name: "Dota",
        code: "dota",
        districts: [
          { id: 1, name: "Santa María", code: "santa-maria" },
          { id: 2, name: "Jardín", code: "jardin" },
          { id: 3, name: "Copey", code: "copey" }
        ]
      },
      {
        id: 18,
        name: "Curridabat",
        code: "curridabat",
        districts: [
          { id: 1, name: "Curridabat", code: "curridabat" },
          { id: 2, name: "Granadilla", code: "granadilla" },
          { id: 3, name: "Sánchez", code: "sanchez" },
          { id: 4, name: "Tirrases", code: "tirrases" }
        ]
      },
      {
        id: 19,
        name: "Pérez Zeledón",
        code: "perez-zeledon",
        districts: [
          { id: 1, name: "San Isidro De El General", code: "san-isidro-de-el-general" },
          { id: 2, name: "El General", code: "el-general" },
          { id: 3, name: "Daniel Flores", code: "daniel-flores" },
          { id: 4, name: "Rivas", code: "rivas" },
          { id: 5, name: "San Pedro", code: "san-pedro" },
          { id: 6, name: "Platanares", code: "platanares" },
          { id: 7, name: "Pejibaye", code: "pejibaye" },
          { id: 8, name: "Cajón", code: "cajon" },
          { id: 9, name: "Barú", code: "baru" },
          { id: 10, name: "Río Nuevo", code: "rio-nuevo" },
          { id: 11, name: "Páramo", code: "paramo" },
          { id: 12, name: "La Amistad", code: "la-amistad" }
        ]
      },
      {
        id: 20,
        name: "León Cortés Castro",
        code: "leon-cortes-castro",
        districts: [
          { id: 1, name: "San Pablo", code: "san-pablo" },
          { id: 2, name: "San Andrés", code: "san-andres" },
          { id: 3, name: "Llano Bonito", code: "llano-bonito" },
          { id: 4, name: "San Isidro", code: "san-isidro" },
          { id: 5, name: "Santa Cruz", code: "santa-cruz" },
          { id: 6, name: "San Antonio", code: "san-antonio" }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Alajuela",
    code: "alajuela",
    cantons: [
      {
        id: 1,
        name: "Alajuela",
        code: "alajuela",
        districts: [
          { id: 1, name: "Alajuela", code: "alajuela" },
          { id: 2, name: "San José", code: "san-jose" },
          { id: 3, name: "Carrizal", code: "carrizal" },
          { id: 4, name: "San Antonio", code: "san-antonio" },
          { id: 5, name: "Guácima", code: "guacima" },
          { id: 6, name: "San Isidro", code: "san-isidro" },
          { id: 7, name: "Sabanilla", code: "sabanilla" },
          { id: 8, name: "San Rafael", code: "san-rafael" },
          { id: 9, name: "Río Segundo", code: "rio-segundo" },
          { id: 10, name: "Desamparados", code: "desamparados" },
          { id: 11, name: "Turrúcares", code: "turrucares" },
          { id: 12, name: "Tambor", code: "tambor" },
          { id: 13, name: "Garita", code: "garita" },
          { id: 14, name: "Sarapiquí", code: "sarapiqui" }
        ]
      },
      {
        id: 2,
        name: "San Ramón",
        code: "san-ramon",
        districts: [
          { id: 1, name: "San Ramón", code: "san-ramon" },
          { id: 2, name: "Santiago", code: "santiago" },
          { id: 3, name: "San Juan", code: "san-juan" },
          { id: 4, name: "Piedades Norte", code: "piedades-norte" },
          { id: 5, name: "Piedades Sur", code: "piedades-sur" },
          { id: 6, name: "San Rafael", code: "san-rafael" },
          { id: 7, name: "San Isidro", code: "san-isidro" },
          { id: 8, name: "Ángeles", code: "angeles" },
          { id: 9, name: "Alfaro", code: "alfaro" },
          { id: 10, name: "Volio", code: "volio" },
          { id: 11, name: "Concepción", code: "concepcion" },
          { id: 12, name: "Zapotal", code: "zapotal" },
          { id: 13, name: "Peñas Blancas", code: "penas-blancas" },
          { id: 14, name: "San Lorenzo", code: "san-lorenzo" }
        ]
      },
      {
        id: 3,
        name: "Grecia",
        code: "grecia",
        districts: [
          { id: 1, name: "Grecia", code: "grecia" },
          { id: 2, name: "San Isidro", code: "san-isidro" },
          { id: 3, name: "San José", code: "san-jose" },
          { id: 4, name: "San Roque", code: "san-roque" },
          { id: 5, name: "Tacares", code: "tacares" },
          { id: 6, name: "Río Cuarto", code: "rio-cuarto" },
          { id: 7, name: "Puente Piedra", code: "puente-piedra" },
          { id: 8, name: "Bolívar", code: "bolivar" }
        ]
      },
      {
        id: 4,
        name: "San Mateo",
        code: "san-mateo",
        districts: [
          { id: 1, name: "San Mateo", code: "san-mateo" },
          { id: 2, name: "Desmonte", code: "desmonte" },
          { id: 3, name: "Jesús María", code: "jesus-maria" },
          { id: 4, name: "Labrador", code: "labrador" }
        ]
      },
      {
        id: 5,
        name: "Atenas",
        code: "atenas",
        districts: [
          { id: 1, name: "Atenas", code: "atenas" },
          { id: 2, name: "Jesús", code: "jesus" },
          { id: 3, name: "Mercedes", code: "mercedes" },
          { id: 4, name: "San Isidro", code: "san-isidro" },
          { id: 5, name: "Concepción", code: "concepcion" },
          { id: 6, name: "San José", code: "san-jose" },
          { id: 7, name: "Santa Eulalia", code: "santa-eulalia" },
          { id: 8, name: "Escobal", code: "escobal" }
        ]
      },
      {
        id: 6,
        name: "Naranjo",
        code: "naranjo",
        districts: [
          { id: 1, name: "Naranjo", code: "naranjo" },
          { id: 2, name: "San Miguel", code: "san-miguel" },
          { id: 3, name: "San José", code: "san-jose" },
          { id: 4, name: "Cirrí Sur", code: "cirri-sur" },
          { id: 5, name: "San Jerónimo", code: "san-jeronimo" },
          { id: 6, name: "San Juan", code: "san-juan" },
          { id: 7, name: "El Rosario", code: "el-rosario" },
          { id: 8, name: "Palmitos", code: "palmitos" }
        ]
      },
      {
        id: 7,
        name: "Palmares",
        code: "palmares",
        districts: [
          { id: 1, name: "Palmares", code: "palmares" },
          { id: 2, name: "Zaragoza", code: "zaragoza" },
          { id: 3, name: "Buenos Aires", code: "buenos-aires" },
          { id: 4, name: "Santiago", code: "santiago" },
          { id: 5, name: "Candelaria", code: "candelaria" },
          { id: 6, name: "Esquipulas", code: "esquipulas" },
          { id: 7, name: "La Granja", code: "la-granja" }
        ]
      },
      {
        id: 8,
        name: "Poás",
        code: "poas",
        districts: [
          { id: 1, name: "San Pedro", code: "san-pedro" },
          { id: 2, name: "San Juan", code: "san-juan" },
          { id: 3, name: "San Rafael", code: "san-rafael" },
          { id: 4, name: "Carrillos", code: "carrillos" },
          { id: 5, name: "Sabana Redonda", code: "sabana-redonda" }
        ]
      },
      {
        id: 9,
        name: "Orotina",
        code: "orotina",
        districts: [
          { id: 1, name: "Orotina", code: "orotina" },
          { id: 2, name: "El Mastate", code: "el-mastate" },
          { id: 3, name: "Hacienda Vieja", code: "hacienda-vieja" },
          { id: 4, name: "Coyolar", code: "coyolar" },
          { id: 5, name: "La Ceiba", code: "la-ceiba" }
        ]
      },
      {
        id: 10,
        name: "San Carlos",
        code: "san-carlos",
        districts: [
          { id: 1, name: "Quesada", code: "quesada" },
          { id: 2, name: "Florencia", code: "florencia" },
          { id: 3, name: "Buenavista", code: "buenavista" },
          { id: 4, name: "Aguas Zarcas", code: "aguas-zarcas" },
          { id: 5, name: "Venecia", code: "venecia" },
          { id: 6, name: "Pital", code: "pital" },
          { id: 7, name: "La Fortuna", code: "la-fortuna" },
          { id: 8, name: "La Tigra", code: "la-tigra" },
          { id: 9, name: "La Palmera", code: "la-palmera" },
          { id: 10, name: "Venado", code: "venado" },
          { id: 11, name: "Cutris", code: "cutris" },
          { id: 12, name: "Monterrey", code: "monterrey" },
          { id: 13, name: "Pocosol", code: "pocosol" }
        ]
      },
      {
        id: 11,
        name: "Zarcero",
        code: "zarcero",
        districts: [
          { id: 1, name: "Zarcero", code: "zarcero" },
          { id: 2, name: "Laguna", code: "laguna" },
          { id: 3, name: "Tapesco", code: "tapesco" },
          { id: 4, name: "Guadalupe", code: "guadalupe" },
          { id: 5, name: "Palmira", code: "palmira" },
          { id: 6, name: "Zapote", code: "zapote" },
          { id: 7, name: "Brisas", code: "brisas" }
        ]
      },
      {
        id: 12,
        name: "Valverde Vega",
        code: "valverde-vega",
        districts: [
          { id: 1, name: "Sarchí Norte", code: "sarchi-norte" },
          { id: 2, name: "Sarchí Sur", code: "sarchi-sur" },
          { id: 3, name: "Turrúcares", code: "turrucares" },
          { id: 4, name: "San Pedro", code: "san-pedro" },
          { id: 5, name: "Rodríguez", code: "rodriguez" }
        ]
      },
      {
        id: 13,
        name: "Upala",
        code: "upala",
        districts: [
          { id: 1, name: "Upala", code: "upala" },
          { id: 2, name: "Aguas Claras", code: "aguas-claras" },
          { id: 3, name: "San José", code: "san-jose" },
          { id: 4, name: "Bijagua", code: "bijagua" },
          { id: 5, name: "Delicias", code: "delicias" },
          { id: 6, name: "Dos Ríos", code: "dos-rios" },
          { id: 7, name: "Yolillal", code: "yolillal" }
        ]
      },
      {
        id: 14,
        name: "Los Chiles",
        code: "los-chiles",
        districts: [
          { id: 1, name: "Los Chiles", code: "los-chiles" },
          { id: 2, name: "Caño Negro", code: "cano-negro" },
          { id: 3, name: "El Amparo", code: "el-amparo" },
          { id: 4, name: "San Jorge", code: "san-jorge" }
        ]
      },
      {
        id: 15,
        name: "Guatuso",
        code: "guatuso",
        districts: [
          { id: 1, name: "San Rafael", code: "san-rafael" },
          { id: 2, name: "Buenavista", code: "buenavista" },
          { id: 3, name: "Cote", code: "cote" },
          { id: 4, name: "Katira", code: "katira" }
        ]
      },
      {
        id: 16,
        name: "Río Cuarto",
        code: "rio-cuarto",
        districts: [
          { id: 1, name: "Río Cuarto", code: "rio-cuarto" },
          { id: 2, name: "Santa Rita", code: "santa-rita" },
          { id: 3, name: "Santa Isabel", code: "santa-isabel" }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Cartago",
    code: "cartago",
    cantons: [
      {
        id: 1,
        name: "Cartago",
        code: "cartago",
        districts: [
          { id: 1, name: "Oriental", code: "oriental" },
          { id: 2, name: "Occidental", code: "occidental" },
          { id: 3, name: "Carmen", code: "carmen" },
          { id: 4, name: "San Nicolás", code: "san-nicolas" },
          { id: 5, name: "Aguacaliente", code: "aguacaliente" },
          { id: 6, name: "Guadalupe", code: "guadalupe" },
          { id: 7, name: "Corralillo", code: "corralillo" },
          { id: 8, name: "Tierra Blanca", code: "tierra-blanca" },
          { id: 9, name: "Dulce Nombre", code: "dulce-nombre" },
          { id: 10, name: "Llano Grande", code: "llano-grande" },
          { id: 11, name: "Quebradilla", code: "quebradilla" }
        ]
      },
      {
        id: 2,
        name: "Paraíso",
        code: "paraiso",
        districts: [
          { id: 1, name: "Paraíso", code: "paraiso" },
          { id: 2, name: "Santiago", code: "santiago" },
          { id: 3, name: "Orosi", code: "orosi" },
          { id: 4, name: "Cachí", code: "cachi" },
          { id: 5, name: "Llanos De Santa Lucía", code: "llanos-de-santa-lucia" }
        ]
      },
      {
        id: 3,
        name: "La Unión",
        code: "la-union",
        districts: [
          { id: 1, name: "Tres Ríos", code: "tres-rios" },
          { id: 2, name: "San Diego", code: "san-diego" },
          { id: 3, name: "San Juan", code: "san-juan" },
          { id: 4, name: "San Rafael", code: "san-rafael" },
          { id: 5, name: "Concepción", code: "concepcion" },
          { id: 6, name: "Dulce Nombre", code: "dulce-nombre" },
          { id: 7, name: "San Ramón", code: "san-ramon" },
          { id: 8, name: "Río Azul", code: "rio-azul" }
        ]
      },
      {
        id: 4,
        name: "Jiménez",
        code: "jimenez",
        districts: [
          { id: 1, name: "Juan Viñas", code: "juan-vinas" },
          { id: 2, name: "Tucurrique", code: "tucurrique" },
          { id: 3, name: "Pejibaye", code: "pejibaye" }
        ]
      },
      {
        id: 5,
        name: "Turrialba",
        code: "turrialba",
        districts: [
          { id: 1, name: "Turrialba", code: "turrialba" },
          { id: 2, name: "La Suiza", code: "la-suiza" },
          { id: 3, name: "Peralta", code: "peralta" },
          { id: 4, name: "Santa Cruz", code: "santa-cruz" },
          { id: 5, name: "Santa Teresita", code: "santa-teresita" },
          { id: 6, name: "Pavones", code: "pavones" },
          { id: 7, name: "Tuis", code: "tuis" },
          { id: 8, name: "Tayutic", code: "tayutic" },
          { id: 9, name: "Santa Rosa", code: "santa-rosa" },
          { id: 10, name: "Tres Equis", code: "tres-equis" },
          { id: 11, name: "La Isabel", code: "la-isabel" },
          { id: 12, name: "Chirripó", code: "chirripo" }
        ]
      },
      {
        id: 6,
        name: "Alvarado",
        code: "alvarado",
        districts: [
          { id: 1, name: "Pacayas", code: "pacayas" },
          { id: 2, name: "Cervantes", code: "cervantes" },
          { id: 3, name: "Capellades", code: "capellades" }
        ]
      },
      {
        id: 7,
        name: "Oreamuno",
        code: "oreamuno",
        districts: [
          { id: 1, name: "San Rafael", code: "san-rafael" },
          { id: 2, name: "Cot", code: "cot" },
          { id: 3, name: "Potrero Cerrado", code: "potrero-cerrado" },
          { id: 4, name: "Cipreses", code: "cipreses" },
          { id: 5, name: "Santa Rosa", code: "santa-rosa" }
        ]
      },
      {
        id: 8,
        name: "El Guarco",
        code: "el-guarco",
        districts: [
          { id: 1, name: "El Tejar", code: "el-tejar" },
          { id: 2, name: "San Isidro", code: "san-isidro" },
          { id: 3, name: "Tobosi", code: "tobosi" },
          { id: 4, name: "Patio De Agua", code: "patio-de-agua" }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Heredia",
    code: "heredia",
    cantons: [
      {
        id: 1,
        name: "Heredia",
        code: "heredia",
        districts: [
          { id: 1, name: "Heredia", code: "heredia" },
          { id: 2, name: "Mercedes", code: "mercedes" },
          { id: 3, name: "San Francisco", code: "san-francisco" },
          { id: 4, name: "Ulloa", code: "ulloa" },
          { id: 5, name: "Varablanca", code: "varablanca" }
        ]
      },
      {
        id: 2,
        name: "Barva",
        code: "barva",
        districts: [
          { id: 1, name: "Barva", code: "barva" },
          { id: 2, name: "San Pedro", code: "san-pedro" },
          { id: 3, name: "San Pablo", code: "san-pablo" },
          { id: 4, name: "San Roque", code: "san-roque" },
          { id: 5, name: "Santa Lucía", code: "santa-lucia" },
          { id: 6, name: "San José De La Montaña", code: "san-jose-de-la-montana" }
        ]
      },
      {
        id: 3,
        name: "Santo Domingo",
        code: "santo-domingo",
        districts: [
          { id: 1, name: "Santo Domingo", code: "santo-domingo" },
          { id: 2, name: "San Vicente", code: "san-vicente" },
          { id: 3, name: "San Miguel", code: "san-miguel" },
          { id: 4, name: "Paracito", code: "paracito" },
          { id: 5, name: "Santo Tomás", code: "santo-tomas" },
          { id: 6, name: "Santa Rosa", code: "santa-rosa" },
          { id: 7, name: "Tures", code: "tures" },
          { id: 8, name: "Pará", code: "para" }
        ]
      },
      {
        id: 4,
        name: "Santa Bárbara",
        code: "santa-barbara",
        districts: [
          { id: 1, name: "Santa Bárbara", code: "santa-barbara" },
          { id: 2, name: "San Pedro", code: "san-pedro" },
          { id: 3, name: "San Juan", code: "san-juan" },
          { id: 4, name: "Jesús", code: "jesus" },
          { id: 5, name: "Santo Domingo", code: "santo-domingo" },
          { id: 6, name: "Purabá", code: "puraba" }
        ]
      },
      {
        id: 5,
        name: "San Rafael",
        code: "san-rafael",
        districts: [
          { id: 1, name: "San Rafael", code: "san-rafael" },
          { id: 2, name: "San Josecito", code: "san-josecito" },
          { id: 3, name: "Santiago", code: "santiago" },
          { id: 4, name: "Ángeles", code: "angeles" },
          { id: 5, name: "Concepción", code: "concepcion" }
        ]
      },
      {
        id: 6,
        name: "San Isidro",
        code: "san-isidro",
        districts: [
          { id: 1, name: "San Isidro", code: "san-isidro" },
          { id: 2, name: "San José", code: "san-jose" },
          { id: 3, name: "Concepción", code: "concepcion" },
          { id: 4, name: "San Francisco", code: "san-francisco" }
        ]
      },
      {
        id: 7,
        name: "Belén",
        code: "belen",
        districts: [
          { id: 1, name: "San Antonio", code: "san-antonio" },
          { id: 2, name: "La Ribera", code: "la-ribera" },
          { id: 3, name: "La Asunción", code: "la-asuncion" }
        ]
      },
      {
        id: 8,
        name: "Flores",
        code: "flores",
        districts: [
          { id: 1, name: "San Joaquín", code: "san-joaquin" },
          { id: 2, name: "Barrantes", code: "barrantes" },
          { id: 3, name: "Llorente", code: "llorente" }
        ]
      },
      {
        id: 9,
        name: "San Pablo",
        code: "san-pablo",
        districts: [
          { id: 1, name: "San Pablo", code: "san-pablo" },
          { id: 2, name: "Rincón De Sabanilla", code: "rincon-de-sabanilla" }
        ]
      },
      {
        id: 10,
        name: "Sarapiquí",
        code: "sarapiqui",
        districts: [
          { id: 1, name: "Puerto Viejo", code: "puerto-viejo" },
          { id: 2, name: "La Virgen", code: "la-virgen" },
          { id: 3, name: "Horquetas", code: "horquetas" },
          { id: 4, name: "Llanuras Del Gaspar", code: "llanuras-del-gaspar" },
          { id: 5, name: "Cureña", code: "curena" }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Guanacaste",
    code: "guanacaste",
    cantons: [
      {
        id: 1,
        name: "Liberia",
        code: "liberia",
        districts: [
          { id: 1, name: "Liberia", code: "liberia" },
          { id: 2, name: "Cañas Dulces", code: "canas-dulces" },
          { id: 3, name: "Mayorga", code: "mayorga" },
          { id: 4, name: "Nacascolo", code: "nacascolo" },
          { id: 5, name: "Curubandé", code: "curubande" }
        ]
      },
      {
        id: 2,
        name: "Nicoya",
        code: "nicoya",
        districts: [
          { id: 1, name: "Nicoya", code: "nicoya" },
          { id: 2, name: "Mansión", code: "mansion" },
          { id: 3, name: "San Antonio", code: "san-antonio" },
          { id: 4, name: "Quebrada Honda", code: "quebrada-honda" },
          { id: 5, name: "Sámara", code: "samara" },
          { id: 6, name: "Nosara", code: "nosara" },
          { id: 7, name: "Belén De Nosarita", code: "belen-de-nosarita" }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Puntarenas",
    code: "puntarenas",
    cantons: [
      {
        id: 1,
        name: "Puntarenas",
        code: "puntarenas",
        districts: [
          { id: 1, name: "Puntarenas", code: "puntarenas" },
          { id: 2, name: "Pitahaya", code: "pitahaya" },
          { id: 3, name: "Chomes", code: "chomes" },
          { id: 4, name: "Lepanto", code: "lepanto" },
          { id: 5, name: "Paquera", code: "paquera" },
          { id: 6, name: "Manzanillo", code: "manzanillo" },
          { id: 7, name: "Guacimal", code: "guacimal" },
          { id: 8, name: "Barranca", code: "barranca" },
          { id: 10, name: "Isla Del Coco", code: "isla-del-coco" },
          { id: 11, name: "Cóbano", code: "cobano" },
          { id: 12, name: "Chacarita", code: "chacarita" },
          { id: 13, name: "Chira", code: "chira" },
          { id: 14, name: "Acapulco", code: "acapulco" },
          { id: 15, name: "El Roble", code: "el-roble" },
          { id: 16, name: "Arancibia", code: "arancibia" }
        ]
      }
    ]
  },
  {
    id: 7,
    name: "Limón",
    code: "limon",
    cantons: [
      {
        id: 1,
        name: "Limón",
        code: "limon",
        districts: [
          { id: 1, name: "Limón", code: "limon" },
          { id: 2, name: "Valle La Estrella", code: "valle-la-estrella" },
          { id: 3, name: "Río Blanco", code: "rio-blanco" },
          { id: 4, name: "Matama", code: "matama" }
        ]
      },
      {
        id: 2,
        name: "Pococí",
        code: "pococi",
        districts: [
          { id: 1, name: "Guápiles", code: "guapiles" },
          { id: 2, name: "Jiménez", code: "jimenez" },
          { id: 3, name: "Rita", code: "rita" },
          { id: 4, name: "Roxana", code: "roxana" },
          { id: 5, name: "Cariari", code: "cariari" },
          { id: 6, name: "Colorado", code: "colorado" },
          { id: 7, name: "La Colonia", code: "la-colonia" }
        ]
      }
    ]
  }
];

// Helper functions for easy data access
export const getProvinces = (): Province[] => costaRicanLocations;

export const getProvinceByCode = (code: string): Province | undefined => 
  costaRicanLocations.find(province => province.code === code);

export const getCantonsByProvinceCode = (provinceCode: string): Canton[] => {
  const province = getProvinceByCode(provinceCode);
  return province ? province.cantons : [];
};

export const getCantonByCode = (provinceCode: string, cantonCode: string): Canton | undefined => {
  const cantons = getCantonsByProvinceCode(provinceCode);
  return cantons.find(canton => canton.code === cantonCode);
};

export const getDistrictsByCantonCode = (provinceCode: string, cantonCode: string): District[] => {
  const canton = getCantonByCode(provinceCode, cantonCode);
  return canton ? canton.districts : [];
};

export const getDistrictByCode = (provinceCode: string, cantonCode: string, districtCode: string): District | undefined => {
  const districts = getDistrictsByCantonCode(provinceCode, cantonCode);
  return districts.find(district => district.code === districtCode);
};

// Format location for display
export const formatLocationString = (provinceCode: string, cantonCode?: string, districtCode?: string): string => {
  const province = getProvinceByCode(provinceCode);
  if (!province) return '';
  
  let location = province.name;
  
  if (cantonCode) {
    const canton = getCantonByCode(provinceCode, cantonCode);
    if (canton) {
      location += `, ${canton.name}`;
      
      if (districtCode) {
        const district = getDistrictByCode(provinceCode, cantonCode, districtCode);
        if (district) {
          location += `, ${district.name}`;
        }
      }
    }
  }
  
  return location;
};