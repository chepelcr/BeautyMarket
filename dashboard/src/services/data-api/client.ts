import { buildDataApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import type {
  DocumentVersionResponse,
  DocumentVersionListResponse,
  GetDocumentVersionParams,
  GetAllDocumentVersionsParams,
  GetDocumentVersionByIdParams,
  CodeResponse,
  CodeListResponse,
  GetCodeParams,
  GetAllCodesParams,
  CustomerTypeResponse,
  CustomerTypeListResponse,
  GetAllCustomerTypesParams,
  GetCustomerTypeByIdParams,
  DiscountTypeResponse,
  DiscountTypeListResponse,
  GetDiscountTypeParams,
  GetAllDiscountTypesParams,
  DocumentTypeResponse,
  DocumentTypeListResponse,
  GetDocumentTypeParams,
  GetAllDocumentTypesParams,
  EconomicActivityResponse,
  EconomicActivityListResponse,
  GetEconomicActivityParams,
  GetAllEconomicActivitiesParams,
  ExemptionResponse,
  ExemptionListResponse,
  GetExemptionParams,
  GetAllExemptionsParams,
  ExemptionIssuingInstitutionResponse,
  ExemptionIssuingInstitutionListResponse,
  GetExemptionIssuingInstitutionParams,
  GetAllExemptionIssuingInstitutionsParams,
  FactoryTaxChargeResponse,
  FactoryTaxChargeListResponse,
  GetFactoryTaxChargeParams,
  GetAllFactoryTaxChargesParams,
  IdentificationResponse,
  IdentificationListResponse,
  GetIdentificationParams,
  GetAllIdentificationsParams,
  MeasurementUnitResponse,
  MeasurementUnitListResponse,
  GetMeasurementUnitParams,
  GetAllMeasurementUnitsParams,
  NationalTaxpayerCompanyResponse,
  NationalTaxpayerCompanyListResponse,
  GetNationalTaxpayerCompanyParams,
  GetAllNationalTaxpayerCompaniesParams,
  NationalTaxpayerSpecialFieldResponse,
  NationalTaxpayerSpecialFieldListResponse,
  GetNationalTaxpayerSpecialFieldParams,
  GetAllNationalTaxpayerSpecialFieldsParams,
  NotificationCodeResponse,
  NotificationCodeListResponse,
  GetNotificationCodeParams,
  GetAllNotificationCodesParams,
  OtherChargeResponse,
  OtherChargeListResponse,
  GetOtherChargeParams,
  GetAllOtherChargesParams,
  PaymentResponse,
  PaymentListResponse,
  GetPaymentParams,
  GetAllPaymentsParams,
  PharmaceuticalFormResponse,
  PharmaceuticalFormListResponse,
  GetPharmaceuticalFormParams,
  GetAllPharmaceuticalFormsParams,
  ProductTypeResponse,
  ProductTypeListResponse,
  GetProductTypeParams,
  GetAllProductTypesParams,
  ReferenceCodeResponse,
  ReferenceCodeListResponse,
  GetReferenceCodeParams,
  GetAllReferenceCodesParams,
  ReferenceResponse,
  ReferenceListResponse,
  GetReferenceParams,
  GetAllReferencesParams,
  RegimeResponse,
  RegimeListResponse,
  GetRegimeParams,
  GetAllRegimesParams,
  SaleConditionResponse,
  SaleConditionListResponse,
  GetSaleConditionParams,
  GetAllSaleConditionsParams,
  TaxAmountResponse,
  TaxAmountListResponse,
  GetTaxAmountParams,
  GetAllTaxAmountsParams,
  TaxConditionResponse,
  TaxConditionListResponse,
  GetTaxConditionParams,
  GetAllTaxConditionsParams,
  TaxFactorResponse,
  TaxFactorListResponse,
  GetTaxFactorParams,
  GetAllTaxFactorsParams,
  TaxRateCodeResponse,
  TaxRateCodeListResponse,
  GetTaxRateCodeParams,
  GetAllTaxRateCodesParams,
  TransactionResponse,
  TransactionListResponse,
  GetTransactionParams,
  GetAllTransactionsParams,
  CabysSearchResponse,
  SearchCabysParams,
  TaxpayerResponse,
  GetTaxpayerParams,
  ExemptionValidationResponse,
  ValidateExemptionParams,
  ExchangeRates,
  DollarRate,
  EuroRate,
  GetExchangeRateParams,
  CountryResponse,
  CountryListResponse,
  SearchCountryParams,
  GetAllCountriesParams,
  StateResponse,
  StateListResponse,
  GetStatesParams,
  GetStateParams,
  CountyResponse,
  CountyListResponse,
  GetCountiesParams,
  GetCountyParams,
  DistrictResponse,
  DistrictListResponse,
  GetDistrictsParams,
  GetDistrictParams,
  NeighborhoodResponse,
  NeighborhoodListResponse,
  GetNeighborhoodsParams,
  GetNeighborhoodParams,
  CurrencyListResponse,
  TaxResponse,
  TaxListResponse,
  GetTaxParams,
  GetAllTaxesParams,
  TaxRateResponse,
  TaxRateListResponse,
  GetTaxRateParams,
  GetAllTaxRatesParams,
} from './dtos';

class DataApiClient {
  private async request<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = buildDataApiUrl(path, params);
    const response = await apiRequest('GET', url);
    return response.json();
  }

  // Document Versions
  async getDocumentVersion(params: GetDocumentVersionParams): Promise<DocumentVersionResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/document-versions`, queryParams);
  }

  async getAllDocumentVersions(params: GetAllDocumentVersionsParams): Promise<DocumentVersionListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/document-versions/all`, queryParams);
  }

  async getDocumentVersionById(params: GetDocumentVersionByIdParams): Promise<DocumentVersionResponse> {
    const { iso_code, id } = params;
    return this.request(`/countries/${iso_code}/document-versions/${id}`);
  }

  // Codes
  async getCode(params: GetCodeParams): Promise<CodeResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/codes`, queryParams);
  }

  async getAllCodes(params: GetAllCodesParams): Promise<CodeListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/codes/all`, queryParams);
  }

  // Customer Types
  async getAllCustomerTypes(params?: GetAllCustomerTypesParams): Promise<CustomerTypeListResponse> {
    return this.request('/customer-types/all', params);
  }

  async getCustomerTypeById(params: GetCustomerTypeByIdParams): Promise<CustomerTypeResponse> {
    return this.request(`/customer-types/${params.id}`);
  }

  // Discount Types
  async getDiscountType(params: GetDiscountTypeParams): Promise<DiscountTypeResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/discounts`, queryParams);
  }

  async getAllDiscountTypes(params: GetAllDiscountTypesParams): Promise<DiscountTypeListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/discounts/all`, queryParams);
  }

  // Documents
  async getDocumentType(params: GetDocumentTypeParams): Promise<DocumentTypeResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/documents`, queryParams);
  }

  async getAllDocumentTypes(params: GetAllDocumentTypesParams): Promise<DocumentTypeListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/documents/all`, queryParams);
  }

  // Economic Activities
  async getEconomicActivity(params: GetEconomicActivityParams): Promise<EconomicActivityResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/economic-activities`, queryParams);
  }

  async getAllEconomicActivities(params: GetAllEconomicActivitiesParams): Promise<EconomicActivityListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/economic-activities/all`, queryParams);
  }

  // Exemptions
  async getExemption(params: GetExemptionParams): Promise<ExemptionResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/exemptions`, queryParams);
  }

  async getAllExemptions(params: GetAllExemptionsParams): Promise<ExemptionListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/exemptions/all`, queryParams);
  }

  // Exemptions Issuing Institutions
  async getExemptionIssuingInstitution(params: GetExemptionIssuingInstitutionParams): Promise<ExemptionIssuingInstitutionResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/exemptions-issuing-institutions`, queryParams);
  }

  async getAllExemptionIssuingInstitutions(params: GetAllExemptionIssuingInstitutionsParams): Promise<ExemptionIssuingInstitutionListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/exemptions-issuing-institutions/all`, queryParams);
  }

  // Factory Tax Charges
  async getFactoryTaxCharge(params: GetFactoryTaxChargeParams): Promise<FactoryTaxChargeResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/factory-tax-charges`, queryParams);
  }

  async getAllFactoryTaxCharges(params: GetAllFactoryTaxChargesParams): Promise<FactoryTaxChargeListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/factory-tax-charges/all`, queryParams);
  }

  // Identifications
  async getIdentification(params: GetIdentificationParams): Promise<IdentificationResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/identifications`, queryParams);
  }

  async getAllIdentifications(params: GetAllIdentificationsParams): Promise<IdentificationListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/identifications/all`, queryParams);
  }

  // Measurement Units
  async getMeasurementUnit(params: GetMeasurementUnitParams): Promise<MeasurementUnitResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/measurement-units`, queryParams);
  }

  async getAllMeasurementUnits(params: GetAllMeasurementUnitsParams): Promise<MeasurementUnitListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/measurement-units/all`, queryParams);
  }

  // National Taxpayer Companies
  async getNationalTaxpayerCompany(params: GetNationalTaxpayerCompanyParams): Promise<NationalTaxpayerCompanyResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/national-taxpayer-companies`, queryParams);
  }

  async getAllNationalTaxpayerCompanies(params: GetAllNationalTaxpayerCompaniesParams): Promise<NationalTaxpayerCompanyListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/national-taxpayer-companies/all`, queryParams);
  }

  // National Taxpayer Special Fields
  async getNationalTaxpayerSpecialField(params: GetNationalTaxpayerSpecialFieldParams): Promise<NationalTaxpayerSpecialFieldResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/national-taxpayer-special-fields`, queryParams);
  }

  async getAllNationalTaxpayerSpecialFields(params: GetAllNationalTaxpayerSpecialFieldsParams): Promise<NationalTaxpayerSpecialFieldListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/national-taxpayer-special-fields/all`, queryParams);
  }

  // Notification Codes
  async getNotificationCode(params: GetNotificationCodeParams): Promise<NotificationCodeResponse> {
    return this.request('/notification-codes', params);
  }

  async getAllNotificationCodes(params?: GetAllNotificationCodesParams): Promise<NotificationCodeListResponse> {
    return this.request('/notification-codes/all', params);
  }

  // Other Charges
  async getOtherCharge(params: GetOtherChargeParams): Promise<OtherChargeResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/other-charges`, queryParams);
  }

  async getAllOtherCharges(params: GetAllOtherChargesParams): Promise<OtherChargeListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/other-charges/all`, queryParams);
  }

  // Payments
  async getPayment(params: GetPaymentParams): Promise<PaymentResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/payments`, queryParams);
  }

  async getAllPayments(params: GetAllPaymentsParams): Promise<PaymentListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/payments/all`, queryParams);
  }

  // Pharmaceutical Forms
  async getPharmaceuticalForm(params: GetPharmaceuticalFormParams): Promise<PharmaceuticalFormResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/pharmaceutical-forms`, queryParams);
  }

  async getAllPharmaceuticalForms(params: GetAllPharmaceuticalFormsParams): Promise<PharmaceuticalFormListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/pharmaceutical-forms/all`, queryParams);
  }

  // Product Types
  async getProductType(params: GetProductTypeParams): Promise<ProductTypeResponse> {
    return this.request('/product-types', params);
  }

  async getAllProductTypes(params?: GetAllProductTypesParams): Promise<ProductTypeListResponse> {
    return this.request('/product-types/all', params);
  }

  // Reference Codes
  async getReferenceCode(params: GetReferenceCodeParams): Promise<ReferenceCodeResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/reference-codes`, queryParams);
  }

  async getAllReferenceCodes(params: GetAllReferenceCodesParams): Promise<ReferenceCodeListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/reference-codes/all`, queryParams);
  }

  // References
  async getReference(params: GetReferenceParams): Promise<ReferenceResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/references`, queryParams);
  }

  async getAllReferences(params: GetAllReferencesParams): Promise<ReferenceListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/references/all`, queryParams);
  }

  // Regimes
  async getRegime(params: GetRegimeParams): Promise<RegimeResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/regimes`, queryParams);
  }

  async getAllRegimes(params: GetAllRegimesParams): Promise<RegimeListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/regimes/all`, queryParams);
  }

  // Sale Conditions
  async getSaleCondition(params: GetSaleConditionParams): Promise<SaleConditionResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/sale-conditions`, queryParams);
  }

  async getAllSaleConditions(params: GetAllSaleConditionsParams): Promise<SaleConditionListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/sale-conditions/all`, queryParams);
  }

  // Tax Amounts (nested under taxes)
  async getTaxAmount(params: GetTaxAmountParams): Promise<TaxAmountResponse> {
    const { iso_code, tax_id, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/taxes/${tax_id}/amounts`, queryParams);
  }

  async getAllTaxAmounts(params: GetAllTaxAmountsParams): Promise<TaxAmountListResponse> {
    const { iso_code, tax_id, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/taxes/${tax_id}/amounts/all`, queryParams);
  }

  // Tax Conditions
  async getTaxCondition(params: GetTaxConditionParams): Promise<TaxConditionResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/tax-conditions`, queryParams);
  }

  async getAllTaxConditions(params: GetAllTaxConditionsParams): Promise<TaxConditionListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/tax-conditions/all`, queryParams);
  }

  // Tax Factors
  async getTaxFactor(params: GetTaxFactorParams): Promise<TaxFactorResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/tax-factors`, queryParams);
  }

  async getAllTaxFactors(params: GetAllTaxFactorsParams): Promise<TaxFactorListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/tax-factors/all`, queryParams);
  }

  // Tax Rate Codes
  async getTaxRateCode(params: GetTaxRateCodeParams): Promise<TaxRateCodeResponse> {
    return this.request('/tax-rate-codes', params);
  }

  async getAllTaxRateCodes(params?: GetAllTaxRateCodesParams): Promise<TaxRateCodeListResponse> {
    return this.request('/tax-rate-codes/all', params);
  }

  // Transactions
  async getTransaction(params: GetTransactionParams): Promise<TransactionResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/transactions`, queryParams);
  }

  async getAllTransactions(params: GetAllTransactionsParams): Promise<TransactionListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/transactions/all`, queryParams);
  }

  // Locations - Countries
  async searchCountry(params: SearchCountryParams): Promise<CountryResponse> {
    return this.request('/countries', params);
  }

  async getAllCountries(params?: GetAllCountriesParams): Promise<CountryListResponse> {
    return this.request('/countries/all', params);
  }

  // Locations - States
  async getStates(params: GetStatesParams): Promise<StateListResponse> {
    return this.request(`/countries/${params.iso_code}/states`);
  }

  async getState(params: GetStateParams): Promise<StateResponse> {
    return this.request(`/countries/${params.iso_code}/states/${params.state_id}`);
  }

  // Locations - Counties
  async getCounties(params: GetCountiesParams): Promise<CountyListResponse> {
    return this.request(`/countries/${params.iso_code}/states/${params.state_id}/counties`);
  }

  async getCounty(params: GetCountyParams): Promise<CountyResponse> {
    return this.request(`/countries/${params.iso_code}/states/${params.state_id}/counties/${params.county_id}`);
  }

  // Locations - Districts
  async getDistricts(params: GetDistrictsParams): Promise<DistrictListResponse> {
    return this.request(`/countries/${params.iso_code}/states/${params.state_id}/counties/${params.county_id}/districts`);
  }

  async getDistrict(params: GetDistrictParams): Promise<DistrictResponse> {
    return this.request(`/countries/${params.iso_code}/states/${params.state_id}/counties/${params.county_id}/districts/${params.district_id}`);
  }

  // Locations - Neighborhoods
  async getNeighborhoods(params: GetNeighborhoodsParams): Promise<NeighborhoodListResponse> {
    return this.request(`/countries/${params.iso_code}/states/${params.state_id}/counties/${params.county_id}/districts/${params.district_id}/neighborhoods`);
  }

  async getNeighborhood(params: GetNeighborhoodParams): Promise<NeighborhoodResponse> {
    return this.request(`/countries/${params.iso_code}/states/${params.state_id}/counties/${params.county_id}/districts/${params.district_id}/neighborhoods/${params.neighborhood_id}`);
  }

  // Currencies
  async getAllCurrencies(): Promise<CurrencyListResponse> {
    return this.request('/currencies');
  }

  async getCurrencyByCode(code: string): Promise<CurrencyListResponse[0]> {
    return this.request(`/currencies/${code}`);
  }

  // Taxes
  async getTax(params: GetTaxParams): Promise<TaxResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/taxes`, queryParams);
  }

  async getAllTaxes(params: GetAllTaxesParams): Promise<TaxListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/taxes/all`, queryParams);
  }

  // Tax Rates
  async getTaxRate(params: GetTaxRateParams): Promise<TaxRateResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/tax-rates`, queryParams);
  }

  async getAllTaxRates(params: GetAllTaxRatesParams): Promise<TaxRateListResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/tax-rates/all`, queryParams);
  }

  // Consumer - CABYS
  async searchCabys(params: SearchCabysParams): Promise<CabysSearchResponse> {
    const { iso_code, ...queryParams } = params;
    return this.request(`/countries/${iso_code}/cabys`, queryParams);
  }

  // Consumer - Taxpayer Identification
  async getTaxpayerInfo(params: GetTaxpayerParams): Promise<TaxpayerResponse> {
    const { iso_code, identification } = params;
    return this.request(`/countries/${iso_code}/taxpayer/${identification}/hacienda-info`);
  }

  // Consumer - Exemption Validation
  async validateExemption(params: ValidateExemptionParams): Promise<ExemptionValidationResponse> {
    const { iso_code, authorization } = params;
    return this.request(`/countries/${iso_code}/exemptions/${authorization}`);
  }

  // Consumer - Exchange Rates
  async getExchangeRates(params: GetExchangeRateParams): Promise<ExchangeRates> {
    return this.request(`/countries/${params.iso_code}/exchange-rate`);
  }

  async getDollarRate(params: GetExchangeRateParams): Promise<DollarRate> {
    return this.request(`/countries/${params.iso_code}/exchange-rate/dollar`);
  }

  async getEuroRate(params: GetExchangeRateParams): Promise<EuroRate> {
    return this.request(`/countries/${params.iso_code}/exchange-rate/euro`);
  }
}

export const dataApiClient = new DataApiClient();
export default dataApiClient;
