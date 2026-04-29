import { api } from "~/lib/api";
import { createAgent } from "~/lib/antigravity";
import { initialWilayahState } from "./wilayahStore";

/**
 * Antigravity Wilayah Agent
 * Logic for fetching regions from Laravel Proxy and handling chained dropdown resets.
 */
export const WilayahAgent = createAgent({
  name: "WilayahAgent",
  initialState: initialWilayahState,
  actions: (state, setState) => ({
    /**
     * fetchProvinsi: Fetch all provinces from Laravel proxy
     */
    fetchProvinsi: async () => {
      setState({ isLoading: true, error: null });
      try {
        const response = await api.get("/wilayah/provinces");
        setState({ provinces: response.data.data, isLoading: false });
      } catch (err) {
        setState({ 
          error: "Gagal mengambil data provinsi.", 
          isLoading: false 
        });
      }
    },

    /**
     * fetchKota: Fetch regencies and reset dependent states
     */
    fetchKota: async (provinceCode) => {
      const provinceName = state.provinces.find(p => p.code === provinceCode)?.name || "";
      setState({ 
        isLoading: true, 
        error: null,
        selectedCodes: { ...state.selectedCodes, province: provinceCode, regency: "", district: "", village: "" },
        selectedNames: { ...state.selectedNames, province: provinceName, regency: "", district: "", village: "" },
        regencies: [],
        districts: [],
        villages: []
      });
      try {
        const response = await api.get(`/wilayah/regencies/${provinceCode}`);
        setState({ regencies: response.data.data, isLoading: false });
      } catch (err) {
        setState({ error: "Gagal mengambil data kota/kabupaten.", isLoading: false });
      }
    },

    /**
     * fetchKecamatan: Fetch districts and reset dependent states
     */
    fetchKecamatan: async (regencyCode) => {
      const regencyName = state.regencies.find(c => c.code === regencyCode)?.name || "";
      setState({ 
        isLoading: true, 
        error: null,
        selectedCodes: { ...state.selectedCodes, regency: regencyCode, district: "", village: "" },
        selectedNames: { ...state.selectedNames, regency: regencyName, district: "", village: "" },
        districts: [],
        villages: []
      });
      try {
        const response = await api.get(`/wilayah/districts/${regencyCode}`);
        setState({ districts: response.data.data, isLoading: false });
      } catch (err) {
        setState({ error: "Gagal mengambil data kecamatan.", isLoading: false });
      }
    },

    /**
     * fetchDesa: Fetch villages
     */
    fetchDesa: async (districtCode) => {
      const districtName = state.districts.find(d => d.code === districtCode)?.name || "";
      setState({ 
        isLoading: true, 
        error: null,
        selectedCodes: { ...state.selectedCodes, district: districtCode, village: "" },
        selectedNames: { ...state.selectedNames, district: districtName, village: "" },
        villages: []
      });
      try {
        const response = await api.get(`/wilayah/villages/${districtCode}`);
        setState({ villages: response.data.data, isLoading: false });
      } catch (err) {
        setState({ error: "Gagal mengambil data desa/kelurahan.", isLoading: false });
      }
    },

    /**
     * setSelectedVillage: Final selection
     */
    setSelectedVillage: (villageCode) => {
      const villageName = state.villages.find(v => v.code === villageCode)?.name || "";
      setState({ 
        selectedCodes: { ...state.selectedCodes, village: villageCode },
        selectedNames: { ...state.selectedNames, village: villageName }
      });
    },

    /**
     * setRegionData: Pre-fill for editing
     */
    setRegionData: (data) => {
      setState((prev) => ({ ...prev, ...data }));
    }
  }),
});
