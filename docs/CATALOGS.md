# Fiscal Catalog Tables

Catalog data for Costa Rica Hacienda fiscal identifiers used in product DTOs. All data originates from the Hacienda API and must be seeded before products can reference them.

## Identifier Strategy

| Catalog        | DTO field          | FE sends                                              | Backend lookup |
|----------------|--------------------|-------------------------------------------------------|----------------|
| code_types     | `codeTypeId`       | Hacienda `code` (e.g. `"01"`)                         | `code` column  |
| discount_types | `discountTypeId`   | Hacienda `code` (e.g. `"01"`)                         | `code` column  |
| tax_types      | `taxTypeId`        | Hacienda `code` (e.g. `"01"`)                         | `code` column  |
| tax_rates      | `taxRate`          | DTO `{ id: HaciendaCode, percentage }` (e.g. `"08"`) | `code` column  |
| tax_factors    | `taxFactor`        | DTO `{ id: UUID, factor }`                            | `id` column    |
| tax_amounts    | `taxAmount`        | DTO `{ id: UUID, amount }`                            | `id` column    |

- `taxRate.id` is the Hacienda `code` string, bundled with `percentage` so the BE has the rate value directly. `id` may be `null` for taxes that use a manual rate without a catalog entry (e.g. ISC, ISEC).
- `taxFactor.id` and `taxAmount.id` are real UUIDs (no Hacienda code definition for these catalogs).

---

## Code Types (`code_types`)

| Code | Name |
|------|------|
| 01 | Código del producto del vendedor |
| 02 | Código del producto del comprador |
| 03 | Código del producto asignado por el fabricante – industriales o importadores |
| 04 | Código uso interno |
| 99 | Otros |

---

## Discount Types (`discount_types`)

| Code | Name |
|------|------|
| 01 | Descuento por Regalía |
| 02 | Descuento por Regalía o Bonificación. IVA Cobrado al Cliente |
| 03 | Descuento por Bonificación |
| 04 | Descuento por volumen |
| 05 | Descuento por Temporada (estacional) |
| 06 | Descuento promocional |
| 07 | Descuento Comercial |
| 08 | Descuento por frecuencia |
| 09 | Descuento sostenido |
| 99 | Otros descuentos |

---

## Document Types (`document_types`)

| Code | Name |
|------|------|
| 01 | Factura electrónica |
| 02 | Nota de débito electrónica |
| 03 | Nota de crédito electrónica |
| 04 | Tiquete electrónico |
| 05 | Confirmación de aceptación del comprobante electrónico |
| 06 | Confirmación de aceptación parcial del comprobante electrónico |
| 07 | Confirmación de rechazo del comprobante electrónico |
| 08 | Factura electrónica de compras |
| 09 | Factura electrónica de exportación |
| 10 | Recibo Electrónico de Pago |

---

## ID Types (`id_types`)

| Code | Name |
|------|------|
| 01 | Cédula Física |
| 02 | Cédula Jurídica |
| 03 | DIMEX |
| 04 | NITE |
| 05 | Extranjero No Domiciliado |
| 06 | No Contribuyente |

---

## Payment Methods (`payment_methods`)

| Code | Name |
|------|------|
| 01 | Efectivo |
| 02 | Tarjeta |
| 03 | Cheque |
| 04 | Transferencia – depósito bancario |
| 05 | Recaudado por terceros |
| 06 | SINPE MOVIL |
| 07 | Plataforma Digital |
| 99 | Otros |

---

## Reference Codes (`reference_codes`)

| Code | Name |
|------|------|
| 01 | Anula Documento de Referencia |
| 02 | Corrige monto |
| 04 | Referencia a otro documento |
| 05 | Sustituye comprobante provisional por contingencia |
| 06 | Devolución de mercancía |
| 07 | Sustituye comprobante electrónico |
| 08 | Factura Endosada |
| 09 | Nota de crédito financiera |
| 10 | Nota de débito financiera |
| 11 | Proveedor No Domiciliado |
| 12 | Crédito por exoneración posterior a la facturación |
| 99 | Otros |

---

## Reference Types (`reference_types`)

| Code | Name |
|------|------|
| 01 | Factura electrónica |
| 02 | Nota de débito electrónica |
| 03 | Nota de crédito electrónica |
| 04 | Tiquete electrónico |
| 05 | Nota de despacho |
| 06 | Contrato |
| 07 | Procedimiento |
| 08 | Comprobante emitido en contingencia |
| 09 | Devolución mercadería |
| 10 | Comprobante electrónico rechazado por el Ministerio de Hacienda |
| 11 | Sustituye factura rechazada por el Receptor del comprobante |
| 12 | Sustituye Factura de exportación |
| 13 | Facturación mes vencido |
| 14 | Comprobante aportado por contribuyente de Régimen Especial |
| 15 | Sustituye una Factura electrónica de Compra |
| 16 | Comprobante de Proveedor No Domiciliado |
| 17 | Nota de Crédito a Factura Electrónica de Compra |
| 18 | Nota de Débito a Factura Electrónica de Compra |
| 99 | Otros |

---

## Tax Conditions (`tax_conditions`)

| Code | Name |
|------|------|
| 01 | Genera crédito IVA |
| 02 | Genera Crédito parcial del IVA |
| 03 | Bienes de Capital |
| 04 | Gasto corriente no genera crédito |
| 05 | Proporcionalidad |

---

## Tax Factory Charge (`tax_factory_charge`) — IVA a nivel de fábrica

| Code | Name |
|------|------|
| 01 | Venta de bienes con IVA según el sistema especial de determinación de IVA a nivel de fábrica |
| 02 | Ventas exentas según el sistema especial de determinación de IVA a nivel de fábrica, mayorista y aduanas |

---

## Tax Types (`tax_types`)

| Code | Name |
|------|------|
| 01 | Impuesto al Valor Agregado |
| 02 | Impuesto Selectivo de Consumo |
| 03 | Impuesto Único a los Combustibles |
| 04 | Impuesto específico de Bebidas Alcohólicas |
| 05 | Impuesto Específico sobre las bebidas envasadas sin contenido alcohólico y jabones de tocador |
| 06 | Impuesto a los Productos de Tabaco |
| 07 | IVA (cálculo especial) |
| 08 | IVA Régimen de Bienes Usados (Factor) |
| 12 | Impuesto Específico al Cemento |
| 99 | Otros |

---

## Tax Rates (`tax_rates`) — Tarifa IVA

Used by tax type `01` (IVA). The `rate` is the percentage used in calculations.

| Code | Name | Rate (%) |
|------|------|----------|
| 01 | Tarifa 0% (Artículo 32, num 1, RLIVA) | 0.00 |
| 02 | Tarifa reducida 1% | 1.00 |
| 03 | Tarifa reducida 2% | 2.00 |
| 04 | Tarifa reducida 4% | 4.00 |
| 05 | Transitorio 0% | 0.00 |
| 06 | Transitorio 4% | 4.00 |
| 07 | Tarifa transitoria 8% | 8.00 |
| 08 | Tarifa general 13% | 13.00 |
| 09 | Tarifa reducida 0.5% | 0.50 |
| 10 | Tarifa Exenta | 0.00 |
| 11 | Tarifa 0% sin derecho a crédito | 0.00 |

---

## Tax Factors (`tax_factors`) — IVA Bienes Usados

Used by tax type `08`. No Hacienda code — referenced by UUID.

Formula: `IVA = salePrice × ivaFactor`

| Name | IVA Factor | Final Price Factor |
|------|------------|-------------------|
| Artículos electrónicos | 0.058 | 1.058 |
| Herramientas manuales o eléctricas | 0.050 | 1.050 |
| Línea Blanca - Electrodomésticos | 0.044 | 1.044 |
| Antigüedades | 0.065 | 1.065 |

---

## Tax Amounts (`tax_amounts`)

Used by tax types `03`, `04`, `05`, `06`. No Hacienda code — referenced by UUID.

### Tax Type 03 — Impuesto Único a los Combustibles

Formula: `Tax = taxAmount.amount` (fixed amount per unit/liter)

| Name | Amount (₡) |
|------|------------|
| Gasolina regular | 259.50 |
| Gasolina súper | 271.75 |
| Diésel | 153.75 |
| Asfalto | 52.75 |
| Emulsión asfáltica | 40.00 |
| Búnker | 25.25 |
| LPG | 24.00 |
| Jet fuel A1 | 155.75 |
| Av. gas | 259.50 |
| Queroseno | 74.00 |
| Diésel pesado (gasóleo) | 50.75 |
| Nafta pesada | 37.50 |
| Nafta liviana | 37.50 |

### Tax Type 04 — Impuesto Específico sobre Bebidas Alcohólicas

Formula: `Tax = volume (ml) × (alcohol% / 100) × taxAmount.amount`

| Name | Amount (₡/ml de alcohol absoluto) |
|------|-----------------------------------|
| Hasta 15% alcohol | 3.66 |
| Más de 15% y hasta 30% alcohol | 4.36 |
| Más de 30% alcohol | 5.10 |

### Tax Type 05 — Impuesto Específico sobre Bebidas Envasadas y Jabón de Tocador

Formula: `Tax = quantity × taxAmount.amount`

| Name | Amount (₡/unidad) |
|------|-------------------|
| Bebidas gaseosas y concentrados de gaseosas | 21.79 |
| Otras bebidas líquidas envasadas (incluso agua) | 16.17 |
| Agua (envases de 18 litros o más) | 7.53 |
| Jabón de tocador (por gramo) | 0.276 |

### Tax Type 06 — Impuesto Específico sobre el Tabaco

Formula: `Tax = quantity (units) × taxAmount.amount`

| Tariff Code | Description | Amount (₡/unidad) |
|-------------|-------------|-------------------|
| 24.01 | Tabaco en rama o sin elaborar; desperdicios de tabaco | 26.92 |
| 24.02 | Cigarros (puros), cigarritos y cigarrillos de tabaco | 26.92 |
| 24.03 | Los demás tabacos elaborados; extractos y jugos de tabaco | 26.92 |

---

## Sale Conditions (`sale_conditions`)

| Code | Name |
|------|------|
| 01 | Contado |
| 02 | Crédito |
| 03 | Consignación |
| 04 | Apartado |
| 05 | Arrendamiento con opción de compra |
| 06 | Arrendamiento en función financiera |
| 07 | Cobro a favor de un tercero |
| 08 | Servicios prestados al Estado |
| 09 | Pago de servicios prestado al Estado |
| 10 | Venta a crédito en IVA hasta 90 días (Artículo 27, LIVA) |
| 11 | Pago de venta a crédito en IVA hasta 90 días (Artículo 27, LIVA) |
| 12 | Venta Mercancía No Nacionalizada |
| 13 | Venta Bienes Usados No Contribuyente |
| 14 | Arrendamiento Operativo |
| 15 | Arrendamiento Financiero |
| 99 | Otros |

---

## Measurement Units (`measurement_units`)

| Symbol | Description |
|--------|-------------|
| 1 | uno (índice de refracción) |
| ´ | minuto |
| ´´ | segundo |
| °C | grado Celsius |
| 1/m | 1 por metro |
| A | Ampere |
| A/m | ampere por metro |
| A/m² | ampere por metro cuadrado |
| Acv | Activo Virtual |
| Al | Alquiler de uso habitacional |
| Alc | Alquiler de uso comercial |
| B | bel |
| Bq | Becquerel |
| C | coulomb |
| C/kg | coulomb por kilogramo |
| C/m² | coulomb por metro cuadrado |
| C/m³ | coulomb por metro cúbico |
| Cc | Cajuela de café |
| Cd | Candela |
| cd/m² | candela por metro cuadrado |
| Cm | Comisiones |
| cm | centímetro |
| Cu | cuartillos de café |
| D | día |
| eV | electronvolt |
| F | farad |
| F/m | farad por metro |
| Fa | fanega de café |
| G | Gramo |
| Gal | Galón |
| Gy | gray |
| Gy/s | gray por segundo |
| h | hora |
| H | henry |
| H/m | henry por metro |
| Hz | hertz |
| I | Intereses |
| J | Joule |
| J/(kg·K) | joule por kilogramo kelvin |
| J/(mol·K) | joule por mol kelvin |
| J/K | joule por kelvin |
| J/kg | joule por kilogramo |
| J/m³ | joule por metro cúbico |
| J/mol | joule por mol |
| K | Kelvin |
| Kat | katal |
| kat/m³ | katal por metro cúbico |
| Kg | Kilogramo |
| kg/m³ | kilogramo por metro cúbico |
| Km | Kilómetro |
| Kw | kilovatios |
| kWh | kilovatios por hora |
| L | litro |
| Lm | lumen |
| Ln | pulgada |
| Lx | lux |
| M | Metro |
| m/s | metro por segundo |
| m/s² | metro por segundo cuadrado |
| m² | metro cuadrado |
| m³ | metro cúbico |
| Min | minuto |
| mL | mililitro |
| Mm | Milímetro |
| Mol | Mol |
| mol/m³ | mol por metro cúbico |
| N | newton |
| N/m | newton por metro |
| N·m | newton metro |
| Np | neper |
| º | grado |
| Os | Otros |
| Otro | Otro tipo de servicio |
| Oz | Onzas |
| Pa | pascal |
| Pa·s | pascal segundo |
| Qq | Quintal |
| Rad | radián |
| rad/s | radián por segundo |
| rad/s² | radián por segundo cuadrado |
| S | Segundo |
| s | siemens |
| Sp | Servicios Profesionales |
| Spe | Servicios personales |
| Sr | estereorradián |
| St | Servicios técnicos |
| Sv | sievert |
| t | tesla |
| T | tonelada |
| U | unidad de masa atómica unificada |
| Ua | unidad astronómica |
| Unid | Unidad |
| V | volt |
| V/m | volt por metro |
| W | Watt |
| W/(m·K) | watt por metro kelvin |
| W/(m²·sr) | watt por metro cuadrado estereorradián |
| W/m² | watt por metro cuadrado |
| W/sr | watt por estereorradián |
| Wb | weber |
| Ω | ohm |

---

## Exemption Institutions (`exemption_institutions`)

| Code | Name |
|------|------|
| 01 | Ministerio de Hacienda |
| 02 | Ministerio de Relaciones Exteriores y Culto |
| 03 | Ministerio de Agricultura y Ganadería |
| 04 | Ministerio de Economía, Industria y Comercio |
| 05 | Cruz Roja Costarricense |
| 06 | Benemérito Cuerpo de Bomberos de Costa Rica |
| 07 | Asociación Obras del Espíritu Santo |
| 08 | Federación Cruzada Nacional de protección al Anciano (Fecrunapa) |
| 09 | Escuela de Agricultura de la Región Húmeda (EARTH) |
| 10 | Instituto Centroamericano de Administración de Empresas (INCAE) |
| 11 | Junta de Protección Social (JPS) |
| 12 | Autoridad Reguladora de los Servicios Públicos (Aresep) |
| 99 | Otros |

---

## Exemption Types (`exemption_types`)

| Code | Name |
|------|------|
| 01 | Compras autorizadas por la Dirección General de Tributación |
| 02 | Ventas exentas a diplomáticos |
| 03 | Autorizado por Ley especial |
| 04 | Exenciones Dirección General de Hacienda Autorización Local Genérica |
| 05 | Exenciones Dirección General de Hacienda Transitorio V (servicios de ingeniería, arquitectura, topografía obra civil) |
| 06 | Servicios turísticos inscritos ante el Instituto Costarricense de Turismo (ICT) |
| 07 | Transitorio XVII (Recolección, Clasificación, almacenamiento de Reciclaje y reutilizable) |
| 08 | Exoneración a Zona Franca |
| 09 | Exoneración de servicios complementarios para la exportación artículo 11 RLIVA |
| 10 | Órgano de las corporaciones municipales |
| 11 | Exenciones Dirección General de Hacienda Autorización de Impuesto Local Concreta |
| 99 | Otros |

---

## Transaction Types (`transaction_types`)

| Code | Name |
|------|------|
| 01 | Venta Normal de Bienes y Servicios (Transacción General) |
| 02 | Mercancía de Autoconsumo exento |
| 03 | Mercancía de Autoconsumo gravado |
| 04 | Servicio de Autoconsumo exento |
| 05 | Servicio de Autoconsumo gravado |
| 06 | Cuota de afiliación |
| 07 | Cuota de afiliación Exenta |
| 08 | Bienes de Capital para el emisor |
| 09 | Bienes de Capital para el receptor |
| 10 | Bienes de Capital para el emisor y el receptor |
| 11 | Bienes de capital de autoconsumo exento para el emisor |
| 12 | Bienes de capital sin contraprestación a terceros exento para el emisor |
| 13 | Sin contraprestación a terceros |
