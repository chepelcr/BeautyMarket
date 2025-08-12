export interface Location {
  code: string;
  name: string;
}

export const provinces: Location[] = [
  { code: "san-jose", name: "San José" },
  { code: "alajuela", name: "Alajuela" },
  { code: "cartago", name: "Cartago" },
  { code: "heredia", name: "Heredia" },
  { code: "guanacaste", name: "Guanacaste" },
  { code: "puntarenas", name: "Puntarenas" },
  { code: "limon", name: "Limón" }
];

export const cantonsByProvince: Record<string, Location[]> = {
  "san-jose": [
    { code: "san-jose", name: "San José" },
    { code: "escazu", name: "Escazú" },
    { code: "desamparados", name: "Desamparados" },
    { code: "puriscal", name: "Puriscal" },
    { code: "tarrazu", name: "Tarrazú" }
  ],
  "alajuela": [
    { code: "alajuela", name: "Alajuela" },
    { code: "san-ramon", name: "San Ramón" },
    { code: "grecia", name: "Grecia" },
    { code: "san-mateo", name: "San Mateo" }
  ],
  "cartago": [
    { code: "cartago", name: "Cartago" },
    { code: "paraiso", name: "Paraíso" },
    { code: "la-union", name: "La Unión" }
  ],
  "heredia": [
    { code: "heredia", name: "Heredia" },
    { code: "barva", name: "Barva" },
    { code: "santo-domingo", name: "Santo Domingo" }
  ],
  "guanacaste": [
    { code: "liberia", name: "Liberia" },
    { code: "nicoya", name: "Nicoya" },
    { code: "santa-cruz", name: "Santa Cruz" }
  ],
  "puntarenas": [
    { code: "puntarenas", name: "Puntarenas" },
    { code: "esparza", name: "Esparza" },
    { code: "buenos-aires", name: "Buenos Aires" }
  ],
  "limon": [
    { code: "limon", name: "Limón" },
    { code: "pococi", name: "Pococí" },
    { code: "siquirres", name: "Siquirres" }
  ]
};

export const districtsByCantonKey: Record<string, Location[]> = {
  "san-jose-san-jose": [
    { code: "carmen", name: "Carmen" },
    { code: "merced", name: "Merced" },
    { code: "hospital", name: "Hospital" },
    { code: "catedral", name: "Catedral" }
  ],
  "san-jose-escazu": [
    { code: "escazu", name: "Escazú" },
    { code: "san-antonio", name: "San Antonio" },
    { code: "san-rafael", name: "San Rafael" }
  ],
  "alajuela-alajuela": [
    { code: "alajuela", name: "Alajuela" },
    { code: "san-jose", name: "San José" },
    { code: "carrizal", name: "Carrizal" }
  ]
};
