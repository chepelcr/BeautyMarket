# Translation Keys Added for Tax Implementation

## English Translations (en)

Added to line ~687 in `dashboard/src/contexts/LanguageContext.tsx`:

```typescript
'products.advancedTaxes': 'Advanced Taxes',
// Tax translations
'taxes.valueAddedTax': 'Value Added Tax (IVA)',
'taxes.selectiveConsumptionTax': 'Selective Consumption Tax',
'taxes.uniqueFuelTax': 'Unique Fuel Tax',
'taxes.specificAlcoholicBeveragesTax': 'Specific Alcoholic Beverages Tax',
'taxes.specificPackagedBeveragesTax': 'Specific Packaged Beverages Tax',
'taxes.tobaccoProductsTax': 'Tobacco Products Tax',
'taxes.ivaSpecialCalculation': 'IVA (Special Calculation)',
'taxes.ivaUsedGoodsRegime': 'IVA Used Goods Regime',
'taxes.specificCementTax': 'Specific Cement Tax',
'taxes.others': 'Others',
'taxes.specificTaxes': 'Specific Taxes',
'taxes.addTax': 'Add Tax',
'taxes.tax': 'Tax',
'taxes.ivaType': 'IVA Type',
'taxes.rate': 'Rate',
'taxes.selectRate': 'Select rate',
'taxes.selectFactor': 'Select factor',
'taxes.selectAmount': 'Select amount',
'taxes.amount': 'Amount',
'taxes.calculatedAmount': 'Calculated Amount',
'taxes.suggestedRate': 'Suggested rate',
'taxes.selectCabysForTaxes': 'Select a CABYS code to configure taxes',
'taxes.selectIVA': 'Select IVA',
'taxes.taxAmount': 'Tax Amount',
'taxes.quantity': 'Quantity',
'taxes.percentage': 'Percentage',
'taxes.volumeConsumption': 'Volume Consumption',
```

## Spanish Translations (es)

Added to line ~2367 in `dashboard/src/contexts/LanguageContext.tsx`:

```typescript
'products.advancedTaxes': 'Impuestos Avanzados',
// Tax translations
'taxes.valueAddedTax': 'Impuesto al Valor Agregado (IVA)',
'taxes.selectiveConsumptionTax': 'Impuesto Selectivo de Consumo',
'taxes.uniqueFuelTax': 'Impuesto Único a los Combustibles',
'taxes.specificAlcoholicBeveragesTax': 'Impuesto Específico de Bebidas Alcohólicas',
'taxes.specificPackagedBeveragesTax': 'Impuesto Específico sobre Bebidas Envasadas',
'taxes.tobaccoProductsTax': 'Impuesto a los Productos de Tabaco',
'taxes.ivaSpecialCalculation': 'IVA (cálculo especial)',
'taxes.ivaUsedGoodsRegime': 'IVA Régimen de Bienes Usados',
'taxes.specificCementTax': 'Impuesto Específico al Cemento',
'taxes.others': 'Otros',
'taxes.specificTaxes': 'Impuestos Específicos',
'taxes.addTax': 'Agregar impuesto',
'taxes.tax': 'Impuesto',
'taxes.ivaType': 'Tipo de IVA',
'taxes.rate': 'Tarifa',
'taxes.selectRate': 'Seleccionar tarifa',
'taxes.selectFactor': 'Seleccionar factor',
'taxes.selectAmount': 'Seleccionar monto',
'taxes.amount': 'Monto',
'taxes.calculatedAmount': 'Monto calculado',
'taxes.suggestedRate': 'Tarifa sugerida',
'taxes.selectCabysForTaxes': 'Seleccione un código CABYS para configurar impuestos',
'taxes.selectIVA': 'Seleccionar IVA',
'taxes.taxAmount': 'Monto de impuesto',
'taxes.quantity': 'Cantidad',
'taxes.percentage': 'Porcentaje',
'taxes.volumeConsumption': 'Consumo volumétrico',
```

## Usage in Components

These translation keys are used in:

1. **IvaTaxSection.tsx** - IVA tax configuration component
   - `taxes.valueAddedTax`
   - `taxes.ivaType`
   - `taxes.rate`
   - `taxes.selectRate`
   - `taxes.selectFactor`
   - `taxes.amount`
   - `taxes.calculatedAmount`
   - `taxes.suggestedRate`
   - `taxes.selectCabysForTaxes`
   - `taxes.selectIVA`

2. **OtherTaxSection.tsx** - Specific taxes component
   - `taxes.specificTaxes`
   - `taxes.addTax`
   - `taxes.tax`
   - `taxes.taxAmount`
   - `taxes.quantity`
   - `taxes.percentage`
   - `taxes.volumeConsumption`
   - `taxes.calculatedAmount`
   - `taxes.selectAmount`

3. **AdvancedTaxesSection.tsx** - Main tax container
   - `products.advancedTaxes`

4. **taxTypes.ts** - Tax type descriptions
   - All tax type translations (valueAddedTax, selectiveConsumptionTax, etc.)

## Total Keys Added

- **28 translation keys** in English
- **28 translation keys** in Spanish
- **56 total translation keys**

All keys follow the naming convention:
- `taxes.*` for tax-specific translations
- `products.advancedTaxes` for the main section title
