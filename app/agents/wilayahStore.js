/**
 * Antigravity Wilayah Store
 * Holds state for Indonesian administrative regions
 */

export const initialWilayahState = {
  provinces: [],
  regencies: [],
  districts: [],
  villages: [],
  isLoading: false,
  error: null,
  selectedCodes: {
    province: "",
    regency: "",
    district: "",
    village: ""
  },
  selectedNames: {
    province: "",
    regency: "",
    district: "",
    village: ""
  },
  latitude: null,
  longitude: null
};
