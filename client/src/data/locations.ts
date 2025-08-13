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