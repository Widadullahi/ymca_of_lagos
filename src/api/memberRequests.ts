// Create API functions factory that accepts fetchWithAuth function
export const createMemberRequestsApi = (fetchWithAuth: any) => ({
  // Get a single member request by ID
  async getMemberRequestById(requestId: string) {
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/admin/requests/${requestId}/`,
      });
      return response;
    } catch (error) {
      console.error('Error fetching member request:', error);
      throw error;
    }
  },

  // Approve a member request
  async approveMemberRequest(requestId: string, reviewNotes: string = '') {
    try {
      const response = await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/requests/${requestId}/status/`,
        body: {
          status: 'approved',
          review_notes: reviewNotes
        }
      });
      return response;
    } catch (error) {
      console.error('Error approving member request:', error);
      throw error;
    }
  },

  // Reject a member request
  async rejectMemberRequest(requestId: string, reviewNotes: string = '') {
    try {
      const response = await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/requests/${requestId}/status/`,
        body: {
          status: 'rejected',
          review_notes: reviewNotes
        }
      });
      return response;
    } catch (error) {
      console.error('Error rejecting member request:', error);
      throw error;
    }
  },

  // Reconsider a rejected member request by approving it
  async reconsiderMemberRequest(requestId: string, reviewNotes: string = '') {
    try {
      const response = await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/requests/${requestId}/status/`,
        body: {
          status: 'approved',
          review_notes: reviewNotes
        }
      });
      return response;
    } catch (error) {
      console.error('Error reconsidering member request:', error);
      throw error;
    }
  }
});

// For backwards compatibility
export const memberRequestsApi = {
  // This will be initialized with fetchWithAuth function
  init: (fetchWithAuth: any) => createMemberRequestsApi(fetchWithAuth)
};
