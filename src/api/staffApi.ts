// api/staffApi.ts

export type StaffMember = {
  id: string;
  name: string;
  position: string;
  category: 'principal_officer' | 'management_staff';
  image: string | null;
  order: number;
};

export const createStaffApi = (fetchWithAuth: any) => ({
  async listAll(): Promise<StaffMember[]> {
    const data = await fetchWithAuth({ method: 'GET', path: '/staff/' });
    // Router returns standard list for viewset under `/staff/`
    // Might be a plain array or paginated; normalize to array
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    if (data?.data) return data.data; // in case success_response wrapper
    return data || [];
  },

  async listByCategory(category: 'principal_officer' | 'management_staff'): Promise<StaffMember[]> {
    const path = category === 'principal_officer'
      ? '/staff/principal-officers/'
      : '/staff/management-staff/';
    const data = await fetchWithAuth({ method: 'GET', path, isAthenticated: false });
    return Array.isArray(data?.data) ? data.data : (data || []);
  },

  async create({ name, position, category, imageFile }: { name: string; position: string; category: 'principal_officer' | 'management_staff'; imageFile?: File | null; }): Promise<StaffMember> {
    const form = new FormData();
    form.append('name', name);
    form.append('position', position);
    form.append('category', category);
    if (imageFile) form.append('image', imageFile);

    const resp = await fetchWithAuth({ method: 'POST', path: '/staff/', body: form, isFormData: true });
    return resp?.data || resp; // success_response wraps as {data}
  },

  async update(id: string, { name, position, category, imageFile }: { name?: string; position?: string; category?: 'principal_officer' | 'management_staff'; imageFile?: File | null; }): Promise<StaffMember> {
    const form = new FormData();
    if (name !== undefined) form.append('name', name);
    if (position !== undefined) form.append('position', position);
    if (category !== undefined) form.append('category', category);
    if (imageFile !== undefined) {
      if (imageFile) form.append('image', imageFile);
    }

    const resp = await fetchWithAuth({ method: 'PATCH', path: `/staff/${id}/`, body: form, isFormData: true });
    return resp?.data || resp;
  },

  async remove(id: string): Promise<void> {
    await fetchWithAuth({ method: 'DELETE', path: `/staff/${id}/` });
  }
});

export const staffApi = {
  init: (fetchWithAuth: any) => createStaffApi(fetchWithAuth)
};