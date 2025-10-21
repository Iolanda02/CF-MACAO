import protectedApi from "./protectedApi";

export async function getAllOrdersUser(search, paginator) {
    try {
        const URL = `/orders?page=${paginator.page}&perPage=${paginator.perPage}` + (search? `&search=${search}`: '');
        const response = await protectedApi.get(URL);
        // console.log("(API) getAll users: ", response);
        return response.data;
    } catch(error) {
        // console.error("Error fetching users:", error); 
        throw error;
    }
}

export async function getAllOrdersAdmin(search, paginator) {
    try {
        const URL = `/orders/admin?page=${paginator.page}&perPage=${paginator.perPage}` + (search? `&search=${search}`: '');
        const response = await protectedApi.get(URL);
        // console.log("(API) getAll users: ", response);
        return response.data;
    } catch(error) {
        // console.error("Error fetching users:", error); 
        throw error;
    }
}

export async function getUserOrders(search, paginator) {
    try {
        const URL = `/orders?page=${paginator.page}&perPage=${paginator.perPage}` + (search? `&title=${search}`: '');
        const response = await protectedApi.get(URL);
        // console.log("(API) getAll orders: ", response);
        return response.data;
    } catch(error) {
        // console.error("Error fetching orders:", error); 
        throw error;
    }
}

export async function createOrder(newOrder) {
    try {
        const response = await protectedApi.post(`/orders`, newOrder);
        // console.log("(API) createUser: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function getOrderById(id) {
    try {
        const response = await protectedApi.get(`/orders/${id}`);
        // console.log("(API) getSingle order: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function updateOrder(id, newData) {
    try {
        const URL = `/orders/${id}`;
        const response = await protectedApi.patch(URL, newData);
        // console.log("(API) put user: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function updatePaymentStatus(id, newData) {
    try {
        const URL = `/orders/${id}/payment-status`;
        const response = await protectedApi.patch(URL, newData);
        // console.log("(API) put user: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function cancelOrder(id) {
    try {
        const response = await protectedApi.post(`/orders/${id}/cancel`);
        // console.log("(API) createUser: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}