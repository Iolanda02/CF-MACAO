import protectedApi from "./protectedApi";

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