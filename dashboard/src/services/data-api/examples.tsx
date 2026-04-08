/**
 * Example Component: Location Selector
 * 
 * This component demonstrates how to use the Data API integration
 * to build a cascading location selector (State > County > District > Neighborhood)
 */

import { useState } from 'react';
import {
  useStates,
  useCounties,
  useDistricts,
  useNeighborhoods,
} from '@/hooks/useDataApi';

export function LocationSelectorExample() {
  const [selectedState, setSelectedState] = useState<number>();
  const [selectedCounty, setSelectedCounty] = useState<number>();
  const [selectedDistrict, setSelectedDistrict] = useState<number>();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number>();

  // Fetch states for Costa Rica (ISO code 188)
  const { data: states, isLoading: statesLoading } = useStates({ 
    isoCode: '188' 
  });

  // Fetch counties only when a state is selected
  const { data: counties, isLoading: countiesLoading } = useCounties(
    { 
      isoCode: '188', 
      stateId: selectedState! 
    },
    { enabled: !!selectedState }
  );

  // Fetch districts only when a county is selected
  const { data: districts, isLoading: districtsLoading } = useDistricts(
    { 
      isoCode: '188', 
      stateId: selectedState!, 
      countyId: selectedCounty! 
    },
    { enabled: !!selectedCounty }
  );

  // Fetch neighborhoods only when a district is selected
  const { data: neighborhoods, isLoading: neighborhoodsLoading } = useNeighborhoods(
    { 
      isoCode: '188', 
      stateId: selectedState!, 
      countyId: selectedCounty!, 
      districtId: selectedDistrict! 
    },
    { enabled: !!selectedDistrict }
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Location Selector</h2>

      {/* State Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Province (Provincia)
        </label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedState || ''}
          onChange={(e) => {
            setSelectedState(Number(e.target.value));
            setSelectedCounty(undefined);
            setSelectedDistrict(undefined);
            setSelectedNeighborhood(undefined);
          }}
          disabled={statesLoading}
        >
          <option value="">Select a province...</option>
          {states?.map((state) => (
            <option key={state.stateId} value={state.stateId}>
              {state.stateName}
            </option>
          ))}
        </select>
      </div>

      {/* County Selector */}
      {selectedState && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Canton (Cantón)
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedCounty || ''}
            onChange={(e) => {
              setSelectedCounty(Number(e.target.value));
              setSelectedDistrict(undefined);
              setSelectedNeighborhood(undefined);
            }}
            disabled={countiesLoading}
          >
            <option value="">Select a canton...</option>
            {counties?.map((county) => (
              <option key={county.countyId} value={county.countyId}>
                {county.countyName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* District Selector */}
      {selectedCounty && (
        <div>
          <label className="block text-sm font-medium mb-1">
            District (Distrito)
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedDistrict || ''}
            onChange={(e) => {
              setSelectedDistrict(Number(e.target.value));
              setSelectedNeighborhood(undefined);
            }}
            disabled={districtsLoading}
          >
            <option value="">Select a district...</option>
            {districts?.map((district) => (
              <option key={district.districtId} value={district.districtId}>
                {district.districtName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Neighborhood Selector */}
      {selectedDistrict && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Neighborhood (Barrio)
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedNeighborhood || ''}
            onChange={(e) => setSelectedNeighborhood(Number(e.target.value))}
            disabled={neighborhoodsLoading}
          >
            <option value="">Select a neighborhood...</option>
            {neighborhoods?.map((neighborhood) => (
              <option key={neighborhood.neighborhoodId} value={neighborhood.neighborhoodId}>
                {neighborhood.neighborhoodName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedNeighborhood && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800">Selected Location:</h3>
          <p className="text-sm text-green-700">
            State: {states?.find(s => s.stateId === selectedState)?.stateName}<br />
            County: {counties?.find(c => c.countyId === selectedCounty)?.countyName}<br />
            District: {districts?.find(d => d.districtId === selectedDistrict)?.districtName}<br />
            Neighborhood: {neighborhoods?.find(n => n.neighborhoodId === selectedNeighborhood)?.neighborhoodName}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example Component: Document Version Selector
 * 
 * Shows how to fetch and display document versions
 */

import { useAllDocumentVersions } from '@/hooks/useDataApi';

export function DocumentVersionSelectorExample() {
  const { data: versions, isLoading, error } = useAllDocumentVersions({
    isoCode: '188',
    status: '1' // Only active versions
  });

  if (isLoading) {
    return <div>Loading document versions...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Document Versions</h2>
      <div className="grid gap-2">
        {versions?.map((version) => (
          <div 
            key={version.versionId}
            className="p-4 border rounded hover:bg-gray-50"
          >
            <div className="font-semibold">{version.description}</div>
            <div className="text-sm text-gray-600">
              Version: {version.versionNumber} | 
              Date: {new Date(version.versionDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example Component: Tax Types Selector
 * 
 * Shows how to fetch taxes for a specific document version
 */

import { useAllTaxes } from '@/hooks/useDataApi';

export function TaxTypesSelectorExample() {
  const [documentVersionId, setDocumentVersionId] = useState<number>(1);

  const { data: taxes, isLoading } = useAllTaxes({
    isoCode: '188',
    documentVersionId,
    status: '1'
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Tax Types</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Document Version ID
        </label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={documentVersionId}
          onChange={(e) => setDocumentVersionId(Number(e.target.value))}
        />
      </div>

      {isLoading ? (
        <div>Loading taxes...</div>
      ) : (
        <div className="grid gap-2">
          {taxes?.map((tax) => (
            <div 
              key={tax.id}
              className="p-4 border rounded"
            >
              <div className="font-semibold">{tax.description}</div>
              <div className="text-sm text-gray-600">
                Code: {tax.code} | 
                Percentage: {tax.percentage}% |
                {tax.requiredIva && ' IVA Required'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Direct Client Usage (without hooks)
 * 
 * For use in non-React contexts or when you need more control
 */

import { dataApiClient } from '@/services/data-api';

export async function fetchCountriesExample() {
  try {
    // Fetch all countries
    const countries = await dataApiClient.getAllCountries();
    console.log('Countries:', countries);

    // Search for a specific country
    const costaRica = await dataApiClient.searchCountry({ isoCode: '188' });
    console.log('Costa Rica:', costaRica);

    // Fetch document versions
    const versions = await dataApiClient.getAllDocumentVersions({
      isoCode: '188',
      status: '1'
    });
    console.log('Document Versions:', versions);

    return { countries, costaRica, versions };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
